
'use server';

/**
 * @fileOverview Validates if a resume is compatible with a selected job role before starting an interview.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ValidateRoleCompatibilityInputSchema = z.object({
  jobRole: z.string().describe('The job role the user is targeting.'),
  resumeDataUri: z.string().describe("The resume file as a data URI (PDF, DOCX, or Image)."),
});
export type ValidateRoleCompatibilityInput = z.infer<typeof ValidateRoleCompatibilityInputSchema>;

const ValidateRoleCompatibilityOutputSchema = z.object({
  isCompatible: z.boolean().describe('Whether the resume has the foundational skills for the job role (Score >= 40).'),
  matchScore: z.number().describe('A score from 0-100 indicating the skill match.'),
  missingSkills: z.array(z.string()).describe('Critical skills for the role that are missing from the resume.'),
  foundationalSkills: z.array(z.string()).describe('Skills found in the resume that match the role.'),
  feedback: z.string().describe("Advice on why the resume is or isn't compatible."),
  parsingError: z.boolean().describe('Set to true if the document could not be read or is not a valid resume.'),
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
  prompt: `You are an expert technical recruiter. Analyze the provided resume document against the requirements for the job role: "{{{jobRole}}}".

Resume Document:
{{media url=resumeDataUri}}

Evaluate the compatibility using a weighted system:
1. Identify Mandatory (core), Important (preferred), and Optional (bonus) skills for a "{{{jobRole}}}".
2. Calculate a Match Score (0-100) based on how well the resume satisfies these categories.
3. If the document is unreadable, blurry, or clearly not a resume, set 'parsingError' to true and 'matchScore' to 0.
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
