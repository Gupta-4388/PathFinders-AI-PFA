
'use server';

/**
 * @fileOverview Recommends YouTube channels for web developers based on a specific topic.
 *
 * - recommendYoutubeChannels - A function that suggests relevant YouTube channels.
 * - RecommendYoutubeChannelsInput - The input type for the recommendYoutubeChannels function.
 * - RecommendYoutubeChannelsOutput - The return type for the recommendYoutubeChannels function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const RecommendYoutubeChannelsInputSchema = z.object({
  topic: z
    .string()
    .describe(
      'The web development topic the user is interested in (e.g., HTML, CSS, JavaScript, React, Node.js, Django, full-stack development, UI/UX design, or website deployment).'
    ),
});
export type RecommendYoutubeChannelsInput = z.infer<
  typeof RecommendYoutubeChannelsInputSchema
>;

const RecommendedChannelSchema = z.object({
  channelName: z.string().describe('The name of the YouTube channel.'),
  channelLink: z
    .string()
    .url()
    .describe('The valid, working URL link to the YouTube channel.'),
  description: z
    .string()
    .describe(
      'A short description of the channel, including its style, teaching approach, and target level (e.g., beginner, intermediate, advanced).'
    ),
  recommendationReason: z
    .string()
    .describe('A brief explanation of why this channel is recommended for the specified topic.'),
  exampleVideos: z
    .array(z.string())
    .describe(
      'A list of titles of recent or popular videos that are relevant to the topic.'
    ),
});

const RecommendYoutubeChannelsOutputSchema = z.object({
  recommendedChannels: z
    .array(RecommendedChannelSchema)
    .describe('A list of recommended YouTube channels.'),
});
export type RecommendYoutubeChannelsOutput = z.infer<
  typeof RecommendYoutubeChannelsOutputSchema
>;

export async function recommendYoutubeChannels(
  input: RecommendYoutubeChannelsInput
): Promise<RecommendYoutubeChannelsOutput> {
  return recommendYoutubeChannelsFlow(input);
}

const recommendChannelsPrompt = ai.definePrompt({
  name: 'recommendYoutubeChannelsPrompt',
  input: { schema: RecommendYoutubeChannelsInputSchema },
  output: { schema: RecommendYoutubeChannelsOutputSchema },
  prompt: `Act as an AI mentor for aspiring web developers. Based on the user’s query about a specific topic, find and recommend the best working YouTube channels that currently provide high-quality, consistent, and practical tutorials on that topic.

User Query Topic: {{{topic}}}

For each channel, you must provide:
1.  **Channel Name**: The official name of the channel.
2.  **Channel Link**: The full, valid, and working URL to the channel's main page.
3.  **Short Description**: Describe the channel's style, teaching approach, and the primary audience level (beginner, intermediate, advanced).
4.  **Why it’s recommended**: Explain why this channel is a great resource for the user's topic.
5.  **Example of recent or popular videos**: List a few relevant video titles.

Ensure the channels recommended are active and relevant to the query. Prioritize channels that:
- Regularly post new content.
- Offer project-based learning.
- Have good viewer engagement and credibility.
- Use modern tools, frameworks, and coding standards.`,
});

const recommendYoutubeChannelsFlow = ai.defineFlow(
  {
    name: 'recommendYoutubeChannelsFlow',
    inputSchema: RecommendYoutubeChannelsInputSchema,
    outputSchema: RecommendYoutubeChannelsOutputSchema,
  },
  async (input) => {
    const { output } = await recommendChannelsPrompt(input);
    return output!;
  }
);
