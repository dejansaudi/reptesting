import { ConfigService } from '@nestjs/config';
import { User } from '@validately/db';
import { RateLimiterService } from './rate-limiter.service';
export declare class AiService {
    private readonly configService;
    private readonly rateLimiter;
    constructor(configService: ConfigService, rateLimiter: RateLimiterService);
    chat(user: User, message: string, context?: Record<string, unknown>): Promise<{
        message: string;
        usage: {
            used: number;
            limit: number;
            remaining: number;
            resetsAt: string;
        };
    }>;
    startResearch(user: User, query: string, projectId: string): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    reviewField(user: User, fieldKey: string, fieldValue: string, projectData?: Record<string, unknown>): Promise<{
        fieldKey: string;
        feedback: string;
        usage: {
            used: number;
            limit: number;
            remaining: number;
            resetsAt: string;
        };
    }>;
    getJobStatus(jobId: string): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    getUsage(user: User): Promise<{
        used: number;
        limit: number;
        remaining: number;
        resetsAt: string;
    }>;
    private getMaxTokens;
    private sanitizeInput;
}
