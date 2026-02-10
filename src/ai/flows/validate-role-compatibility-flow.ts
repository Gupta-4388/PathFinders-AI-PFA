
'use server';

/**
 * @fileOverview Validates if a resume is compatible with a selected job role before starting an interview.
 * Now includes a strict check to ensure the document is a valid resume.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ValidateRoleCompatibilityInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is targeting.'),
  resumeDataUri: z.string().describe("The resume file as a data URI (PDF, DOCX, or Image)."),
});
export type ValidateRoleCompatibilityInput = z.infer<typeof ValidateRoleCompatibilityInputSchema>;

const ValidateRoleCompatibilityOutputSchema = z.object({
  isResume: z.boolean().describe('Whether the uploaded document is a valid professional resume or CV.'),
  rejectionReason: z.string().optional().describe('If the document is not a resume (e.g., Aadhaar, PAN, simple certificate), explain why.'),
  isCompatible: z.boolean().describe('Whether the resume has the foundational skills for the job role (Score >= 40).'),
  matchScore: z.number().describe('A score from 0-100 indicating the skill match.'),
  missingSkills: z.array(z.string()).describe('Critical skills for the role that are missing from the resume.'),
  foundationalSkills: z.array(z.string()).describe('Skills found in the resume that match the role.'),
  feedback: z.string().describe("Advice on why the resume is or isn't compatible."),
  parsingError: z.boolean().describe('Set to true if the document could not be read or is very low quality.'),
});
export type ValidateRoleCompatibilityOutput = z.infer<typeof ValidateRoleCompatibilityOutputSchema>;

export async function validateRoleCompatibility(
  input: ValidateRoleCompatibilityInput
): Promise<ValidateRoleCompatibilityOutput> {
  return validateRoleCompatibilityFlow(input);
}

const compatibilityPrompt = ai.definePrompt({
  name: 'validateRoleCompatibilityPrompt',
  input: { schema: ValidateRoleCompatibilityInputSchema },
  output: { schema: ValidateRoleCompatibilityOutputSchema },
  prompt: `You are an expert technical recruiter. Your primary goal is to analyze the provided resume against the job role: "{{{jobRole}}}".

STEP 1: Validate if the document IS A RESUME. 
A valid resume contains sections like Experience, Education, Skills, and Contact Info.
REJECT (isResume: false) if the document is an Aadhaar card, PAN card, ID card, generic form, or a simple certificate without professional experience context. Provide a specific rejectionReason.

STEP 2: Evaluate compatibility (ONLY if isResume is true).
- Identify Mandatory, Important, and Optional skills for a "{{{jobRole}}}".
- Calculate a Match Score (0-100).
- If matchScore >= 40, set isCompatible to true.
- List foundational and missing skills.
- Provide professional feedback.

Resume Document:
{{media url=resumeDataUri}}

IMPORTANT: If the document is unreadable or non-professional content, set parsingError to true. If it is clearly not a resume (like an ID card), isResume MUST be false.`,
});

const validateRoleCompatibilityFlow = ai.defineFlow(
  {
    name: 'validateRoleCompatibilityFlow',
    inputSchema: ValidateRoleCompatibilityInputSchema,
    outputSchema: ValidateRoleCompatibilityOutputSchema,
  },
  async (input) => {
    const { output } = await compatibilityPrompt(input);
    return output!;
  }
);
