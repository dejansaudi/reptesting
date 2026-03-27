"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ExportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const common_1 = require("@nestjs/common");
const pdf_generator_1 = require("./pdf-generator");
const deck_generator_1 = require("./deck-generator");
const prisma_service_1 = require("../common/prisma.service");
let ExportService = ExportService_1 = class ExportService {
    constructor(prismaService) {
        this.prismaService = prismaService;
        this.logger = new common_1.Logger(ExportService_1.name);
        this.buffers = new Map();
    }
    get prisma() {
        return this.prismaService.client;
    }
    async generatePdf(user, projectId) {
        const project = await this.getProjectWithAccessCheck(projectId, user.id);
        const job = await this.prisma.exportJob.create({
            data: {
                type: 'pdf',
                status: 'QUEUED',
                projectId,
                userId: user.id,
            },
        });
        this.processJob(job.id, 'pdf', project.name, (project.data || {}))
            .catch((err) => this.logger.error(`Unexpected export error: ${job.id}`, err));
        return { jobId: job.id, status: 'queued', type: 'pdf' };
    }
    async generatePitchDeck(user, projectId) {
        const project = await this.getProjectWithAccessCheck(projectId, user.id);
        const job = await this.prisma.exportJob.create({
            data: {
                type: 'pitch-deck',
                status: 'QUEUED',
                projectId,
                userId: user.id,
            },
        });
        this.processJob(job.id, 'pitch-deck', project.name, (project.data || {}))
            .catch((err) => this.logger.error(`Unexpected export error: ${job.id}`, err));
        return { jobId: job.id, status: 'queued', type: 'pitch-deck' };
    }
    async generatePublicPage(user, projectId, slug) {
        await this.getProjectWithAccessCheck(projectId, user.id);
        await this.prisma.project.update({
            where: { id: projectId },
            data: {
                isPublic: true,
                publicSlug: slug,
            },
        });
        return {
            slug,
            url: `/p/${slug}`,
            status: 'published',
        };
    }
    async getJobStatus(jobId, userId) {
        const job = await this.prisma.exportJob.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new common_1.NotFoundException('Export job not found');
        }
        if (job.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this export job');
        }
        return {
            jobId: job.id,
            status: job.status.toLowerCase(),
            type: job.type,
            downloadUrl: job.status === 'COMPLETED' ? `/api/export/jobs/${job.id}/download` : null,
            error: job.error,
        };
    }
    async getJobDownload(jobId, userId) {
        const job = await this.prisma.exportJob.findUnique({
            where: { id: jobId },
        });
        if (!job) {
            throw new common_1.NotFoundException('Export job not found');
        }
        if (job.userId !== userId) {
            throw new common_1.ForbiddenException('You do not have access to this export job');
        }
        if (job.status !== 'COMPLETED') {
            throw new common_1.NotFoundException('Export not ready yet');
        }
        const buffer = this.buffers.get(jobId);
        if (!buffer) {
            throw new common_1.NotFoundException('Export file expired. Please regenerate.');
        }
        const ext = job.type === 'pitch-deck' ? 'pitch-deck' : 'report';
        return {
            buffer,
            filename: `validately-${ext}-${Date.now()}.pdf`,
        };
    }
    async processJob(jobId, type, name, data) {
        try {
            await this.prisma.exportJob.update({
                where: { id: jobId },
                data: { status: 'PROCESSING' },
            });
            const buffer = type === 'pdf'
                ? await (0, pdf_generator_1.generateProjectPdf)(name, data)
                : await (0, deck_generator_1.generatePitchDeckPdf)(name, data);
            this.buffers.set(jobId, buffer);
            await this.prisma.exportJob.update({
                where: { id: jobId },
                data: { status: 'COMPLETED', completedAt: new Date() },
            });
            this.logger.log(`Export generated: ${jobId} (${type})`);
            setTimeout(() => this.buffers.delete(jobId), 30 * 60 * 1000);
        }
        catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Unknown error';
            await this.prisma.exportJob.update({
                where: { id: jobId },
                data: { status: 'FAILED', error: errorMsg, completedAt: new Date() },
            });
            this.logger.error(`Export failed: ${jobId}`, err);
        }
    }
    async getProjectWithAccessCheck(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { team: { include: { members: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const isOwner = project.userId === userId;
        const isMember = project.team?.members.some((m) => m.userId === userId) ?? false;
        if (!isOwner && !isMember) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
        return project;
    }
};
exports.ExportService = ExportService;
exports.ExportService = ExportService = ExportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExportService);
//# sourceMappingURL=export.service.js.map