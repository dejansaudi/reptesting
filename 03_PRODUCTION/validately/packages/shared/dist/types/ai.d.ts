import type { StageId } from './stage';
import type { ProjectData } from './project';
/** A message in the AI coach conversation */
export interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}
/** Result from AI market research */
export interface ResearchResult {
    query: string;
    summary: string;
    sources: string[];
    timestamp: string;
}
/** Genie trigger — buzzword pattern that fires a coaching nudge */
export interface GenieTrigger {
    pattern: RegExp;
    msg: string;
    stage: StageId;
}
/** Proactive trigger — fires when a key field reaches a threshold */
export interface ProactiveTrigger {
    stage: StageId;
    field: keyof ProjectData;
    minLength: number;
    prompt: (val: string, data: Partial<ProjectData>) => string;
}
//# sourceMappingURL=ai.d.ts.map