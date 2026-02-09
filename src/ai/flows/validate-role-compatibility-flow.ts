
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
  isCompatible: z.boolean().describe('Whether the resume has the foundational skills for the job role (Score >= 40).'),
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

Evaluate the compatibility using a weighted system:
1. Identify Mandatory (core), Important (preferred), and Optional (bonus) skills for a "{{{jobRole}}}".
2. Calculate a Match Score (0-100) based on how well the resume satisfies these categories.
3. If the resume contains the basic foundations or related skills (even if not an exact match), give credit.
4. If the Match Score is 40 or higher, set isCompatible to true.
5. List the foundational skills found and the critical missing ones.
6. Provide professional feedback. If the score is between 40-59, mention it's a partial match. If below 40, explain why it's too low for a realistic interview.

IMPORTANT: Be realistic. Do not require a 100% match. A score of 60+ is a strong match. 40-59 is a partial/warning match.`,
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
