import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface RepoNarrative {
  introduction: string;
  majorEvents: {
    title: string;
    description: string;
    date: string;
    impact: "high" | "medium" | "low";
  }[];
  challenges: string[];
  turningPoints: string[];
  conclusion: string;
  summary: string;
  documentaryScript: string;
}

export async function generateRepoNarrative(repoData: any): Promise<RepoNarrative> {
  const prompt = `
    Analyze the following Git repository metrics and commit history to generate a cinematic narrative story of its development.
    
    Repository: ${repoData.repoName} by ${repoData.owner}
    Total Commits: ${repoData.totalCommits}
    Contributors: ${JSON.stringify(repoData.contributors)}
    Recent Commits: ${JSON.stringify(repoData.commits.slice(0, 20))}
    Metrics: ${JSON.stringify(repoData.metrics)}

    Return a structured JSON object representing the "biography" of this codebase.
    The narrative should feel like a documentary script.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          introduction: { type: Type.STRING },
          majorEvents: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                date: { type: Type.STRING },
                impact: { type: Type.STRING, enum: ["high", "medium", "low"] },
              },
              required: ["title", "description", "date", "impact"]
            }
          },
          challenges: { type: Type.ARRAY, items: { type: Type.STRING } },
          turningPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          conclusion: { type: Type.STRING },
          summary: { type: Type.STRING },
          documentaryScript: { type: Type.STRING },
        },
        required: ["introduction", "majorEvents", "challenges", "turningPoints", "conclusion", "summary", "documentaryScript"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
