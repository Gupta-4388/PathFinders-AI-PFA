'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIMentorProvidePersonalizedGuidanceInputSchema = z.object({
  query: z.string().describe('The query from the user.'),
  resume: z.string().optional().describe('The resume of the user.'),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'model']),
        content: z.string(),
      })
    )
    .optional()
    .describe('The chat history between the user and the AI mentor.'),
});
export type AIMentorProvidePersonalizedGuidanceInput = z.infer<
  typeof AIMentorProvidePersonalizedGuidanceInputSchema
>;

const AIMentorProvidePersonalizedGuidanceOutputSchema = z.object({
  response: z.string().describe("A concise, conversational response to the user's query."),
  keyPoints: z.array(z.string()).optional().describe('A list of optimized key takeaways or action items.'),
  suggestedResources: z
    .array(
      z.object({
        title: z.string(),
        url: z.string(),
        description: z.string().optional(),
        category: z
          .enum(['Website', 'Video', 'Course', 'Certification', 'Article', 'Other'])
          .describe('The category of the resource.'),
      })
    )
    .optional()
    .describe('Suggested resources for the user, categorized for clarity.'),
});
export type AIMentorProvidePersonalizedGuidanceOutput = z.infer<
  typeof AIMentorProvidePersonalizedGuidanceOutputSchema
>;

export async function aiMentorProvidePersonalizedGuidance(
  input: AIMentorProvidePersonalizedGuidanceInput
): Promise<AIMentorProvidePersonalizedGuidanceOutput> {
  return aiMentorProvidePersonalizedGuidanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMentorProvidePersonalizedGuidancePrompt',
  input: {schema: AIMentorProvidePersonalizedGuidanceInputSchema},
  output: {schema: AIMentorProvidePersonalizedGuidanceOutputSchema},
  prompt: `You are an AI career mentor. Your goal is to provide personalized career guidance, mentorship suggestions, skill growth roadmaps, and job market insights. You can converse in multiple languages, including English and Indian regional languages.

  Your response MUST be in a structured JSON format. Provide a concise, conversational 'response' and a list of 'keyPoints' that are optimized and easy to understand.

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
  If relevant, include suggested resources and classify each into a category: 'Website', 'Video', 'Course', 'Certification', 'Article', or 'Other'.

  IMPORTANT: It is absolutely critical that you only provide URLs that are valid and currently working. Double-check every link before including it in the response. Do not invent or guess URLs. If you are unsure if a link is active and correct, do not include it. Prioritize free certifications and resources whenever possible.
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
