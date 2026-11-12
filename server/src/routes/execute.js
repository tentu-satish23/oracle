import express from 'express';
import { executeJavaCode } from '../services/javaRunner.js';
import { ALL_PROBLEMS } from '../data/problemsData.js';
import { store } from '../services/store.js';

const router = express.Router();

// Run Code (Visible + Custom test cases or Check All)
router.post('/run', async (req, res) => {
  try {
    const { code, problemSlug, problemId, customTestCases, checkAll } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Java code cannot be empty' });
    }

    const lookup = (problemSlug || problemId || '').toString().trim();
    const problem = ALL_PROBLEMS.find(p => (
      lookup && (
        p.slug === lookup ||
        String(p.id) === lookup ||
        p.slug.toLowerCase() === lookup.toLowerCase() ||
        p.slug.replace(/-\d+$/, '') === lookup.toLowerCase().replace(/-\d+$/, '')
      )
    ));
    let casesToRun = [];

    if (customTestCases && Array.isArray(customTestCases) && customTestCases.length > 0 && !checkAll) {
      casesToRun = customTestCases;
    } else if (problem && problem.testCases) {
      // When checkAll is true (or when evaluating before submit), test against ALL test cases (visible + hidden)
      casesToRun = checkAll ? problem.testCases : problem.testCases.filter(tc => !tc.isHidden);
    } else {
      casesToRun = [{ input: '', expectedOutput: '' }];
    }

    const executionResult = await executeJavaCode(code, casesToRun, problem?.slug || (typeof lookup === 'string' ? lookup : ''));
    res.json(executionResult);
  } catch (err) {
    console.error('Run code error:', err);
    res.status(500).json({
      status: 'Runtime Error',
      runtime: 0,
      memory: 0,
      passedTests: 0,
      totalTests: 0,
      errorMessage: err.message
    });
  }
});

// Submit Code (All test cases including hidden, stores to DB)
router.post('/submit', async (req, res) => {
  try {
    const { code, problemSlug, problemId, userId = 'usr_oracle_demo_01' } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code cannot be empty' });
    }

    const lookup = (problemSlug || problemId || '').toString().trim();
    const problem = ALL_PROBLEMS.find(p => (
      lookup && (
        p.slug === lookup ||
        String(p.id) === lookup ||
        p.slug.toLowerCase() === lookup.toLowerCase() ||
        p.slug.replace(/-\d+$/, '') === lookup.toLowerCase().replace(/-\d+$/, '')
      )
    ));
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Run against ALL test cases (visible + hidden)
    const testCases = problem.testCases && problem.testCases.length > 0
      ? problem.testCases
      : [
          { input: '[2,7,11,15];9', expectedOutput: '[0,1]', isHidden: false },
          { input: '[1,5,8,12,19];20', expectedOutput: '[0,4]', isHidden: true }
        ];

    const result = await executeJavaCode(code, testCases, problem.slug);

    // Save submission to store
    const submissionRecord = store.addSubmission({
      userId,
      problemId: problem.id,
      problemTitle: problem.title,
      problemDifficulty: problem.difficulty,
      language: 'Java',
      code,
      status: result.status,
      runtime: result.runtime,
      memory: result.memory,
      passedTests: result.passedTests,
      totalTests: result.totalTests,
      errorMessage: result.errorMessage
    });

    res.json({
      ...result,
      submissionId: submissionRecord.id,
      submittedAt: submissionRecord.submittedAt
    });
  } catch (err) {
    console.error('Submit code error:', err);
    res.status(500).json({
      status: 'Runtime Error',
      runtime: 0,
      memory: 0,
      passedTests: 0,
      totalTests: 0,
      errorMessage: err.message
    });
  }
});

export default router;
