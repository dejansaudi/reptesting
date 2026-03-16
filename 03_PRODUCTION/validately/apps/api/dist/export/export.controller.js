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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const auth_guard_1 = require("../auth/auth.guard");
const plan_guard_1 = require("../auth/plan.guard");
const current_user_decorator_1 = require("../auth/current-user.decorator");
const export_service_1 = require("./export.service");
let ExportController = class ExportController {
    constructor(exportService) {
        this.exportService = exportService;
    }
    async generatePdf(user, body) {
        return this.exportService.generatePdf(user, body.projectId);
    }
    async generatePitchDeck(user, body) {
        return this.exportService.generatePitchDeck(user, body.projectId);
    }
    async generatePublicPage(user, body) {
        return this.exportService.generatePublicPage(user, body.projectId, body.slug);
    }
    async getJobStatus(jobId) {
        return this.exportService.getJobStatus(jobId);
    }
    async downloadJob(jobId, res) {
        const { buffer, filename } = await this.exportService.getJobDownload(jobId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': buffer.length.toString(),
        });
        res.end(buffer);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Post)('pdf'),
    (0, plan_guard_1.RequirePlan)('PRO', 'TEAM'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "generatePdf", null);
__decorate([
    (0, common_1.Post)('pitch-deck'),
    (0, plan_guard_1.RequirePlan)('PRO', 'TEAM'),
    (0, common_1.HttpCode)(common_1.HttpStatus.ACCEPTED),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "generatePitchDeck", null);
__decorate([
    (0, common_1.Post)('public-page'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "generatePublicPage", null);
__decorate([
    (0, common_1.Get)('jobs/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "getJobStatus", null);
__decorate([
    (0, common_1.Get)('jobs/:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "downloadJob", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('export'),
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard, plan_guard_1.PlanGuard),
    __metadata("design:paramtypes", [export_service_1.ExportService])
], ExportController);
//# sourceMappingURL=export.controller.js.map