import { ensureEnvVar, RELEASE_PREFIX, sh } from "./github-helpers.mjs";

const newVersion = ensureEnvVar("NEW_VERSION");
const track = ensureEnvVar("TRACK");

const releaseTag = `${RELEASE_PREFIX}${newVersion}`;
const trackTag = track;

sh("git", ["status", "--porcelain"]);

// tag commit (HEAD)
sh("git", ["tag", "-f", releaseTag]);
sh("git", ["tag", "-f", trackTag]);

// push commit and tags
sh("git", ["push", "origin", "HEAD"]);
sh("git", ["push", "origin", "-f", releaseTag, trackTag]);

console.log(`Pushed tags: ${releaseTag}, ${trackTag}`);
