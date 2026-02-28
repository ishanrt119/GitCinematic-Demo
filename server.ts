import express from "express";
import { createServer as createViteServer } from "vite";
import { Octokit } from "octokit";
import Database from "better-sqlite3";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const db = new Database("git_cinematic.db");

// Initialize DB
db.exec(`
  CREATE TABLE IF NOT EXISTS analysis (
    id TEXT PRIMARY KEY,
    repo_url TEXT,
    data TEXT,
    narrative TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(express.json());

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Helper: Simple sentiment scoring
function analyzeSentiment(message: string) {
  const positive = ["feat", "fix", "improve", "add", "awesome", "great", "clean", "refactor", "optimize"];
  const negative = ["bug", "error", "fail", "break", "revert", "issue", "hotfix", "critical", "broken"];
  
  let score = 0;
  const words = message.toLowerCase().split(/\s+/);
  words.forEach(word => {
    if (positive.some(p => word.includes(p))) score += 1;
    if (negative.some(n => word.includes(n))) score -= 1;
  });
  
  if (score > 0) return "positive";
  if (score < 0) return "negative";
  return "neutral";
}

app.post("/api/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL required" });

  try {
    // Extract owner and repo from URL
    const match = url.match(/github\.com\/([^/]+)\/([^/.]+)/);
    if (!match) return res.status(400).json({ error: "Invalid GitHub URL" });
    
    const [_, owner, repo] = match;
    const repoId = `${owner}/${repo}`;

    // Check cache
    const cached = db.prepare("SELECT * FROM analysis WHERE id = ?").get(repoId) as any;
    if (cached) {
      return res.json({ 
        data: JSON.parse(cached.data), 
        narrative: JSON.parse(cached.narrative) 
      });
    }

    // Fetch Commits
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100, // Limit for prototype
    });

    // Fetch File Tree
    const { data: treeData } = await octokit.rest.git.getTree({
      owner,
      repo,
      tree_sha: commits[0].sha,
      recursive: "true",
    });
    const files = treeData.tree.map(f => f.path || "");

    // Identify core files for "memory"
    const coreFilePaths = files.filter(path => {
      const p = path.toLowerCase();
      return p === "readme.md" || 
             p === "package.json" || 
             p === "requirements.txt" || 
             p === "dockerfile" ||
             p.match(/^(src|app|lib|main)\/(index|main|app|server)\.(js|ts|py|go|java|cpp|c)$/) ||
             p.match(/^(index|main|app|server)\.(js|ts|py|go|java|cpp|c)$/);
    }).slice(0, 10);

    const coreFiles = await Promise.all(coreFilePaths.map(async (path) => {
      try {
        const { data: fileData } = await octokit.rest.repos.getContent({ owner, repo, path }) as any;
        return {
          path,
          content: Buffer.from(fileData.content, "base64").toString().substring(0, 10000)
        };
      } catch (e) {
        return null;
      }
    }));

    // Fetch README
    let readme = "";
    try {
      const { data: readmeData } = await octokit.rest.repos.getReadme({ owner, repo });
      readme = Buffer.from(readmeData.content, "base64").toString();
    } catch (e) {
      console.log("No README found");
    }

    // Fetch package.json if exists
    let packageJson = null;
    if (files.includes("package.json")) {
      try {
        const { data: pkgData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: "package.json",
        }) as any;
        packageJson = JSON.parse(Buffer.from(pkgData.content, "base64").toString());
      } catch (e) {
        console.log("Error fetching package.json");
      }
    }

    // Basic Metrics
    const contributors: Record<string, number> = {};
    const processedCommits = commits.map((c) => {
      const author = c.commit.author?.name || "Unknown";
      contributors[author] = (contributors[author] || 0) + 1;
      const sentiment = analyzeSentiment(c.commit.message);
      
      return {
        sha: c.sha,
        author,
        date: c.commit.author?.date,
        message: c.commit.message,
        sentiment,
      };
    });

    // Group by week for timeline
    const stats = {
      repoName: repo,
      owner,
      totalCommits: commits.length,
      contributors: Object.entries(contributors).map(([name, count]) => ({ name, count })),
      commits: processedCommits,
      files, // Store full file tree
      readme,
      packageJson,
      coreFiles: coreFiles.filter(Boolean),
      metrics: {
        churnRate: Math.random() * 100, // Simulated for prototype
        refactorCount: processedCommits.filter(c => c.message.toLowerCase().includes("refactor")).length,
        bugFixes: processedCommits.filter(c => c.message.toLowerCase().includes("fix")).length,
      }
    };

    // Store in DB
    db.prepare("INSERT OR REPLACE INTO analysis (id, repo_url, data) VALUES (?, ?, ?)")
      .run(repoId, url, JSON.stringify(stats));

    res.json({ data: stats });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/save-narrative", (req, res) => {
  const { repoId, narrative } = req.body;
  db.prepare("UPDATE analysis SET narrative = ? WHERE id = ?")
    .run(JSON.stringify(narrative), repoId);
  res.json({ success: true });
});

app.post("/api/repo/chat-context", async (req, res) => {
  const { repoId, question } = req.body;
  if (!repoId || !question) return res.status(400).json({ error: "Missing repoId or question" });

  try {
    const cached = db.prepare("SELECT * FROM analysis WHERE id = ?").get(repoId) as any;
    if (!cached) return res.status(404).json({ error: "Repo not analyzed yet" });

    const repoData = JSON.parse(cached.data);
    const [owner, repo] = repoId.split("/");
    const files = repoData.files || [];

    // Improved keyword search
    // Extract potential identifiers from question
    const identifiers = question.match(/[a-zA-Z_][a-zA-Z0-9_.]*/g) || [];
    const keywords = [...new Set([...question.toLowerCase().split(/\s+/), ...identifiers])];
    
    // Score files based on keyword matches in path
    const scoredFiles = files.map(path => {
      const fileName = path.toLowerCase().split("/").pop() || "";
      let score = 0;
      keywords.forEach(k => {
        if (k.length < 3) return;
        if (fileName.includes(k)) score += 10;
        if (path.includes(k)) score += 5;
      });
      return { path, score };
    })
    .filter(f => f.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

    // Fetch content for top relevant files
    const relevantFiles = await Promise.all(scoredFiles.map(async (f) => {
      // Check if it's already in coreFiles
      const cachedFile = repoData.coreFiles?.find((cf: any) => cf.path === f.path);
      if (cachedFile) return cachedFile;

      try {
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: f.path,
        }) as any;
        return {
          path: f.path,
          content: Buffer.from(fileData.content, "base64").toString().substring(0, 8000),
        };
      } catch (e) {
        return null;
      }
    }));

    res.json({
      fileTree: files.slice(0, 500), // More generous tree limit
      readme: repoData.readme?.substring(0, 5000),
      packageJson: repoData.packageJson,
      coreFiles: repoData.coreFiles || [],
      relevantFiles: relevantFiles.filter(Boolean),
    });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
