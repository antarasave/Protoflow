/**
 * Creates .git + initial commit using only Node (no git.exe, no npm deps).
 * Run: node scripts/create-git-repo-native.mjs
 *    or: npm run git:init   (if you have npm on PATH)
 */
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const gitDir = path.join(root, ".git");

/** Paths use forward slashes (Git convention). */
const FILES = [
  ".gitignore",
  "index.html",
  "serve-local.js",
  "_snippet.txt",
  "package.json",
  "scripts/create-git-repo-native.mjs",
];

function writeObject(type, body) {
  const header = Buffer.from(`${type} ${body.length}\0`, "utf8");
  const store = Buffer.concat([header, body]);
  const hash = createHash("sha1").update(store).digest("hex");
  const objDir = path.join(gitDir, "objects", hash.slice(0, 2));
  fs.mkdirSync(objDir, { recursive: true });
  fs.writeFileSync(path.join(objDir, hash.slice(2)), deflateSync(store));
  return hash;
}

function writeBlob(absPath) {
  return writeObject("blob", fs.readFileSync(absPath));
}

/** entries: { name, hash, mode } — hash is 40-char hex, mode 100644 | 40000 */
function writeTree(entries) {
  const sorted = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  const parts = [];
  for (const e of sorted) {
    parts.push(Buffer.from(`${e.mode} ${e.name}\0`, "utf8"));
    parts.push(Buffer.from(e.hash, "hex"));
  }
  return writeObject("tree", Buffer.concat(parts));
}

function writeCommit(treeHash, message, author) {
  const ts = Math.floor(Date.now() / 1000);
  const body =
    `tree ${treeHash}\n` +
    `author ${author.name} <${author.email}> ${ts} +0000\n` +
    `committer ${author.name} <${author.email}> ${ts} +0000\n` +
    `\n` +
    `${message}\n`;
  return writeObject("commit", Buffer.from(body, "utf8"));
}

function buildRootTree() {
  const rootEntries = [];
  for (const rel of FILES) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) {
      console.warn(`Skip missing: ${rel}`);
      continue;
    }
    const d = path.posix.dirname(rel);
    if (d === ".") {
      const blob = writeBlob(abs);
      rootEntries.push({ name: path.posix.basename(rel), hash: blob, mode: "100644" });
    }
  }

  const scriptFiles = FILES.filter((f) => f.startsWith("scripts/") && fs.existsSync(path.join(root, f)));
  if (scriptFiles.length) {
    const scriptEntries = [];
    for (const rel of scriptFiles) {
      const blob = writeBlob(path.join(root, rel));
      scriptEntries.push({ name: path.posix.basename(rel), hash: blob, mode: "100644" });
    }
    const scriptsTree = writeTree(scriptEntries);
    rootEntries.push({ name: "scripts", hash: scriptsTree, mode: "40000" });
  }

  return writeTree(rootEntries);
}

if (fs.existsSync(gitDir)) {
  console.error("Already a Git repo (.git exists). Remove .git first for a fresh repo.");
  process.exit(1);
}

fs.mkdirSync(path.join(gitDir, "objects"), { recursive: true });
fs.mkdirSync(path.join(gitDir, "refs", "heads"), { recursive: true });
fs.mkdirSync(path.join(gitDir, "info"), { recursive: true });
fs.mkdirSync(path.join(gitDir, "hooks"), { recursive: true });

fs.writeFileSync(path.join(gitDir, "HEAD"), "ref: refs/heads/main\n");
fs.writeFileSync(
  path.join(gitDir, "config"),
  `[core]
\trepositoryformatversion = 0
\tfilemode = false
\tbare = false
\tlogallrefupdates = true
`
);
fs.writeFileSync(path.join(gitDir, "description"), "Unnamed repository; edit this file 'description' to name the repo.\n");
fs.writeFileSync(path.join(gitDir, "info", "exclude"), `# git info exclude\n*.log\n`);

const tree = buildRootTree();
const commit = writeCommit(tree, "Initial commit: ProtoFlow landing page", {
  name: process.env.GIT_AUTHOR_NAME || "ProtoFlow",
  email: process.env.GIT_AUTHOR_EMAIL || "dev@localhost",
});

fs.writeFileSync(path.join(gitDir, "refs", "heads", "main"), commit + "\n");

console.log(`Created .git on branch main, commit ${commit}`);
console.log("With MiniGit / Git on PATH:");
console.log('  git remote add origin https://github.com/antarasave/Protoflow.git');
console.log("  git push -u origin main");
