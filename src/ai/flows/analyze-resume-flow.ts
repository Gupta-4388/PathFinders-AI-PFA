'use server';

/**
 * @fileOverview Resume analysis flow.
 *
 * This flow analyzes a resume to identify skills, projects, and potential mistakes,
 * providing AI-driven insights to improve it and a summary of the user's skills.
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
      'The resume file as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected the typo here
    ),
});
export type AnalyzeResumeInput = z.infer<typeof AnalyzeResumeInputSchema>;

const AnalyzeResumeOutputSchema = z.object({
  skillSummary: z
    .string()
    .describe('A summary of the skills identified in the resume.'),
  improvementInsights: z
    .string()
    .describe(
      'AI-driven insights to improve the resume, including identifying potential mistakes and missing skills.'
    ),
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
  prompt: `You are an expert career coach. Analyze the following resume and provide a summary of the skills and improvement insights.

Resume:
{{media url=resumeDataUri}}


Provide the skillSummary and improvementInsights as described in the output schema.
`,
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
