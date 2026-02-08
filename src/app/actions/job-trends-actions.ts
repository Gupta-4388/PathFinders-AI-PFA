'use server';

/**
 * @fileOverview Server Action for fetching real-time job trends from the Adzuna API.
 */

export async function fetchJobTrendsFromAPI() {
  const appId = process.env.ADZUNA_APP_ID;
  const apiKey = process.env.ADZUNA_API_KEY;

  if (!appId || !apiKey) {
    throw new Error('Adzuna API credentials are not configured.');
  }

  // Define tech hubs and roles to track
  const countries = ['us', 'gb', 'in'];
  const roles = [
    'Software Engineer',
    'Data Scientist',
    'Product Manager',
    'DevOps Engineer',
    'UX/UI Designer',
    'Cybersecurity Analyst'
  ];

  try {
    // We fetch a sample of recent jobs for the top roles to derive trends
    // Adzuna Search API: /v1/api/jobs/{country}/search/{page}
    // We'll focus on 'us' as a primary benchmark for global trends
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/us/search/1?app_id=${appId}&app_key=${apiKey}&results_per_page=50&content-type=application/json`,
      { next: { revalidate: 3600 } } // Cache for 1 hour
    );

    if (!response.ok) {
      throw new Error(`Adzuna API responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Normalize data for the AI to analyze
    // We extract titles, locations, and salaries to provide context to the LLM
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
      listings: listings.slice(0, 20), // Send a representative sample to the LLM
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error fetching from Adzuna:', error);
    throw error;
  }
}
