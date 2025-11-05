'use server';

/**
 * @fileOverview Recommends career paths based on user skills.
 *
 * - recommendCareerPaths - A function that suggests career paths.
 * - RecommendCareerPathsInput - The input type for the recommendCareerPaths function.
 * - RecommendCareerPathsOutput - The return type for the recommendCareerPaths function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendCareerPathsInputSchema = z.object({
  skills: z.array(z.string()).describe('A list of skills from the user\'s resume.'),
});
export type RecommendCareerPathsInput = z.infer<typeof RecommendCareerPathsInputSchema>;

const CareerPathSchema = z.object({
  title: z.string().describe('The title of the career path.'),
  description: z.string().describe('A short description of the career path.'),
  demandScore: z.number().describe('A score from 1-10 indicating market demand.'),
  salaryRange: z.string().describe('An estimated annual salary range, e.g., "$110k - $160k".'),
  skills: z.array(z.string()).describe('A list of 5 key skills required for this path.'),
  progress: z.number().describe('A number from 0-100 representing the user\'s skill match for this path.'),
  roadmapUrl: z.string().url().describe('A URL to a learning resource or roadmap.'),
});

const RecommendCareerPathsOutputSchema = z.object({
  careerPaths: z.array(CareerPathSchema).length(3).describe('A list of exactly 3 recommended career paths.'),
});
export type RecommendCareerPathsOutput = z.infer<typeof RecommendCareerPathsOutputSchema>;

export async function recommendCareerPaths(
  input: RecommendCareerPathsInput
): Promise<RecommendCareerPathsOutput> {
  return recommendCareerPathsFlow(input);
}

const recommendCareerPathsPrompt = ai.definePrompt({
  name: 'recommendCareerPathsPrompt',
  input: { schema: RecommendCareerPathsInputSchema },
  output: { schema: RecommendCareerPathsOutputSchema },
  prompt: `You are an expert career advisor. Based on the user's skills and current job market trends, recommend the top 3 career paths.

User Skills:
{{#each skills}}- {{{this}}}{{/each}}

For each path, provide a title, description, demand score (1-10), estimated salary range, a list of 5 key skills, the user's skill match percentage, and a relevant roadmap URL from a free and readily accessible learning platform. Prioritize resources like Coursera's free courses, edX, freeCodeCamp, or official documentation.`,
});

const recommendCareerPathsFlow = ai.defineFlow(
  {
    name: 'recommendCareerPathsFlow',
    inputSchema: RecommendCareerPathsInputSchema,
    outputSchema: RecommendCareerPathsOutputSchema,
  },
  async (input) => {
    const { output } = await recommendCareerPathsPrompt(input);
    return output!;
  }
);
