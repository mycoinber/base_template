#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, "..");
const generatedRoot = join(projectRoot, ".fastgen");
const targetDir = join(generatedRoot, "offer-layout");

loadEnvFile(join(projectRoot, ".env"));

const layoutName = (process.env.OFFER_LAYOUT_NAME || "").trim();
const archiveUrl = (process.env.OFFER_LAYOUT_ARCHIVE_URL || "").trim();
const archivePathValue = (process.env.OFFER_LAYOUT_ARCHIVE_PATH || "").trim();
const expectedChecksum = (process.env.OFFER_LAYOUT_SHA256 || "").trim().toLowerCase();

if (!layoutName && !archiveUrl && !archivePathValue) {
  await rm(targetDir, { recursive: true, force: true });
  console.log("[offer-layout] No layout configured; using default layout.");
  process.exit(0);
}

if (!layoutName) throw new Error("[offer-layout] OFFER_LAYOUT_NAME is required.");
if (Boolean(archiveUrl) === Boolean(archivePathValue)) {
  throw new Error("[offer-layout] Set exactly one of OFFER_LAYOUT_ARCHIVE_URL or OFFER_LAYOUT_ARCHIVE_PATH.");
}
if (!/^[a-f0-9]{64}$/.test(expectedChecksum)) {
  throw new Error("[offer-layout] OFFER_LAYOUT_SHA256 must be a SHA-256 checksum.");
}

const archive = archiveUrl
  ? await downloadArchive(archiveUrl)
  : await readFile(resolveArchivePath(archivePathValue));
const actualChecksum = createHash("sha256").update(archive).digest("hex");

if (actualChecksum !== expectedChecksum) {
  throw new Error(`[offer-layout] Checksum mismatch. Expected ${expectedChecksum}, got ${actualChecksum}.`);
}

const stagingDir = join(generatedRoot, `offer-layout-${Date.now()}`);
await rm(stagingDir, { recursive: true, force: true });
await mkdir(stagingDir, { recursive: true });
const stagedArchive = join(stagingDir, "layout.tar.gz");
await writeFile(stagedArchive, archive);

await execFileAsync("tar", ["-xzf", stagedArchive, "--no-same-owner", "-C", stagingDir]);
await rm(stagedArchive, { force: true });

const manifestPath = join(stagingDir, "layout.manifest.json");
const layerConfigPath = join(stagingDir, "nuxt.config.ts");
if (!existsSync(manifestPath) || !existsSync(layerConfigPath)) {
  throw new Error("[offer-layout] Archive must contain layout.manifest.json and nuxt.config.ts at its root.");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
if (manifest.id !== layoutName || manifest.layout !== layoutName) {
  throw new Error(`[offer-layout] Archive manifest does not match OFFER_LAYOUT_NAME=${layoutName}.`);
}

await rm(targetDir, { recursive: true, force: true });
await rename(stagingDir, targetDir);
console.log(`[offer-layout] ${layoutName} extracted to ${targetDir}.`);

async function downloadArchive(url) {
  if (!/^https:\/\//i.test(url)) {
    throw new Error("[offer-layout] OFFER_LAYOUT_ARCHIVE_URL must use HTTPS.");
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`[offer-layout] Download failed: ${response.status} ${response.statusText}`);
  return Buffer.from(await response.arrayBuffer());
}

function resolveArchivePath(value) {
  const path = isAbsolute(value) ? value : resolve(projectRoot, value);
  if (!existsSync(path)) throw new Error(`[offer-layout] Archive file does not exist: ${path}`);
  return path;
}

function loadEnvFile(envPath) {
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    if (!key || key in process.env) continue;
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    process.env[key] = value;
  }
}
