'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal task schedules based on user habits and calendar data.
 *
 * - suggestSmartSchedule - A function that takes task details and user context to suggest an optimal schedule.
 * - SmartScheduleInput - The input type for the suggestSmartSchedule function.
 * - SmartScheduleOutput - The return type for the suggestSmartSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartScheduleInputSchema = z.object({
  taskName: z.string().describe('The name of the task to schedule.'),
  taskDescription: z.string().describe('A detailed description of the task.'),
  estimatedDurationMinutes: z.number().describe('The estimated duration of the task in minutes.'),
  userCalendarData: z.string().describe('The user’s calendar data, including existing appointments and commitments.'),
  userHabits: z.string().describe('A description of the user’s daily habits and preferences, such as preferred working hours.'),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const SmartScheduleOutputSchema = z.object({
  suggestedStartTime: z.string().describe('The suggested start time for the task, in ISO 8601 format.'),
  reasoning: z.string().describe('The AI’s reasoning for suggesting this start time, considering calendar data and user habits.'),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

export async function suggestSmartSchedule(input: SmartScheduleInput): Promise<SmartScheduleOutput> {
  return smartScheduleFlow(input);
}

const smartSchedulePrompt = ai.definePrompt({
  name: 'smartSchedulePrompt',
  input: {schema: SmartScheduleInputSchema},
  output: {schema: SmartScheduleOutputSchema},
  prompt: `You are an AI assistant designed to suggest optimal times for tasks based on a user’s calendar and habits.

  Task: {{{taskName}}}
  Description: {{{taskDescription}}}
  Estimated Duration: {{{estimatedDurationMinutes}}} minutes
  Calendar Data: {{{userCalendarData}}}
  User Habits: {{{userHabits}}}

  Consider the user’s calendar data to avoid conflicts with existing appointments.  Take into account the user’s habits and preferences to suggest a time when they are most likely to be productive.

  Provide a suggested start time in ISO 8601 format and explain your reasoning.
  For example: 2024-09-24T10:00:00Z
  `,
});

const smartScheduleFlow = ai.defineFlow(
  {
    name: 'smartScheduleFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async input => {
    const {output} = await smartSchedulePrompt(input);
    return output!;
  }
);
