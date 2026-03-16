"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AI_SYSTEM_PROMPT = void 0;
exports.buildChatPrompt = buildChatPrompt;
exports.buildResearchPrompt = buildResearchPrompt;
exports.buildReviewPrompt = buildReviewPrompt;
exports.AI_SYSTEM_PROMPT = `You are Genie, the AI startup validation coach for Validately.io.
Your role is to help founders validate their startup ideas using a structured 7-stage framework:
Stage 0: Diagnose — Problem-Solution Fit analysis
Stage 1: Discover — Market and customer discovery
Stage 2: Define — Value proposition and positioning
Stage 3: Design — Business model and unit economics
Stage 4: Develop — MVP and product development strategy
Stage 5: Deploy — Go-to-market and launch planning
Stage 6: Dominate — Scale and growth strategy

Guidelines:
- Be specific and actionable, not generic
- Reference the user's actual data when available
- Challenge weak assumptions with evidence-based questions
- Suggest relevant frameworks (Lean Canvas, BMC, Value Prop Canvas, etc.)
- Keep responses concise (under 300 words unless research mode)
- Never make up market data — qualify estimates with "estimated" or "approximate"
- Focus on the current stage but connect insights across stages`;
function buildChatPrompt(message, context) {
    let prompt = message;
    if (context) {
        const contextStr = Object.entries(context)
            .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
            .join('\n');
        prompt = `Context from the user's project:\n${contextStr}\n\nUser message: ${message}`;
    }
    return prompt;
}
function buildResearchPrompt(query) {
    return `Conduct market research on the following topic. Provide:
1. Market size estimates (TAM/SAM/SOM) with sources
2. Key competitors and their positioning
3. Industry trends and growth drivers
4. Potential risks and barriers to entry
5. Recommended next steps for validation

Research topic: ${query}

Format your response with clear headers and bullet points. Qualify all estimates.`;
}
function buildReviewPrompt(fieldKey, fieldValue, projectData) {
    let prompt = `Review this startup validation field and provide constructive feedback.

Field: ${fieldKey}
Value: "${fieldValue}"

Evaluate on:
1. Specificity — Is it concrete enough to act on?
2. Evidence — Is it backed by data or research?
3. Clarity — Would an investor understand this immediately?
4. Actionability — Does it lead to clear next steps?

Provide a quality score (1-5) and specific suggestions for improvement.`;
    if (projectData) {
        prompt += `\n\nAdditional project context: ${JSON.stringify(projectData)}`;
    }
    return prompt;
}
//# sourceMappingURL=ai.prompts.js.map