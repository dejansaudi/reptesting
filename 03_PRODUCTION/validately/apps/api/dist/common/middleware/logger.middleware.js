"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerMiddleware = void 0;
const common_1 = require("@nestjs/common");
let LoggerMiddleware = class LoggerMiddleware {
    use(req, res, next) {
        const { method, originalUrl, ip } = req;
        const startTime = Date.now();
        const requestId = req.headers['x-request-id'] ||
            `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        req.headers['x-request-id'] = requestId;
        res.setHeader('x-request-id', requestId);
        res.on('finish', () => {
            const duration = Date.now() - startTime;
            const { statusCode } = res;
            const logEntry = {
                level: statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info',
                msg: `${method} ${originalUrl}`,
                requestId,
                method,
                url: originalUrl,
                statusCode,
                duration: `${duration}ms`,
                ip,
                contentLength: res.getHeader('content-length'),
            };
            if (statusCode >= 400) {
                console.warn(JSON.stringify(logEntry));
            }
            else {
                console.log(JSON.stringify(logEntry));
            }
        });
        next();
    }
};
exports.LoggerMiddleware = LoggerMiddleware;
exports.LoggerMiddleware = LoggerMiddleware = __decorate([
    (0, common_1.Injectable)()
], LoggerMiddleware);
//# sourceMappingURL=logger.middleware.js.map