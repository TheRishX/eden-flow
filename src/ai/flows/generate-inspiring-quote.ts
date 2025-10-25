'use server';

/**
 * @fileOverview Flow to generate inspiring quotes. It determines if an inspiring quote
 * could help the user stay on task, and if so, generates and returns a quote.
 *
 * @file GenerateInspiringQuote - A function that determines if an inspiring quote would be helpful, and returns it if so.
 * @file GenerateInspiringQuoteInput - The input type for the GenerateInspiringQuote function.
 * @file GenerateInspiringQuoteOutput - The return type for the GenerateInspiringQuote function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInspiringQuoteInputSchema = z.object({
  userFocus: z
    .string()
    .describe('The user\'s main focus for the day.  This helps tailor the quote.'),
});
export type GenerateInspiringQuoteInput = z.infer<typeof GenerateInspiringQuoteInputSchema>;

const GenerateInspiringQuoteOutputSchema = z.object({
  shouldShowQuote: z
    .boolean()
    .describe(
      'Whether or not an inspiring quote would be helpful to the user right now, given their focus.'
    ),
  quote: z.string().describe('The inspiring quote to display to the user.'),
});
export type GenerateInspiringQuoteOutput = z.infer<typeof GenerateInspiringQuoteOutputSchema>;

export async function generateInspiringQuote(
  input: GenerateInspiringQuoteInput
): Promise<GenerateInspiringQuoteOutput> {
  return generateInspiringQuoteFlow(input);
}

const inspiringQuotePrompt = ai.definePrompt({
  name: 'inspiringQuotePrompt',
  input: {schema: GenerateInspiringQuoteInputSchema},
  output: {schema: GenerateInspiringQuoteOutputSchema},
  prompt: `You are a motivation and productivity expert. Your job is to determine whether to provide the user an inspiring quote based on their current focus.

  The user's current focus is: {{{userFocus}}}

  First, decide if seeing a quote would be helpful for the user to stay on task, and set the "shouldShowQuote" field appropriately.

  If you decide that the quote would be helpful, then generate an inspiring quote that is related to the user's focus. The quote should be relatively short and sweet.

  Be sure to set the quote field no matter what - if you decided that showing a quote would NOT be helpful, then set the quote to be a blank string.
  `,
});

const generateInspiringQuoteFlow = ai.defineFlow(
  {
    name: 'generateInspiringQuoteFlow',
    inputSchema: GenerateInspiringQuoteInputSchema,
    outputSchema: GenerateInspiringQuoteOutputSchema,
  },
  async input => {
    const {output} = await inspiringQuotePrompt(input);
    return output!;
  }
);
