import express from 'express';
import { JAVA_COURSES } from '../data/coursesData.js';
import { store } from '../services/store.js';

const router = express.Router();

// ── 1. List all courses (100% free for all users) ──────────────────────────────
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';
  const progressList = store.getUserLessonProgress(userId);

  const coursesWithStatus = JAVA_COURSES.map(course => {
    const completedLessons = progressList.filter(
      lp => lp.courseId === course.id && lp.completed
    ).length;
    const progressPercent = course.totalLessons > 0
      ? Math.round((completedLessons / course.totalLessons) * 100)
      : 0;
    const isCompleted = progressPercent === 100;

    return {
      id: course.id,
      slug: course.slug,
      title: course.title,
      description: course.description,
      difficulty: course.difficulty,
      totalLessons: course.totalLessons,
      estimatedDuration: course.estimatedDuration,
      priceINR: 0,
      isFree: true,
      isPurchased: true,
      thumbnail: course.thumbnail,
      category: course.category,
      completedLessons,
      progressPercent,
      isCompleted
    };
  });

  res.json({ courses: coursesWithStatus, totalCourses: JAVA_COURSES.length });
});

// ── 2. Dynamic Fetch: Single Lesson by Course ID and Lesson ID ────────────────
router.get('/:courseId/lessons/:lessonId', (req, res) => {
  const { courseId, lessonId } = req.params;
  const userId = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';

  // Find course by slug or numeric ID
  const course = JAVA_COURSES.find(c => c.slug === courseId || String(c.id) === courseId);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }

  // Find lesson by numeric id or lessonNumber
  const lesson = (course.lessons || []).find(
    l => String(l.id) === lessonId || String(l.lessonNumber) === lessonId
  );

  if (!lesson) {
    return res.status(404).json({ error: 'Lesson content is currently unavailable' });
  }

  // Check user completion status for this specific lesson
  const userProgress = store.getUserLessonProgress(userId, course.id);
  const isCompleted = userProgress.some(lp => lp.lessonId === lesson.id && lp.completed);

  res.json({
    courseId: course.id,
    courseTitle: course.title,
    courseSlug: course.slug,
    totalLessons: course.totalLessons,
    lesson: {
      ...lesson,
      isCompleted,
      isLocked: false
    }
  });
});

// ── 3. Single course details (All lessons unlocked & free) ────────────────────
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const userId   = req.headers['x-user-id'] || req.query.userId || 'usr_oracle_demo_01';

  const course = JAVA_COURSES.find(c => c.slug === slug || String(c.id) === slug);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const userProgress       = store.getUserLessonProgress(userId, course.id);
  const completedLessonIds = new Set(userProgress.map(lp => lp.lessonId));
  const completedLessons   = userProgress.filter(lp => lp.completed).length;
  const progressPercent    = course.totalLessons > 0
    ? Math.round((completedLessons / course.totalLessons) * 100)
    : 0;
  const isCompleted = progressPercent === 100;

  // Map lessons with completion status
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

// ── 4. Mark lesson complete ───────────────────────────────────────────────────
router.post('/complete-lesson', (req, res) => {
  const userId = req.headers['x-user-id'] || req.body?.userId || 'usr_oracle_demo_01';
  const { courseId, lessonId } = req.body;

  if (!courseId || !lessonId) {
    return res.status(400).json({ error: 'courseId and lessonId are required' });
  }

  store.markLessonComplete({ userId, courseId: Number(courseId), lessonId: Number(lessonId) });

  // Check if all lessons are now complete → isCompleted
  const course = JAVA_COURSES.find(c => c.id === Number(courseId));
  const isCompleted = course
    ? store.isCourseCompleted(userId, Number(courseId), course.totalLessons)
    : false;

  res.json({ success: true, message: 'Lesson progress saved', isCompleted });
});

export default router;
