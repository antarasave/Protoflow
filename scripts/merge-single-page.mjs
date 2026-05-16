import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function extractMainSection(file, label) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  const m = html.match(/<main id="main">([\s\S]*?)<\/main>/);
  if (!m) throw new Error(`No main in ${file}`);
  return m[1].trim();
}

function cleanSection(html) {
  return html
    .replace(/\s*class="page-single\s*"/g, "")
    .replace(/\s*class="page-single"/g, "")
    .replace(/\s+class=""/g, "")
    .replace(/href="workflow\.html"/g, 'href="#workflow"')
    .replace(/href="features\.html"/g, 'href="#features"')
    .replace(/href="compare\.html"/g, 'href="#compare"')
    .replace(/href="faq\.html"/g, 'href="#faq"')
    .replace(/href="download\.html"/g, 'href="#download"')
    .replace(/href="docs\.html"/g, 'href="#docs"')
    .replace(/href="index\.html"/g, 'href="#"')
    .replace(/href="workflow\.html"/g, 'href="#workflow"')
    .replace(/ aria-current="page"/g, "");
}

function extractHero() {
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const m = html.match(/<section class="hero"[\s\S]*?<\/section>/);
  if (!m) throw new Error("Hero section not found");
  return m[0];
}

const hero = extractHero()
  .replace('class="hero page-single"', 'class="hero"')
  .replace(/href="workflow\.html"/g, 'href="#workflow"')
  .replace(/href="download\.html"/g, 'href="#download"');
const workflow = cleanSection(extractMainSection("workflow.html", "workflow"));
const features = cleanSection(extractMainSection("features.html", "features"));
const compare = cleanSection(extractMainSection("compare.html", "compare"));
const faq = cleanSection(extractMainSection("faq.html", "faq"));
const docs = cleanSection(extractMainSection("docs.html", "docs"));
const download = cleanSection(extractMainSection("download.html", "download"));

const header = `  <header class="site">
    <div class="header-inner">
      <a class="brand" href="#" aria-label="ProtoFlow home">
        <span class="brand-mark" aria-hidden="true">P</span>
        ProtoFlow
      </a>
      <nav class="primary" aria-label="Primary">
        <a href="#workflow">Workflow</a>
        <a href="#features">Features</a>
        <a href="#compare">Compare</a>
        <a href="#faq">FAQ</a>
      </nav>
      <div class="header-actions">
        <a class="btn btn-primary" href="#download">Download</a>
      </div>
    </div>
  </header>`;

const page = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="ProtoFlow: desktop schematic capture. Draft from a prompt, edit, export to KiCad or Altium." />
  <title>ProtoFlow — Schematic capture for hardware teams</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/site.css" />
</head>
<body class="site-body page-landing">
  <a class="skip" href="#main">Skip to content</a>

  <div class="announce" role="region" aria-label="Early access">
    <strong>Early access</strong>
    <span>Free to start. No credit card.</span>
  </div>

${header}

  <main id="main">
${[hero, workflow, features, compare, faq, docs, download].map((s) => "    " + s.split("\n").join("\n    ")).join("\n\n")}
  </main>

  <footer class="site">
    <div class="footer-inner">
      <span>© <span id="y"></span> ProtoFlow. All rights reserved.</span>
      <div class="footer-links">
        <a href="#docs">Documentation</a>
        <a href="#">Privacy</a>
        <a href="#">Security</a>
      </div>
    </div>
  </footer>

  <script src="js/site.js"></script>
</body>
</html>
`;

fs.writeFileSync(path.join(root, "index.html"), page);
console.log("Merged index.html");
