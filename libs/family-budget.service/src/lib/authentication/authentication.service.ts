import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, LoginUserDto, User } from '@family-budget/family-budget.model';
import * as argon2 from 'argon2';
import { FamilyService } from '../family/family.service';

@Injectable()
export class AuthenticationService {
    
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private familyService: FamilyService
    ) {}

    async signUp(createUserDto: CreateUserDto) {
        const userExists = await this.userService.findByEmail(createUserDto.email);
        let isUserInvited = false;
        if (userExists) {
            throw new BadRequestException('User already exists');
        }

        const hashedPassword = await this.hashData(createUserDto.password);
        const newUser = await this.userService.create({
            ...createUserDto,
            password: hashedPassword,
        }) as User;

        const tokens = await this.getTokens(newUser.id || '', newUser.email);
        await this.updateRefreshToken(newUser.id || '', tokens.refreshToken);
        return tokens;
    }

    async signIn(loginDto: LoginUserDto) {
        const user = await this.userService.findByEmail(loginDto.email);
        if (!user) throw new BadRequestException('Invalid credentials');
        const passwordMatches = await argon2.verify(user.password, loginDto.password);
        if (!passwordMatches) throw new BadRequestException('Invalid credentials');
        const tokens = await this.getTokens(user.id || '', user.email);
        await this.updateRefreshToken(user.id || '', tokens.refreshToken);
        return {tokens: tokens, user: user};
    }

    async refreshTokens(userId: string, refreshToken: string) {
      const user = await this.userService.findById(userId);
      if (!user || !user.refreshToken) throw new ForbiddenException('Access Denied');

      const refreshTokenMatches = await argon2.verify(user.refreshToken, refreshToken);
      if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');
      const tokens = await this.getTokens(user.id || '', user.email);
      await this.updateRefreshToken(user.id || '', tokens.refreshToken);
      return tokens;
    }

    async logout(userId: string) {
        return this.userService.update(userId, {refreshToken: ''});
    }

    hashData(data: string) {
        return argon2.hash(data);
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await this.hashData(refreshToken);
        await this.userService.update(userId, {refreshToken: hashedRefreshToken});
    }

    async getTokens(userId: string, email: string) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
              {
                sub: userId,
                email,
              },
              {
                secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
                expiresIn: '15m',
              },
            ),
            this.jwtService.signAsync(
              {
                sub: userId,
                email,
              },
              {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                expiresIn: '7d',
              },
            ),
          ]);
      
          return {
            accessToken,
            refreshToken,
          };
    }

}
