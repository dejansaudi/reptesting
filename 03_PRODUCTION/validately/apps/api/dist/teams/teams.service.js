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
exports.TeamsService = void 0;
const common_1 = require("@nestjs/common");
const email_service_1 = require("../common/email.service");
const prisma_service_1 = require("../common/prisma.service");
const MAX_TEAM_MEMBERS = 5;
let TeamsService = class TeamsService {
    constructor(emailService, prismaService) {
        this.emailService = emailService;
        this.prismaService = prismaService;
    }
    get prisma() {
        return this.prismaService.client;
    }
    async getOrCreateTeam(projectId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: { team: true },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.team)
            return project.team;
        const team = await this.prisma.team.create({
            data: { name: `Team for ${project.name}` },
        });
        await this.prisma.project.update({
            where: { id: projectId },
            data: { teamId: team.id },
        });
        return team;
    }
    async getMembers(user, projectId) {
        await this.verifyProjectAccess(projectId, user.id);
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
            include: {
                user: {
                    select: { id: true, name: true, email: true, avatar: true },
                },
                team: {
                    include: {
                        members: {
                            include: {
                                user: {
                                    select: { id: true, name: true, email: true, avatar: true },
                                },
                            },
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                },
            },
        });
        return {
            owner: project?.user,
            members: (project?.team?.members ?? []).map((m) => ({
                id: m.id,
                role: m.role,
                user: m.user,
                joinedAt: m.createdAt,
            })),
        };
    }
    async invite(user, projectId, email, role) {
        await this.verifyProjectOwnership(projectId, user.id);
        const team = await this.getOrCreateTeam(projectId);
        const memberCount = await this.prisma.teamMember.count({
            where: { teamId: team.id },
        });
        if (memberCount >= MAX_TEAM_MEMBERS) {
            throw new common_1.ForbiddenException(`Team member limit reached (${MAX_TEAM_MEMBERS}). ` +
                'Remove a member before adding a new one.');
        }
        const invitedUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!invitedUser) {
            const project = await this.prisma.project.findUnique({ where: { id: projectId } });
            await this.emailService.sendTeamInvite({
                to: email,
                inviterName: user.name || user.email,
                projectName: project?.name || 'Untitled Project',
                role: role === 'EDITOR' ? 'Editor' : 'Viewer',
            });
            return { status: 'invited', email };
        }
        if (invitedUser.id === user.id) {
            throw new common_1.BadRequestException('You cannot invite yourself');
        }
        const existing = await this.prisma.teamMember.findUnique({
            where: {
                userId_teamId: {
                    userId: invitedUser.id,
                    teamId: team.id,
                },
            },
        });
        if (existing) {
            throw new common_1.ConflictException('User is already a team member');
        }
        const teamRole = role === 'EDITOR' ? 'EDITOR' : 'VIEWER';
        const member = await this.prisma.teamMember.create({
            data: {
                userId: invitedUser.id,
                teamId: team.id,
                role: teamRole,
            },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        return {
            status: 'added',
            member: {
                id: member.id,
                role: member.role,
                user: member.user,
            },
        };
    }
    async updateRole(user, projectId, memberId, role) {
        await this.verifyProjectOwnership(projectId, user.id);
        const team = await this.getOrCreateTeam(projectId);
        const member = await this.prisma.teamMember.findFirst({
            where: { id: memberId, teamId: team.id },
        });
        if (!member) {
            throw new common_1.NotFoundException('Team member not found');
        }
        if (role !== 'EDITOR' && role !== 'VIEWER') {
            throw new common_1.BadRequestException('Role must be EDITOR or VIEWER');
        }
        return this.prisma.teamMember.update({
            where: { id: memberId },
            data: { role: role },
            include: {
                user: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
    }
    async removeMember(user, projectId, memberId) {
        await this.verifyProjectOwnership(projectId, user.id);
        const team = await this.getOrCreateTeam(projectId);
        const member = await this.prisma.teamMember.findFirst({
            where: { id: memberId, teamId: team.id },
        });
        if (!member) {
            throw new common_1.NotFoundException('Team member not found');
        }
        await this.prisma.teamMember.delete({
            where: { id: memberId },
        });
    }
    async verifyProjectAccess(projectId, userId) {
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
    async verifyProjectOwnership(projectId, userId) {
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found');
        }
        if (project.userId !== userId) {
            throw new common_1.ForbiddenException('Only the project owner can manage team members');
        }
        return project;
    }
};
exports.TeamsService = TeamsService;
exports.TeamsService = TeamsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [email_service_1.EmailService,
        prisma_service_1.PrismaService])
], TeamsService);
//# sourceMappingURL=teams.service.js.map