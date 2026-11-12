import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen, CheckCircle, Lock, Play, ShieldCheck, ArrowLeft, ArrowRight,
  Check, Sparkles, HelpCircle, Code, Award, Trophy, ChevronRight, ChevronLeft,
  Terminal, Copy, CheckCheck, Lightbulb, AlertTriangle, Layers, FileCode
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Lesson } from '../../types';
import { CertificateModal } from '../certificate/CertificateModal';
import { useTheme } from '../../context/ThemeContext';

interface CoursesPageProps {
  initialCourseSlug?: string | null;
  onBackToDashboard: () => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ initialCourseSlug, onBackToDashboard }) => {
  const { isDark } = useTheme();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lessonLoading, setLessonLoading] = useState(false);
  const [lessonError, setLessonError] = useState<string | null>(null);

  // Certificate modal
  const [certCourse, setCertCourse] = useState<Course | null>(null);

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Active Code Example Tab (Example 1, Example 2, Example 3)
  const [activeCodeExampleIndex, setActiveCodeExampleIndex] = useState(0);

  // Exercise solution toggle
  const [showExerciseSolution, setShowExerciseSolution] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab: 'catalog' | 'my-courses'
  const [viewTab, setViewTab] = useState<'catalog' | 'my-courses'>('catalog');

  const fetchCoursesList = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getCourses();
      setCourses(res.courses || []);
      if (initialCourseSlug) {
        const found = (res.courses || []).find((c: Course) => c.slug === initialCourseSlug);
        if (found) handleOpenCourse(found.slug);
      }
    } catch (err) {
      console.error('Failed to load courses:', err);
    } finally {
      setLoading(false);
    }
  }, [initialCourseSlug]);

  useEffect(() => {
    fetchCoursesList();
  }, [fetchCoursesList]);

  // Open course and load first lesson dynamically
  const handleOpenCourse = async (slug: string) => {
    try {
      setLoading(true);
      setLessonError(null);
      const fullCourse = await api.getCourse(slug);
      setSelectedCourse(fullCourse);
      setIsClassroomOpen(true);

      if (fullCourse.lessons && fullCourse.lessons.length > 0) {
        // Load first lesson dynamically using its unique lesson ID
        await handleSelectLesson(fullCourse.id, fullCourse.lessons[0].id);
      }
    } catch (err) {
      console.error('Failed to open course:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Lesson Loading: Fetch individual lesson from server by courseId & lessonId
  const handleSelectLesson = async (courseId: number, lessonId: number) => {
    try {
      setLessonLoading(true);
      setLessonError(null);
      setSelectedQuizAnswer(null);
      setQuizSubmitted(false);
      setShowExerciseSolution(false);
      setActiveCodeExampleIndex(0);
      setCopiedKey(null);

      const res = await api.getLesson(courseId, lessonId);
      setActiveLesson(res.lesson);
    } catch (err: any) {
      console.error('Failed to load lesson:', err);
      setLessonError(err.message || 'Lesson content is currently unavailable');
    } finally {
      setLessonLoading(false);
    }
  };

  // Navigation: Previous Lesson
  const handlePreviousLesson = () => {
    if (!selectedCourse || !activeLesson || !selectedCourse.lessons) return;
    const currentNum = activeLesson.lessonNumber;
    if (currentNum <= 1) return;

    const prevLesson = selectedCourse.lessons.find(l => l.lessonNumber === currentNum - 1);
    if (prevLesson) {
      handleSelectLesson(selectedCourse.id, prevLesson.id);
    }
  };

  // Navigation: Next Lesson
  const handleNextLesson = () => {
    if (!selectedCourse || !activeLesson || !selectedCourse.lessons) return;
    const currentNum = activeLesson.lessonNumber;
    if (currentNum >= selectedCourse.totalLessons) return;

    const nextLesson = selectedCourse.lessons.find(l => l.lessonNumber === currentNum + 1);
    if (nextLesson) {
      handleSelectLesson(selectedCourse.id, nextLesson.id);
    }
  };

  const handleCompleteLesson = async () => {
    if (!selectedCourse || !activeLesson) return;
    try {
      const res = await api.completeLesson(selectedCourse.id, activeLesson.id);
      setActiveLesson({ ...activeLesson, isCompleted: true });

      // Refresh full course so progress updates
      const updated = await api.getCourse(selectedCourse.slug);
      setSelectedCourse(updated);
      await fetchCoursesList();

      if (res.isCompleted) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#F89820', '#22C55E', '#3B82F6', '#fff']
        });
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  const handleCopyCode = (key: string, codeText: string) => {
    navigator.clipboard.writeText(codeText);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Courses that the user has started working on
  const inProgressCourses = courses.filter(c => (c.progressPercent || 0) > 0);

  // ─── CLASSROOM VIEW ─────────────────────────────────────────────────────────
  if (isClassroomOpen && selectedCourse) {
    const prog = selectedCourse.progressPercent ?? 0;
    const canGetCert = prog === 100;
    const hasPrevious = activeLesson ? activeLesson.lessonNumber > 1 : false;
    const hasNext = activeLesson ? activeLesson.lessonNumber < selectedCourse.totalLessons : false;

    return (
      <div className={`flex flex-col h-[calc(100vh-3.5rem)] ${isDark ? 'bg-[#0B1120]' : 'bg-[#F5F7FA]'}`}>

        {/* Top Navigation Bar */}
        <div className={`h-14 border-b px-4 flex items-center justify-between z-20 ${
          isDark ? 'bg-[#151F32] border-white/5' : 'bg-white border-[#E2E8F0] shadow-sm'
        }`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsClassroomOpen(false)}
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition ${
                isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Courses</span>
            </button>
            <span className={isDark ? 'text-gray-600' : 'text-[#CBD5E1]'}>/</span>
            <span className={`text-xs font-mono font-bold truncate max-w-xs sm:max-w-md ${
              isDark ? 'text-white' : 'text-[#172033]'
            }`}>
              {selectedCourse.title}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Previous & Next quick buttons in header */}
            <div className="hidden md:flex items-center space-x-1.5">
              <button
                onClick={handlePreviousLesson}
                disabled={!hasPrevious}
                className={`p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition ${
                  isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'
                }`}
                title="Previous Lesson"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className={`text-xs font-mono px-2 py-1 rounded border ${
                isDark ? 'text-gray-300 bg-[#0B1120] border-white/5' : 'text-[#172033] bg-[#F1F5F9] border-[#E2E8F0]'
              }`}>
                {activeLesson ? `Lesson ${activeLesson.lessonNumber} / ${selectedCourse.totalLessons}` : '—'}
              </span>
              <button
                onClick={handleNextLesson}
                disabled={!hasNext}
                className={`p-1.5 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition ${
                  isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'
                }`}
                title="Next Lesson"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Course Progress Indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
              <div className={`w-24 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-white/10' : 'bg-[#E2E8F0]'}`}>
                <div
                  className="h-full bg-gradient-to-r from-[#F89820] to-[#16A34A] rounded-full transition-all"
                  style={{ width: `${prog}%` }}
                />
              </div>
              <span className={prog === 100 ? 'text-[#16A34A] font-bold' : isDark ? 'text-gray-400' : 'text-[#64748B]'}>
                {prog}%
              </span>
            </div>

            {/* Certificate button — strictly unlocked at 100% */}
            {canGetCert ? (
              <button
                onClick={() => setCertCourse(selectedCourse)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] hover:from-[#fba93e] hover:to-[#f56a00] text-black font-mono font-bold text-xs shadow-glow-orange transition animate-pulse"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Get Certificate 🎉</span>
              </button>
            ) : (
              <div
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs cursor-not-allowed ${
                  isDark ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8]'
                }`}
                title="Complete all lessons to earn certificate"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Complete all lessons ({prog}%)</span>
                <span className="lg:hidden">{prog}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Classroom Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

          {/* Sidebar: Curriculum List */}
          <div className={`lg:col-span-4 border-r overflow-y-auto p-4 space-y-3 ${
            isDark ? 'border-white/5 bg-[#111A2C]' : 'border-[#E2E8F0] bg-white'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-mono font-semibold uppercase tracking-wider flex items-center space-x-1.5 ${
                  isDark ? 'text-gray-400' : 'text-[#64748B]'
                }`}>
                  <Layers className="w-3.5 h-3.5 text-[#F89820]" />
                  <span>Curriculum</span>
                </h3>
                <span className={`text-[11px] font-mono ${isDark ? 'text-gray-500' : 'text-[#94A3B8]'}`}>
                  {selectedCourse.completedLessons || 0} / {selectedCourse.totalLessons} Completed
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-mono">
                Click any lesson to load its topic-specific content.
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                selectedCourse.lessons.map((lesson) => {
                  const isSelected = activeLesson?.id === lesson.id;
                  return (
                    <div
                      key={lesson.id}
                      onClick={() => handleSelectLesson(selectedCourse.id, lesson.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs font-mono group ${
                        isSelected
                          ? 'bg-[#F89820] text-black font-semibold border-[#F89820] shadow-md'
                          : 'bg-[#151F32] text-gray-300 hover:text-white hover:border-[#F89820]/40 border-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 font-bold ${
                          isSelected ? 'bg-black/25 text-black' : 'bg-white/10 text-gray-400 group-hover:text-white'
                        }`}>
                          {lesson.lessonNumber}
                        </span>
                        <span className="truncate">{lesson.title}</span>
                      </div>
                      {lesson.isCompleted && (
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isSelected ? 'text-black' : 'text-[#22C55E]'}`} />
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs font-mono text-gray-400 p-4 text-center">
                  No lessons available.
                </div>
              )}
            </div>
          </div>

          {/* Lesson Content Area */}
          <div className={`lg:col-span-8 overflow-y-auto p-6 md:p-8 space-y-8 ${isDark ? 'bg-[#0B1120]' : 'bg-[#F5F7FA]'}`}>

            {/* Loading State */}
            {lessonLoading && (
              <div className="py-24 flex flex-col items-center justify-center space-y-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#F89820] border-t-transparent animate-spin" />
                <span className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>Loading lesson content…</span>
              </div>
            )}

            {/* Error / Unavailable State */}
            {!lessonLoading && lessonError && (
              <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
                <h3 className={`text-base font-bold font-mono ${isDark ? 'text-white' : 'text-[#172033]'}`}>{lessonError}</h3>
                <p className={`text-xs font-mono ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>Please select another lesson from the curriculum sidebar.</p>
              </div>
            )}

            {/* Active Lesson Content (Rich, Topic-Specific) */}
            {!lessonLoading && !lessonError && activeLesson && (
              <div className="space-y-8 max-w-4xl mx-auto">

                {/* 1. Header & Navigation Top Row */}
                <div className={`space-y-3 pb-6 border-b ${isDark ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30">
                        LESSON {activeLesson.lessonNumber} OF {selectedCourse.totalLessons}
                      </span>
                      {activeLesson.module && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono border ${isDark ? 'text-gray-400 bg-white/5 border-white/10' : 'text-[#64748B] bg-[#F1F5F9] border-[#E2E8F0]'}`}>
                          {activeLesson.module}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousLesson}
                        disabled={!hasPrevious}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-mono disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1 ${isDark ? 'border-white/10 text-gray-300 hover:text-white hover:bg-white/5' : 'border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'}`}
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Previous</span>
                      </button>
                      <button
                        onClick={handleNextLesson}
                        disabled={!hasNext}
                        className="px-3 py-1.5 rounded-lg bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30 hover:bg-[#F89820] hover:text-black text-xs font-mono font-semibold disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-[#172033]'}`}>
                    {activeLesson.title}
                  </h1>
                </div>

                {/* 2. Introduction & Definition */}
                {activeLesson.introduction && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-[#F89820]" />
                      <span>Introduction & Core Concept</span>
                    </h2>
                    <p className="text-sm text-gray-300 leading-relaxed font-sans">
                      {activeLesson.introduction}
                    </p>

                    {activeLesson.definition && (
                      <div className={`p-4 rounded-xl border-l-4 border-[#F89820] text-sm leading-relaxed font-sans ${isDark ? 'bg-gradient-to-r from-[#F89820]/10 via-[#151F32] to-[#151F32] text-gray-200' : 'bg-[#FFF7ED] text-[#334155]'}`}>
                        <span className={`font-bold block mb-1 ${isDark ? 'text-white' : 'text-[#172033]'}`}>Clear Technical Definition:</span>
                        {activeLesson.definition}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Detailed Explanation */}
                {activeLesson.explanation && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-[#3B82F6]" />
                      <span>Detailed Explanation</span>
                    </h2>
                    <div className={`text-sm whitespace-pre-line leading-relaxed font-sans p-5 rounded-2xl border space-y-2 ${isDark ? 'text-gray-300 bg-[#111A2C] border-white/5' : 'text-[#334155] bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                      {activeLesson.explanation}
                    </div>
                  </div>
                )}

                {/* 4. Important Concepts & Edge Cases */}
                {activeLesson.importantConcepts && activeLesson.importantConcepts.length > 0 && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-[#22C55E]" />
                      <span>Important Concepts to Master</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeLesson.importantConcepts.map((concept, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border space-y-1 ${isDark ? 'bg-[#151F32] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#22C55E]">
                            <Check className="w-3.5 h-3.5" />
                            <span>Concept #{idx + 1}</span>
                          </div>
                          <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#334155]'}`}>{concept}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Java Syntax Reference */}
                {activeLesson.syntax && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-[#F89820]" />
                      <span>Java Syntax Reference</span>
                    </h2>
                    <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${isDark ? 'bg-[#151F32] border-white/5 text-gray-200' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'}`}>
                      <pre>{activeLesson.syntax}</pre>
                    </div>
                  </div>
                )}

                {/* 6. Practical Java Code Examples (At least 3 examples with tabs) */}
                {((activeLesson.codeExamples && activeLesson.codeExamples.length > 0) || activeLesson.codeExample) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h2 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                        <Code className="w-4 h-4 text-[#F89820]" />
                        <span>Practical Java 17 Code Examples ({activeLesson.codeExamples?.length || 1} Examples)</span>
                      </h2>
                    </div>

                    {/* Example Selector Tabs */}
                    {activeLesson.codeExamples && activeLesson.codeExamples.length > 1 && (
                      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
                        {activeLesson.codeExamples.map((ex, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveCodeExampleIndex(idx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center space-x-1.5 whitespace-nowrap ${
                              activeCodeExampleIndex === idx
                                ? 'bg-[#F89820] text-black shadow-md'
                                : isDark ? 'bg-[#151F32] text-gray-300 hover:text-white hover:bg-white/10 border border-white/5' : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#172033] hover:bg-[#E2E8F0] border border-[#E2E8F0]'
                            }`}
                          >
                            <span>Example {idx + 1}</span>
                            <span className="opacity-70 text-[10px]">
                              {idx === 0 ? '• Basic' : idx === 1 ? '• Applied' : '• Edge Case'}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Active Example Display */}
                    {(() => {
                      const currentEx = (activeLesson.codeExamples && activeLesson.codeExamples[activeCodeExampleIndex]) || {
                        title: 'Practical Java 17 Code Example',
                        description: '',
                        code: activeLesson.codeExample || '',
                        output: activeLesson.expectedOutput || ''
                      };
                      const copyKey = `code-ex-${activeCodeExampleIndex}`;
                      const isCopied = copiedKey === copyKey;

                      return (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <h3 className="text-xs font-mono font-bold text-white">
                                {currentEx.title}
                              </h3>
                              {currentEx.description && (
                                <p className="text-xs font-sans text-gray-400 mt-0.5">
                                  {currentEx.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleCopyCode(copyKey, currentEx.code)}
                               className="flex items-center space-x-1 text-xs font-mono text-gray-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition"
                            >
                              {isCopied ? <CheckCheck className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? 'Copied!' : 'Copy Code'}</span>
                            </button>
                          </div>

                          <div className={`p-4 rounded-2xl border font-mono text-xs overflow-x-auto shadow-inner ${isDark ? 'bg-[#080D1A] border-white/10 text-gray-200' : 'bg-[#F1F5F9] border-[#E2E8F0] text-[#1E293B]'}`}>
                            <pre>{currentEx.code}</pre>
                          </div>

                          {currentEx.output && (
                            <div className={`p-4 rounded-xl border font-mono text-xs space-y-1 ${isDark ? 'bg-[#070B14] border-[#22C55E]/20' : 'bg-[#F0FDF4] border-[#22C55E]/30'}`}>
                              <div className="flex items-center space-x-2 text-gray-500 text-[11px] uppercase tracking-wider">
                                <Terminal className="w-3.5 h-3.5 text-[#22C55E]" />
                                <span>Console Expected Output</span>
                              </div>
                              <div className="text-[#22C55E] pt-1 whitespace-pre-line font-mono">
                                {currentEx.output}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 7. Real-World Architecture & Use Case */}
                {activeLesson.realWorldExample && (
                  <div className={`p-5 rounded-2xl border space-y-2 ${isDark ? 'bg-gradient-to-br from-[#151F32] to-[#0F1A2E] border-white/5' : 'bg-[#FFF7ED] border-[#FED7AA]'}`}>
                    <h3 className="text-xs font-mono font-bold text-[#F89820] uppercase tracking-wider flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Enterprise Production Use Case</span>
                    </h3>
                    <p className={`text-xs leading-relaxed font-sans ${isDark ? 'text-gray-300' : 'text-[#334155]'}`}>
                      {activeLesson.realWorldExample}
                    </p>
                  </div>
                )}

                {/* 8. Common Mistakes and How to Avoid Them */}
                {activeLesson.commonMistakes && activeLesson.commonMistakes.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>Common Pitfalls & How to Avoid Them</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {activeLesson.commonMistakes.map((mistake, idx) => (
                        <div key={idx} className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-[#111A2C] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                          <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-500">
                            <span className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-500 border border-amber-400/20 flex items-center justify-center text-[10px]">
                              !
                            </span>
                            <span>{mistake.title}</span>
                          </div>
                          <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#334155]'}`}>
                            {mistake.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                            {mistake.badCode && (
                              <div className={`p-3.5 rounded-xl border space-y-1.5 font-mono text-xs ${isDark ? 'bg-red-950/20 border-red-500/20 text-red-200' : 'bg-red-50/80 border-red-200 text-red-900'}`}>
                                <div className={`text-[11px] font-bold flex items-center space-x-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                                  <span>❌ Common Bug / Anti-Pattern:</span>
                                </div>
                                <div className="overflow-x-auto">
                                  <pre>{mistake.badCode}</pre>
                                </div>
                              </div>
                            )}
                            {mistake.goodCode && (
                              <div className={`p-3.5 rounded-xl border space-y-1.5 font-mono text-xs ${isDark ? 'bg-emerald-950/20 border-emerald-500/20 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'}`}>
                                <div className={`text-[11px] font-bold flex items-center space-x-1 ${isDark ? 'text-[#22C55E]' : 'text-emerald-700'}`}>
                                  <span>✅ Recommended Fix:</span>
                                </div>
                                <div className="overflow-x-auto">
                                  <pre>{mistake.goodCode}</pre>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 9. Technical Interview Questions */}
                {((activeLesson.interviewQuestions && activeLesson.interviewQuestions.length > 0) || (activeLesson.practiceQuestions && activeLesson.practiceQuestions.length > 0)) && (
                  <div className="space-y-3">
                    <h2 className="text-sm font-mono font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-2">
                      <HelpCircle className="w-4 h-4 text-[#3B82F6]" />
                      <span>Technical Interview Questions & Answers</span>
                    </h2>
                    <div className="space-y-3">
                      {(activeLesson.interviewQuestions || activeLesson.practiceQuestions || []).map((q, idx) => (
                        <div key={idx} className={`p-4 rounded-xl border space-y-2 ${isDark ? 'bg-[#151F32] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                          <div className={`text-xs font-mono font-bold flex items-start space-x-2 ${isDark ? 'text-white' : 'text-[#172033]'}`}>
                            <span className="text-[#3B82F6]">Q{idx + 1}:</span>
                            <span>{q.question}</span>
                          </div>
                          <div className={`text-xs font-mono pl-3 border-l-2 border-[#3B82F6] leading-relaxed ${isDark ? 'text-gray-300' : 'text-[#334155]'}`}>
                            <strong className={isDark ? 'text-gray-400' : 'text-[#64748B]'}>Answer: </strong>{q.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 10. Practice Coding Challenge with Test Cases */}
                {((activeLesson.practiceProblems && activeLesson.practiceProblems.length > 0) || (activeLesson.miniExercise && activeLesson.miniExercise.prompt)) && (
                  <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#111A2C] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                    {(() => {
                      const problem = (activeLesson.practiceProblems && activeLesson.practiceProblems[0]) || {
                        title: 'Mini Hands-On Coding Exercise',
                        description: activeLesson.miniExercise?.prompt || '',
                        starterCode: activeLesson.miniExercise?.starterCode || '',
                        solution: activeLesson.miniExercise?.solution || '',
                        testCases: []
                      };

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-[#F89820]">
                              <Code className="w-4 h-4" />
                              <span>{problem.title}</span>
                            </div>
                            <span className={`text-[11px] font-mono px-2 py-0.5 rounded-full border ${isDark ? 'bg-white/5 text-gray-400 border-white/10' : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'}`}>
                              Interactive Challenge
                            </span>
                          </div>

                          <p className={`text-xs font-sans leading-relaxed ${isDark ? 'text-gray-200' : 'text-[#334155]'}`}>
                            {problem.description}
                          </p>

                          {/* Test cases table */}
                          {problem.testCases && problem.testCases.length > 0 && (
                            <div className="space-y-2">
                              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider block ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>
                                Sample Test Cases:
                              </span>
                              <div className={`border rounded-xl overflow-hidden font-mono text-xs ${isDark ? 'border-white/10' : 'border-[#E2E8F0]'}`}>
                                <table className="w-full text-left">
                                  <thead className={isDark ? 'bg-[#151F32] text-gray-400 text-[11px]' : 'bg-[#F1F5F9] text-[#64748B] text-[11px]'}>
                                    <tr>
                                      <th className="p-2.5">Input</th>
                                      <th className="p-2.5">Expected Output</th>
                                      <th className="p-2.5 hidden sm:table-cell">Explanation</th>
                                    </tr>
                                  </thead>
                                  <tbody className={`divide-y ${isDark ? 'divide-white/5 bg-[#080D1A] text-gray-300' : 'divide-[#E2E8F0] bg-white text-[#334155]'}`}>
                                    {problem.testCases.map((tc, tcIdx) => (
                                      <tr key={tcIdx}>
                                        <td className="p-2.5 text-[#F89820] font-semibold">{tc.input}</td>
                                        <td className="p-2.5 text-[#22C55E] font-semibold">{tc.output}</td>
                                        <td className={`p-2.5 hidden sm:table-cell text-[11px] ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>{tc.explanation || '—'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Starter Code */}
                          {problem.starterCode && (
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className={`text-[11px] font-mono ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>Starter Code Scaffold:</span>
                                <button
                                  onClick={() => handleCopyCode('starter-code', problem.starterCode || '')}
                                  className={`flex items-center space-x-1 text-[11px] font-mono px-2 py-1 rounded transition ${isDark ? 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10' : 'text-[#64748B] hover:text-[#172033] bg-[#F1F5F9] hover:bg-[#E2E8F0]'}`}
                                >
                                  {copiedKey === 'starter-code' ? <CheckCheck className="w-3 h-3 text-[#22C55E]" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedKey === 'starter-code' ? 'Copied!' : 'Copy'}</span>
                                </button>
                              </div>
                              <div className={`p-3.5 rounded-xl border font-mono text-xs overflow-x-auto ${isDark ? 'bg-[#080D1A] border-white/10 text-gray-300' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'}`}>
                                <pre>{problem.starterCode}</pre>
                              </div>
                            </div>
                          )}

                          {/* Solution Reveal */}
                          {problem.solution && (
                            <div className={`pt-2 border-t ${isDark ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                              <button
                                onClick={() => setShowExerciseSolution(!showExerciseSolution)}
                                className="text-xs font-mono text-[#F89820] hover:underline flex items-center space-x-1 font-semibold"
                              >
                                <span>{showExerciseSolution ? 'Hide Reference Solution' : 'Reveal Reference Solution →'}</span>
                              </button>
                              {showExerciseSolution && (
                                <div className={`mt-2 p-3.5 rounded-xl border font-mono text-xs overflow-x-auto animate-in fade-in ${isDark ? 'bg-[#151F32] border-[#22C55E]/30 text-[#22C55E]' : 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]'}`}>
                                  <pre>{problem.solution}</pre>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 11. Summary & Key Takeaways */}
                {(activeLesson.summary || (activeLesson.keyPoints && activeLesson.keyPoints.length > 0)) && (
                  <div className={`p-5 rounded-2xl border space-y-3 ${isDark ? 'bg-gradient-to-r from-emerald-950/20 via-[#151F32] to-[#151F32] border-emerald-500/20' : 'bg-[#F0FDF4] border-[#86EFAC]'}`}>
                    <h2 className="text-sm font-mono font-semibold text-[#16A34A] uppercase tracking-wider flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                      <span>Lesson Summary & Core Takeaways</span>
                    </h2>
                    {activeLesson.summary && (
                      <div className={`text-xs font-mono whitespace-pre-line leading-relaxed ${isDark ? 'text-gray-200' : 'text-[#166534]'}`}>
                        {activeLesson.summary}
                      </div>
                    )}
                    {activeLesson.keyPoints && activeLesson.keyPoints.length > 0 && !activeLesson.summary && (
                      <ul className="space-y-2">
                        {activeLesson.keyPoints.map((point, idx) => (
                          <li key={idx} className={`flex items-start space-x-2 text-xs font-mono ${isDark ? 'text-gray-300' : 'text-[#166534]'}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] mt-1.5 flex-shrink-0" />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 11. Conceptual Checkpoint Quiz */}
                {activeLesson.quizQuestion && (
                  <div className={`p-5 rounded-2xl border space-y-4 ${isDark ? 'bg-[#151F32] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                    <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-[#F89820]">
                      <HelpCircle className="w-4 h-4" />
                      <span>Checkpoint Quiz</span>
                    </div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#172033]'}`}>{activeLesson.quizQuestion}</p>
                    <div className="space-y-2">
                      {activeLesson.quizOptions?.map((opt, idx) => {
                        let btnStyle = isDark
                          ? 'bg-[#0B1120] border-white/10 text-gray-300 hover:border-white/30'
                          : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]';
                        if (quizSubmitted) {
                          if (idx === activeLesson.quizCorrectIndex) btnStyle = isDark ? 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E] font-bold' : 'bg-[#DCFCE7] border-[#16A34A] text-[#15803D] font-bold';
                          else if (selectedQuizAnswer === idx) btnStyle = isDark ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-red-50 border-red-400 text-red-700';
                        } else if (selectedQuizAnswer === idx) {
                          btnStyle = isDark ? 'bg-[#F89820]/20 border-[#F89820] text-white font-medium' : 'bg-[#FFF7ED] border-[#F89820] text-[#C2410C] font-semibold';
                        }
                        return (
                          <div
                            key={idx}
                            onClick={() => !quizSubmitted && setSelectedQuizAnswer(idx)}
                            className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && idx === activeLesson.quizCorrectIndex && <Check className="w-4 h-4 text-[#16A34A]" />}
                          </div>
                        );
                      })}
                    </div>
                    {!quizSubmitted ? (
                      <button
                        onClick={() => setQuizSubmitted(true)}
                        disabled={selectedQuizAnswer === null}
                        className="px-4 py-2 rounded-lg bg-[#F89820] text-black font-mono text-xs font-bold disabled:opacity-40 transition"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <div className="text-xs font-mono">
                        {selectedQuizAnswer === activeLesson.quizCorrectIndex
                          ? <span className="text-[#16A34A] font-bold">✓ Correct! Excellent mastery.</span>
                          : <span className="text-red-500 font-bold">✗ Incorrect. Review the lesson explanation above!</span>
                        }
                      </div>
                    )}
                  </div>
                )}

                {/* 12. Bottom Navigation & Completion Row */}
                <div className={`pt-6 border-t flex items-center justify-between flex-wrap gap-4 ${isDark ? 'border-white/5' : 'border-[#E2E8F0]'}`}>
                  <button
                    onClick={handlePreviousLesson}
                    disabled={!hasPrevious}
                    className={`px-4 py-2.5 rounded-xl border font-mono text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition flex items-center space-x-1.5 ${isDark ? 'border-white/10 text-gray-300 hover:text-white hover:bg-white/5' : 'border-[#E2E8F0] text-[#64748B] hover:text-[#172033] hover:bg-[#F1F5F9]'}`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Lesson</span>
                  </button>

                  <button
                    onClick={handleCompleteLesson}
                    disabled={activeLesson.isCompleted}
                    className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center space-x-2 transition ${
                      activeLesson.isCompleted
                        ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 cursor-default'
                        : 'bg-gradient-to-r from-[#22C55E] to-emerald-600 text-white shadow-glow-green hover:opacity-95'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>{activeLesson.isCompleted ? 'Lesson Completed ✓' : 'Mark Lesson as Complete'}</span>
                  </button>

                  <button
                    onClick={handleNextLesson}
                    disabled={!hasNext}
                    className="px-4 py-2.5 rounded-xl bg-[#F89820] text-black font-mono text-xs font-bold disabled:opacity-30 disabled:pointer-events-none hover:bg-[#fca83a] transition flex items-center space-x-1.5"
                  >
                    <span>Next Lesson</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Modal */}
        {certCourse && (
          <CertificateModal
            isOpen={!!certCourse}
            onClose={() => setCertCourse(null)}
            courseTitle={certCourse.title}
            courseId={certCourse.id}
            userName={JSON.parse(localStorage.getItem('oracle_user') || '{}').fullName || 'Developer'}
            isEarned={canGetCert}
          />
        )}
      </div>
    );
  }

  // ─── COURSES CATALOG + MY COURSES VIEW ───────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center space-x-2.5 ${isDark ? 'text-white' : 'text-[#172033]'}`}>
            <BookOpen className="w-6 h-6 text-[#F89820]" />
            <span>Java Programming Courses</span>
          </h1>
          <p className={`text-xs font-mono mt-1 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            20 expert Java tracks — 50+ concepts each — 100% Free Lifetime Access
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#16A34A]/15 border border-[#16A34A]/40 text-xs font-mono text-[#16A34A] font-bold">
          <Sparkles className="w-4 h-4 text-[#16A34A]" />
          <span>All 20 Tracks 100% Free</span>
        </div>
      </div>

      {/* Tabs: Catalog | My Courses */}
      <div className={`flex rounded-xl p-1 border text-xs font-mono w-fit ${
        isDark ? 'bg-[#151F32] border-white/5' : 'bg-[#F1F5F9] border-[#E2E8F0]'
      }`}>
        <button
          onClick={() => setViewTab('catalog')}
          className={`px-5 py-2 rounded-lg font-semibold transition ${
            viewTab === 'catalog'
              ? 'bg-[#F89820] text-black shadow-md'
              : isDark ? 'text-gray-400 hover:text-white' : 'text-[#64748B] hover:text-[#172033]'
          }`}
        >
          ALL COURSES (20)
        </button>
        <button
          onClick={() => setViewTab('my-courses')}
          className={`px-5 py-2 rounded-lg font-semibold transition flex items-center space-x-1.5 ${
            viewTab === 'my-courses'
              ? 'bg-[#F89820] text-black shadow-md'
              : isDark ? 'text-gray-400 hover:text-white' : 'text-[#64748B] hover:text-[#172033]'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>IN PROGRESS {inProgressCourses.length > 0 ? `(${inProgressCourses.length})` : ''}</span>
        </button>
      </div>

      {/* ─── MY COURSES (IN PROGRESS) TAB ─── */}
      {viewTab === 'my-courses' && (
        <div>
          {inProgressCourses.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto" />
              <p className="text-gray-400 font-mono text-sm">You haven't started any courses yet.</p>
              <p className="text-gray-600 font-mono text-xs">All 20 Java tracks are 100% free. Choose a track below to begin learning!</p>
              <button onClick={() => setViewTab('catalog')} className="px-5 py-2 rounded-xl bg-[#F89820] text-black font-mono font-bold text-xs">
                Browse Free Courses →
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressCourses.map((course) => (
                <div key={course.id} className="glass-card rounded-2xl border border-white/5 p-5 space-y-4 hover:border-[#22C55E]/30 transition">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20">
                      100% FREE ACCESS
                    </span>
                    <span className="text-[10px] font-mono text-gray-500">
                      {course.totalLessons} Lessons
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{course.title}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{course.description}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-gray-400">{course.completedLessons || 0} / {course.totalLessons} lessons</span>
                      <span className={course.progressPercent === 100 ? 'text-[#22C55E] font-bold' : 'text-[#F89820]'}>
                        {course.progressPercent || 0}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${course.progressPercent === 100 ? 'bg-gradient-to-r from-[#22C55E] to-emerald-400' : 'bg-gradient-to-r from-[#F89820] to-orange-400'}`}
                        style={{ width: `${course.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleOpenCourse(course.slug)}
                      className="flex-1 py-2 rounded-lg bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-mono text-xs font-semibold hover:bg-[#22C55E] hover:text-black transition flex items-center justify-center space-x-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Continue Learning</span>
                    </button>

                    {course.isCompleted ? (
                      <button
                        onClick={() => { setSelectedCourse(course); setCertCourse(course); }}
                        className="p-2 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black hover:opacity-90 transition shadow-glow-orange animate-pulse"
                        title="Download Your Certificate!"
                      >
                        <Award className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="p-2 rounded-lg bg-white/5 text-gray-600 cursor-not-allowed" title={`Complete all lessons to earn certificate (${course.progressPercent || 0}%)`}>
                        <Lock className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CATALOG TAB (ALL 20 COURSES FREE) ─── */}
      {viewTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="glass-card rounded-2xl border border-white/5 p-5 hover:border-[#22C55E]/40 transition flex flex-col justify-between space-y-4 group relative"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    course.difficulty === 'Beginner' ? 'bg-[#22C55E]/15 text-[#22C55E]'
                    : course.difficulty === 'Intermediate' ? 'bg-[#3B82F6]/15 text-[#3B82F6]'
                    : 'bg-[#F89820]/15 text-[#F89820]'
                  }`}>
                    {course.difficulty}
                  </span>
                  <div className="flex items-center text-xs font-mono font-bold text-[#22C55E] bg-[#22C55E]/10 px-2.5 py-0.5 rounded border border-[#22C55E]/20">
                    <span>FREE</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-[#F89820] transition line-clamp-2">
                  {course.title}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">{course.description}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-white/5">
                <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
                  <span>{course.totalLessons} Lessons</span>
                  <span>{course.estimatedDuration}</span>
                </div>

                {/* Progress bar if user has made progress */}
                {(course.progressPercent || 0) > 0 && (
                  <div className="space-y-1">
                    <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#F89820] to-[#22C55E] rounded-full"
                        style={{ width: `${course.progressPercent || 0}%` }}
                      />
                    </div>
                    <div className="text-[10px] font-mono text-gray-500">{course.progressPercent || 0}% complete</div>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleOpenCourse(course.slug)}
                    className="flex-1 py-2 rounded-lg bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-mono text-xs font-semibold hover:bg-[#22C55E] hover:text-black transition flex items-center justify-center space-x-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{(course.progressPercent || 0) > 0 ? 'Continue Learning' : 'Start Course'}</span>
                  </button>

                  {course.isCompleted ? (
                    <button
                      onClick={() => { setSelectedCourse(course); setCertCourse(course); }}
                      className="p-2 rounded-lg bg-gradient-to-r from-[#F89820] to-[#E65100] text-black hover:opacity-90 transition shadow-glow-orange"
                      title="Download Certificate"
                    >
                      <Award className="w-4 h-4" />
                    </button>
                  ) : (
                    <div
                      className="p-2 rounded-lg bg-white/5 text-gray-600 cursor-not-allowed"
                      title={`Complete all lessons to earn certificate (${course.progressPercent || 0}%)`}
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificate Modal — strictly earned at 100% completion */}
      {certCourse && (
        <CertificateModal
          isOpen={!!certCourse}
          onClose={() => setCertCourse(null)}
          courseTitle={certCourse.title}
          courseId={certCourse.id}
          userName={JSON.parse(localStorage.getItem('oracle_user') || '{}').fullName || 'Developer'}
          isEarned={certCourse.isCompleted || false}
        />
      )}
    </div>
  );
};
