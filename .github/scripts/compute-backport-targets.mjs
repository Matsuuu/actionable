import {
  readPrLabels,
  resolveRcBranchForTrack,
  writeGithubOutput,
} from "./github-helpers.mjs";

function main() {
  const labels = readPrLabels();
  const targets = new Set();

  if (labels.some((l) => l === "Backport to Beta")) {
    const b = resolveRcBranchForTrack("beta");
    if (b) {
      targets.add(b);
    }
  }

  if (labels.some((l) => l === "Backport to Stable")) {
    const b = resolveRcBranchForTrack("stable");
    if (b) {
      targets.add(b);
    }
  }

  if (labels.some((l) => l === "Backport to Legacy")) {
    // TODO: Just hardcoded 1.x or find legacy tag and do like the others?
    targets.add("1.x");
  }

  const target_branches = [...targets].join(" "); // korthout/backport-action@v4 uses space-delimited branch list
  writeGithubOutput({ target_branches });

  // Handy for logs
  console.log(`target_branches=${target_branches}`);
}

main();
