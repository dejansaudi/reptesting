export declare class CreateProjectDto {
    name?: string;
    data?: Record<string, unknown>;
}
export declare class UpdateProjectDto {
    name?: string;
    data?: Record<string, unknown>;
    stageIdx?: number;
    unlocked?: number[];
    xp?: number;
    isPublic?: boolean;
    publicSlug?: string;
    version: number;
}
export declare class ProjectQueryDto {
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: 'asc' | 'desc';
}
