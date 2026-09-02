#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { copyFile, mkdir, readdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(here, "..");
const generatedRoot = join(projectRoot, ".fastgen");
const targetDir = join(generatedRoot, "offer-layout");
const checksumPath = join(generatedRoot, "offer-layout.sha256");
const publicDir = join(projectRoot, "public");
const publicAssetManifestPath = join(generatedRoot, "offer-layout.public-assets.json");
const buildCacheDirs = [join(projectRoot, ".nuxt"), join(projectRoot, ".output")];

loadEnvFile(join(projectRoot, ".env"));

const layoutName = (process.env.OFFER_LAYOUT_NAME || "").trim();
const archiveUrl = (process.env.OFFER_LAYOUT_ARCHIVE_URL || "").trim();
const archivePathValue = (process.env.OFFER_LAYOUT_ARCHIVE_PATH || "").trim();
const expectedChecksum = (process.env.OFFER_LAYOUT_SHA256 || "").trim().toLowerCase();

if (!layoutName && !archiveUrl && !archivePathValue) {
  await rm(targetDir, { recursive: true, force: true });
  await rm(checksumPath, { force: true });
  await clearMirroredPublicAssets();
  await invalidateBuildCache();
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
await writeFile(checksumPath, `${actualChecksum}\n`, "utf8");
await syncLayerPublicAssets();
await invalidateBuildCache();
console.log(`[offer-layout] ${layoutName} (${actualChecksum.slice(0, 12)}) extracted to ${targetDir}; Nuxt build cache cleared.`);

async function invalidateBuildCache() {
  await Promise.all(buildCacheDirs.map((directory) => rm(directory, { recursive: true, force: true })));
}

// Nuxt layers contribute code and configuration, but do not automatically
// expose their public/ directory. Mirror only files owned by the mounted
// layout into the app's public tree so /offer-v1/media/... works in both
// local previews and production builds. The manifest prevents us from
// deleting application-owned files when a layout is changed or removed.
async function syncLayerPublicAssets() {
  await clearMirroredPublicAssets();
  const layerPublicDir = join(targetDir, "public");
  if (!existsSync(layerPublicDir)) return;

  const files = await listFiles(layerPublicDir);
  for (const relativePath of files) {
    const source = join(layerPublicDir, ...relativePath.split("/"));
    const destination = publicAssetPath(relativePath);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
  await writeFile(publicAssetManifestPath, `${JSON.stringify({ version: 1, files })}\n`, "utf8");
}

async function clearMirroredPublicAssets() {
  if (!existsSync(publicAssetManifestPath)) return;
  let files = [];
  try {
    const manifest = JSON.parse(await readFile(publicAssetManifestPath, "utf8"));
    files = Array.isArray(manifest.files) ? manifest.files : [];
  } catch {
    // A malformed local receipt must never make us delete arbitrary files.
  }
  await Promise.all(files.filter((file) => typeof file === "string" && isSafePublicRelativePath(file)).map((file) => rm(publicAssetPath(file), { force: true })));
  await rm(publicAssetManifestPath, { force: true });
}

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(join(directory, entry.name), relativePath));
    else if (entry.isFile()) files.push(relativePath);
  }
  return files.sort();
}

function publicAssetPath(relativePath) {
  if (!isSafePublicRelativePath(relativePath)) throw new Error(`[offer-layout] Unsafe public asset path: ${relativePath}`);
  return join(publicDir, ...relativePath.split("/"));
}

function isSafePublicRelativePath(value) {
  return Boolean(value) && !value.startsWith("/") && value.split("/").every((part) => part && part !== "." && part !== "..");
}

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
