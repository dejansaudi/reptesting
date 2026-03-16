import { User } from '@validately/db';
export declare class ExportService {
    private prisma;
    generatePdf(user: User, projectId: string): Promise<{
        jobId: string;
        status: string;
        type: string;
        message: string;
    }>;
    generatePitchDeck(user: User, projectId: string): Promise<{
        jobId: string;
        status: string;
        type: string;
        message: string;
    }>;
    generatePublicPage(user: User, projectId: string, slug: string): Promise<{
        slug: string;
        url: string;
        status: string;
    }>;
    getJobStatus(jobId: string): Promise<{
        jobId: string;
        status: string;
        downloadUrl: null;
        message: string;
    }>;
    private getProjectWithAccessCheck;
}
