import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(file) {
  return fs.readFileSync(path.join(root, file), "utf8");
}

function extractMainSection(html, pattern, label) {
  const m = html.match(pattern);
  if (!m) throw new Error(`Missing section: ${label}`);
  return m[0];
}

function stripPageSingle(html) {
  return html
    .replace(/\s*class="page-single"/g, "")
    .replace(/\s*page-single\s+/g, " ")
    .replace(/class="\s+/g, 'class="')
    .replace(/class=""/g, "");
}

function patchAnchors(html) {
  return html
    .replace(/href="download\.html"/g, 'href="#download"')
    .replace(/href="workflow\.html"/g, 'href="#workflow"')
    .replace(/href="features\.html"/g, 'href="#features"')
    .replace(/href="compare\.html"/g, 'href="#compare"')
    .replace(/href="faq\.html"/g, 'href="#faq"')
    .replace(/href="docs\.html"/g, 'href="#docs"')
    .replace(/href="index\.html"/g, 'href="#"');
}

const sourceMain = read("source.html").match(/<main id="main">([\s\S]*?)<\/main>/)[1];

const hero = extractMainSection(sourceMain, /<section class="hero"[\s\S]*?<\/section>/, "hero");
const workflow = stripPageSingle(
  extractMainSection(read("workflow.html"), /<section[^>]*id="workflow"[\s\S]*?<\/section>/, "workflow")
);
const integration = extractMainSection(
  sourceMain,
  /<section class="section-muted"[\s\S]*?<\/section>/,
  "integration"
);
const features = stripPageSingle(
  extractMainSection(read("features.html"), /<section[^>]*id="features"[\s\S]*?<\/section>/, "features")
);
const docs = extractMainSection(sourceMain, /<section id="docs"[\s\S]*?<\/section>/, "docs");
const compare = stripPageSingle(
  extractMainSection(read("compare.html"), /<section[^>]*id="compare"[\s\S]*?<\/section>/, "compare")
);
const faq = stripPageSingle(
  extractMainSection(read("faq.html"), /<section[^>]*id="faq"[\s\S]*?<\/section>/, "faq")
);
const download = stripPageSingle(
  extractMainSection(read("download.html"), /<section[^>]*id="download"[\s\S]*?<\/section>/, "download")
);

const mainContent = patchAnchors(
  [hero, workflow, integration, features, docs, compare, faq, download]
    .map((s) => "    " + s.trim().split("\n").join("\n    "))
    .join("\n\n")
);

const headerFixed = `  <header class="site">
    <div class="header-inner">
      <a class="brand" href="#" aria-label="ProtoFlow home">
        <span class="brand-mark" aria-hidden="true">P</span>
        ProtoFlow
      </a>
      <nav class="primary" aria-label="Primary">
        <a href="#workflow">Workflow</a>
        <a href="#features">Features</a>
        <a href="#compare">Compare</a>
        <a href="#docs">Documentation</a>
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

${headerFixed}

  <main id="main">
${mainContent}
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
console.log("Assembled index.html (single-page landing)");
