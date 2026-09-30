export function classifyBranchState({ mainUnique, developmentUnique, treeEqual }) {
  if (treeEqual && mainUnique === 0 && developmentUnique === 0) {
    return {
      key: 'identical',
      headline: 'main and Development are identical (same commit and same files).',
      details:
        'No synchronization is required. Development and main point to the same history tip.',
    };
  }

  if (treeEqual) {
    return {
      key: 'content_identical_history_differs',
      headline: 'main and Development have identical file contents but different commit history.',
      details:
        'No file-level sync is required, but histories are not identical. A fast-forward or merge may still be needed to align pointers.',
    };
  }

  if (mainUnique === 0 && developmentUnique > 0) {
    return {
      key: 'development_ahead',
      headline: 'Development is ahead of main.',
      details:
        'Development contains commits not present on main. Merge Development into main after conflict checks pass.',
    };
  }

  if (developmentUnique === 0 && mainUnique > 0) {
    return {
      key: 'main_ahead',
      headline: 'main is ahead of Development.',
      details:
        'main contains commits not present on Development. Consider syncing main changes back into Development.',
    };
  }

  return {
    key: 'diverged',
    headline: 'main and Development have diverged.',
    details:
      'Both branches contain unique commits. Merge/rebase carefully and resolve conflicts before synchronization.',
  };
}
