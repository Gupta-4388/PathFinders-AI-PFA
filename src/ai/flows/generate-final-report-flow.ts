
'use server';

/**
 * @fileOverview Generates a final evaluation report at the end of a mock interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFinalReportInputSchema = z.object({
  jobRole: z.string(),
  resumeText: z.string(),
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
  prompt: `You are an expert interview evaluator. Review the following mock interview transcript for the role of "{{{jobRole}}}".

Candidate Resume Context:
{{{resumeText}}}

Interview History:
{{#each history}}
Question: {{{this.question}}}
Answer: {{{this.answer}}}
Individual Feedback: {{{this.analysis.content}}}
Individual Score: {{{this.score}}}
---
{{/each}}

Provide a comprehensive final evaluation:
1. Calculate an overall performance score (0-100) based on all answers.
2. Identify 3-5 core strengths.
3. Identify 3-5 key weaknesses or areas for improvement.
4. Highlight specific skill gaps relative to the "{{{jobRole}}}" requirements.
5. Provide actionable suggestions for improvement.
6. Give a final verdict on the candidate's readiness for a real-world interview for this role.`,
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
