import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { Trophy, Clock, Play, Award, CheckCircle2, AlertCircle, ChevronRight, Send, ArrowLeft, Shield, Users, Terminal, ChevronDown, ChevronUp, Copy, Check, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../../services/api';
import { Contest, ContestProblem } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ContestsPageProps {
  initialContestSlug?: string | null;
  onBackToDashboard: () => void;
}

export const ContestsPage: React.FC<ContestsPageProps> = ({
  initialContestSlug,
  onBackToDashboard
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [contests, setContests] = useState<Contest[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(45 * 60); // 45 minutes countdown in seconds
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [running, setRunning] = useState(false);
  const [checkingAll, setCheckingAll] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);
  const [bottomTab, setBottomTab] = useState<'testcases' | 'result'>('testcases');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [isConsoleOpen, setIsConsoleOpen] = useState(true);
  const [submissionFeedback, setSubmissionFeedback] = useState<any>(null);

  useEffect(() => {
    async function loadContests() {
      try {
        setLoading(true);
        const data = await api.getContests();
        setContests(data.contests || []);

        if (initialContestSlug) {
          const matched = (data.contests || []).find((c: Contest) => c.slug === initialContestSlug);
          if (matched) {
            handleOpenContest(matched.slug);
          }
        }
      } catch (err) {
        console.error('Failed to load contests:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContests();
  }, [initialContestSlug]);

  const handleOpenContest = async (slug: string) => {
    try {
      setLoading(true);
      const contestData = await api.getContest(slug);
      setSelectedContest(contestData);
      setIsWorkspaceOpen(true);
      setTimeLeft(contestData.durationMinutes * 60);
      if (contestData.problems && contestData.problems.length > 0) {
        setActiveQuestionIdx(0);
        setCode(contestData.problems[0].starterCode || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Timer countdown hook
  useEffect(() => {
    if (!isWorkspaceOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkspaceOpen, timeLeft]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectQuestion = (idx: number) => {
    if (!selectedContest?.problems) return;
    setActiveQuestionIdx(idx);
    setCode(selectedContest.problems[idx].starterCode || '');
    setSubmissionFeedback(null);
    setRunResult(null);
    setBottomTab('testcases');
    setSelectedCaseIdx(0);
  };

  const handleRunCode = async () => {
    if (!selectedContest?.problems) return;
    const currentQ = selectedContest.problems[activeQuestionIdx];
    try {
      setRunning(true);
      setBottomTab('result');
      const res = await api.runContestCode(selectedContest.slug, {
        problemId: currentQ.problemId,
        code,
        customTestCases: currentQ.testCases || []
      });
      setRunResult(res);
    } catch (err: any) {
      setRunResult({ status: 'Runtime Error', errorMessage: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleCheckAllContestCode = async () => {
    if (!selectedContest?.problems) return;
    const currentQ = selectedContest.problems[activeQuestionIdx];
    try {
      setCheckingAll(true);
      setBottomTab('result');
      const res = await api.runContestCode(selectedContest.slug, {
        problemId: currentQ.problemId,
        code,
        checkAll: true
      });
      setRunResult(res);
    } catch (err: any) {
      setRunResult({ status: 'Runtime Error', errorMessage: err.message });
    } finally {
      setCheckingAll(false);
    }
  };

  const handleContestSubmit = async () => {
    if (!selectedContest?.problems) return;
    const currentQ = selectedContest.problems[activeQuestionIdx];
    try {
      setSubmitting(true);
      setBottomTab('result');
      const res = await api.submitContest(selectedContest.slug, {
        problemId: currentQ.problemId,
        code
      });
      setSubmissionFeedback(res);
      setRunResult(res);

      if (res.status === 'Accepted') {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F89820', '#22C55E', '#3B82F6', '#FFD700']
        });
      }
    } catch (err: any) {
      setSubmissionFeedback({ status: 'Error', error: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // 1. CONTEST WORKSPACE VIEW (When participating in a live contest)
  if (isWorkspaceOpen && selectedContest) {
    const currentQuestion = selectedContest.problems[activeQuestionIdx] || selectedContest.problems[0];
    const testCases = currentQuestion.testCases || [];

    return (
      <div className={`flex flex-col h-[calc(100vh-3.5rem)] ${isDark ? 'bg-[#0B1120]' : 'bg-[#F5F7FA]'}`}>

        {/* ── TOP BAR ─────────────────────────────────────────────────── */}
        <div className={`h-12 border-b px-4 flex items-center justify-between z-20 shrink-0 ${
          isDark ? 'bg-[#151F32] border-white/5' : 'bg-white border-[#E2E8F0] shadow-sm'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsWorkspaceOpen(false)}
              className={`flex items-center space-x-1 text-xs font-mono transition ${
                isDark ? 'text-gray-400 hover:text-white' : 'text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Leave Arena</span>
            </button>
            <span className={isDark ? 'text-gray-600' : 'text-[#CBD5E1]'}>|</span>
            <span className={`text-xs font-mono font-bold truncate max-w-xs sm:max-w-md ${
              isDark ? 'text-white' : 'text-[#172033]'
            }`}>
              {selectedContest.title}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Live Countdown Clock */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/30 text-[#DC2626] font-mono text-xs font-bold">
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunCode}
              disabled={running || checkingAll || submitting || timeLeft <= 0}
              className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium border transition flex items-center space-x-1.5 disabled:opacity-50 ${
                isDark
                  ? 'bg-[#1B263B] hover:bg-white/10 text-white border-white/10'
                  : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] border-[#CBD5E1]'
              }`}
              title="Run code against visible sample test cases"
            >
              {running ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 text-[#16A34A] fill-[#16A34A]" />
              )}
              <span>Run</span>
            </button>

            {/* Check All Cases (Includes Hidden Tests) */}
            <button
              onClick={handleCheckAllContestCode}
              disabled={running || checkingAll || submitting || timeLeft <= 0}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium border transition flex items-center space-x-1.5 disabled:opacity-50 ${
                isDark
                  ? 'bg-[#112240] hover:bg-[#1B3A57] text-[#38BDF8] border-[#38BDF8]/30'
                  : 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]'
              }`}
              title="Check against all sample and hidden test cases before submitting"
            >
              {checkingAll ? (
                <div className="w-3.5 h-3.5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
              )}
              <span>Check All Cases</span>
            </button>

            {/* Submit Button */}
            <button
              onClick={handleContestSubmit}
              disabled={running || checkingAll || submitting || timeLeft <= 0}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-mono text-xs font-bold shadow-glow-orange hover:opacity-95 transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              {submitting ? (
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              <span>Submit</span>
            </button>
          </div>
        </div>

        {/* ── QUESTION TABS ────────────────────────────────────────────── */}
        <div className={`px-4 py-2 border-b flex items-center space-x-2 overflow-x-auto text-xs font-mono shrink-0 ${
          isDark ? 'bg-[#111A2C] border-white/5' : 'bg-[#F8FAFC] border-[#E2E8F0]'
        }`}>
          {selectedContest.problems.map((prob, idx) => (
            <button
              key={prob.id}
              onClick={() => handleSelectQuestion(idx)}
              className={`px-3 py-1.5 rounded-lg transition flex items-center space-x-2 whitespace-nowrap ${
                activeQuestionIdx === idx
                  ? 'bg-[#F89820] text-black font-bold'
                  : isDark ? 'bg-[#151F32] text-gray-400 hover:text-white' : 'bg-white text-[#64748B] hover:text-[#172033] border border-[#E2E8F0]'
              }`}
            >
              <span>Q{idx + 1}: {prob.title}</span>
              <span className="text-[10px] opacity-80">({prob.points} pts)</span>
            </button>
          ))}
        </div>

        {/* ── SPLIT WORKSPACE ─────────────────────────────────────────── */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">

          {/* LEFT PANE – Problem Description */}
          <div className="lg:col-span-5 flex flex-col border-r border-white/5 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm text-gray-300">

              {/* Title + Points */}
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-bold text-white leading-snug">{currentQuestion.title}</h2>
                <span className="shrink-0 px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30">
                  {currentQuestion.points} Points
                </span>
              </div>

              {/* Difficulty */}
              {currentQuestion.difficulty && (
                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  currentQuestion.difficulty === 'Easy'
                    ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30'
                    : currentQuestion.difficulty === 'Hard'
                    ? 'text-red-400 bg-red-500/10 border-red-500/30'
                    : 'text-[#F89820] bg-[#F89820]/10 border-[#F89820]/30'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              )}

              {/* Description */}
              <div className="whitespace-pre-line text-xs font-mono leading-relaxed text-gray-200 bg-[#111A2C] rounded-xl p-4 border border-white/5">
                {currentQuestion.description || 'Contest problem description loaded.'}
              </div>

              {/* Input / Output Format */}
              {(currentQuestion.inputFormat || currentQuestion.outputFormat) && (
                <div className="grid grid-cols-1 gap-2.5">
                  {currentQuestion.inputFormat && (
                    <div className="p-3 rounded-xl bg-[#0E1726] border border-white/10">
                      <div className="text-xs font-mono font-semibold text-[#3B82F6] mb-1 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                        <span>Input Format</span>
                      </div>
                      <p className="text-xs font-mono text-gray-300">{currentQuestion.inputFormat}</p>
                    </div>
                  )}
                  {currentQuestion.outputFormat && (
                    <div className="p-3 rounded-xl bg-[#0E1726] border border-white/10">
                      <div className="text-xs font-mono font-semibold text-[#22C55E] mb-1 flex items-center space-x-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                        <span>Output Format</span>
                      </div>
                      <p className="text-xs font-mono text-gray-300">{currentQuestion.outputFormat}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Examples */}
              {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">Examples:</h4>
                  {currentQuestion.examples.map((ex: any, idx: number) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-[#151F32] border border-white/5 font-mono text-xs space-y-1.5">
                      <div className="font-semibold text-white">Example {idx + 1}:</div>
                      <div>
                        <span className="text-[#3B82F6]">Input: </span>
                        <span className="text-gray-300">{ex.input}</span>
                      </div>
                      <div>
                        <span className="text-[#22C55E]">Output: </span>
                        <span className="text-gray-300">{ex.output}</span>
                      </div>
                      {ex.explanation && (
                        <div className="text-gray-400 text-[11px]">
                          <span className="text-gray-500">Explanation: </span>
                          {ex.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Constraints */}
              {currentQuestion.constraints && currentQuestion.constraints.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">Constraints:</h4>
                  <ul className="list-disc list-inside space-y-1 text-xs font-mono text-gray-400">
                    {currentQuestion.constraints.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submission Feedback */}
              {submissionFeedback && (
                <div className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                  submissionFeedback.status === 'Accepted'
                    ? 'bg-[#22C55E]/15 border-[#22C55E]/40 text-[#22C55E]'
                    : 'bg-red-500/15 border-red-500/40 text-red-400'
                }`}>
                  <div className="font-bold flex items-center space-x-1.5">
                    {submissionFeedback.status === 'Accepted' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    <span>Status: {submissionFeedback.status}</span>
                  </div>
                  {submissionFeedback.status === 'Accepted' && (
                    <div>🎉 Score +{currentQuestion.points} points awarded to leaderboard!</div>
                  )}
                  {submissionFeedback.errorMessage && (
                    <div className="text-[11px] text-red-300">{submissionFeedback.errorMessage}</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANE – Editor + Console */}
          <div className="lg:col-span-7 flex flex-col bg-[#0B1120] overflow-hidden">

            {/* Editor Header */}
            <div className="px-4 py-2 bg-[#151F32] border-b border-white/5 text-xs font-mono text-gray-400 shrink-0">
              Contest Editor — Java 17 LTS (Time Limit: 2000ms)
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 min-h-0">
              <Editor
                height="100%"
                defaultLanguage="java"
                theme={isDark ? 'vs-dark' : 'light'}
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  fontSize: 13,
                  fontFamily: "'Fira Code', Consolas, monospace",
                  minimap: { enabled: false },
                  lineNumbers: 'on',
                  tabSize: 4,
                  scrollBeyondLastLine: false,
                }}
              />
            </div>

            {/* ── BOTTOM CONSOLE ──────────────────────────────────────── */}
            <div className={`border-t border-white/5 bg-[#111A2C] flex flex-col ${isConsoleOpen ? 'h-56' : 'h-9'} shrink-0 transition-all duration-200`}>

              {/* Console Toggle Bar */}
              <div className="h-9 px-3 flex items-center justify-between border-b border-white/5 shrink-0">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setBottomTab('testcases')}
                    className={`px-3 py-1 text-[11px] font-mono rounded transition ${
                      bottomTab === 'testcases' ? 'text-white bg-white/10' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Test Cases
                  </button>
                  <button
                    onClick={() => setBottomTab('result')}
                    className={`px-3 py-1 text-[11px] font-mono rounded transition ${
                      bottomTab === 'result' ? 'text-white bg-white/10' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    Result {runResult && (
                      <span className={`ml-1 font-bold ${runResult.status === 'Accepted' ? 'text-[#22C55E]' : 'text-red-400'}`}>
                        ● {runResult.status}
                      </span>
                    )}
                  </button>
                </div>
                <button
                  onClick={() => setIsConsoleOpen(v => !v)}
                  className="text-gray-500 hover:text-white transition p-1"
                  title={isConsoleOpen ? 'Collapse Console' : 'Expand Console'}
                >
                  {isConsoleOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>

              {/* Console Content */}
              {isConsoleOpen && (
                <div className="flex-1 overflow-y-auto p-3 font-mono text-xs">

                  {/* TEST CASES TAB */}
                  {bottomTab === 'testcases' && (
                    <div className="space-y-2">
                      {testCases.length === 0 && (
                        <p className="text-gray-500 text-[11px]">No sample test cases available for this problem.</p>
                      )}
                      {/* Case Selector Pills */}
                      {testCases.length > 0 && (
                        <>
                          <div className="flex items-center space-x-2 flex-wrap gap-1">
                            {testCases.map((_: any, i: number) => (
                              <button
                                key={i}
                                onClick={() => setSelectedCaseIdx(i)}
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border transition ${
                                  selectedCaseIdx === i
                                    ? 'bg-[#F89820]/20 border-[#F89820]/50 text-[#F89820]'
                                    : 'border-white/10 text-gray-400 hover:text-white'
                                }`}
                              >
                                Case {i + 1}
                              </button>
                            ))}
                          </div>
                          {testCases[selectedCaseIdx] && (
                            <div className="space-y-2 mt-2">
                              <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Input</div>
                                <div className="bg-[#0B1120] rounded-lg p-2.5 text-gray-200 border border-white/5 whitespace-pre-wrap">
                                  {testCases[selectedCaseIdx].input}
                                </div>
                              </div>
                              <div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Expected Output</div>
                                <div className="bg-[#0B1120] rounded-lg p-2.5 text-[#22C55E] border border-white/5 whitespace-pre-wrap">
                                  {testCases[selectedCaseIdx].expectedOutput}
                                </div>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* RESULT TAB */}
                  {bottomTab === 'result' && (
                    <div className="space-y-2">
                      {!runResult && !running && !checkingAll && (
                        <p className="text-gray-500 text-[11px]">Click <span className="text-white font-semibold">Run</span> to test sample cases, <span className="text-[#38BDF8] font-semibold">Check All Cases</span> to verify against hidden cases, or <span className="text-[#F89820] font-semibold">Submit</span> for final score.</p>
                      )}
                      {(running || checkingAll) && (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <div className="w-3.5 h-3.5 border-2 border-[#F89820] border-t-transparent rounded-full animate-spin" />
                          <span>{checkingAll ? 'Evaluating against all visible and hidden test cases...' : 'Executing Java code...'}</span>
                        </div>
                      )}
                      {runResult && !running && !checkingAll && (
                        <div className="space-y-2">
                          {/* Status and count badge */}
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg font-bold ${
                              runResult.status === 'Accepted'
                                ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                : 'bg-red-500/15 text-red-400'
                            }`}>
                              {runResult.status === 'Accepted'
                                ? <CheckCircle2 className="w-3.5 h-3.5" />
                                : <AlertCircle className="w-3.5 h-3.5" />}
                              <span>{runResult.status}</span>
                            </div>

                            {runResult.hiddenCount > 0 && (
                              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center space-x-1">
                                <Lock className="w-3 h-3" />
                                <span>Includes {runResult.hiddenCount} Hidden Tests</span>
                              </span>
                            )}
                          </div>

                          {/* Per-test-case results */}
                          {(runResult.testResults || runResult.results) && (runResult.testResults || runResult.results).map((r: any, i: number) => (
                            <div key={i} className={`rounded-lg p-2.5 border text-[11px] space-y-1 ${
                              r.passed ? 'border-[#22C55E]/20 bg-[#22C55E]/5' : 'border-red-500/20 bg-red-500/5'
                            }`}>
                              <div className={`font-bold flex items-center space-x-1.5 ${r.passed ? 'text-[#22C55E]' : 'text-red-400'}`}>
                                {r.passed ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                <span>Case {r.caseNumber || (i + 1)}: {r.passed ? 'Passed' : 'Failed'}</span>
                                {r.isHidden && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
                                    Hidden Case
                                  </span>
                                )}
                              </div>
                              <div className="text-gray-400">Input: <span className="text-gray-200">{r.input}</span></div>
                              <div className="text-gray-400">Expected: <span className="text-[#22C55E]">{r.expectedOutput}</span></div>
                              <div className="text-gray-400">Got: <span className={r.passed ? 'text-[#22C55E]' : 'text-red-400'}>{r.actualOutput}</span></div>
                            </div>
                          ))}

                          {/* Error output */}
                          {runResult.errorMessage && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-red-300 text-[11px] whitespace-pre-wrap">
                              {runResult.errorMessage}
                            </div>
                          )}
                          {runResult.output && !runResult.results && (
                            <div className="bg-[#0B1120] border border-white/5 rounded-lg p-2.5 text-gray-200 text-[11px] whitespace-pre-wrap">
                              {runResult.output}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. CONTESTS HOME VIEW (Browse Daily, Weekly, Monthly)
  const currentTabContests = contests.filter((c) => c.type === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center space-x-2.5 ${isDark ? 'text-white' : 'text-[#172033]'}`}>
            <Trophy className="w-6 h-6 text-[#F89820]" />
            <span>OOP'S ORACLE Coding Contests</span>
          </h1>
          <p className={`text-xs font-mono mt-1 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            Test your algorithmic prowess under timed competitive pressure with automated scoring & leaderboards.
          </p>
        </div>
      </div>

      {/* Main 3 Tabs: Daily, Weekly, Monthly */}
      <div className={`flex rounded-xl p-1 border ${
        isDark ? 'bg-[#151F32] border-white/5' : 'bg-[#F1F5F9] border-[#E2E8F0]'
      }`}>
        {(['Daily', 'Weekly', 'Monthly'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-xs font-mono font-semibold rounded-lg transition ${
              activeTab === tab
                ? 'bg-[#F89820] text-black shadow-md'
                : isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            {tab.toUpperCase()} CONTEST
          </button>
        ))}
      </div>

      {/* Contests Cards List */}
      <div className="space-y-4">
        {currentTabContests.map((contest) => (
          <div
            key={contest.id}
            className="glass-card rounded-2xl border border-white/5 p-6 hover:border-[#F89820]/40 transition space-y-5"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30">
                    {contest.type} ARENA
                  </span>
                  <span className="text-xs font-mono text-gray-400">
                    {contest.durationMinutes} Minutes • {contest.problems?.length || 2} Problems
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-sans">
                  {contest.title}
                </h3>
                <p className="text-xs text-gray-400 max-w-2xl font-mono">
                  {contest.description}
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleOpenContest(contest.slug)}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F89820] to-[#E65100] text-black font-semibold text-xs font-mono shadow-glow-orange hover:opacity-95 transition flex items-center space-x-2"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Enter Contest Workspace</span>
                </button>
              </div>
            </div>

            {/* Questions included in this contest */}
            <div className="pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {contest.problems?.map((prob, i) => (
                <div key={prob.id} className="p-3 rounded-lg bg-[#0B1120] border border-white/5 text-xs font-mono space-y-1">
                  <div className="text-gray-500 text-[10px]">Question {i + 1}</div>
                  <div className="text-white font-medium truncate">{prob.title}</div>
                  <div className="text-[#F89820] font-bold">{prob.points} Points</div>
                </div>
              ))}
            </div>

            {/* Contest Rules Accordion */}
            <div className="p-3 rounded-xl bg-[#0B1120]/60 border border-white/5 space-y-1.5 text-xs font-mono text-gray-400">
              <div className="text-white font-semibold flex items-center space-x-1.5">
                <Shield className="w-3.5 h-3.5 text-[#F89820]" />
                <span>Contest Rules:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                {contest.rules?.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Live Leaderboard */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-white uppercase flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5 text-[#3B82F6]" />
                  <span>Live Leaderboard</span>
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  {contest.participantsCount} Developers Registered
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-white/5">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0B1120] text-gray-400">
                    <tr>
                      <th className="py-2.5 px-3 w-16">Rank</th>
                      <th className="py-2.5 px-3">Developer</th>
                      <th className="py-2.5 px-3">Solved</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Finish Time</th>
                      <th className="py-2.5 px-3">Penalty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {contest.leaderboard?.map((entry) => (
                      <tr key={entry.rank} className="hover:bg-white/5">
                        <td className="py-2 px-3 font-bold text-white">
                          {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`}
                        </td>
                        <td className="py-2 px-3 font-medium text-white flex items-center space-x-2">
                          <span>{entry.avatar}</span>
                          <span>{entry.username}</span>
                        </td>
                        <td className="py-2 px-3 text-[#22C55E]">{entry.solvedCount} / {contest.problems?.length}</td>
                        <td className="py-2 px-3 font-bold text-[#F89820]">{entry.totalScore}</td>
                        <td className="py-2 px-3 text-gray-400">{entry.finishTime}</td>
                        <td className="py-2 px-3 text-gray-500">+{entry.penalty}m</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
