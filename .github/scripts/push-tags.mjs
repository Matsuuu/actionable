import { ensureEnvVar, RELEASE_PREFIX, sh } from "./github-helpers.mjs";

const newVersion = ensureEnvVar("NEW_VERSION");

const releaseTag = `${RELEASE_PREFIX}${newVersion}`;

sh("git", ["status", "--porcelain"]);

// tag commit (HEAD)
sh("git", ["tag", "-f", releaseTag]);

// push commit and tags
sh("git", ["push", "origin", "HEAD"]);
sh("git", ["push", "origin", "-f", releaseTag]);

console.log(`Pushed tags: ${releaseTag}`);
