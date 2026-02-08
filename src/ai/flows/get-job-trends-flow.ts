'use server';

/**
 * @fileOverview Provides job market trend data for visualization based on current industry knowledge.
 *
 * - getJobTrends - A function that returns job market trends.
 * - GetJobTrendsOutput - The return type for the getJobTrends function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SalaryByExperienceSchema = z.object({
  role: z.string().describe('The job role.'),
  'Entry-Level': z.number().describe('The average salary for an entry-level position.'),
  'Mid-Level': z.number().describe('The average salary for a mid-level position.'),
  'Senior-Level': z.number().describe('The average salary for a senior-level position.'),
});

const DemandDataSchema = z.object({
  role: z.string().describe('The job role.'),
  demand: z.number().describe('A score from 1-100 indicating current market demand.'),
});

const LocationDataSchema = z.object({
  location: z.string().describe('The name of the tech hub city.'),
  openings: z.number().describe('The number of open tech positions in that location.'),
});

const GetJobTrendsOutputSchema = z.object({
  salaryByExperience: z
    .array(SalaryByExperienceSchema)
    .length(6)
    .describe('An array of salary data by experience for key tech roles.'),
  marketDemand: z
    .array(DemandDataSchema)
    .length(6)
    .describe('An array representing the current market demand for key roles.'),
  jobOpeningsByLocation: z
    .array(LocationDataSchema)
    .describe('A list of job openings in key tech hubs.'),
});
export type GetJobTrendsOutput = z.infer<typeof GetJobTrendsOutputSchema>;

export async function getJobTrends(): Promise<GetJobTrendsOutput> {
  return getJobTrendsFlow();
}

const getJobTrendsPrompt = ai.definePrompt({
  name: 'getJobTrendsPrompt',
  output: { schema: GetJobTrendsOutputSchema },
  prompt: `You are a professional job market analyst. Provide current and accurate job market trend data for the following key tech roles: Software Engineer, Data Scientist, Product Manager, DevOps Engineer, UX/UI Designer, and Cybersecurity Analyst. Also provide data on job openings in global tech hubs.

Provide the following:
1.  **Salary by Experience**: For each of the six roles, provide the current average annual salary (in USD, without symbols) for "Entry-Level", "Mid-Level", and "Senior-Level" positions based on recent global tech industry benchmarks.
2.  **Market Demand**: Provide a current demand score (1-100) for each of the six roles based on current hiring volumes and industry growth.
3.  **Job Openings by Location**: Provide the approximate number of current open tech positions in 5 major global tech hubs (e.g., Bengaluru, San Francisco, London, Hyderabad, Singapore).`,
});

const getJobTrendsFlow = ai.defineFlow(
  {
    name: 'getJobTrendsFlow',
    outputSchema: GetJobTrendsOutputSchema,
  },
  async () => {
    const { output } = await getJobTrendsPrompt();
    return output!;
  }
);
