"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggingInterceptor = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
let LoggingInterceptor = class LoggingInterceptor {
    intercept(context, next) {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        const { method, url, ip } = request;
        const userAgent = request.get('user-agent') || '';
        const startTime = Date.now();
        return next.handle().pipe((0, rxjs_1.tap)({
            next: () => {
                const duration = Date.now() - startTime;
                const statusCode = response.statusCode;
                console.log(JSON.stringify({
                    level: 'info',
                    msg: 'request completed',
                    method,
                    url,
                    statusCode,
                    duration: `${duration}ms`,
                    ip,
                    userAgent: userAgent.slice(0, 100),
                }));
            },
            error: (error) => {
                const duration = Date.now() - startTime;
                console.error(JSON.stringify({
                    level: 'error',
                    msg: 'request failed',
                    method,
                    url,
                    duration: `${duration}ms`,
                    error: error.message,
                    stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined,
                    ip,
                }));
            },
        }));
    }
};
exports.LoggingInterceptor = LoggingInterceptor;
exports.LoggingInterceptor = LoggingInterceptor = __decorate([
    (0, common_1.Injectable)()
], LoggingInterceptor);
//# sourceMappingURL=logging.interceptor.js.map