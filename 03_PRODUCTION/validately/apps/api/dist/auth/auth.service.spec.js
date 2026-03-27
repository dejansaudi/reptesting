"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const mockUser = { id: 'u1', email: 'test@test.com', plan: 'FREE' };
const mockPrisma = {
    user: {
        findUnique: vitest_1.vi.fn(),
    },
};
const mockPrismaService = {
    client: mockPrisma,
};
const mockJwtService = {
    sign: vitest_1.vi.fn().mockReturnValue('mock-jwt-token'),
};
(0, vitest_1.describe)('AuthService', () => {
    let service;
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        service = new auth_service_1.AuthService(mockJwtService, mockPrismaService);
    });
    (0, vitest_1.describe)('validateUserById', () => {
        (0, vitest_1.it)('returns user when found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const result = await service.validateUserById('u1');
            (0, vitest_1.expect)(result).toEqual(mockUser);
        });
        (0, vitest_1.it)('throws UnauthorizedException when user not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            await (0, vitest_1.expect)(service.validateUserById('missing')).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    (0, vitest_1.describe)('generateToken', () => {
        (0, vitest_1.it)('signs JWT with correct payload', () => {
            const token = service.generateToken(mockUser);
            (0, vitest_1.expect)(token).toBe('mock-jwt-token');
            (0, vitest_1.expect)(mockJwtService.sign).toHaveBeenCalledWith({
                sub: 'u1',
                email: 'test@test.com',
                plan: 'FREE',
            });
        });
    });
    (0, vitest_1.describe)('getUserByEmail', () => {
        (0, vitest_1.it)('returns user by email', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(mockUser);
            const result = await service.getUserByEmail('test@test.com');
            (0, vitest_1.expect)(result).toEqual(mockUser);
        });
        (0, vitest_1.it)('returns null when not found', async () => {
            mockPrisma.user.findUnique.mockResolvedValue(null);
            const result = await service.getUserByEmail('nope@test.com');
            (0, vitest_1.expect)(result).toBeNull();
        });
    });
});
//# sourceMappingURL=auth.service.spec.js.map