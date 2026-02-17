import { ensureEnvVar, sh } from "./github-helpers.mjs";

const bump = ensureEnvVar("BUMP");
const prevBetaTag = ensureEnvVar("BETA_VERSION"); // e.g. 2.8.0
const newVersionTag = ensureEnvVar("NEW_VERSION_TAG"); // e.g. release/2.9.0

if (bump !== "minor") {
  console.log("Not a minor release. Skipping track promotion.");
  process.exit(0);
}

console.log(`Promoting previous beta (${prevBetaTag}) to stable`);
console.log(`Promoting new release (${newVersionTag}) to beta`);

// Ensure we have all tags locally
sh("git", ["fetch", "--tags", "origin"]);

// Move stable -> previous beta
sh("git", ["tag", "-f", "stable", prevBetaTag]);
sh("git", ["push", "origin", "-f", "stable"]);

// Move beta -> new release
sh("git", ["tag", "-f", "beta", newVersionTag]);
sh("git", ["push", "origin", "-f", "beta"]);

console.log("Track promotion complete.");
