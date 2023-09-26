import { AccessToken } from "@family-budget/family-budget.model";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            //ignoreExpiration: true,
            secretOrKey: process.env['JWT_ACCESS_TOKEN_SECRET'] || ''
        });
    }

    validate(payload: AccessToken) {
        return payload;
    }
}