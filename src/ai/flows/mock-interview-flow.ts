
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
  resumeText: z.string().describe('The text content of the uploaded resume.'),
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
- Candidate Resume: {{{resumeText}}}

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
3. Use the candidate's resume to tailor the question (e.g., asking about specific projects, tools, or experiences mentioned).
4. Do NOT repeat questions or topics already covered in the history.
5. Focus on assessing the candidate's readiness for the specific role of {{{jobRole}}}.
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
