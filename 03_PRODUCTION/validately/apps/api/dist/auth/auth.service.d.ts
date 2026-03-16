import { JwtService } from '@nestjs/jwt';
import { User } from '@validately/db';
export interface JwtPayload {
    sub: string;
    email: string;
    plan: string;
}
export declare class AuthService {
    private readonly jwtService;
    private prisma;
    constructor(jwtService: JwtService);
    validateUserById(userId: string): Promise<User>;
    validateJwtPayload(payload: JwtPayload): Promise<User>;
    generateToken(user: User): string;
    getUserByEmail(email: string): Promise<User | null>;
}
