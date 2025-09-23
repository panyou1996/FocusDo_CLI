// Prioritize tasks based on importance using AI.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for prioritizing tasks using AI.
 *
 * - prioritizeTasks - A function that prioritizes a list of tasks based on importance.
 * - PrioritizeTasksInput - The input type for the prioritizeTasks function.
 * - PrioritizeTasksOutput - The output type for the prioritizeTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeTasksInputSchema = z.array(
  z.object({
    title: z.string().describe('The title of the task.'),
    description: z.string().describe('A detailed description of the task.'),
    dueDate: z.string().optional().describe('The due date of the task (ISO format).'),
    isImportant: z.boolean().optional().describe('Whether the task is currently marked as important.'),
  })
).describe('A list of tasks to prioritize.');

export type PrioritizeTasksInput = z.infer<typeof PrioritizeTasksInputSchema>;

const PrioritizeTasksOutputSchema = z.array(
  z.object({
    title: z.string().describe('The title of the task.'),
    description: z.string().describe('A detailed description of the task.'),
    dueDate: z.string().optional().describe('The due date of the task (ISO format).'),
    isImportant: z.boolean().describe('Whether the task is marked as important by the AI.'),
    reason: z.string().describe('The AI reasoning for the importance level.'),
  })
).describe('A list of tasks with AI-determined importance and reasoning.');

export type PrioritizeTasksOutput = z.infer<typeof PrioritizeTasksOutputSchema>;

export async function prioritizeTasks(input: PrioritizeTasksInput): Promise<PrioritizeTasksOutput> {
  return prioritizeTasksFlow(input);
}

const prioritizeTasksPrompt = ai.definePrompt({
  name: 'prioritizeTasksPrompt',
  input: {schema: PrioritizeTasksInputSchema},
  output: {schema: PrioritizeTasksOutputSchema},
  prompt: `You are an AI task prioritization expert. Analyze the following tasks and determine their importance based on their titles, descriptions, and due dates.

Tasks:
{{#each this}}
- Title: {{title}}
  Description: {{description}}
  Due Date: {{dueDate}}
  Current Importance: {{isImportant}}
{{/each}}

For each task, determine whether it should be marked as important (isImportant: true/false). Provide a brief reason for your determination. Return the tasks with updated isImportant flags and reasons.

Output format: An array of tasks with updated isImportant fields and a "reason" field explaining the importance assessment. Preserve all original data, including fields that are not isImportant or reason.

Example output:
[
  {
    "title": "Grocery Shopping",
    "description": "Buy groceries for the week.",
    "dueDate": "2024-03-10",
    "isImportant": false,
    "reason": "Routine task; not urgent or critical."
  },
  {
    "title": "Submit Project Proposal",
    "description": "Finalize and submit the project proposal to the client.",
    "dueDate": "2024-03-08",
    "isImportant": true,
    "reason": "Critical task with an approaching deadline."
  }
]
`,
});

const prioritizeTasksFlow = ai.defineFlow(
  {
    name: 'prioritizeTasksFlow',
    inputSchema: PrioritizeTasksInputSchema,
    outputSchema: PrioritizeTasksOutputSchema,
  },
  async input => {
    const {output} = await prioritizeTasksPrompt(input);
    return output!;
  }
);
