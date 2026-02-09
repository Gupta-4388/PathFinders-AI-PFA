'use server';

/**
 * @fileOverview Generates a final evaluation report at the end of a mock interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFinalReportInputSchema = z.object({
  jobRole: z.string(),
  difficulty: z.string(),
  interviewMode: z.string(),
  resumeDataUri: z.string().optional(),
  history: z.array(z.object({
    question: z.string(),
    answer: z.string(),
  }))
});
export type GenerateFinalReportInput = z.infer<typeof GenerateFinalReportInputSchema>;

const GenerateFinalReportOutputSchema = z.object({
  overallScore: z.number().describe('A score from 0-100 representing overall performance.'),
  summary: z.object({
     questionsAnswered: z.number(),
     status: z.enum(['Completed', 'Ended early']),
  }),
  questionReviews: z.array(z.object({
    question: z.string(),
    answer: z.string(),
    feedback: z.string().describe("Brief strengths and improvement suggestions for this specific answer.")
  })),
  strengths: z.array(z.string()).describe('Key strengths identified during the interview.'),
  weaknesses: z.array(z.string()).describe('Areas where the candidate needs improvement.'),
  skillGaps: z.array(z.string()).describe('Specific technical or soft skills lacking for the job role.'),
  overallFeedback: z.object({
    communicationClarity: z.string(),
    technicalDepth: z.string(),
    problemSolving: z.string(),
    confidence: z.string().describe("Qualitative assessment of confidence."),
  }),
  improvementSuggestions: z.array(z.string()).describe('3-5 Actionable next steps.'),
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

CONTEXT:
- Job Role: {{{jobRole}}}
- Difficulty: {{{difficulty}}}
- Interview Mode: {{{interviewMode}}}

{{#if resumeDataUri}}
Candidate Resume Context provided.
{{/if}}

Interview History:
{{#if history}}
{{#each history}}
Question: {{{this.question}}}
Answer: {{{this.answer}}}
---
{{/each}}
{{else}}
Note: The candidate provided no responses for this session.
{{/if}}

INSTRUCTIONS:
1. Provide a comprehensive evaluation. 
2. If the interview ended early (fewer than 15 questions), provide insights based on the available responses.
3. Calculate an overall performance score (0-100). If no answers were provided, the score should be 0.
4. For each question in the history, provide a brief feedback string summarizing strengths and improvements.
5. Identify core strengths and weaknesses.
6. Highlight technical/soft skill gaps for the role.
7. Provide an assessment of communication clarity, technical depth, problem-solving, and confidence.
8. Suggest 3-5 actionable next steps.
9. Give a final readiness verdict. Mention if the session was partial.`,
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
