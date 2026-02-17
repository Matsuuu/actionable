import { Octokit } from "@octokit/rest";
import { ensureEnvVar, RELEASE_PREFIX } from "./github-helpers.mjs";

const token = ensureEnvVar("GITHUB_TOKEN"); // use secrets.GITHUB_TOKEN
const repositoryName = ensureEnvVar("GITHUB_REPOSITORY"); // provided by Actions
const versionTag = ensureEnvVar("VERSION_TAG"); // e.g. "release/2.9.0" OR "2.9.0" depending on your tags
const versionBody = ensureEnvVar("VERSION_BODY");

const versionName = `${RELEASE_PREFIX}${versionTag}`;

const stableTag = "stable";
const betaTag = "beta";

const [owner, repo] = repositoryName.split("/");
const octokit = new Octokit({ auth: token });

async function getReleaseByTag(tag) {
  try {
    const res = await octokit.repos.getReleaseByTag({ owner, repo, tag });
    return res.data;
  } catch (err) {
    if (err?.status === 404) return null;
    throw err;
  }
}

async function deleteReleaseByTag(tag) {
  const release = await getReleaseByTag(tag);
  if (!release) {
    console.log(`No existing release for tag "${tag}" (nothing to delete)`);
    return false;
  }
  await octokit.repos.deleteRelease({ owner, repo, release_id: release.id });
  console.log(`Deleted release for tag "${tag}" (id=${release.id})`);
  return true;
}

async function createOrUpdateRelease({
  tag_name,
  name,
  body,
  draft,
  prerelease,
  make_latest,
}) {
  const existing = await getReleaseByTag(tag_name);

  if (existing) {
    await octokit.repos.updateRelease({
      owner,
      repo,
      release_id: existing.id,
      tag_name,
      name,
      body,
      draft,
      prerelease,
      make_latest,
    });
    console.log(`Updated release for tag "${tag_name}" (id=${existing.id})`);
    return;
  }

  await octokit.repos.createRelease({
    owner,
    repo,
    tag_name,
    name,
    body,
    draft,
    prerelease,
    make_latest,
  });
  console.log(`Created release for tag "${tag_name}"`);
}

(async () => {
  const newReleaseData = {
    tag_name: versionTag,
    name: versionName,
    body: versionBody,
    draft: false,
    prerelease: true,
    make_latest: false,
  };

  // 1) Create/Update release for the released version tag
  console.log(`Ensuring version release exists for tag "${versionTag}"...`);
  await createOrUpdateRelease({ ...newReleaseData });

  // 2) Capture current beta release metadata to clone into stable (must happen BEFORE deletion)
  console.log(
    `Fetching current beta release metadata from tag "${betaTag}"...`,
  );
  const currentBetaRelease = await getReleaseByTag(betaTag);

  if (!currentBetaRelease) {
    console.warn(
      `No existing beta release found for tag "${betaTag}. \nCannot clone beta -> stable.`,
    );
  }

  // 3) Delete current beta & stable releases
  console.log(
    `Deleting existing "${betaTag}" and "${stableTag}" releases (if any)...`,
  );
  await deleteReleaseByTag(betaTag);
  await deleteReleaseByTag(stableTag);

  // 4) Create stable release (clone beta metadata), mark as latest
  console.log(
    `Creating "${stableTag}" release cloned from beta, marked as latest...`,
  );
  await createOrUpdateRelease({
    tag_name: stableTag,
    name: stableTag,
    body: currentBetaRelease.body,
    draft: false,
    prerelease: false,
    make_latest: true,
  });

  // 5) Create beta release for beta tag, mark as prerelease
  console.log(`Creating "${betaTag}" prerelease...`);
  await createOrUpdateRelease({
    tag_name: betaTag,
    name: betaTag,
    body: newReleaseData.body,
    draft: newReleaseData.draft,
    prerelease: newReleaseData.prerelease,
    make_latest: newReleaseData.make_latest,
  });

  console.log("Done.");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
