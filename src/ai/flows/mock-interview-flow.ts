
'use server';

/**
 * @fileOverview Simulates domain-specific interviews with AI-generated questions and provides real-time feedback.
 *
 * - mockInterviewWithRealtimeFeedback - A function that orchestrates the mock interview process.
 * - MockInterviewInput - The input type for the mockInterviewWithRealtimeFeedback function.
 * - MockInterviewOutput - The return type for the mockInterviewWithRealtimeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MockInterviewInputSchema = z.object({
  domain: z.string().describe('The specific domain for the interview (e.g., software engineering, marketing).'),
  resumeDataUri: z
    .string()
    .describe(
      "A resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MockInterviewInput = z.infer<typeof MockInterviewInputSchema>;

const MockInterviewOutputSchema = z.object({
  question: z.string().describe('The AI-generated interview question.'),
});
export type MockInterviewOutput = z.infer<typeof MockInterviewOutputSchema>;

export async function mockInterviewWithRealtimeFeedback(input: MockInterviewInput): Promise<MockInterviewOutput> {
  return mockInterviewFlow(input);
}

const mockInterviewPrompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: {schema: MockInterviewInputSchema},
  output: {schema: MockInterviewOutputSchema},
  prompt: `You are an AI-powered interview simulator. Generate an interview question based on the candidate's resume and the interview domain.

Consider the following information:

Domain: {{{domain}}}
Resume: {{media url=resumeDataUri}}

Generate one relevant interview question:
`,
});

const mockInterviewFlow = ai.defineFlow(
  {
    name: 'mockInterviewFlow',
    inputSchema: MockInterviewInputSchema,
    outputSchema: MockInterviewOutputSchema,
  },
  async input => {
    const {output} = await mockInterviewPrompt(input);
    return output!;
  }
);
