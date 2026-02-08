'use server';

/**
 * @fileOverview Provides job market trend data by combining real-time Adzuna API data with AI analysis.
 *
 * - getJobTrends - A function that returns job market trends.
 * - GetJobTrendsOutput - The return type for the getJobTrends function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchJobTrendsFromAPI } from '@/app/actions/job-trends-actions';

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
  input: {
    schema: z.object({
      apiData: z.any().optional().describe('Real-time data from the Adzuna API.')
    })
  },
  output: { schema: GetJobTrendsOutputSchema },
  prompt: `You are a professional job market analyst. 
  
  Use the provided real-time Adzuna API data as your primary source of truth for current salaries and job volumes. 
  If API data is provided, use it to calibrate your benchmarks for the tech industry.

  {{#if apiData}}
  Real-time Market Pulse (Adzuna):
  - Total Active Listings Sampled: {{apiData.count}}
  - Representative Listings: 
    {{#each apiData.listings}}
    * {{this.title}} in {{this.location}} (Salary Range: {{this.salary_min}} - {{this.salary_max}})
    {{/each}}
  {{/if}}

  Provide current and accurate job market trend data for: Software Engineer, Data Scientist, Product Manager, DevOps Engineer, UX/UI Designer, and Cybersecurity Analyst.

  Provide the following:
  1. **Salary by Experience**: For each role, provide the current average annual salary (USD) for "Entry-Level", "Mid-Level", and "Senior-Level".
  2. **Market Demand**: Provide a demand score (1-100) for each role.
  3. **Job Openings by Location**: Provide approximate current open positions in 5 major global tech hubs (e.g., Bengaluru, San Francisco, London, Hyderabad, Singapore).`,
});

const getJobTrendsFlow = ai.defineFlow(
  {
    name: 'getJobTrendsFlow',
    outputSchema: GetJobTrendsOutputSchema,
  },
  async () => {
    let apiData = null;
    try {
      apiData = await fetchJobTrendsFromAPI();
    } catch (e) {
      console.warn('Proceeding with AI baseline as Adzuna API is unavailable:', e);
    }

    const { output } = await getJobTrendsPrompt({ apiData });
    return output!;
  }
);
