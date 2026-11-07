import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  BookOpen, CheckCircle, Lock, Play, ShieldCheck, ArrowLeft,
  Check, Sparkles, HelpCircle, Code, Award, Trophy, ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import { Course, Lesson } from '../../types';
import { CertificateModal } from '../certificate/CertificateModal';

interface CoursesPageProps {
  initialCourseSlug?: string | null;
  onBackToDashboard: () => void;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ initialCourseSlug, onBackToDashboard }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [isClassroomOpen, setIsClassroomOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Certificate modal
  const [certCourse, setCertCourse] = useState<Course | null>(null);

  // Quiz state
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);

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

  // Open course directly into classroom (100% Free)
  const handleOpenCourse = async (slug: string) => {
    try {
      setLoading(true);
      const fullCourse = await api.getCourse(slug);
      setSelectedCourse(fullCourse);
      setIsClassroomOpen(true);
      if (fullCourse.lessons && fullCourse.lessons.length > 0) {
        setActiveLesson(fullCourse.lessons[0]);
      }
    } catch (err) {
      console.error('Failed to open course:', err);
    } finally {
      setLoading(false);
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

  // Courses that the user has started working on
  const inProgressCourses = courses.filter(c => (c.progressPercent || 0) > 0);

  // ─── CLASSROOM VIEW ─────────────────────────────────────────────────────────
  if (isClassroomOpen && selectedCourse) {
    const prog = selectedCourse.progressPercent ?? 0;
    const canGetCert = prog === 100;

    return (
      <div className="flex flex-col h-[calc(100vh-3.5rem)] bg-[#0B1120]">

        {/* Top Bar */}
        <div className="h-12 bg-[#151F32] border-b border-white/5 px-4 flex items-center justify-between z-20">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsClassroomOpen(false)}
              className="flex items-center space-x-1 text-xs font-mono text-gray-400 hover:text-white transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Courses</span>
            </button>
            <span className="text-gray-600">|</span>
            <span className="text-xs font-mono font-bold text-white truncate max-w-xs sm:max-w-md">
              {selectedCourse.title}
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Progress indicator */}
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono">
              <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#F89820] to-[#22C55E] rounded-full transition-all"
                  style={{ width: `${prog}%` }}
                />
              </div>
              <span className={prog === 100 ? 'text-[#22C55E] font-bold' : 'text-gray-400'}>
                {prog}%
              </span>
            </div>

            {/* Certificate button — unlocked at 100% */}
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
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-500 font-mono text-xs cursor-not-allowed"
                title="Complete all lessons to earn certificate"
              >
                <Lock className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Complete all lessons to earn certificate ({prog}%)</span>
                <span className="sm:hidden">🔒 {prog}%</span>
              </div>
            )}

            <span className="text-xs font-mono text-[#22C55E] items-center space-x-1 hidden sm:flex">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100% Free Access</span>
            </span>
          </div>
        </div>

        {/* Classroom Layout */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

          {/* Sidebar */}
          <div className="lg:col-span-4 border-r border-white/5 bg-[#111A2C] overflow-y-auto p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="text-xs font-mono font-semibold text-gray-400 uppercase">Curriculum</h3>
              <p className="text-[11px] text-gray-500 font-mono">
                {selectedCourse.completedLessons || 0} / {selectedCourse.totalLessons} lessons completed
              </p>
            </div>

            <div className="space-y-1.5 pt-2">
              {selectedCourse.lessons && selectedCourse.lessons.length > 0 ? (
                selectedCourse.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => { setActiveLesson(lesson); setSelectedQuizAnswer(null); setQuizSubmitted(false); }}
                    className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between text-xs font-mono ${
                      activeLesson?.id === lesson.id
                        ? 'bg-[#F89820] text-black font-semibold border-[#F89820]'
                        : 'bg-[#151F32] text-gray-300 hover:text-white border-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px] flex-shrink-0">
                        {lesson.lessonNumber}
                      </span>
                      <span className="truncate">{lesson.title}</span>
                    </div>
                    {lesson.isCompleted && (
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${activeLesson?.id === lesson.id ? 'text-black' : 'text-[#22C55E]'}`} />
                    )}
                  </div>
                ))
              ) : (
                <div className="text-xs font-mono text-gray-400 p-4 text-center">
                  Structured lessons are active for this track.
                </div>
              )}
            </div>
          </div>

          {/* Lesson Content */}
          <div className="lg:col-span-8 overflow-y-auto p-6 md:p-8 space-y-6 bg-[#0B1120]">
            {activeLesson ? (
              <div className="space-y-6 max-w-3xl">
                <div>
                  <span className="text-xs font-mono text-[#F89820] font-semibold">Lesson {activeLesson.lessonNumber}</span>
                  <h1 className="text-2xl font-bold text-white mt-1">{activeLesson.title}</h1>
                </div>

                <div className="text-sm text-gray-300 whitespace-pre-line leading-relaxed space-y-3 font-sans">
                  {activeLesson.content}
                </div>

                {activeLesson.codeExample && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
                      <Code className="w-4 h-4 text-[#F89820]" />
                      <span>Java 17 Code Demonstration</span>
                    </h3>
                    <div className="p-4 rounded-xl bg-[#151F32] border border-white/5 font-mono text-xs text-gray-200 overflow-x-auto">
                      <pre>{activeLesson.codeExample}</pre>
                    </div>
                    {activeLesson.expectedOutput && (
                      <div className="p-3 rounded-lg bg-[#0B1120] border border-white/5 font-mono text-xs">
                        <span className="text-gray-500">Console Output:</span>
                        <div className="text-[#22C55E] mt-1 whitespace-pre-line">{activeLesson.expectedOutput}</div>
                      </div>
                    )}
                  </div>
                )}

                {activeLesson.quizQuestion && (
                  <div className="p-5 rounded-2xl bg-[#151F32] border border-white/5 space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-[#F89820]">
                      <HelpCircle className="w-4 h-4" />
                      <span>Conceptual Checkpoint Quiz</span>
                    </div>
                    <p className="text-sm font-semibold text-white">{activeLesson.quizQuestion}</p>
                    <div className="space-y-2">
                      {activeLesson.quizOptions?.map((opt, idx) => {
                        let btnStyle = 'bg-[#0B1120] border-white/10 text-gray-300 hover:border-white/30';
                        if (quizSubmitted) {
                          if (idx === activeLesson.quizCorrectIndex) btnStyle = 'bg-[#22C55E]/20 border-[#22C55E] text-[#22C55E] font-bold';
                          else if (selectedQuizAnswer === idx) btnStyle = 'bg-red-500/20 border-red-500 text-red-400';
                        } else if (selectedQuizAnswer === idx) {
                          btnStyle = 'bg-[#F89820]/20 border-[#F89820] text-white font-medium';
                        }
                        return (
                          <div
                            key={idx}
                            onClick={() => !quizSubmitted && setSelectedQuizAnswer(idx)}
                            className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && idx === activeLesson.quizCorrectIndex && <Check className="w-4 h-4 text-[#22C55E]" />}
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
                          ? <span className="text-[#22C55E] font-bold">✓ Correct! Excellent mastery.</span>
                          : <span className="text-red-400 font-bold">✗ Incorrect. Review the lesson above!</span>
                        }
                      </div>
                    )}
                  </div>
                )}

                {/* Mark Complete */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between flex-wrap gap-3">
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

                  {!canGetCert && (
                    <span className="text-xs font-mono text-gray-500">
                      {selectedCourse.totalLessons - (selectedCourse.completedLessons || 0)} lesson(s) remaining to unlock certificate
                    </span>
                  )}
                  {canGetCert && (
                    <span className="text-xs font-mono text-[#F89820] font-bold animate-pulse">
                      🏆 All done! Click "Get Certificate" above.
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-xs font-mono text-gray-400 py-12 text-center">
                Select a lesson from the left to begin.
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
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <BookOpen className="w-6 h-6 text-[#F89820]" />
            <span>Java Programming Courses</span>
          </h1>
          <p className="text-xs text-[#94A3B8] font-mono mt-1">
            20 expert Java tracks — 50+ concepts each — 100% Free Lifetime Access
          </p>
        </div>
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/40 text-xs font-mono text-[#22C55E] font-bold">
          <Sparkles className="w-4 h-4 text-[#22C55E]" />
          <span>All 20 Tracks 100% Free</span>
        </div>
      </div>

      {/* Tabs: Catalog | My Courses */}
      <div className="flex rounded-xl bg-[#151F32] p-1 border border-white/5 text-xs font-mono w-fit">
        <button
          onClick={() => setViewTab('catalog')}
          className={`px-5 py-2 rounded-lg font-semibold transition ${viewTab === 'catalog' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          ALL COURSES (20)
        </button>
        <button
          onClick={() => setViewTab('my-courses')}
          className={`px-5 py-2 rounded-lg font-semibold transition flex items-center space-x-1.5 ${viewTab === 'my-courses' ? 'bg-[#F89820] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
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
