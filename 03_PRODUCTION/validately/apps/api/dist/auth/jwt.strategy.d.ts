import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from './auth.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authService;
    constructor(authService: AuthService, configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        name: string | null;
        id: string;
        email: string;
        avatar: string | null;
        plan: import("@validately/db").$Enums.Plan;
        stripeCustomerId: string | null;
        encryptedApiKey: string | null;
        onboardingComplete: boolean;
        createdAt: Date;
        updatedAt: Date;
        emailVerified: Date | null;
        image: string | null;
    }>;
}
export {};
