'use server';

/**
 * @fileOverview Flow to suggest actionable tasks based on a user's goal.
 * 
 * @file suggestTasks - A function that takes a user's goal and returns a list of suggested tasks.
 * @file SuggestTasksInput - The input type for the suggestTasks function.
 * @file SuggestTasksOutput - The return type for the suggestTasks function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SuggestTasksInputSchema = z.object({
  goal: z.string().describe("The user's high-level goal."),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  suggestions: z.array(z.string()).length(7).describe('A list of 5-7 actionable tasks related to the goal.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const suggestTasksPrompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: { schema: SuggestTasksInputSchema },
  output: { schema: SuggestTasksOutputSchema },
  prompt: `You are a productivity expert. A user will provide you with a high-level goal. 
  
  Your job is to break that goal down into 5-7 small, actionable, and concrete tasks that the user can add to their daily schedule.
  
  The user's goal is: {{{goal}}}
  
  Return the list of tasks in the 'suggestions' array.`,
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const { output } = await suggestTasksPrompt(input);
    return output!;
  }
);
