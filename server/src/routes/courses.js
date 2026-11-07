import express from 'express';
import { JAVA_COURSES } from '../data/coursesData.js';
import { store } from '../services/store.js';

const router = express.Router();

// ── List all courses (100% free for all users) ─────────────────────────────────
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';

  const progressList = store.getUserLessonProgress(userId);

  const coursesWithStatus = JAVA_COURSES.map(course => {
    const completedLessons = progressList.filter(
      lp => lp.courseId === course.id && lp.completed
    ).length;
    const progressPercent  = course.totalLessons > 0
      ? Math.round((completedLessons / course.totalLessons) * 100)
      : 0;
    const isCompleted = progressPercent === 100;

    return {
      ...course,
      priceINR:         0,
      isFree:           true,
      isPurchased:      true, // All courses are 100% free and fully unlocked
      completedLessons,
      progressPercent,
      isCompleted
    };
  });

  res.json({ courses: coursesWithStatus, totalCourses: JAVA_COURSES.length });
});

// ── Single course details (All lessons unlocked & free) ────────────────────────
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const userId   = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';

  const course = JAVA_COURSES.find(c => c.slug === slug || String(c.id) === slug);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const userProgress        = store.getUserLessonProgress(userId, course.id);
  const completedLessonIds  = new Set(userProgress.map(lp => lp.lessonId));
  const completedLessons    = userProgress.filter(lp => lp.completed).length;
  const progressPercent     = course.totalLessons > 0
    ? Math.round((completedLessons / course.totalLessons) * 100)
    : 0;
  const isCompleted = progressPercent === 100;

  // All lessons unlocked for free learning
  const lessons = (course.lessons || []).map(lesson => ({
    ...lesson,
    isLocked:    false,
    isCompleted: completedLessonIds.has(lesson.id)
  }));

  res.json({
    ...course,
    priceINR:         0,
    isFree:           true,
    isPurchased:      true,
    completedLessons,
    progressPercent,
    isCompleted,
    lessons
  });
});

// ── Mark lesson complete ──────────────────────────────────────────────────────
router.post('/complete-lesson', (req, res) => {
  const userId = req.headers['x-user-id'] || req.body?.userId || 'usr_oracle_demo_01';
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    return res.status(400).json({ error: 'courseId and lessonId are required' });
  }

  store.markLessonComplete({ userId, courseId, lessonId });

  // Check if all lessons are now complete → isCompleted
  const course = JAVA_COURSES.find(c => c.id === Number(courseId));
  const isCompleted = course
    ? store.isCourseCompleted(userId, courseId, course.totalLessons)
    : false;

  res.json({ success: true, message: 'Lesson progress saved', isCompleted });
});

export default router;
