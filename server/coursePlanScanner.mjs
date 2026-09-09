import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const isPdf = (fileName) => fileName.toLowerCase().endsWith(".pdf");

const walk = async (absoluteDir, files) => {
  const entries = await readdir(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(absoluteDir, entry.name);
    if (entry.isDirectory()) {
      await walk(fullPath, files);
      continue;
    }

    if (!entry.isFile() || !isPdf(entry.name)) continue;

    const metadata = await stat(fullPath);
    files.push({
      name: entry.name,
      absolutePath: fullPath,
      size: metadata.size,
      mtimeMs: metadata.mtimeMs,
    });
  }
};

export const scanCoursePlanDirectory = async (cwd = process.cwd()) => {
  const configuredDir = process.env.COURSE_PLANS_DIR || "docs/plans-de-cours";
  const baseDir = path.resolve(cwd, configuredDir);
  const files = [];
  const errors = [];

  try {
    await walk(baseDir, files);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "UNKNOWN";
    if (code !== "ENOENT") {
      errors.push(`scan_failed:${String(code)}`);
    }
  }

  const normalizedFiles = files
    .map((file) => ({
      name: file.name,
      relativePath: path.relative(cwd, file.absolutePath).split(path.sep).join("/"),
      size: file.size,
      mtimeMs: file.mtimeMs,
    }))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));

  return {
    ok: true,
    baseDir: baseDir.split(path.sep).join("/"),
    count: normalizedFiles.length,
    files: normalizedFiles,
    errors,
  };
};

