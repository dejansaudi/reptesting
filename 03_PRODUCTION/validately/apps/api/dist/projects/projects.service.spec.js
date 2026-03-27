"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const projects_service_1 = require("./projects.service");
const mockPrisma = {
    project: {
        count: vitest_1.vi.fn(),
        create: vitest_1.vi.fn(),
        findMany: vitest_1.vi.fn(),
        findUnique: vitest_1.vi.fn(),
        update: vitest_1.vi.fn(),
        updateMany: vitest_1.vi.fn(),
        delete: vitest_1.vi.fn(),
    },
};
const mockPrismaService = {
    client: mockPrisma,
};
const freeUser = { id: 'u1', email: 'a@b.com', name: 'A', plan: 'FREE' };
const proUser = { id: 'u2', email: 'b@b.com', name: 'B', plan: 'PRO' };
(0, vitest_1.describe)('ProjectsService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new projects_service_1.ProjectsService(mockPrismaService);
    });
    (0, vitest_1.describe)('create', () => {
        (0, vitest_1.it)('creates a project when under limit', async () => {
            mockPrisma.project.count.mockResolvedValue(0);
            mockPrisma.project.create.mockResolvedValue({ id: 'p1', name: 'Test' });
            const result = await service.create(freeUser, { name: 'Test' });
            (0, vitest_1.expect)(result).toEqual({ id: 'p1', name: 'Test' });
            (0, vitest_1.expect)(mockPrisma.project.create).toHaveBeenCalledWith({
                data: vitest_1.expect.objectContaining({ name: 'Test', userId: 'u1' }),
            });
        });
        (0, vitest_1.it)('rejects when FREE user exceeds 1 project', async () => {
            mockPrisma.project.count.mockResolvedValue(1);
            await (0, vitest_1.expect)(service.create(freeUser, { name: 'Test' })).rejects.toThrow(common_1.ForbiddenException);
        });
        (0, vitest_1.it)('allows PRO user up to 5 projects', async () => {
            mockPrisma.project.count.mockResolvedValue(4);
            mockPrisma.project.create.mockResolvedValue({ id: 'p2', name: 'Pro project' });
            const result = await service.create(proUser, { name: 'Pro project' });
            (0, vitest_1.expect)(result.id).toBe('p2');
        });
        (0, vitest_1.it)('uses default name when none provided', async () => {
            mockPrisma.project.count.mockResolvedValue(0);
            mockPrisma.project.create.mockResolvedValue({ id: 'p1', name: 'Untitled Startup' });
            await service.create(freeUser, {});
            (0, vitest_1.expect)(mockPrisma.project.create).toHaveBeenCalledWith({
                data: vitest_1.expect.objectContaining({ name: 'Untitled Startup' }),
            });
        });
    });
    (0, vitest_1.describe)('findAll', () => {
        (0, vitest_1.it)('returns paginated results', async () => {
            mockPrisma.project.findMany.mockResolvedValue([{ id: 'p1' }]);
            mockPrisma.project.count = vitest_1.vi.fn().mockResolvedValue(1);
            const result = await service.findAll('u1', {});
            (0, vitest_1.expect)(result.data).toHaveLength(1);
            (0, vitest_1.expect)(result.meta).toMatchObject({ total: 1, page: 1 });
        });
    });
    (0, vitest_1.describe)('findOne', () => {
        (0, vitest_1.it)('returns project when user is owner', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({
                id: 'p1',
                userId: 'u1',
                team: null,
            });
            const result = await service.findOne('p1', 'u1');
            (0, vitest_1.expect)(result.id).toBe('p1');
        });
        (0, vitest_1.it)('throws NotFoundException when project missing', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.findOne('missing', 'u1')).rejects.toThrow(common_1.NotFoundException);
        });
        (0, vitest_1.it)('throws ForbiddenException for non-member', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({
                id: 'p1',
                userId: 'other',
                team: { members: [] },
            });
            await (0, vitest_1.expect)(service.findOne('p1', 'u1')).rejects.toThrow(common_1.ForbiddenException);
        });
    });
    (0, vitest_1.describe)('update', () => {
        const existing = {
            id: 'p1',
            userId: 'u1',
            data: { startup_name: 'OldName' },
            version: 1,
            team: null,
        };
        (0, vitest_1.it)('merges data fields', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(existing);
            mockPrisma.project.update.mockResolvedValue({ id: 'p1' });
            await service.update('p1', 'u1', { data: { startup_name: 'NewName' } });
            (0, vitest_1.expect)(mockPrisma.project.update).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                data: vitest_1.expect.objectContaining({
                    data: vitest_1.expect.objectContaining({ startup_name: 'NewName' }),
                }),
            }));
        });
        (0, vitest_1.it)('uses optimistic locking when version provided', async () => {
            mockPrisma.project.findUnique
                .mockResolvedValueOnce(existing)
                .mockResolvedValueOnce({ ...existing, version: 2 });
            mockPrisma.project.updateMany.mockResolvedValue({ count: 1 });
            await service.update('p1', 'u1', {
                data: { startup_name: 'X' },
                version: 1,
            });
            (0, vitest_1.expect)(mockPrisma.project.updateMany).toHaveBeenCalledWith(vitest_1.expect.objectContaining({
                where: { id: 'p1', version: 1 },
            }));
        });
        (0, vitest_1.it)('throws ConflictException on version mismatch', async () => {
            mockPrisma.project.findUnique.mockResolvedValue(existing);
            mockPrisma.project.updateMany.mockResolvedValue({ count: 0 });
            await (0, vitest_1.expect)(service.update('p1', 'u1', { data: { startup_name: 'X' }, version: 99 })).rejects.toThrow(common_1.ConflictException);
        });
    });
    (0, vitest_1.describe)('remove', () => {
        (0, vitest_1.it)('deletes project when user is owner', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'u1' });
            mockPrisma.project.delete.mockResolvedValue({});
            await service.remove('p1', 'u1');
            (0, vitest_1.expect)(mockPrisma.project.delete).toHaveBeenCalledWith({ where: { id: 'p1' } });
        });
        (0, vitest_1.it)('rejects non-owner', async () => {
            mockPrisma.project.findUnique.mockResolvedValue({ id: 'p1', userId: 'other' });
            await (0, vitest_1.expect)(service.remove('p1', 'u1')).rejects.toThrow(common_1.ForbiddenException);
        });
    });
});
//# sourceMappingURL=projects.service.spec.js.map