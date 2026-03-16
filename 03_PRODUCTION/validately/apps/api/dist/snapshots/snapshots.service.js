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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SnapshotsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../common/prisma.service");
const PLAN_SNAPSHOT_LIMITS = {
    FREE: 5,
    PRO: 50,
    TEAM: Infinity,
};
let SnapshotsService = class SnapshotsService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    get prisma() {
        return this.prismaService.client;
    }
    async create(user, projectId, name) {
        const project = await this.getProjectWithAccessCheck(projectId, user.id);
        const snapshotCount = await this.prisma.snapshot.count({
            where: { projectId },
        });
        const limit = PLAN_SNAPSHOT_LIMITS[user.plan] ?? 5;
        if (snapshotCount >= limit) {
            throw new common_1.ForbiddenException(`Your ${user.plan} plan allows up to ${limit} snapshots per project. ` +
                'Upgrade to create more.');
        }
        return this.prisma.snapshot.create({
            data: {
                name,
                data: project.data || {},
                stageIdx: project.stageIdx,
                projectId,
            },
        });
    }
    async findAll(user, projectId) {
        await this.getProjectWithAccessCheck(projectId, user.id);
        return this.prisma.snapshot.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                stageIdx: true,
                createdAt: true,
            },
        });
    }
    async restore(user, projectId, snapshotId) {
        await this.getProjectWithAccessCheck(projectId, user.id, true);
        const snapshot = await this.prisma.snapshot.findFirst({
            where: { id: snapshotId, projectId },
        });
        if (!snapshot) {
            throw new common_1.NotFoundException('Snapshot not found');
        }
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (project) {
            await this.prisma.snapshot.create({
                data: {
                    name: `Auto-save before restore (${new Date().toISOString()})`,
                    data: project.data || {},
                    stageIdx: project.stageIdx,
                    projectId,
                },
            });
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                data: snapshot.data,
                stageIdx: snapshot.stageIdx,
                version: { increment: 1 },
            },
        });
    }
    async remove(user, projectId, snapshotId) {
        await this.getProjectWithAccessCheck(projectId, user.id, true);
        const snapshot = await this.prisma.snapshot.findFirst({
            where: { id: snapshotId, projectId },
        });
        if (!snapshot) {
            throw new common_1.NotFoundException('Snapshot not found');
        }
        await this.prisma.snapshot.delete({
            where: { id: snapshotId },
        });
    }
    async getProjectWithAccessCheck(projectId, userId, requireEdit = false) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { team: { include: { members: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const isOwner = project.userId === userId;
        const member = project.team?.members.find((m) => m.userId === userId);
        const isMember = !!member;
        if (!isOwner && !isMember) {
            throw new common_1.ForbiddenException('You do not have access to this project');
        }
        if (requireEdit && !isOwner && member?.role === 'VIEWER') {
            throw new common_1.ForbiddenException('You do not have edit access to this project');
        }
        return project;
    }
};
exports.SnapshotsService = SnapshotsService;
exports.SnapshotsService = SnapshotsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SnapshotsService);
//# sourceMappingURL=snapshots.service.js.map