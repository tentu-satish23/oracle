import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import confetti from 'canvas-confetti';
import { Play, Send, RotateCcw, Copy, Check, ChevronLeft, ChevronRight, Terminal, BookOpen, MessageSquare, History, Sparkles, CheckCircle2, XCircle, AlertTriangle, Maximize2, Minimize2, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../../services/api';
import { soundEngine } from '../../services/audio';
import { Problem, TestCase } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface CodingWorkspaceProps {
  slug: string;
  onNavigateProblem: (slug: string) => void;
  onBackToLibrary: () => void;
}

export const CodingWorkspace: React.FC<CodingWorkspaceProps> = ({
  slug,
  onNavigateProblem,
  onBackToLibrary
}) => {
  const { isDark } = useTheme();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState('');
  const [activeTab, setActiveTab] = useState<'description' | 'editorial' | 'submissions' | 'discussion'>('description');
  const [bottomTab, setBottomTab] = useState<'testcases' | 'result'>('testcases');
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [customInput, setCustomInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Execution state
  const [running, setRunning] = useState(false);
  const [checkingAll, setCheckingAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [runResult, setRunResult] = useState<any>(null);

  // Load problem details
  useEffect(() => {
    async function loadProblem() {
      try {
        setLoading(true);
        const data = await api.getProblem(slug);
        setProblem(data);

        // Check if there's a saved draft in localStorage
        const savedDraft = localStorage.getItem(`oracle_draft_${slug}`);
        setCode(savedDraft || data.starterCode || '');
        setRunResult(null);

        if (data.testCases && data.testCases.length > 0) {
          setCustomInput(data.testCases[0].input);
        }
      } catch (err) {
        console.error('Failed to load problem:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProblem();
  }, [slug]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetCode = () => {
    if (problem?.starterCode) {
      if (confirm('Reset code to original starter template?')) {
        setCode(problem.starterCode);
        localStorage.removeItem(`oracle_draft_${slug}`);
      }
    }
  };

  const handleSaveDraft = () => {
    localStorage.setItem(`oracle_draft_${slug}`, code);
    alert('Code draft saved locally!');
  };

  // Run Code against sample / custom test cases
  const handleRunCode = async () => {
    if (!problem) return;
    try {
      soundEngine.playClick();
      setRunning(true);
      setBottomTab('result');

      const visibleCases = problem.testCases || [{ input: customInput, expectedOutput: '' }];
      const res = await api.runCode({
        code,
        problemSlug: slug,
        customTestCases: visibleCases
      });

      setRunResult(res);
    } catch (err: any) {
      setRunResult({
        status: 'Runtime Error',
        errorMessage: err.message
      });
    } finally {
      setRunning(false);
    }
  };

  // Check against ALL test cases (including hidden test cases) before submitting
  const handleCheckAll = async () => {
    if (!problem) return;
    try {
      soundEngine.playClick();
      setCheckingAll(true);
      setBottomTab('result');

      const res = await api.runCode({
        code,
        problemSlug: slug,
        checkAll: true
      });

      setRunResult(res);
    } catch (err: any) {
      setRunResult({
        status: 'Runtime Error',
        errorMessage: err.message
      });
    } finally {
      setCheckingAll(false);
    }
  };

  // Submit Code against ALL test cases (including hidden)
  const handleSubmitCode = async () => {
    if (!problem) return;
    try {
      soundEngine.playClick();
      setSubmitting(true);
      setBottomTab('result');

      const res = await api.submitCode({
        code,
        problemSlug: slug
      });

      setRunResult(res);

      if (res.status === 'Accepted') {
        // Trigger celebratory confetti!
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F89820', '#22C55E', '#3B82F6', '#FFD700']
        });
      }
    } catch (err: any) {
      setRunResult({
        status: 'Runtime Error',
        errorMessage: err.message
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatInlineMarkdown = (content: string) => {
    const parts = content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 rounded bg-[#1B263B] text-[#F89820] font-mono text-xs border border-white/5">
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  const renderFormattedDescription = (text: string) => {
    if (!text) return null;
    const lines = text.split('\n');
    return (
      <div className="space-y-3 font-sans text-sm leading-relaxed text-gray-200">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) return <div key={idx} className="h-1" />;

          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-bold font-mono text-[#F89820] uppercase tracking-wider pt-3 pb-1 border-b border-white/5 flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F89820]" />
                <span>{trimmed.replace('### ', '')}</span>
              </h3>
            );
          }

          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start space-x-2 pl-2 text-xs font-mono text-gray-300">
                <span className="text-[#F89820] font-bold">•</span>
                <span>{formatInlineMarkdown(trimmed.substring(2))}</span>
              </div>
            );
          }

          return (
            <p key={idx} className="text-xs text-gray-300 leading-relaxed">
              {formatInlineMarkdown(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  if (loading || !problem) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-3 font-mono text-gray-400">
        <div className="w-8 h-8 border-2 border-[#F89820] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Initialising Monaco Java Workspace...</span>
      </div>
    );
  }

  const diffColor =
    problem.difficulty === 'Easy'
      ? 'text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/30'
      : problem.difficulty === 'Medium'
      ? 'text-[#F89820] bg-[#F89820]/10 border-[#F89820]/30'
      : 'text-red-400 bg-red-500/10 border-red-500/30';

  return (
    <div className={`flex flex-col h-[calc(100vh-3.5rem)] ${isDark ? 'bg-[#0B1120]' : 'bg-[#F5F7FA]'} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>

      {/* WORKSPACE TOP ACTION BAR */}
      <div className={`h-12 border-b px-4 flex items-center justify-between z-20 ${
        isDark ? 'bg-[#151F32] border-white/5' : 'bg-white border-[#E2E8F0] shadow-sm'
      }`}>
        {/* Navigation & Problem Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToLibrary}
            className={`flex items-center space-x-1 text-xs font-mono transition ${
              isDark ? 'text-[#94A3B8] hover:text-white' : 'text-[#64748B] hover:text-[#172033]'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Problem Library</span>
          </button>

          <span className={isDark ? 'text-gray-600' : 'text-[#CBD5E1]'}>|</span>

          <div className="flex items-center space-x-2">
            <span className={`text-xs font-mono font-bold ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>#{problem.id}</span>
            <span className={`text-sm font-semibold truncate max-w-xs md:max-w-md font-sans ${isDark ? 'text-white' : 'text-[#172033]'}`}>
              {problem.title}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${diffColor}`}>
              {problem.difficulty}
            </span>
          </div>
        </div>

        {/* Action Buttons: Run & Submit */}
        <div className="flex items-center space-x-2">
          {/* Previous / Next buttons */}
          <button
            onClick={() => onNavigateProblem(String(Math.max(1, problem.id - 1)))}
            disabled={problem.id <= 1}
            className={`p-1.5 rounded-lg border disabled:opacity-40 transition ${
              isDark ? 'bg-[#0B1120] hover:bg-[#1B263B] text-gray-400 hover:text-white border-white/5' : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#172033] border-[#E2E8F0]'
            }`}
            title="Previous Problem"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateProblem(String(problem.id + 1))}
            className={`p-1.5 rounded-lg border transition ${
              isDark ? 'bg-[#0B1120] hover:bg-[#1B263B] text-gray-400 hover:text-white border-white/5' : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#172033] border-[#E2E8F0]'
            }`}
            title="Next Problem"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <span className={`${isDark ? 'text-gray-600' : 'text-[#CBD5E1]'} mx-1`}>|</span>

          {/* Run Code (Sample Cases) */}
          <button
            onClick={handleRunCode}
            disabled={running || submitting || checkingAll}
            className={`px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium border transition flex items-center space-x-1.5 disabled:opacity-50 ${
              isDark
                ? 'bg-[#1B263B] hover:bg-white/10 text-white border-white/10'
                : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] border-[#D1D5DB]'
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

          {/* Check All Tests (Includes Hidden Test Cases) */}
          <button
            onClick={handleCheckAll}
            disabled={running || submitting || checkingAll}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-medium border transition flex items-center space-x-1.5 disabled:opacity-50 ${
              isDark
                ? 'bg-[#112240] hover:bg-[#1B3A57] text-[#38BDF8] border-[#38BDF8]/30'
                : 'bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#2563EB] border-[#BFDBFE]'
            }`}
            title="Evaluate code against ALL test cases including hidden cases before submitting"
          >
            {checkingAll ? (
              <div className="w-3.5 h-3.5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
            )}
            <span>Check All Cases</span>
          </button>

          {/* Submit Code (All Test Cases + Profile Record) */}
          <button
            onClick={handleSubmitCode}
            disabled={running || submitting || checkingAll}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] hover:opacity-95 text-black font-mono text-xs font-bold transition flex items-center space-x-1.5 shadow-glow-orange disabled:opacity-50"
            title="Submit final solution to run all hidden cases and update leaderboard"
          >
            {submitting ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Submit</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={`p-1.5 rounded-lg transition ${
              isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Editor'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* MAIN SPLIT SCREEN AREA */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

        {/* LEFT PANEL: Description, Editorial, Submissions, Discussion (5 cols) */}
        <div className={`lg:col-span-5 flex flex-col border-r overflow-hidden ${
          isDark ? 'border-white/5 bg-[#0B1120]' : 'border-[#E2E8F0] bg-white'
        }`}>

          {/* Left Tabs */}
          <div className={`flex items-center px-2 border-b overflow-x-auto text-xs font-mono ${
            isDark ? 'border-white/5 bg-[#111A2C]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
          }`}>
            <button
              onClick={() => setActiveTab('description')}
              className={`px-3 py-2.5 border-b-2 font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'description'
                  ? 'border-[#F89820] text-[#F89820]'
                  : isDark ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Description</span>
            </button>

            <button
              onClick={() => setActiveTab('editorial')}
              className={`px-3 py-2.5 border-b-2 font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'editorial'
                  ? 'border-[#F89820] text-[#F89820]'
                  : isDark ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Editorial</span>
            </button>

            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-3 py-2.5 border-b-2 font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'submissions'
                  ? 'border-[#F89820] text-[#F89820]'
                  : isDark ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Submissions</span>
            </button>

            <button
              onClick={() => setActiveTab('discussion')}
              className={`px-3 py-2.5 border-b-2 font-medium transition whitespace-nowrap flex items-center space-x-1.5 ${
                activeTab === 'discussion'
                  ? 'border-[#F89820] text-[#F89820]'
                  : isDark ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-[#64748B] hover:text-[#172033]'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Discussion</span>
            </button>
          </div>

          {/* Left Tab Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm text-gray-300 leading-relaxed">
            {activeTab === 'description' && (
              <>
                {/* Companies pills */}
                {problem.companyTags && problem.companyTags.length > 0 && (
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-[11px] font-mono text-gray-500">Asked in:</span>
                    {problem.companyTags.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-white/5 text-[#94A3B8] border border-white/10">
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Problem Statement Markdown */}
                {renderFormattedDescription(problem.description)}

                {/* Input Format & Output Format */}
                {(problem.inputFormat || problem.outputFormat) && (
                  <div className="grid grid-cols-1 gap-2.5 pt-1">
                    {problem.inputFormat && (
                      <div className="p-3 rounded-xl bg-[#0E1726] border border-white/10 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#3B82F6]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
                          <span>Input Format</span>
                        </div>
                        <p className="text-xs font-mono text-gray-300 leading-relaxed">{problem.inputFormat}</p>
                      </div>
                    )}
                    {problem.outputFormat && (
                      <div className="p-3 rounded-xl bg-[#0E1726] border border-white/10 space-y-1">
                        <div className="flex items-center space-x-1.5 text-xs font-mono font-semibold text-[#22C55E]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                          <span>Output Format</span>
                        </div>
                        <p className="text-xs font-mono text-gray-300 leading-relaxed">{problem.outputFormat}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Examples */}
                {problem.examples && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                      Examples:
                    </h4>
                    {problem.examples.map((ex, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#151F32] border border-white/5 space-y-1.5 font-mono text-xs">
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
                {problem.constraints && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                      Constraints:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-xs font-mono text-gray-400">
                      {problem.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Collapsible Hints */}
                {problem.hints && problem.hints.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <h4 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                      Hints:
                    </h4>
                    {problem.hints.map((hint, idx) => (
                      <details key={idx} className="p-2.5 rounded-lg bg-[#151F32]/50 border border-white/5 text-xs">
                        <summary className="font-mono text-[#F89820] cursor-pointer hover:underline">
                          Hint {idx + 1}
                        </summary>
                        <p className="mt-2 text-gray-400 font-mono">{hint}</p>
                      </details>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* EDITORIAL TAB */}
            {activeTab === 'editorial' && (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[#F89820]/10 border border-[#F89820]/30 text-xs font-mono text-[#F89820]">
                  Official OOP'S ORACLE Java Editorial & Complexity Analysis
                </div>
                <div className="whitespace-pre-line text-xs font-mono text-gray-300 leading-relaxed bg-[#111A2C] p-4 rounded-xl border border-white/5 overflow-x-auto">
                  {problem.editorial || 'Editorial analysis is being finalized for this problem.'}
                </div>
              </div>
            )}

            {/* SUBMISSIONS TAB */}
            {activeTab === 'submissions' && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-white uppercase">
                  Past Submissions for this Question
                </h4>
                {problem.userSubmissions && problem.userSubmissions.length > 0 ? (
                  problem.userSubmissions.map((sub) => (
                    <div key={sub.id} className="p-3 rounded-lg bg-[#151F32] border border-white/5 flex items-center justify-between text-xs font-mono">
                      <div>
                        <div className={sub.status === 'Accepted' ? 'text-[#22C55E] font-bold' : 'text-red-400 font-bold'}>
                          {sub.status}
                        </div>
                        <div className="text-[10px] text-gray-500">
                          {new Date(sub.submittedAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right text-gray-400 text-[11px]">
                        <div>Runtime: {sub.runtime}ms</div>
                        <div>Memory: {sub.memory}MB</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-mono text-gray-500 py-6 text-center">
                    No submissions yet. Write your Java solution and click Submit!
                  </div>
                )}
              </div>
            )}

            {/* DISCUSSION TAB */}
            {activeTab === 'discussion' && (
              <div className="space-y-3">
                <h4 className="text-xs font-mono font-semibold text-white uppercase">
                  Developer Community Discussions
                </h4>
                {problem.discussions && problem.discussions.length > 0 ? (
                  problem.discussions.map((d, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[#151F32] border border-white/5 space-y-1">
                      <div className="flex items-center justify-between text-xs font-mono text-[#F89820]">
                        <span>@{d.author}</span>
                        <span className="text-gray-500">{d.time}</span>
                      </div>
                      <p className="text-xs text-gray-300">{d.text}</p>
                      <div className="text-[10px] font-mono text-gray-500 pt-1">
                        ▲ {d.upvotes} upvotes
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-mono text-gray-500 py-6 text-center">
                    Be the first to start a discussion thread for this problem!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Monaco Editor & Bottom Console (7 cols) */}
        <div className={`lg:col-span-7 flex flex-col overflow-hidden ${isDark ? 'bg-[#0B1120]' : 'bg-[#F5F7FA]'}`}>

          {/* Monaco Editor Toolbar */}
          <div className={`h-10 border-b px-4 flex items-center justify-between text-xs font-mono ${
            isDark ? 'bg-[#151F32] border-white/5 text-gray-400' : 'bg-white border-[#E2E8F0] text-[#64748B]'
          }`}>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#F89820]" />
              <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#172033]'}`}>Java 17 (OpenJDK)</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyCode}
                className={`p-1.5 rounded transition ${isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-[#172033] hover:bg-[#F1F5F9]'}`}
                title="Copy Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleResetCode}
                className={`p-1.5 rounded transition ${isDark ? 'hover:text-white hover:bg-white/5' : 'hover:text-[#172033] hover:bg-[#F1F5F9]'}`}
                title="Reset to Starter Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleSaveDraft}
                className={`px-2 py-0.5 rounded text-[11px] border ${
                  isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/5' : 'bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#172033] border-[#E2E8F0]'
                }`}
              >
                Save Draft
              </button>
            </div>
          </div>

          {/* Monaco Editor Area */}
          <div className="flex-1 min-h-[300px]">
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
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                suggestOnTriggerCharacters: true,
                quickSuggestions: true,
                padding: { top: 12, bottom: 12 }
              }}
            />
          </div>

          {/* BOTTOM PANEL: Test Cases & Execution Results */}
          <div className={`h-64 border-t flex flex-col ${
            isDark ? 'border-white/10 bg-[#111A2C]' : 'border-[#E2E8F0] bg-white'
          }`}>

            {/* Bottom Tabs */}
            <div className={`flex items-center justify-between px-4 border-b text-xs font-mono ${
              isDark ? 'border-white/5 bg-[#0B1120]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
            }`}>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setBottomTab('testcases')}
                  className={`py-2 px-3 border-b-2 font-medium transition ${
                    bottomTab === 'testcases'
                      ? 'border-[#F89820] text-[#F89820]'
                      : isDark ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  Test Cases
                </button>
                <button
                  onClick={() => setBottomTab('result')}
                  className={`py-2 px-3 border-b-2 font-medium transition ${
                    bottomTab === 'result'
                      ? 'border-[#F89820] text-[#F89820]'
                      : isDark ? 'border-transparent text-gray-400 hover:text-white' : 'border-transparent text-[#64748B] hover:text-[#172033]'
                  }`}
                >
                  Execution Result {runResult && `(${runResult.status})`}
                </button>
              </div>

              <div className={`text-[11px] font-mono ${isDark ? 'text-gray-500' : 'text-[#94A3B8]'}`}>
                Judge0 Isolated Sandbox
              </div>
            </div>

            {/* Bottom Tab Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-gray-300">
              {bottomTab === 'testcases' && (
                <div className="space-y-3">
                  {/* Test case selector pills */}
                  <div className="flex items-center space-x-2">
                    {(problem.testCases || []).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedCaseIdx(idx)}
                        className={`px-3 py-1 rounded-md transition ${
                          selectedCaseIdx === idx
                            ? 'bg-[#F89820] text-black font-semibold'
                            : 'bg-[#1B263B] text-gray-300 hover:text-white'
                        }`}
                      >
                        Case {idx + 1}
                      </button>
                    ))}
                  </div>

                  {/* Test Case Inputs */}
                  {problem.testCases && problem.testCases[selectedCaseIdx] && (
                    <div className="space-y-2">
                      <div>
                        <span className="text-gray-500">Input:</span>
                        <div className="p-2.5 rounded bg-[#0B1120] text-gray-200 mt-1">
                          {problem.testCases[selectedCaseIdx].input}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Expected Output:</span>
                        <div className="p-2.5 rounded bg-[#0B1120] text-[#22C55E] mt-1">
                          {problem.testCases[selectedCaseIdx].expectedOutput}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EXECUTION / SUBMISSION RESULTS */}
              {bottomTab === 'result' && (
                <div>
                  {!runResult ? (
                    <div className="text-gray-500 py-6 text-center">
                      Click "Run" to test visible sample cases or "Submit" to test all hidden interview cases.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {/* Verdict Banner */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {runResult.status === 'Accepted' ? (
                            <>
                              <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                              <span className="text-base font-bold text-[#22C55E]">Accepted</span>
                            </>
                          ) : runResult.status === 'Compilation Error' ? (
                            <>
                              <AlertTriangle className="w-5 h-5 text-amber-400" />
                              <span className="text-base font-bold text-amber-400">Compilation Error</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-5 h-5 text-red-400" />
                              <span className="text-base font-bold text-red-400">{runResult.status}</span>
                            </>
                          )}
                        </div>

                        {runResult.status === 'Accepted' && (
                          <div className="flex items-center space-x-4 text-xs text-gray-400 font-mono">
                            <span>Runtime: <strong className="text-white">{runResult.runtime} ms</strong> (Beats 96.2%)</span>
                            <span>Memory: <strong className="text-white">{runResult.memory} MB</strong> (Beats 88.5%)</span>
                          </div>
                        )}
                      </div>

                      {/* Compilation Error or Runtime Error Output */}
                      {runResult.errorMessage && (
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 whitespace-pre-wrap font-mono text-xs">
                          {runResult.errorMessage}
                        </div>
                      )}

                      {/* Detailed Test Results Breakdown */}
                      {runResult.testResults && runResult.testResults.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                            <span>
                              Test Cases Evaluated: <strong className="text-white">{runResult.passedTests} / {runResult.totalTests} Passed</strong>
                            </span>
                            {runResult.hiddenCount > 0 && (
                              <span className="text-[#38BDF8] text-[10px] bg-[#38BDF8]/10 px-2 py-0.5 rounded border border-[#38BDF8]/30 flex items-center space-x-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>Includes {runResult.hiddenCount} Hidden Test Cases</span>
                              </span>
                            )}
                          </div>
                          <div className="space-y-1.5">
                            {runResult.testResults.map((t: any, idx: number) => (
                              <div
                                key={idx}
                                className={`p-2.5 rounded-lg bg-[#0B1120] border text-xs flex items-center justify-between font-mono ${
                                  t.passed ? 'border-[#22C55E]/30 bg-[#22C55E]/5' : 'border-red-500/30 bg-red-500/5'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className={t.passed ? 'text-[#22C55E] font-bold' : 'text-red-400 font-bold'}>
                                    {t.passed ? '✓' : '✗'} Case {t.caseNumber}
                                  </span>
                                  {t.isHidden && (
                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 flex items-center space-x-1">
                                      <Lock className="w-2.5 h-2.5" />
                                      <span>Hidden</span>
                                    </span>
                                  )}
                                  <span className="text-gray-400">Input: <span className="text-gray-200">{t.input}</span></span>
                                </div>
                                <div className="text-right text-gray-400">
                                  <span>Output: <strong className={t.passed ? 'text-[#22C55E]' : 'text-red-400'}>{t.actualOutput}</strong></span>
                                </div>
                              </div>
                            ))}
                          </div>
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
    </div>
  );
};
