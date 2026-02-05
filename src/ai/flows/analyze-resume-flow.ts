
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

const SuggestedRoleSchema = z.object({
  title: z.string().describe('The job title of the suggested role.'),
  description: z
    .string()
    .describe('A short description of why this role is a good fit.'),
  matchConfidence: z
    .number()
    .describe(
      'A score from 0-100 indicating how well the resume matches the role.'
    ),
});

const AnalyzeResumeOutputSchema = z.object({
  isResume: z.boolean().describe('Whether the uploaded document is a resume or CV.'),
  rejectionReason: z.string().optional().describe('If the document is not a resume, explain why.'),
  skillSummary: z
    .string()
    .optional()
    .describe('A high-level summary of the skills identified in the resume.'),
  improvementInsights: z
    .array(z.string())
    .optional()
    .describe(
      'A short, optimized list of AI-driven insights to improve the resume, including identifying potential mistakes and missing skills.'
    ),
  extractedSkills: z
    .array(z.string())
    .max(5)
    .optional()
    .describe('A concise list of the top 5 most relevant skills extracted from the resume.'),
  suggestedRoles: z
    .array(SuggestedRoleSchema)
    .optional()
    .describe(
      'A list of 3-5 suitable job roles based on the resume and current market analysis.'
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
  prompt: `You are an expert career coach and tech recruiter. Your first task is to determine if the provided document is a professional resume or CV.

If the document is a resume/CV, set 'isResume' to true and provide the following analysis:
1.  A high-level summary of the user's skills.
2.  A short, optimized list of actionable insights to improve the resume (e.g., clarity, impact, missing information).
3.  A concise list of the top 5 most relevant skills extracted from the resume content.
4.  Analyze current job market openings and suggest 3-5 suitable roles for the candidate, including a title, a short description, and a match confidence score.

If the document is NOT a resume/CV, set 'isResume' to false, provide a brief 'rejectionReason' explaining why it's not a resume (e.g., "The document appears to be a receipt."), and do not fill out the other analysis fields.

Document:
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
