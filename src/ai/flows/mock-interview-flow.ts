
'use server';

/**
 * @fileOverview Simulates domain-specific interviews with AI-generated questions and provides real-time feedback.
 *
 * - mockInterviewWithRealtimeFeedback - A function that orchestrates the mock interview process.
 * - MockInterviewInput - The input type for the mockInterviewWithRealtimeFeedback function.
 * - MockInterviewOutput - The return type for the mockInterviewWithRealtimeFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MockInterviewInputSchema = z.object({
  jobRole: z.string().describe('The specific job role for the interview (e.g., Senior Software Engineer).'),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']).describe('The difficulty level of the interview.'),
  interviewType: z.enum(['Technical', 'HR', 'Behavioral', 'Mixed']).describe('The type of interview questions to generate.'),
  resumeDataUri: z.string().optional().describe('The resume file as a data URI.'),
  missingSkills: z.array(z.string()).optional().describe('Skills identified as missing during validation.'),
  history: z.array(z.object({
    question: z.string(),
    answer: z.string()
  })).optional().describe('The history of questions and answers in this session to avoid repetition.')
});
export type MockInterviewInput = z.infer<typeof MockInterviewInputSchema>;

const MockInterviewOutputSchema = z.object({
  question: z.string().describe('The AI-generated interview question.'),
});
export type MockInterviewOutput = z.infer<typeof MockInterviewOutputSchema>;

export async function mockInterviewWithRealtimeFeedback(input: MockInterviewInput): Promise<MockInterviewOutput> {
  return mockInterviewFlow(input);
}

const mockInterviewPrompt = ai.definePrompt({
  name: 'mockInterviewPrompt',
  input: {schema: MockInterviewInputSchema},
  output: {schema: MockInterviewOutputSchema},
  prompt: `You are a professional hiring manager and expert interviewer. Your goal is to conduct a realistic mock interview.

INTERVIEW CONTEXT:
- Job Role: {{{jobRole}}}
- Difficulty Level: {{{difficulty}}}
- Interview Type: {{{interviewType}}}

{{#if resumeDataUri}}
Candidate Resume:
{{media url=resumeDataUri}}
{{else}}
Candidate Resume: No resume provided. Base questions on the job role and difficulty.
{{/if}}

{{#if missingSkills}}
- Missing Skills Identified: {{#each missingSkills}}{{{this}}}, {{/each}}
{{/if}}

SESSION HISTORY:
{{#if history}}
{{#each history}}
Q: {{{this.question}}}
A: {{{this.answer}}}
{{/each}}
{{/if}}

INSTRUCTIONS:
1. Generate one relevant, challenging, and role-specific interview question.
2. The question must match the chosen difficulty ({{{difficulty}}}) and type ({{{interviewType}}}).
3. Focus primarily on the candidate's actual experience and projects found in the resume if provided.
4. Occasionally (20-30% of the time), ask a question about one of the missing skills to probe the candidate's theoretical knowledge or willingness to learn.
5. Do NOT repeat questions or topics already covered in the history.
6. Focus on assessing the candidate's readiness for the specific role of {{{jobRole}}}.
`,
});

const mockInterviewFlow = ai.defineFlow(
  {
    name: 'mockInterviewFlow',
    inputSchema: MockInterviewInputSchema,
    outputSchema: MockInterviewOutputSchema,
  },
  async input => {
    const {output} = await mockInterviewPrompt(input);
    return output!;
  }
);
