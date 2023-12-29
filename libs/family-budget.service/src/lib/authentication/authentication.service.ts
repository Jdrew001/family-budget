import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto, LoginUserDto, User } from '@family-budget/family-budget.model';
import * as argon2 from 'argon2';
import { FamilyService } from '../family/family.service';
import { CoreService } from '../core/core.service';
import { ErrorConstants } from '../constants/error.constants';

@Injectable()
export class AuthenticationService {

  get currentUser() { return this.coreService.currentUser; }
    
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private coreService: CoreService
    ) {}

    async signUp(createUserDto: CreateUserDto) {
      createUserDto.email = createUserDto.email.toLowerCase().trim();
      createUserDto.password = createUserDto.password.trim();
        const userExists = await this.userService.findByEmail(createUserDto.email);
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
        if (!user) throw new BadRequestException(ErrorConstants.INVALID_CREDENTIALS);
        const passwordMatches = await argon2.verify(user.password, loginDto.password);
        if (!passwordMatches) throw new BadRequestException(ErrorConstants.INVALID_CREDENTIALS);
        const tokens = await this.getTokens(user.id || '', user.email);
        await this.updateRefreshToken(user.id || '', tokens.refreshToken);
        return {tokens: tokens, user: user};
    }

    async refreshTokens(refreshToken: string) {
      if (!this.currentUser || !this.currentUser.refreshToken) throw new ForbiddenException(ErrorConstants.YOU_HAVE_BEEN_LOGGED_OUT);

      const refreshTokenMatches = await argon2.verify(this.currentUser.refreshToken, refreshToken);
      if (!refreshTokenMatches) throw new ForbiddenException(ErrorConstants.YOU_HAVE_BEEN_LOGGED_OUT);
      const tokens = await this.getTokens(this.currentUser.id || '', this.currentUser.email);
      await this.updateRefreshToken(this.currentUser.id || '', tokens.refreshToken);
      return tokens;
    }

    async logout() {
        return this.userService.update(this.currentUser.id as string, {refreshToken: ''});
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
