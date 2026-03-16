import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare const REQUIRED_PLAN_KEY = "requiredPlan";
export declare const RequirePlan: (...plans: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare class PlanGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
