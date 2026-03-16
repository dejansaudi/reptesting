import { TeamsService } from './teams.service';
import { User } from '@validately/db';
export declare class TeamsController {
    private readonly teamsService;
    constructor(teamsService: TeamsService);
    getMembers(user: User, projectId: string): Promise<{
        owner: {
            name: string | null;
            id: string;
            email: string;
            avatar: string | null;
        } | undefined;
        members: {
            id: string;
            role: import("@validately/db").$Enums.TeamRole;
            user: {
                name: string | null;
                id: string;
                email: string;
                avatar: string | null;
            };
            joinedAt: Date;
        }[];
    }>;
    invite(user: User, projectId: string, body: {
        email: string;
        role?: string;
    }): Promise<{
        status: string;
        email: string;
        message: string;
        member?: undefined;
    } | {
        status: string;
        member: {
            id: string;
            role: import("@validately/db").$Enums.TeamRole;
            user: {
                name: string | null;
                id: string;
                email: string;
            };
        };
        email?: undefined;
        message?: undefined;
    }>;
    updateRole(user: User, projectId: string, memberId: string, body: {
        role: string;
    }): Promise<{
        user: {
            name: string | null;
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        teamId: string;
        role: import("@validately/db").$Enums.TeamRole;
    }>;
    removeMember(user: User, projectId: string, memberId: string): Promise<void>;
}
