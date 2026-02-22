import { genkit, z } from 'genkit';
import { googleAI, gemini15Flash } from '@genkit-ai/googleai';

/**
 * Genkit AI instance.
 * GEMINI_API_KEY must be set as an environment variable.
 * Get a free key at: https://aistudio.google.com/app/apikey
 */
const ai = genkit({
    plugins: [googleAI()],
    model: gemini15Flash,
});

/**
 * Flow: suggest subtasks for a given todo title.
 * Returns an array of 3–5 clear, actionable subtask strings.
 */
export const suggestSubtasksFlow = ai.defineFlow(
    {
        name: 'suggestSubtasks',
        inputSchema: z.object({
            title: z.string().describe('The parent todo task title'),
        }),
        outputSchema: z.object({
            subtasks: z.array(z.string()).describe('List of 3–5 actionable subtasks'),
        }),
    },
    async ({ title }) => {
        const { output } = await ai.generate({
            prompt: `You are a productivity assistant. 
Given the following task title, suggest 3 to 5 clear and actionable subtasks that would help someone complete it.

Task: "${title}"

Return ONLY a JSON object in this format (no markdown, no explanation):
{"subtasks": ["subtask 1", "subtask 2", "subtask 3"]}`,
            output: {
                schema: z.object({
                    subtasks: z.array(z.string()),
                }),
            },
        });

        return output ?? { subtasks: [] };
    }
);

/**
 * Flow: prioritise a list of todos and return them sorted by urgency.
 */
export const prioritiseTodosFlow = ai.defineFlow(
    {
        name: 'prioritiseTodos',
        inputSchema: z.object({
            todos: z.array(z.string()).describe('List of todo titles to prioritise'),
        }),
        outputSchema: z.object({
            prioritised: z.array(
                z.object({
                    title: z.string(),
                    priority: z.enum(['high', 'medium', 'low']),
                    reason: z.string(),
                })
            ),
        }),
    },
    async ({ todos }) => {
        const { output } = await ai.generate({
            prompt: `You are a productivity assistant.
Given the following list of tasks, assign each a priority level (high, medium, or low) and give a one-sentence reason.

Tasks:
${todos.map((t, i) => `${i + 1}. ${t}`).join('\n')}

Return ONLY a JSON object (no markdown, no explanation):
{"prioritised": [{"title": "...", "priority": "high|medium|low", "reason": "..."}]}`,
            output: {
                schema: z.object({
                    prioritised: z.array(
                        z.object({
                            title: z.string(),
                            priority: z.enum(['high', 'medium', 'low']),
                            reason: z.string(),
                        })
                    ),
                }),
            },
        });

        return output ?? { prioritised: [] };
    }
);
