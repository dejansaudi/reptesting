"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const health_controller_1 = require("./health.controller");
(0, vitest_1.describe)('HealthController', () => {
    const controller = new health_controller_1.HealthController();
    (0, vitest_1.it)('returns ok status with expected shape', () => {
        const result = controller.check();
        (0, vitest_1.expect)(result).toMatchObject({
            status: 'ok',
            service: 'validately-api',
        });
        (0, vitest_1.expect)(result.timestamp).toBeDefined();
    });
});
//# sourceMappingURL=health.controller.spec.js.map