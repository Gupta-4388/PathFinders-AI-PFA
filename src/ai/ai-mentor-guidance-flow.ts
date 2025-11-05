// This is an AI-powered chatbot that provides personalized career guidance, mentorship suggestions, and skill growth roadmaps.
'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMentorProvidePersonalizedGuidanceInputSchema = z.object({
  query: z.string().describe('The query from the user.'),
  resume: z.string().optional().describe('The resume of the user.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('The chat history between the user and the AI mentor.'),
});
export type AIMentorProvidePersonalizedGuidanceInput = z.infer<typeof AIMentorProvidePersonalizedGuidanceInputSchema>;

const AIMentorProvidePersonalizedGuidanceOutputSchema = z.object({
  response: z.string().describe('The response from the AI mentor.'),
  suggestedResources: z.array(
    z.object({
      title: z.string(),
      url: z.string(),
      description: z.string().optional(),
    })
  ).optional().describe('Suggested resources for the user.'),
});
export type AIMentorProvidePersonalizedGuidanceOutput = z.infer<typeof AIMentorProvidePersonalizedGuidanceOutputSchema>;

export async function aiMentorProvidePersonalizedGuidance(
  input: AIMentorProvidePersonalizedGuidanceInput
): Promise<AIMentorProvidePersonalizedGuidanceOutput> {
  return aiMentorProvidePersonalizedGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMentorProvidePersonalizedGuidancePrompt',
  input: {schema: AIMentorProvidePersonalizedGuidanceInputSchema},
  output: {schema: AIMentorProvidePersonalizedGuidanceOutputSchema},
  prompt: `You are an AI career mentor. Your goal is to provide personalized career guidance, mentorship suggestions, skill growth roadmaps, and job market insights to the user. You can converse in multiple languages, including English and Indian regional languages.

  Consider the user's query, chat history, and resume (if provided) to provide the best possible advice.

  {{#if resume}}
  User Resume: {{{resume}}}
  {{/if}}

  {{#if history}}
  Chat History:
  {{#each history}}
  {{this.role}}: {{{this.content}}}
  {{/each}}
  {{/if}}

  User Query: {{{query}}}

  Please provide a helpful and informative response tailored to the user's specific needs and goals.
  If relevant, include suggested resources like YouTube videos, course links, and websites. Prioritize free certifications and resources.
`,
});

const aiMentorProvidePersonalizedGuidanceFlow = ai.defineFlow(
  {
    name: 'aiMentorProvidePersonalizedGuidanceFlow',
    inputSchema: AIMentorProvidePersonalizedGuidanceInputSchema,
    outputSchema: AIMentorProvidePersonalizedGuidanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
