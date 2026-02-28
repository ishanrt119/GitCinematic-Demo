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

export async function generateProjectSummary(repoData: any): Promise<any> {
  const prompt = `
    Analyze the following Git repository files and README to generate a project summary for a "Project Preview" panel.
    
    Repository: ${repoData.repoName} by ${repoData.owner}
    Files: ${JSON.stringify(repoData.files?.slice(0, 50))}
    README: ${repoData.readme?.substring(0, 2000)}
    Package.json: ${JSON.stringify(repoData.packageJson)}

    Return a structured JSON object with the following properties:
    - projectPurpose: A concise description of what the project does.
    - expectedOutput: What the project produces (e.g., a web app, an API, a CLI tool).
    - howToRun: Simple instructions on how to run the project.
    - mainFeatures: An array of strings describing the key features.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projectPurpose: { type: Type.STRING },
          expectedOutput: { type: Type.STRING },
          howToRun: { type: Type.STRING },
          mainFeatures: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["projectPurpose", "expectedOutput", "howToRun", "mainFeatures"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function chatWithRepo(context: any, question: string, mode: 'beginner' | 'technical'): Promise<string> {
  const prompt = `
    You are an expert software engineer. You are analyzing a Git repository.
    Answer questions based ONLY on the provided repository context.
    If information is not available, say so clearly.
    
    Mode: ${mode === 'beginner' ? 'Explain in simple language for a non-technical person.' : 'Provide deep technical details, architecture analysis, and code references.'}

    CONTEXT:
    - File Structure: ${JSON.stringify(context.fileTree)}
    - README: ${context.readme}
    - Package.json: ${JSON.stringify(context.packageJson)}
    - Relevant Code Snippets:
      ${context.relevantFiles.map((f: any) => `File: ${f.path}\nContent:\n${f.content}`).join('\n\n')}

    USER QUESTION:
    ${question}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "I couldn't generate an answer.";
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
