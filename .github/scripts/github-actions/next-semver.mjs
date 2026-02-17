import semver from "semver";
import { writeGithubOutput } from "./github-helpers.mjs";

/**
 * @param {string} raw
 */
function normalize(raw) {
  let v = String(raw ?? "").trim();
  v = v.replace(/^release\//, "");
  return v;
}

/**
 * @param {string} bump
 *
 * @returns { bump is import("semver").ReleaseType }
 * */
function isReleaseType(bump) {
  return ["major", "minor", "patch"].includes(bump);
}

function main() {
  const rawVersion = process.env.VERSION;
  const bump = process.env.BUMP;

  if (!rawVersion) throw new Error("Missing VERSION env var.");
  if (!bump) throw new Error("Missing BUMP env var.");

  const version = normalize(rawVersion);

  if (!semver.valid(version)) {
    throw new Error(
      `Input version must be a valid semver like X.Y.Z (optionally prefixed by release/, refs/tags/, or v). Got: ${rawVersion}`,
    );
  }

  if (!isReleaseType(bump)) {
    throw new Error(`BUMP must be one of: major, minor, patch. Got: ${bump}`);
  }

  const nextVersion = semver.inc(version, bump);
  if (!nextVersion) {
    throw new Error(`Failed to bump version "${version}" with bump "${bump}".`);
  }

  const nextTag = `release/${nextVersion}`;

  writeGithubOutput({
    next_version: nextVersion,
    next_tag: nextTag,
  });

  console.log(`Input: ${rawVersion} (normalized: ${version})`);
  console.log(`Bump:  ${bump}`);
  console.log(`Next:  ${nextVersion}`);
  console.log(`Tag:   ${nextTag}`);
}

try {
  main();
} catch (err) {
  console.error(String(err?.message ?? err));
  process.exit(1);
}
