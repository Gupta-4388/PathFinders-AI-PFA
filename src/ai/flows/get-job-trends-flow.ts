'use server';

/**
 * @fileOverview Provides job market trend data by combining real-time Adzuna API data with AI analysis.
 *
 * - getJobTrends - A function that returns job market trends.
 * - GetJobTrendsInput - The input type for the getJobTrends function.
 * - GetJobTrendsOutput - The return type for the getJobTrends function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchJobTrendsFromAPI } from '@/app/actions/job-trends-actions';

const GetJobTrendsInputSchema = z.object({
  role: z.string().optional().describe('An optional specific job role to fetch trends for.'),
});
export type GetJobTrendsInput = z.infer<typeof GetJobTrendsInputSchema>;

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

const SkillDemandSchema = z.object({
  skill: z.string().describe('The name of the skill.'),
  score: z.number().describe('A score from 1-100 indicating the frequency/demand for this skill.'),
});

const SalaryHistorySchema = z.object({
  year: z.string().describe('The year.'),
  salary: z.number().describe('The representative average annual salary for that year.'),
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
  topSkills: z
    .array(SkillDemandSchema)
    .length(8)
    .describe('The top 8 most in-demand skills for the current tech market or specific role.'),
  salaryTrends: z
    .array(SalaryHistorySchema)
    .length(5)
    .describe('The estimated average salary trend for the last 5 years for this role or general tech.'),
});
export type GetJobTrendsOutput = z.infer<typeof GetJobTrendsOutputSchema>;

export async function getJobTrends(input?: GetJobTrendsInput): Promise<GetJobTrendsOutput> {
  return getJobTrendsFlow(input || {});
}

const getJobTrendsPrompt = ai.definePrompt({
  name: 'getJobTrendsPrompt',
  input: {
    schema: z.object({
      role: z.string().optional(),
      apiData: z.any().nullable().describe('Real-time data from the Adzuna API, if available.')
    })
  },
  output: { schema: GetJobTrendsOutputSchema },
  prompt: `You are a professional job market analyst. 
  
  {{#if role}}
  Focus your analysis on the role of: {{{role}}}.
  {{else}}
  Provide a general overview of the tech job market.
  {{/if}}

  {{#if apiData}}
  Live Market Data (Adzuna) for {{apiData.queriedRole}}:
  - Total Active Listings Sampled: {{apiData.count}}
  - Representative Listings: 
    {{#each apiData.listings}}
    * {{this.title}} in {{this.location}} (Salary: {{this.salary_min}} - {{this.salary_max}})
    {{/each}}
  
  Use this live data to ground your salary and demand calculations.
  {{else}}
  Note: Real-time API data is currently unavailable. Please provide your best analysis based on your extensive knowledge of 2024-2025 tech market trends. 
  {{/if}}

  Provide the following structured data:
  1. **Salary by Experience**: For each role (or the specific role requested), provide current average annual USD salary for "Entry-Level", "Mid-Level", and "Senior-Level".
  2. **Market Demand**: Provide a demand score (1-100) for key roles.
  3. **Job Openings by Location**: Current open positions in 5 major global tech hubs.
  4. **Top Skills**: Identify the 8 most requested skills for the role or the general market.
  5. **Salary Trends**: provide an estimated trend of average salaries for the last 5 years (2020-2024).`,
});

const getJobTrendsFlow = ai.defineFlow(
  {
    name: 'getJobTrendsFlow',
    inputSchema: GetJobTrendsInputSchema,
    outputSchema: GetJobTrendsOutputSchema,
  },
  async (input) => {
    // Fetch live data with built-in revalidation/caching
    const apiData = await fetchJobTrendsFromAPI(input.role);

    const { output } = await getJobTrendsPrompt({ role: input.role, apiData });
    return output!;
  }
);
