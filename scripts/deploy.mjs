import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    if (options.capture && result.stderr) console.error(result.stderr.trim());
    process.exit(result.status ?? 1);
  }

  return options.capture ? result.stdout.trim() : "";
}

const branch = run("git", ["branch", "--show-current"], { capture: true });
if (branch !== "main") {
  console.error(`Deployment is only allowed from main; current branch is ${branch || "detached HEAD"}.`);
  process.exit(1);
}

const changes = run("git", ["status", "--porcelain", "--untracked-files=all"], { capture: true });
if (changes) {
  console.error("Deployment stopped because the working tree has uncommitted files. Commit them first so GitHub and production stay identical.");
  console.error(changes);
  process.exit(1);
}

console.log("Syncing the committed release to GitHub...");
run("git", ["push", "origin", "main"]);

console.log("GitHub is current. Deploying the same release to production...");
run(process.execPath, [resolve("node_modules/vinext/dist/cli.js"), "deploy"]);
