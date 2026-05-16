import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceFile = fs.existsSync(path.join(root, "source.html"))
  ? path.join(root, "source.html")
  : path.join(root, "index.html");
const src = fs.readFileSync(sourceFile, "utf8");

const cssMatch = src.match(/<style>([\s\S]*?)<\/style>/);
if (!cssMatch) throw new Error("No <style> block found");

const layoutCss = `
    html { height: 100%; }
    body.site-body {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }
    .header-inner {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: 16px;
      max-width: min(var(--max), 1200px);
    }
    .brand { justify-self: start; }
    nav.primary {
      justify-self: center;
      justify-content: center;
    }
    .header-actions {
      justify-self: end;
      display: flex;
      align-items: center;
    }
    nav.primary a[aria-current="page"] {
      color: var(--text);
      background: rgba(255, 255, 255, 0.06);
    }
    main#main {
      flex: 1;
      display: flex;
      flex-direction: column;
    }
    main#main > section.page-single {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-bottom: none;
    }
    main#main > section.page-single > .wrap {
      width: 100%;
    }
    body.page-home .hero.page-single {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      border-bottom: none;
      padding-top: clamp(24px, 4vw, 48px);
      padding-bottom: clamp(24px, 4vw, 48px);
    }
    body.page-sub main#main > section.page-single {
      padding-top: clamp(40px, 6vw, 72px);
      padding-bottom: clamp(40px, 6vw, 72px);
    }
    main#main > section + section.page-single {
      flex: 0;
      padding-top: 32px;
      padding-bottom: var(--space-section);
    }
    @media (max-width: 720px) {
      .header-inner {
        grid-template-columns: 1fr auto;
        grid-template-rows: auto auto;
      }
      nav.primary {
        grid-column: 1 / -1;
        justify-self: center;
        padding-top: 8px;
      }
    }
`;

fs.mkdirSync(path.join(root, "css"), { recursive: true });
fs.writeFileSync(path.join(root, "css", "site.css"), cssMatch[1] + layoutCss);

function extractSection(pattern, label) {
  const m = src.match(pattern);
  if (!m) throw new Error(`Section not found: ${label}`);
  return m[0];
}

const sections = {
  hero: extractSection(/<section class="hero"[\s\S]*?<\/section>/, "hero"),
  workflow: extractSection(/<section id="workflow"[\s\S]*?<\/section>/, "workflow"),
  integration: extractSection(
    /<section class="section-muted" aria-labelledby="fits-title"[\s\S]*?<\/section>/,
    "integration"
  ),
  features: extractSection(/<section id="features"[\s\S]*?<\/section>/, "features"),
  docs: extractSection(/<section id="docs"[\s\S]*?<\/section>/, "docs"),
  compare: extractSection(/<section id="compare"[\s\S]*?<\/section>/, "compare"),
  faq: extractSection(/<section id="faq"[\s\S]*?<\/section>/, "faq"),
  download: extractSection(/<section class="footer-cta"[\s\S]*?<\/section>/, "download"),
};

function patchLinks(html) {
  return html
    .replace(/href="#download"/g, 'href="download.html"')
    .replace(/href="#workflow"/g, 'href="workflow.html"')
    .replace(/href="#features"/g, 'href="features.html"')
    .replace(/href="#compare"/g, 'href="compare.html"')
    .replace(/href="#faq"/g, 'href="faq.html"')
    .replace(/href="#docs"/g, 'href="docs.html"');
}

function addPageSingle(html) {
  const open = html.match(/^<section([^>]*)>/);
  if (!open) return html;
  const attrs = open[1];
  if (/class="/.test(attrs)) {
    return html.replace(/class="/, 'class="page-single ');
  }
  return html.replace(/^<section/, '<section class="page-single"');
}

function header(active) {
  const link = (href, label, key) => {
    const cur = active === key ? ' aria-current="page"' : "";
    return `<a href="${href}"${cur}>${label}</a>`;
  };
  const dlCur = active === "download" ? ' aria-current="page"' : "";
  return `  <header class="site">
    <div class="header-inner">
      <a class="brand" href="index.html" aria-label="ProtoFlow home">
        <span class="brand-mark" aria-hidden="true">P</span>
        ProtoFlow
      </a>
      <nav class="primary" aria-label="Primary">
        ${link("workflow.html", "Workflow", "workflow")}
        ${link("features.html", "Features", "features")}
        ${link("compare.html", "Compare", "compare")}
        ${link("faq.html", "FAQ", "faq")}
      </nav>
      <div class="header-actions">
        <a class="btn btn-primary" href="download.html"${dlCur}>Download</a>
      </div>
    </div>
  </header>`;
}

function footer() {
  return `  <footer class="site">
    <div class="footer-inner">
      <span>© <span id="y"></span> ProtoFlow. All rights reserved.</span>
      <div class="footer-links">
        <a href="docs.html">Documentation</a>
        <a href="#">Privacy</a>
        <a href="#">Security</a>
      </div>
    </div>
  </footer>`;
}

function buildPage({ file, title, description, active, bodyClass, sectionKeys }) {
  const parts = sectionKeys.map((key) => {
    let html = sections[key];
    if (key === "hero") {
      html = html.replace('<section class="hero"', '<section class="hero page-single"');
    } else {
      html = addPageSingle(html);
    }
    return patchLinks(html);
  });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="${description}" />
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/site.css" />
</head>
<body class="site-body ${bodyClass}">
  <a class="skip" href="#main">Skip to content</a>

  <div class="announce" role="region" aria-label="Early access">
    <strong>Early access</strong>
    <span>Free to start. No credit card.</span>
  </div>

${header(active)}

  <main id="main">
${parts.map((p) => "    " + p.split("\n").join("\n    ")).join("\n\n")}
  </main>

${footer()}

  <script src="js/site.js"></script>
</body>
</html>
`;
}

const pages = [
  {
    file: "index.html",
    title: "ProtoFlow — Schematic capture for hardware teams",
    description:
      "ProtoFlow: desktop schematic capture. Draft from a prompt, edit, export to KiCad or Altium.",
    active: null,
    bodyClass: "page-home",
    sectionKeys: ["hero"],
  },
  {
    file: "workflow.html",
    title: "Workflow — ProtoFlow",
    description: "How ProtoFlow works: describe, generate, refine, export to KiCad or Altium.",
    active: "workflow",
    bodyClass: "page-sub",
    sectionKeys: ["workflow"],
  },
  {
    file: "features.html",
    title: "Features — ProtoFlow",
    description: "ProtoFlow features for schematic capture, libraries, cleanup, and export.",
    active: "features",
    bodyClass: "page-sub",
    sectionKeys: ["features"],
  },
  {
    file: "compare.html",
    title: "Compare — ProtoFlow",
    description: "Compare ProtoFlow with Flux AI and traditional EDA for schematic workflow.",
    active: "compare",
    bodyClass: "page-sub",
    sectionKeys: ["compare"],
  },
  {
    file: "faq.html",
    title: "FAQ — ProtoFlow",
    description: "Frequently asked questions about ProtoFlow schematic capture and export.",
    active: "faq",
    bodyClass: "page-sub",
    sectionKeys: ["faq"],
  },
  {
    file: "download.html",
    title: "Download — ProtoFlow",
    description: "Download ProtoFlow desktop app for schematic capture.",
    active: "download",
    bodyClass: "page-sub",
    sectionKeys: ["download"],
  },
  {
    file: "docs.html",
    title: "Documentation — ProtoFlow",
    description: "ProtoFlow documentation, exports, and early access resources.",
    active: null,
    bodyClass: "page-sub",
    sectionKeys: ["docs"],
  },
];

for (const p of pages) {
  fs.writeFileSync(path.join(root, p.file), buildPage(p));
}

fs.mkdirSync(path.join(root, "js"), { recursive: true });
fs.writeFileSync(
  path.join(root, "js", "site.js"),
  `document.getElementById("y").textContent = new Date().getFullYear();
(function () {
  var header = document.querySelector("header.site");
  if (header) {
    function onScroll() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
`
);

console.log("Built:", pages.map((p) => p.file).join(", "));
