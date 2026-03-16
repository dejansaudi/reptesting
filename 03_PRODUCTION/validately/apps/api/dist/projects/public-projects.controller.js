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
exports.PublicProjectsController = void 0;
const common_1 = require("@nestjs/common");
const db_1 = require("@validately/db");
const shared_1 = require("@validately/shared");
let PublicProjectsController = class PublicProjectsController {
    constructor() {
        this.prisma = new db_1.PrismaClient();
    }
    async findBySlug(slug) {
        const project = await this.prisma.project.findFirst({
            where: { publicSlug: slug, isPublic: true },
            include: {
                user: { select: { name: true } },
            },
        });
        if (!project) {
            throw new common_1.NotFoundException('Project not found or is not public');
        }
        const data = (project.data || {});
        const irs = (0, shared_1.calcIRS)(data);
        const stages = shared_1.STAGE_META.map((meta) => {
            const gateResults = (0, shared_1.validateGate)(meta.id, data);
            return {
                id: meta.id,
                phase: meta.phase,
                icon: meta.icon,
                color: meta.color,
                tagline: meta.tagline,
                gatePassed: gateResults.every((r) => r.pass),
                progress: irs.stages.find((s) => s.stage === meta.id)?.pct ?? 0,
            };
        });
        return {
            name: project.name,
            ownerName: project.user?.name || 'Anonymous',
            irs: { score: irs.score, maxScore: irs.maxScore, pct: irs.pct, band: irs.band, bandColor: irs.bandColor },
            stages,
            data: {
                startup_name: data.startup_name,
                problem_statement: data.problem_statement,
                who_has_problem: data.who_has_problem,
                why_now: data.why_now,
                value_prop: data.value_prop,
                revenue_model: data.revenue_model,
                pmf_score: data.pmf_score,
                vision_10yr: data.vision_10yr,
                company_purpose: data.company_purpose,
            },
        };
    }
};
exports.PublicProjectsController = PublicProjectsController;
__decorate([
    (0, common_1.Get)(':slug'),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProjectsController.prototype, "findBySlug", null);
exports.PublicProjectsController = PublicProjectsController = __decorate([
    (0, common_1.Controller)('public/projects')
], PublicProjectsController);
//# sourceMappingURL=public-projects.controller.js.map