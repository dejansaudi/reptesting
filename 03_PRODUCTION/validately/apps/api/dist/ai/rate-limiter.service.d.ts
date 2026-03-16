import { ConfigService } from '@nestjs/config';
import { User } from '@validately/db';
export declare class RateLimiterService {
    private readonly configService;
    private redis;
    constructor(configService: ConfigService);
    checkAndIncrement(user: User): Promise<void>;
    getUsage(userId: string): Promise<{
        used: number;
        limit: number;
        remaining: number;
        resetsAt: string;
    }>;
    private getRateLimitKey;
}
