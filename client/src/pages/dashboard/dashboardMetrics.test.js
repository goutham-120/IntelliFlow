import test from 'node:test';
import assert from 'node:assert/strict';

import { buildDashboardMetrics } from './dashboardMetrics.js';

test('buildDashboardMetrics counts stage completions and active tasks for the current user', () => {
  const userId = 'u1';
  const tasks = [
    {
      _id: 't1',
      assignedTo: { _id: 'u1' },
      status: 'in_progress',
      updatedAt: '2024-01-02T00:00:00.000Z',
      completedStages: [
        { completedBy: { _id: 'u1' }, stageName: 'Review' },
        { completedBy: { _id: 'u2' }, stageName: 'Approval' },
      ],
    },
    {
      _id: 't2',
      assignedTo: 'u1',
      status: 'done',
      updatedAt: '2024-01-03T00:00:00.000Z',
      completedStages: [
        { completedBy: 'u1', stageName: 'Draft' },
      ],
    },
  ];

  const metrics = buildDashboardMetrics({
    tasks,
    notifications: [{ isRead: false }, { isRead: true }],
    memberships: [{ _id: 'm1' }],
    userId,
  });

  assert.equal(metrics.myActiveTasks.length, 1);
  assert.equal(metrics.myStageEntries.length, 2);
  assert.deepEqual(
    metrics.stageBreakdown.map((entry) => entry.stageName).sort(),
    ['Draft', 'Review']
  );
  assert.equal(metrics.stageBreakdown.find((entry) => entry.stageName === 'Review').count, 1);
  assert.equal(metrics.contributedTaskCount, 2);
  assert.equal(metrics.unreadNotifications, 1);
});
