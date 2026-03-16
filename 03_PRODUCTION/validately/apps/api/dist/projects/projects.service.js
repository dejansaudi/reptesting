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
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const shared_1 = require("@validately/shared");
const prisma_service_1 = require("../common/prisma.service");
const PLAN_PROJECT_LIMITS = {
    FREE: 1,
    PRO: 5,
    TEAM: Infinity,
};
let ProjectsService = class ProjectsService {
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    get prisma() {
        return this.prismaService.client;
    }
    async create(user, dto) {
        const existingCount = await this.prisma.project.count({
            where: { userId: user.id },
        });
        const limit = PLAN_PROJECT_LIMITS[user.plan] ?? 1;
        if (existingCount >= limit) {
            throw new common_1.ForbiddenException(`Your ${user.plan} plan allows up to ${limit} project(s). Upgrade to create more.`);
        }
        return this.prisma.project.create({
            data: {
                name: dto.name || 'Untitled Startup',
                data: (dto.data || {}),
                userId: user.id,
            },
        });
    }
    async findAll(userId, query) {
        const { page = 1, limit = 20, sortBy = 'updatedAt', order = 'desc' } = query;
        const skip = (page - 1) * limit;
        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where: {
                    OR: [
                        { userId: userId },
                        { team: { members: { some: { userId } } } },
                    ],
                },
                orderBy: { [sortBy]: order },
                skip,
                take: limit,
                include: {
                    _count: { select: { snapshots: true } },
                },
            }),
            this.prisma.project.count({
                where: {
                    OR: [
                        { userId: userId },
                        { team: { members: { some: { userId } } } },
                    ],
                },
            }),
        ]);
        return {
            data: projects,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                user: { select: { id: true, name: true, email: true } },
                team: {
                    include: {
                        members: {
                            include: {
                                user: { select: { id: true, name: true, email: true } },
                            },
                        },
                    },
                },
                _count: { select: { snapshots: true } },
            },
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
    async update(projectId, userId, dto) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { team: { include: { members: true } } },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        const isOwner = project.userId === userId;
        const isEditor = project.team?.members.some((m) => m.userId === userId && (m.role === 'OWNER' || m.role === 'EDITOR')) ?? false;
        if (!isOwner && !isEditor) {
            throw new common_1.ForbiddenException('You do not have edit access to this project');
        }
        const existingData = project.data || {};
        const mergedData = (dto.data ? { ...existingData, ...dto.data } : existingData);
        const irsResult = dto.data ? (0, shared_1.calcIRS)(mergedData) : undefined;
        const irsScore = irsResult?.score;
        const { version: _version, data: _data, ...rest } = dto;
        if (dto.version !== undefined) {
            const result = await this.prisma.project.updateMany({
                where: { id: projectId, version: dto.version },
                data: {
                    ...rest,
                    data: mergedData,
                    ...(irsScore !== undefined && { irsScore }),
                    version: project.version + 1,
                },
            });
            if (result.count === 0) {
                throw new common_1.ConflictException('This project has been modified by another session. ' +
                    'Please refresh and try again.');
            }
            return this.prisma.project.findUnique({ where: { id: projectId } });
        }
        return this.prisma.project.update({
            where: { id: projectId },
            data: {
                ...rest,
                data: mergedData,
                ...(irsScore !== undefined && { irsScore }),
                version: { increment: 1 },
            },
        });
    }
    async remove(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.userId !== userId) {
            throw new common_1.ForbiddenException('Only the project owner can delete a project');
        }
        await this.prisma.project.delete({
            where: { id: projectId },
        });
    }
    async getScore(projectId, userId) {
        const project = await this.findOne(projectId, userId);
        const data = (project.data || {});
        const irs = (0, shared_1.calcIRS)(data);
        const xv = (0, shared_1.runXV)(data);
        const gates = [0, 1, 2, 3, 4, 5, 6].map((stageId) => ({
            stage: stageId,
            criteria: (0, shared_1.validateGate)(stageId, data),
        }));
        return { irs, xv, gates };
    }
    async getScoreHistory(projectId, userId) {
        await this.findOne(projectId, userId);
        return this.prisma.scoreSnapshot.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
            take: 50,
        });
    }
    async createScoreSnapshot(projectId, userId) {
        const project = await this.findOne(projectId, userId);
        const data = (project.data || {});
        const irs = (0, shared_1.calcIRS)(data);
        return this.prisma.scoreSnapshot.create({
            data: {
                projectId,
                score: irs.score,
                band: irs.band,
                stageIdx: project.stageIdx,
                stages: irs.stages,
            },
        });
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map