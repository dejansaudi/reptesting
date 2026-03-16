import { AiService } from './ai.service';
import { User } from '@validately/db';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(user: User, body: {
        message: string;
        context?: Record<string, unknown>;
    }): Promise<{
        message: string;
        usage: {
            used: number;
            limit: number;
            remaining: number;
            resetsAt: string;
        };
    }>;
    research(user: User, body: {
        query: string;
        projectId: string;
    }): Promise<{
        jobId: string;
        status: string;
        message: string;
    }>;
    review(user: User, body: {
        fieldKey: string;
        fieldValue: string;
        projectData?: Record<string, unknown>;
    }): Promise<{
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
}
