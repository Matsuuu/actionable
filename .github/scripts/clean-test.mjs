import semver from "semver";
import { sh } from "./github-helpers.mjs";

const args = process.argv;
const version = args[2];

console.log(version);

const tag = "stable";
sh("git", ["fetch", "--force", "origin", `refs/tags/${tag}:refs/tags/${tag}`]);
