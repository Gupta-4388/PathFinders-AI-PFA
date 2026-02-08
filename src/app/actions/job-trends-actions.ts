'use server';

/**
 * @fileOverview Server Action for fetching real-time job trends from the Adzuna API.
 */

export async function fetchJobTrendsFromAPI(role?: string) {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    throw new Error('Adzuna API credentials are not configured.');
  }

  try {
    // Construct search URL with optional 'what' parameter for role-specific trends
    const baseUrl = `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=50&content-type=application/json`;
    const queryUrl = role ? `${baseUrl}&what=${encodeURIComponent(role)}` : baseUrl;

    const response = await fetch(queryUrl, { next: { revalidate: 3600 } });

    if (!response.ok) {
      throw new Error(`Adzuna API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize data for the AI to analyze
    const listings = data.results.map((job: any) => ({
      title: job.title,
      location: job.location.display_name,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
      category: job.category.label,
      created: job.created
    }));

    return {
      count: data.count,
      listings: listings.slice(0, 20),
      timestamp: new Date().toISOString(),
      queriedRole: role || 'General Market'
    };
  } catch (error) {
    console.error('Error fetching from Adzuna:', error);
    throw error;
  }
}
