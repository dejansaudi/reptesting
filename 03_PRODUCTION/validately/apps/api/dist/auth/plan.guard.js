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
exports.PlanGuard = exports.RequirePlan = exports.REQUIRED_PLAN_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
exports.REQUIRED_PLAN_KEY = 'requiredPlan';
const RequirePlan = (...plans) => (0, common_1.SetMetadata)(exports.REQUIRED_PLAN_KEY, plans);
exports.RequirePlan = RequirePlan;
const PLAN_HIERARCHY = {
    FREE: 0,
    PRO: 1,
    TEAM: 2,
};
let PlanGuard = class PlanGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredPlans = this.reflector.getAllAndOverride(exports.REQUIRED_PLAN_KEY, [context.getHandler(), context.getClass()]);
        if (!requiredPlans || requiredPlans.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        if (!user) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const userPlanLevel = PLAN_HIERARCHY[user.plan] ?? 0;
        const minRequiredLevel = Math.min(...requiredPlans.map((p) => PLAN_HIERARCHY[p] ?? 0));
        if (userPlanLevel < minRequiredLevel) {
            throw new common_1.ForbiddenException(`This feature requires a ${requiredPlans.join(' or ')} plan. ` +
                `Your current plan: ${user.plan}. Upgrade at /settings/billing.`);
        }
        return true;
    }
};
exports.PlanGuard = PlanGuard;
exports.PlanGuard = PlanGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], PlanGuard);
//# sourceMappingURL=plan.guard.js.map