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
    You are an expert software engineer and code architect. You are analyzing a Git repository to help a user understand its implementation.
    
    Your goal is to provide accurate, code-based answers using the provided repository context.
    
    GUIDELINES:
    - Use the "Relevant Code Snippets" to explain HOW features are implemented.
    - Reference specific file paths and function names in your explanation.
    - If the user asks about a feature not found in the context, look at the "File Structure" to suggest where it might be located.
    - If you truly cannot find the information, state what you searched for and what you found instead.
    - ${mode === 'beginner' ? 'Explain concepts simply, using analogies where helpful.' : 'Provide deep technical analysis, including design patterns and architectural decisions.'}

    REPOSITORY CONTEXT:
    - File Structure: ${JSON.stringify(context.fileTree)}
    - README: ${context.readme}
    - Package.json: ${JSON.stringify(context.packageJson)}
    - Core Files Summary: ${context.coreFiles?.map((f: any) => f.path).join(', ')}
    - Detailed Code Snippets:
      ${context.relevantFiles.map((f: any) => `--- FILE: ${f.path} ---\n${f.content}\n--- END FILE ---`).join('\n\n')}

    USER QUESTION:
    ${question}

    RESPONSE FORMAT:
    - Use Markdown for formatting.
    - Use code blocks for any code references.
    - Be concise but thorough.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
  });

  return response.text || "I couldn't generate an answer based on the repository context.";
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
