
'use server';

/**
 * @fileOverview Validates if a resume is compatible with a selected job role before starting an interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ValidateRoleCompatibilityInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is targeting.'),
  resumeText: z.string().describe("The text extracted from the user's resume."),
});
export type ValidateRoleCompatibilityInput = z.infer<typeof ValidateRoleCompatibilityInputSchema>;

const ValidateRoleCompatibilityOutputSchema = z.object({
  isCompatible: z.boolean().describe('Whether the resume has the foundational skills for the job role.'),
  matchScore: z.number().describe('A score from 0-100 indicating the skill match.'),
  missingSkills: z.array(z.string()).describe('Critical skills for the role that are missing from the resume.'),
  foundationalSkills: z.array(z.string()).describe('Skills found in the resume that match the role.'),
  feedback: z.string().describe("Advice on why the resume is or isn't compatible."),
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
  prompt: `You are an expert technical recruiter. Analyze the provided resume text against the requirements for the job role: "{{{jobRole}}}".

Resume Text:
{{{resumeText}}}

Evaluate the compatibility:
1. Identify the core skills and experience required for a "{{{jobRole}}}".
2. Check if the resume contains at least 30-40% of the foundational skills needed for this role.
3. If the resume is completely unrelated (e.g., a Chef's resume for a Software Engineer role), set isCompatible to false.
4. Provide a match score (0-100).
5. List the skills that were found and the critical ones that are missing.
6. Give brief, professional feedback explaining your determination.

IMPORTANT: Be realistic. A candidate doesn't need 100% match to interview, but they need the right foundation.`,
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
