import fs from "node:fs";
import path from "node:path";

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

const newVersion = process.env.NEW_VERSION;
if (!newVersion) {
  throw new Error("NEW_VERSION env var is required");
}

// Root
const rootPkgPath = path.resolve("package.json");
const rootPkg = readJson(rootPkgPath);
rootPkg.version = newVersion;
writeJson(rootPkgPath, rootPkg);

console.log(`Bumped versions to ${newVersion}`);
