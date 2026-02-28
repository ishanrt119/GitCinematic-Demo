import { RepoData, ProjectPreviewData } from './utils';

export function detectProjectType(repoData: RepoData) {
  const files = repoData.files || [];
  const pkg = repoData.packageJson;
  const readme = repoData.readme || "";

  let projectType = "Unknown";
  let framework = "None";
  let entryPoint = "N/A";

  // 1. Detect by files
  if (files.includes("package.json")) {
    projectType = "Node.js / JavaScript";
    if (pkg?.dependencies?.react || pkg?.devDependencies?.react) {
      framework = "React";
      entryPoint = files.find(f => f.includes("src/main.tsx") || f.includes("src/index.tsx") || f.includes("src/App.tsx")) || "src/index.js";
    } else if (pkg?.dependencies?.next) {
      framework = "Next.js";
      entryPoint = "app/page.tsx";
    } else if (pkg?.dependencies?.express) {
      framework = "Express";
      entryPoint = pkg.main || "server.js";
    }
  } else if (files.includes("index.html")) {
    projectType = "Static Website";
    framework = "HTML/CSS";
    entryPoint = "index.html";
  } else if (files.includes("requirements.txt") || files.some(f => f.endsWith(".py"))) {
    projectType = "Python";
    if (readme.toLowerCase().includes("flask")) framework = "Flask";
    if (readme.toLowerCase().includes("django")) framework = "Django";
    entryPoint = files.find(f => f === "app.py" || f === "main.py" || f === "manage.py") || "main.py";
  } else if (files.includes("Dockerfile")) {
    projectType = "Containerized App";
    framework = "Docker";
    entryPoint = "Dockerfile";
  }

  return { projectType, framework, entryPoint };
}
