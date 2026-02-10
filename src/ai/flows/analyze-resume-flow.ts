
'use server';

/**
 * @fileOverview Resume analysis flow with strict resume-only validation.
 *
 * This flow analyzes a resume to identify skills, projects, and potential mistakes,
 * providing AI-driven insights to improve it. It specifically rejects non-resume
 * documents like ID cards, certificates without context, or random images.
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
  isResume: z.boolean().describe('Whether the uploaded document is a valid professional resume or CV.'),
  rejectionReason: z.string().optional().describe('If the document is not a resume (e.g., ID card, PAN, certificate only), explain why.'),
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
  prompt: `You are an expert career coach and tech recruiter. Your first and most critical task is to determine if the provided document is a professional resume or CV.

A valid resume MUST contain MOST of the following:
- Candidate Name and Contact Info (Email/Phone)
- Skills section
- Education history
- Professional Experience, Internships, or Projects
- Strong resume indicators: bullet points for work history, action verbs (developed, designed), and role-specific keywords.

REJECT the document (isResume: false) if it is:
- A government ID (Aadhaar, PAN, Passport, Driving License, etc.)
- A simple certificate or award without professional experience/skills context.
- A legal form, invoice, receipt, or random non-professional image.
- A document consisting ONLY of an ID number or a single photo.

If 'isResume' is true, provide:
1. A high-level summary of skills.
2. A list of actionable insights.
3. Top 5 extracted skills.
4. Suggested roles based on market analysis.

If 'isResume' is false, set 'rejectionReason' to something like "The uploaded document appears to be an Aadhaar card and not a resume." or "The document is a certificate, not a full resume."

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
    let attempts = 0;
    const maxAttempts = 4;
    while (attempts < maxAttempts) {
      try {
        const {output} = await analyzeResumePrompt(input);
        return output!;
      } catch (error: any) {
        attempts++;
        const isRateLimit = error?.message?.includes('429') || error?.message?.includes('Quota exceeded');
        if (attempts >= maxAttempts) {
          throw error;
        }
        // If 429, wait longer: 10s, 20s, 40s
        const waitTime = isRateLimit ? Math.pow(2, attempts) * 5000 : Math.pow(2, attempts) * 1000;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    throw new Error('Resume analysis failed after multiple attempts.');
  }
);
