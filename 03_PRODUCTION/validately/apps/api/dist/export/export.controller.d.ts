import { ExportService } from './export.service';
import { User } from '@validately/db';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    generatePdf(user: User, body: {
        projectId: string;
    }): Promise<{
        jobId: string;
        status: string;
        type: string;
        message: string;
    }>;
    generatePitchDeck(user: User, body: {
        projectId: string;
    }): Promise<{
        jobId: string;
        status: string;
        type: string;
        message: string;
    }>;
    generatePublicPage(user: User, body: {
        projectId: string;
        slug: string;
    }): Promise<{
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
}
