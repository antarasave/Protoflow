import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const path = join(root, "index.html");
let html = readFileSync(path, "utf8");

const workflowOld = /<section id="workflow"[\s\S]*?<\/section>\s*\n\s*<section id="features"/;
const workflowNew = `<section id="problem" class="section-quiet" aria-labelledby="problem-title">
      <div class="wrap">
        <p class="eyebrow">Problem</p>
        <h2 id="problem-title">Schematic capture is repetitive work</h2>
        <p class="lede">Symbols, pins, and sheet cleanup repeat on every board. ProtoFlow targets that work—not PCB layout.</p>
      </div>
    </section>

    <section id="workflow" aria-labelledby="workflow-title">
      <div class="wrap workflow-wrap">
        <p class="eyebrow">Workflow</p>
        <h2 id="workflow-title">How it works</h2>
        <ol class="workflow-steps">
          <li>
            <span class="workflow-num">01</span>
            <div>
              <h3>Describe your circuit</h3>
              <p>Describe the circuit you want.</p>
            </div>
          </li>
          <li>
            <span class="workflow-num">02</span>
            <div>
              <h3>Generate a draft schematic</h3>
              <p>ProtoFlow drafts the schematic.</p>
            </div>
          </li>
          <li>
            <span class="workflow-num">03</span>
            <div>
              <h3>Review and refine</h3>
              <p>Review parts, nets, and structure.</p>
            </div>
          </li>
          <li>
            <span class="workflow-num">04</span>
            <div>
              <h3>Export to KiCad</h3>
              <p>Export when it&rsquo;s ready.</p>
            </div>
          </li>
        </ol>
        <p class="workflow-note">ProtoFlow is not a PCB editor. Layout, DRC, and release stay in your main EDA.</p>
      </div>
    </section>

    <section id="features"`;

if (!workflowOld.test(html)) {
  console.error("workflow block not found");
  process.exit(1);
}
html = html.replace(workflowOld, workflowNew);

html = html.replace(
  /<p class="eyebrow">Features<\/p>\s*<h2 id="features-title">What you get<\/h2>\s*<p class="lede" style="max-width:44ch;">[^<]*<\/p>/,
  `<p class="eyebrow">Capabilities</p>
        <h2 id="features-title">Product capabilities</h2>
        <p class="lede">Generate a draft schematic, review the connections, and export to KiCad.</p>`
);

html = html.replace(/ feature-card--\w+/g, "");

html = html.replace(
  /<path d="m12 3-1.9 5.8H4l4.9 3.6-1.9 5.8 4.9-3.6 4.9 3.6-1.9-5.8 4.9-3.6H14L12 3z"\/>/,
  '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>'
);

html = html.replace("Circuit generation", "Draft generation");
html = html.replace(
  "<p>Draft from a prompt, then edit against the datasheet.</p>",
  "<p>Generate a schematic draft from a prompt or spec.</p>"
);
html = html.replace(
  "<p>Ctrl-U to align regions before review.</p>",
  "<p>Align sheet regions before you sign off the schematic.</p>"
);

const compareReplacements = [
  ["AI Generation Speed", "Draft generation"],
  ["Fast iteration", "Prompt to schematic"],
  ["Burns credits", "Cloud workflow"],
  ["Ctrl-U Magic", "Ctrl-U layout"],
  ["One-click beautify", "Sheet alignment"],
  ["VS Code Style", "IDE-style UI"],
  ["Split screen, themes", "Editor layout"],
  ["90s UI", "Legacy UI"],
  ["Outdated", "Established tools"],
  ["One-Click Bundle", "Export bundle"],
  ["Ready to use", "KiCad handoff"],
  ["Broken", "Limited"],
  ["Manual fixes", "Varies by tool"],
  ['<span class="badge-free">FREE</span>', ""],
];
for (const [a, b] of compareReplacements) html = html.split(a).join(b);

html = html.replace(
  /<p class="eyebrow">Evidence<\/p>\s*<h2 id="docs-title">Documentation and proof<\/h2>\s*<p class="lede" style="max-width:54ch;">[^<]*<\/p>/,
  `<p class="eyebrow">Documentation</p>
            <h2 id="docs-title">Technical details</h2>
            <p class="lede">Walkthrough video, export screenshots, and release notes—what engineers expect before they install.</p>`
);

html = html.replace(
  '<p class="lede"><strong>Direct answers</strong> — short, engineer-to-engineer. Update any product-specific limits as you ship.</p>',
  "<p class=\"lede\">Short answers on scope, files, and what to verify after export.</p>"
);

html = html.replace(/ProtoFlow v1\.0\.0ΓÇª/g, "ProtoFlow v1.0.0…");
html = html.replace(/LCSC ┬╖ DigiKeyΓÇª/g, "LCSC · DigiKey…");
html = html.replace(/ESP32 ΓåÆ DAC/g, "ESP32 → DAC");
html = html.replace(/bundle ΓåÆ KiCad/g, "bundle → KiCad");
html = html.replace(/LCSC ┬╖ DigiKey/g, "LCSC · DigiKey");
html = html.replace(/Discord placeholder<\/a> ┬╖/g, "Discord placeholder</a> ·");
html = html.replace(/\.kicad_sch ΓÇö confirm/g, ".kicad_sch — confirm");
html = html.replace(/schematic ΓÇö confirm/g, "schematic — confirm");
html = html.replace(/beta ΓÇö set/g, "beta — set");

html = html.replace(
  "<h2 id=\"final-cta-title\">Install ProtoFlow</h2>",
  "<h2 id=\"final-cta-title\">Start with ProtoFlow</h2>"
);
html = html.replace(
  "Desktop app. Local project files.",
  "Install the desktop app and draft your first schematic."
);
html = html.replace(
  'href="#download">Download</a>\n                </div>\n                <p class="trust-line" style="margin:20px',
  'href="#download">Start building</a>\n                </div>\n                <p class="trust-line" style="margin:20px'
);

writeFileSync(path, html, "utf8");
console.log("humanize-index: done");
