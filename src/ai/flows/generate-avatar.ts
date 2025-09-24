
'use server';
/**
 * @fileOverview A flow for generating user avatars based on a text prompt.
 *
 * - generateAvatar - A function that takes a text prompt and returns an SVG avatar.
 * - GenerateAvatarOutput - The return type for the generateAvatar function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { from, an } from 'fast-xml-parser';

const GenerateAvatarOutputSchema = z.object({
  svgContent: z.string().describe('The full SVG content of the generated avatar.'),
});

export type GenerateAvatarOutput = z.infer<typeof GenerateAvatarOutputSchema>;

export async function generateAvatar(promptText: string): Promise<GenerateAvatarOutput> {
  return generateAvatarFlow(promptText);
}

const extractSvgPrompt = ai.definePrompt({
  name: 'extractSvgPrompt',
  prompt: `Extract the <svg>...</svg> block from the following text. Only return the SVG content itself, with no other text or explanation.

Input:
\`\`\`
{{prompt}}
\`\`\`

Output:
`,
});

const generateAvatarFlow = ai.defineFlow(
  {
    name: 'generateAvatarFlow',
    inputSchema: z.string(),
    outputSchema: GenerateAvatarOutputSchema,
  },
  async (promptText) => {
    const llmResponse = await ai.generate({
        prompt: `Generate a simple, flat, vector-style cartoon avatar based on the following description.
The avatar should be suitable for a user profile.
It must be a single, standalone SVG image.

Description: "${promptText}"

Return ONLY the raw SVG code, starting with "<svg" and ending with "</svg>". Do not include any markdown, backticks, or other text.`,
        config: {
            temperature: 0.8
        }
    });

    const text = llmResponse.text;

    // In case the model still wraps the SVG in markdown, try to extract it.
    if (text.includes('<svg') && text.includes('</svg>')) {
        const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
        if (svgMatch) {
            return { svgContent: svgMatch[0] };
        }
    }

    // If no clear SVG is found, make a second attempt to extract it with another LLM call.
    const extractionResponse = await extractSvgPrompt({ prompt: text });
    const extractedText = extractionResponse.text;
    
    if (extractedText.includes('<svg')) {
      return { svgContent: extractedText };
    }

    throw new Error('Failed to generate a valid SVG avatar.');
  }
);
