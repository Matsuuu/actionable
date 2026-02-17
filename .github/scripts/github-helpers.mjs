import { execFileSync } from "node:child_process";
import fs from "node:fs";

export const RELEASE_TRACKS = [
  //
  "stable",
  "beta",
  "legacy",
];

export const RELEASE_PREFIX = "release/";

/**
 * @param {string} tag
 * */
export function stripReleasePrefixes(tag) {
  return tag.startsWith(RELEASE_PREFIX)
    ? tag.slice(RELEASE_PREFIX.length)
    : tag;
}

/**
 * @param {string} bump
 *
 * @returns { bump is import("semver").ReleaseType }
 * */
export function isReleaseType(bump) {
  return ["major", "minor", "patch"].includes(bump);
}

/**
 * @param {string} variableName
 */
export function ensureEnvVar(variableName) {
  const v = process.env[variableName];
  if (!v) {
    throw new Error(`Missing required env var: ${variableName}`);
  }
  return v;
}

/**
 * @param {string} cmd
 * @param {readonly string[]} args
 * @param {import("node:child_process").ExecFileOptionsWithStringEncoding} args
 *
 * @example sh("git", ["tag", "--points-at", commit]);
 * */
export function sh(cmd, args, opts = {}) {
  return execFileSync(cmd, args, { encoding: "utf8", ...opts }).trim();
}

/**
 * @param {string} cmd
 * @param {readonly string[]} args
 * @param {import("node:child_process").ExecFileOptionsWithStringEncoding} args
 *
 * @example trySh("git", ["tag", "--points-at", commit]);
 * */
export function trySh(cmd, args, opts = {}) {
  try {
    return { ok: true, out: sh(cmd, args, opts) };
  } catch {
    return { ok: false, out: "" };
  }
}

/**
 * Append outputs to GITHUB_OUTPUT if available.
 *
 * @param {Record<string, string>} obj
 */
export function writeGithubOutput(obj) {
  const path = process.env.GITHUB_OUTPUT;
  if (!path) return;

  const lines = Object.entries(obj)
    .map(([k, v]) => `${k}=${v ?? ""}`)
    .join("\n");

  fs.appendFileSync(path, lines + "\n", "utf8");
}

/**
 * Resolve a ref (tag/branch/SHA) to the underlying commit SHA.
 * Uses ^{} so annotated tags are peeled to the commit.
 * Returns null if ref doesn't exist.
 *
 * @param {string} ref
 */
export function getCommitForRef(ref) {
  const res = trySh("git", ["rev-parse", `${ref}^{}`]);
  return res.ok && res.out ? res.out : null;
}

/**
 * List all tags that point at the given commit SHA.
 *
 * @param {string} commit
 */
export function listTagsPointingAt(commit) {
  const res = trySh("git", ["tag", "--points-at", commit]);
  if (!res.ok || !res.out) return [];

  return res.out
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}
