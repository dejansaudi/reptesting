"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const health_module_1 = require("./health/health.module");
const auth_module_1 = require("./auth/auth.module");
const projects_module_1 = require("./projects/projects.module");
const billing_module_1 = require("./billing/billing.module");
const ai_module_1 = require("./ai/ai.module");
const export_module_1 = require("./export/export.module");
const snapshots_module_1 = require("./snapshots/snapshots.module");
const teams_module_1 = require("./teams/teams.module");
const users_module_1 = require("./users/users.module");
const app_config_module_1 = require("./config/app-config.module");
const logger_middleware_1 = require("./common/middleware/logger.middleware");
const rate_limit_guard_1 = require("./common/guards/rate-limit.guard");
const prisma_service_1 = require("./common/prisma.service");
let AppModule = class AppModule {
    configure(consumer) {
        consumer.apply(logger_middleware_1.LoggerMiddleware).forRoutes('*');
    }
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            app_config_module_1.AppConfigModule,
            health_module_1.HealthModule,
            auth_module_1.AuthModule,
            projects_module_1.ProjectsModule,
            billing_module_1.BillingModule,
            ai_module_1.AiModule,
            export_module_1.ExportModule,
            snapshots_module_1.SnapshotsModule,
            teams_module_1.TeamsModule,
            users_module_1.UsersModule,
        ],
        providers: [
            prisma_service_1.PrismaService,
            {
                provide: core_1.APP_GUARD,
                useClass: rate_limit_guard_1.RateLimitGuard,
            },
        ],
        exports: [prisma_service_1.PrismaService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map