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
  experienceLevel: z.enum(['entry', 'mid', 'senior']).describe('The experience level of the candidate.'),
  resumeDataUri: z
    .string()
    .describe(
      "A resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type MockInterviewInput = z.infer<typeof MockInterviewInputSchema>;

const MockInterviewOutputSchema = z.object({
  question: z.string().describe('The AI-generated interview question.'),
  analysis: z.object({
    tone: z.string().describe('Analysis of the candidate\'s tone during the answer.'),
    clarity: z.string().describe('Analysis of the clarity of the candidate\'s answer.'),
    content: z.string().describe('Analysis of the content and correctness of the candidate\'s answer.'),
  }).optional(),
  score: z.number().describe('Overall score evaluating relevance, correctness, fluency and confidence.').optional(),
  improvementTips: z.string().describe('Tips for improvement based on the interview simulation.'),
});
export type MockInterviewOutput = z.infer<typeof MockInterviewOutputSchema>;

export async function mockInterviewWithRealtimeFeedback(input: MockInterviewInput): Promise<MockInterviewOutput> {
  return mockInterviewFlow(input);
}

const mockInterviewPrompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: {schema: MockInterviewInputSchema},
  output: {schema: MockInterviewOutputSchema},
  prompt: `You are an AI-powered interview simulator. Generate interview questions based on the candidate's resume, domain, and experience level.

Analyze the candidate's answers in real-time, providing feedback on their tone, clarity, and content.

Provide an overall score and improvement tips at the end of each answer.

Consider the following information:

Domain: {{{domain}}}
Experience Level: {{{experienceLevel}}}
Resume: {{media url=resumeDataUri}}

Generate an interview question:
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
