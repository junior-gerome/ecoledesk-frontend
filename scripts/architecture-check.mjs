import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const appRoot = path.join(frontendRoot, "src", "app");
const featuresRoot = path.join(appRoot, "features");

const violations = [];

function walk(dir) {
  if (!existsSync(dir)) {
    return [];
  }

  return readdirSync(dir).flatMap((entry) => {
    const fullPath = path.join(dir, entry);
    return statSync(fullPath).isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function relativePath(filePath) {
  return path.relative(frontendRoot, filePath).replaceAll(path.sep, "/");
}

function addViolation(filePath, lineNumber, message) {
  violations.push(`${relativePath(filePath)}:${lineNumber} ${message}`);
}

const sourceFiles = walk(appRoot).filter(
  (file) => file.endsWith(".ts") && !file.endsWith(".spec.ts"),
);

for (const file of sourceFiles) {
  const content = readFileSync(file, "utf8");
  const lines = content.split(/\r?\n/);
  const normalized = relativePath(file);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;

    if (normalized.includes("/features/") && normalized.includes("/presentation/")) {
      if (
        line.includes("@angular/common/http") ||
        /\bHttpClient\b/.test(line) ||
        /environment\.(apiUrl|attendanceApiUrl|billingApiUrl)/.test(line)
      ) {
        addViolation(
          file,
          lineNumber,
          "presentation must not depend on HTTP clients or API URLs; use application/infrastructure.",
        );
      }
    }

    if (line.includes("shared/domaines") || line.includes("@shared/domaines")) {
      addViolation(
        file,
        lineNumber,
        "use shared/domains instead of the legacy shared/domaines path.",
      );
    }

    if (normalized.includes("/domain/") && /\bHttpClient\b/.test(line)) {
      addViolation(
        file,
        lineNumber,
        "domain layer must not use HttpClient; define a repository port instead.",
      );
    }

    if (
      normalized.includes("/application/") &&
      (line.includes("@angular/common/http") || /\bHttpClient\b/.test(line))
    ) {
      addViolation(
        file,
        lineNumber,
        "application layer must not call HttpClient directly; use infrastructure adapters.",
      );
    }

    if (/\bany\b/.test(line) && !line.includes("eslint-disable")) {
      addViolation(
        file,
        lineNumber,
        "avoid `any`; model the boundary with an explicit type or `unknown`.",
      );
    }
  });
}

if (violations.length > 0) {
  console.error("Architecture boundary check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log("Architecture boundary check passed.");
