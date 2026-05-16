import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const features = fs.readFileSync(path.join(root, "scripts", "features-section.html"), "utf8").trim();

let index = fs.readFileSync(path.join(root, "index.html"), "utf8");
index = index.replace(
  /<section id="features"[\s\S]*?<\/section>\s*\n\s*<section id="compare"/,
  features + "\n\n    <section id=\"compare\""
);
fs.writeFileSync(path.join(root, "index.html"), index);

let featuresPage = fs.readFileSync(path.join(root, "features.html"), "utf8");
featuresPage = featuresPage.replace(
  /<section[^>]*id="features"[\s\S]*?<\/section>/,
  features.replace(/^    /gm, "          ")
);
fs.writeFileSync(path.join(root, "features.html"), featuresPage);
console.log("patched features");
