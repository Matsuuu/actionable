import fs from "node:fs";
import path from "node:path";
import { ensureEnvVar } from "./github-helpers.mjs";

/**
 * @param {fs.PathOrFileDescriptor} p
 */
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
/**
 * @param {fs.PathOrFileDescriptor} p
 * @param {any} obj
 */
function writeJson(p, obj) {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n");
}

const newVersion = ensureEnvVar("NEW_VERSION");

// Root
const rootPkgPath = path.resolve("package.json");
const rootPkg = readJson(rootPkgPath);
rootPkg.version = newVersion;
writeJson(rootPkgPath, rootPkg);

console.log(`Bumped versions to ${newVersion}`);
