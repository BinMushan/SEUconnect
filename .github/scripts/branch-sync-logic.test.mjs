import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyBranchState } from './branch-sync-logic.mjs';

test('returns identical when both branches share commit and tree', () => {
  const state = classifyBranchState({
    mainUnique: 0,
    developmentUnique: 0,
    treeEqual: true,
  });

  assert.equal(state.key, 'identical');
});

test('returns development_ahead when Development has unique commits', () => {
  const state = classifyBranchState({
    mainUnique: 0,
    developmentUnique: 3,
    treeEqual: false,
  });

  assert.equal(state.key, 'development_ahead');
});

test('returns main_ahead when main has unique commits', () => {
  const state = classifyBranchState({
    mainUnique: 2,
    developmentUnique: 0,
    treeEqual: false,
  });

  assert.equal(state.key, 'main_ahead');
});

test('returns diverged when both branches have unique commits', () => {
  const state = classifyBranchState({
    mainUnique: 2,
    developmentUnique: 1,
    treeEqual: false,
  });

  assert.equal(state.key, 'diverged');
});

test('returns content_identical_history_differs for same tree, different history', () => {
  const state = classifyBranchState({
    mainUnique: 1,
    developmentUnique: 1,
    treeEqual: true,
  });

  assert.equal(state.key, 'content_identical_history_differs');
});
