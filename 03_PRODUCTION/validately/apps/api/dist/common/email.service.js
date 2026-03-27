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
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const resend_1 = require("resend");
const app_config_service_1 = require("../config/app-config.service");
let EmailService = EmailService_1 = class EmailService {
    constructor(appConfig) {
        this.appConfig = appConfig;
        this.logger = new common_1.Logger(EmailService_1.name);
        this.resend = null;
    }
    onModuleInit() {
        if (this.appConfig.resendApiKey) {
            this.resend = new resend_1.Resend(this.appConfig.resendApiKey);
            this.logger.log('Resend email service initialized');
        }
        else {
            this.logger.warn('RESEND_API_KEY not set — emails will be logged only');
        }
    }
    async sendTeamInvite(params) {
        const safeName = this.escapeHtml(params.inviterName);
        const safeProject = this.escapeHtml(params.projectName);
        const safeRole = this.escapeHtml(params.role);
        const subject = `${params.inviterName} invited you to "${params.projectName}" on Validately`;
        const html = `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Validately</h2>
        <p><strong>${safeName}</strong> invited you to collaborate on <strong>${safeProject}</strong> as a <strong>${safeRole}</strong>.</p>
        <p>
          <a href="${this.appConfig.appUrl}/signup" style="display: inline-block; padding: 10px 24px; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 6px;">
            Accept Invitation
          </a>
        </p>
        <p style="color: #64748b; font-size: 13px;">If you already have an account, the project will appear in your dashboard automatically.</p>
      </div>
    `;
        return this.send({ to: params.to, subject, html });
    }
    escapeHtml(str) {
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }
    async send(params) {
        if (!this.resend) {
            this.logger.log(`[DRY RUN] Email to ${params.to}: ${params.subject}`);
            return { id: 'dry-run', status: 'logged' };
        }
        const result = await this.resend.emails.send({
            from: 'Validately <noreply@validately.app>',
            to: params.to,
            subject: params.subject,
            html: params.html,
        });
        this.logger.log(`Email sent to ${params.to}: ${result.data?.id}`);
        return { id: result.data?.id, status: 'sent' };
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [app_config_service_1.AppConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map