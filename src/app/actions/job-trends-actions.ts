'use server';

/**
 * @fileOverview Server Action for fetching real-time job trends from the Adzuna API.
 * Optimized with caching and graceful error handling for production stability.
 */

export async function fetchJobTrendsFromAPI(role?: string) {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  // Gracefully skip if credentials are missing instead of throwing to avoid breaking the UI
  if (!appId || !apiKey) {
    console.warn('Adzuna API: Credentials missing. Skipping live data fetch.');
    return null;
  }

  try {
    // Construct search URL with optional 'what' parameter for role-specific trends
    // We use a results_per_page=20 to keep payload manageable
    const baseUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=20&content-type=application/json`;
    const queryUrl = role ? `${baseUrl}&what=${encodeURIComponent(role)}` : baseUrl;

    // Cache responses for 1 hour (3600 seconds) to stay within rate limits and improve performance
    const response = await fetch(queryUrl, { 
      next: { revalidate: 3600, tags: ['job-trends'] } 
    });

    if (response.status === 429) {
      console.error('Adzuna API: Rate limit exceeded (429).');
      return null;
    }

    if (!response.ok) {
      console.error(`Adzuna API: Request failed with status ${response.status}`);
      return null;
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return {
        count: 0,
        listings: [],
        timestamp: new Date().toISOString(),
        queriedRole: role || 'General Market'
      };
    }

    // Normalize data for the AI to analyze efficiently
    const listings = data.results.map((job: any) => ({
      title: job.title,
      location: job.location?.display_name || 'Remote/Unknown',
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      category: job.category?.label || 'General Tech',
      created: job.created
    }));

    return {
      count: data.count,
      listings: listings,
      timestamp: new Date().toISOString(),
      queriedRole: role || 'General Market'
    };
  } catch (error) {
    // Catch network errors and log them, but don't crash the flow
    console.error('Adzuna API: Network error or unexpected failure:', error);
    return null;
  }
}
