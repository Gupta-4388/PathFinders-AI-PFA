'use server';

/**
 * @fileOverview Resume analysis flow.
 *
 * This flow analyzes a resume to identify skills, projects, and potential mistakes,
 * providing AI-driven insights to improve it.
 *
 * @remarks
 * - analyzeResume - The function to analyze the resume and provide insights.
 * - AnalyzeResumeInput - The input type for the analyzeResume function.
 * - AnalyzeResumeOutput - The return type for the analyzeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeResumeInputSchema = z.object({
  resumeDataUri: z
    .string()
    .describe(
      "The resume file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  skillSummary: z
    .string()
    .describe('A high-level summary of the skills identified in the resume.'),
  improvementInsights: z
    .array(z.string())
    .describe(
      'A short, optimized list of AI-driven insights to improve the resume, including identifying potential mistakes and missing skills.'
    ),
  extractedSkills: z.array(z.string()).describe("A list of skills extracted from the resume."),
});
export type AnalyzeResumeOutput = z.infer<typeof AnalyzeResumeOutputSchema>;

export async function analyzeResume(
  input: AnalyzeResumeInput
): Promise<AnalyzeResumeOutput> {
  return analyzeResumeFlow(input);
}

const analyzeResumePrompt = ai.definePrompt({
  name: 'analyzeResumePrompt',
  input: {schema: AnalyzeResumeInputSchema},
  output: {schema: AnalyzeResumeOutputSchema},
  prompt: `You are an expert career coach and tech recruiter. Analyze the following resume and provide:
1.  A high-level summary of the user's skills.
2.  A short, optimized list of actionable insights to improve the resume (e.g., clarity, impact, missing information).
3.  A list of skills extracted from the resume content.

Resume:
{{media url=resumeDataUri}}`,
});

const analyzeResumeFlow = ai.defineFlow(
  {
    name: 'analyzeResumeFlow',
    inputSchema: AnalyzeResumeInputSchema,
    outputSchema: AnalyzeResumeOutputSchema,
  },
  async input => {
    const {output} = await analyzeResumePrompt(input);
    return output!;
  }
);
