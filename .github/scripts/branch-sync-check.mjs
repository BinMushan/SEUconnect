import { appendFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { classifyBranchState } from './branch-sync-logic.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {
    main: 'main',
    development: 'Development',
  };

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--main' && args[i + 1]) {
      parsed.main = args[i + 1];
      i += 1;
    } else if (args[i] === '--development' && args[i + 1]) {
      parsed.development = args[i + 1];
      i += 1;
    }
  }

  return parsed;
}

function runGit(command, allowFailure = false) {
  try {
    return {
      ok: true,
      output: execSync(command, { encoding: 'utf8' }).trim(),
    };
  } catch (error) {
    if (!allowFailure) {
      throw error;
    }

    return {
      ok: false,
      output: error.stdout?.toString().trim() || error.message,
    };
  }
}

function writeOutput(key, value) {
  if (!process.env.GITHUB_OUTPUT) {
    return;
  }

  appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function appendSummary(lines) {
  if (!process.env.GITHUB_STEP_SUMMARY) {
    return;
  }

  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${lines.join('\n')}\n`);
}

const { main, development } = parseArgs();
const mainRef = `refs/remotes/origin/${main}`;
const developmentRef = `refs/remotes/origin/${development}`;

console.log(`Comparing ${developmentRef} against ${mainRef}...`);
runGit(
  `git fetch --no-tags --prune origin +refs/heads/${main}:${mainRef} +refs/heads/${development}:${developmentRef}`
);

const counts = runGit(`git rev-list --left-right --count ${mainRef}...${developmentRef}`).output;
const [mainUniqueText, developmentUniqueText] = counts.split(/\s+/);
const mainUnique = Number.parseInt(mainUniqueText, 10);
const developmentUnique = Number.parseInt(developmentUniqueText, 10);

const treeEqualResult = runGit(`git diff --quiet ${mainRef} ${developmentRef}`, true);
const treeEqual = treeEqualResult.ok;

const conflictProbe = runGit(`git merge-tree --write-tree ${mainRef} ${developmentRef}`, true);
const hasConflicts = !conflictProbe.ok;

const state = classifyBranchState({
  mainUnique,
  developmentUnique,
  treeEqual,
});

const mergeStatus = hasConflicts
  ? 'Conflicts detected. Development cannot be cleanly merged into main.'
  : 'No conflicts detected. Development can be cleanly merged into main.';

console.log(`State: ${state.key}`);
console.log(`Unique commits -> main: ${mainUnique}, Development: ${developmentUnique}`);
console.log(`File contents identical: ${treeEqual}`);
console.log(mergeStatus);

writeOutput('state', state.key);
writeOutput('main_unique', String(mainUnique));
writeOutput('development_unique', String(developmentUnique));
writeOutput('tree_equal', String(treeEqual));
writeOutput('has_conflicts', String(hasConflicts));
writeOutput('can_merge_cleanly', String(!hasConflicts));
writeOutput('state_headline', state.headline);
writeOutput('state_details', state.details);

appendSummary([
  '## Branch synchronization report',
  '',
  `- **Authoritative branch:** \`${main}\``,
  `- **Compared branch:** \`${development}\``,
  `- **Branch state:** \`${state.key}\``,
  `- **main-only commits:** ${mainUnique}`,
  `- **Development-only commits:** ${developmentUnique}`,
  `- **File contents identical:** ${treeEqual ? 'yes' : 'no'}`,
  `- **Clean merge Development → main:** ${hasConflicts ? 'no' : 'yes'}`,
  '',
  `**Interpretation:** ${state.headline}`,
  '',
  `${state.details}`,
  '',
  hasConflicts
    ? '⚠️ Resolve merge conflicts before merging `Development` into `main`.'
    : '✅ No merge conflicts detected for `Development` into `main`.',
]);
