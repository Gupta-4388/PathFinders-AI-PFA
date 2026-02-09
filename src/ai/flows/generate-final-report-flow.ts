
'use server';

/**
 * @fileOverview Generates a final evaluation report at the end of a mock interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFinalReportInputSchema = z.object({
  jobRole: z.string(),
  resumeDataUri: z.string().optional(),
  history: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    analysis: z.object({
      clarity: z.string(),
      content: z.string()
    }),
    score: z.number()
  }))
});
export type GenerateFinalReportInput = z.infer<typeof GenerateFinalReportInputSchema>;

const GenerateFinalReportOutputSchema = z.object({
  overallScore: z.number().describe('A score from 0-100 representing overall performance.'),
  strengths: z.array(z.string()).describe('Key strengths identified during the interview.'),
  weaknesses: z.array(z.string()).describe('Areas where the candidate needs improvement.'),
  skillGaps: z.array(z.string()).describe('Specific technical or soft skills lacking for the job role.'),
  improvementSuggestions: z.string().describe('Concrete advice for future interviews.'),
  readinessVerdict: z.string().describe('A brief concluding statement on the candidate\'s readiness for the role.')
});
export type GenerateFinalReportOutput = z.infer<typeof GenerateFinalReportOutputSchema>;

export async function generateFinalReport(
  input: GenerateFinalReportInput
): Promise<GenerateFinalReportOutput> {
  return generateFinalReportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'generateFinalReportPrompt',
  input: { schema: GenerateFinalReportInputSchema },
  output: { schema: GenerateFinalReportOutputSchema },
  prompt: `You are an expert interview evaluator. Review the following mock interview session for the role of "{{{jobRole}}}".

{{#if resumeDataUri}}
Candidate Resume Context:
{{media url=resumeDataUri}}
{{/if}}

Interview History:
{{#if history}}
{{#each history}}
Question: {{{this.question}}}
Answer: {{{this.answer}}}
Individual Feedback: {{{this.analysis.content}}}
Individual Score: {{{this.score}}}
---
{{/each}}
{{else}}
Note: The candidate provided no responses for this session.
{{/if}}

INSTRUCTIONS:
1. If the interview ended early (fewer than 15 questions), provide insights based on the available responses but explicitly mention the limited sample size in your readiness verdict.
2. Calculate an overall performance score (0-100). If no answers were provided, the score should be 0.
3. Identify 3-5 core strengths based on their responses.
4. Identify 3-5 key weaknesses or areas for improvement.
5. Highlight specific technical or soft skill gaps relative to the "{{{jobRole}}}" requirements.
6. Provide actionable suggestions for future success.
7. Give a professional final verdict on their current readiness.`,
});

const generateFinalReportFlow = ai.defineFlow(
  {
    name: 'generateFinalReportFlow',
    inputSchema: GenerateFinalReportInputSchema,
    outputSchema: GenerateFinalReportOutputSchema,
  },
  async (input) => {
    const { output } = await reportPrompt(input);
    return output!;
  }
);
