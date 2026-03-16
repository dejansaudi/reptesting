import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
declare const GlobalJwtAuthGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class GlobalJwtAuthGuard extends GlobalJwtAuthGuard_base {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | import("rxjs").Observable<boolean>;
    handleRequest<TUser>(err: Error | null, user: TUser, info: Error | undefined): TUser;
}
export {};
