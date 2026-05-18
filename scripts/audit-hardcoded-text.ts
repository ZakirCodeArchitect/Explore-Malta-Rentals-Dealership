/**
 * Heuristic scan for hardcoded visible English in TSX/JSX files.
 * Run: npm run audit:hardcoded-text
 *
 * Exit 0 always — findings are warnings in reports.
 */
import * as fs from "node:fs";
import * as path from "node:path";
import { ROOT, writeReportJson, writeReportMarkdown } from "./i18n-shared";

type Finding = {
  file: string;
  line: number;
  text: string;
  context: string;
  suggestedAction: string;
};

const SCAN_DIRS = ["src/app", "src/components", "src/features"] as const;
const EXTENSIONS = new Set([".tsx", ".jsx"]);
const SKIP_PATH_RE =
  /(?:\.test\.|\.spec\.|__tests__|node_modules|\.next|generated\/prisma|\/api\/)/i;

const IGNORE_FILE_RE = /next-intl-with-reporting\.tsx$/;

type IgnoreConfig = {
  ignoreFilePatterns: string[];
  ignoreTextPatterns: string[];
};

function loadIgnoreConfig(): IgnoreConfig {
  const file = path.join(__dirname, "hardcoded-ignore-paths.json");
  return JSON.parse(fs.readFileSync(file, "utf8")) as IgnoreConfig;
}

const ignoreConfig = loadIgnoreConfig();
const ignoreFileRes = ignoreConfig.ignoreFilePatterns.map((p) => new RegExp(p, "i"));
const ignoreTextRes = ignoreConfig.ignoreTextPatterns.map((p) => new RegExp(p, "i"));

/** Minimum length for flagged English-like strings */
const MIN_LEN = 3;

const SUGGESTED =
  "Move this text to messages/en.json and use useTranslations/getTranslations (or t() from next-intl).";

function listSourceFiles(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...listSourceFiles(full));
    } else if (EXTENSIONS.has(path.extname(entry.name)) && !SKIP_PATH_RE.test(full)) {
      out.push(full);
    }
  }
  return out;
}

function stripCommentsAndStringsForImports(line: string): string {
  return line.replace(/^import\s.+$/, "").replace(/^export\s+type\s.+$/, "");
}

function looksLikeEnglish(text: string): boolean {
  const t = text.trim();
  if (t.length < MIN_LEN) return false;
  if (!/[a-zA-Z]/.test(t)) return false;
  if (/^[\d\s.,:;%+\-#/()[\]{}]+$/.test(t)) return false;
  if (/^(true|false|null|undefined|void|string|number|boolean|any|unknown)$/.test(t)) return false;
  if (/^[@./\\]/.test(t)) return false;
  if (/^https?:\/\//i.test(t)) return false;
  if (/^[a-z]+-[a-z0-9-]+$/i.test(t) && !/\s/.test(t)) return false;
  if (/^(sm|md|lg|xl|2xl|flex|grid|hidden|block|px-|py-|text-|bg-|border-)/.test(t)) return false;
  if (/^[A-Z_][A-Z0-9_]*$/.test(t)) return false;
  if (/^(use[A-Z]|get[A-Z]|set[A-Z])/.test(t)) return false;
  if (/^t\s*\(/.test(t)) return false;
  if (/console\.(log|warn|error|debug)/.test(t)) return false;
  const words = t.split(/\s+/).filter(Boolean);
  const latinWords = words.filter((w) => /[a-zA-Z]{2,}/.test(w));
  return latinWords.length >= 1 && /[aeiou]/i.test(t);
}

function shouldIgnoreFile(rel: string): boolean {
  if (IGNORE_FILE_RE.test(rel)) return true;
  return ignoreFileRes.some((re) => re.test(rel));
}

function shouldIgnoreText(text: string): boolean {
  const t = text.trim();
  return ignoreTextRes.some((re) => re.test(t));
}

function scanFile(filePath: string): Finding[] {
  const rel = path.relative(ROOT, filePath).replace(/\\/g, "/");
  if (shouldIgnoreFile(rel)) return [];
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split(/\r?\n/);
  const findings: Finding[] = [];

  const patterns: Array<{ re: RegExp; group: number }> = [
    { re: />([^<{][^<]*[a-zA-Z][^<]*)</g, group: 1 },
    { re: /placeholder\s*=\s*["']([^"']+)["']/gi, group: 1 },
    { re: /aria-label\s*=\s*["']([^"']+)["']/gi, group: 1 },
    { re: /title\s*=\s*["']([^"']+)["']/gi, group: 1 },
    { re: /alt\s*=\s*["']([^"']+)["']/gi, group: 1 },
    { re: /label\s*=\s*["']([^"']+)["']/gi, group: 1 },
  ];

  lines.forEach((rawLine, idx) => {
    const lineNum = idx + 1;
    let line = stripCommentsAndStringsForImports(rawLine);
    if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) return;
    if (/className|class=|style=|import |from |type |interface |enum /.test(line) && !/>/.test(line)) {
      if (!/placeholder|aria-label|title=|alt=/.test(line)) return;
    }
    if (/useTranslations|getTranslations|t\(|FormattedMessage/.test(line)) return;

    for (const { re, group } of patterns) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(line)) !== null) {
        const text = m[group]?.trim() ?? "";
        if (!text || !looksLikeEnglish(text) || shouldIgnoreText(text)) continue;
        if (/^\{/.test(text) || /\}$/.test(text)) continue;
        if (/t\s*\(/.test(text)) continue;

        findings.push({
          file: rel,
          line: lineNum,
          text: text.slice(0, 200),
          context: rawLine.trim().slice(0, 160),
          suggestedAction: SUGGESTED,
        });
      }
    }
  });

  return findings;
}

function main(): void {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    files.push(...listSourceFiles(path.join(ROOT, dir)));
  }

  const allFindings: Finding[] = [];
  for (const file of files.sort()) {
    allFindings.push(...scanFile(file));
  }

  const byFile = new Map<string, Finding[]>();
  for (const f of allFindings) {
    const list = byFile.get(f.file) ?? [];
    list.push(f);
    byFile.set(f.file, list);
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    filesScanned: files.length,
    totalFindings: allFindings.length,
    findings: allFindings,
  };

  const jsonPath = writeReportJson("hardcoded-text-audit.json", summary);

  const mdLines = [
    "# Hardcoded text audit",
    "",
    `Generated: ${summary.generatedAt}`,
    "",
    `**Files scanned:** ${files.length}`,
    `**Findings:** ${allFindings.length} (heuristic — review before changing)`,
    "",
    "> **Warning-only.** False positives are common for technical strings and MUI labels.",
    "",
  ];

  if (allFindings.length === 0) {
    mdLines.push("_No obvious hardcoded UI strings detected._");
  } else {
    for (const [file, items] of [...byFile.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      mdLines.push(`## \`${file}\``, "");
      for (const item of items.slice(0, 30)) {
        mdLines.push(`- **L${item.line}:** \`${item.text}\``);
        mdLines.push(`  - _${item.suggestedAction}_`);
      }
      if (items.length > 30) mdLines.push(`- _… +${items.length - 30} more_`);
      mdLines.push("");
    }
  }

  const mdPath = writeReportMarkdown("hardcoded-text-audit.md", `${mdLines.join("\n")}\n`);

  console.log(`Hardcoded text audit: ${allFindings.length} finding(s) in ${files.length} file(s)`);
  console.log(`  JSON: ${jsonPath}`);
  console.log(`  MD:   ${mdPath}`);
  console.log("(Warning-only — does not fail the build.)");
}

main();
