import crypto from 'crypto';

/**
 * High-performance in-memory state manager for OOP'S ORACLE
 * Holds users, purchases, payment records, submissions, streaks, heatmap data.
 */

const defaultUser = {
  id: 'usr_oracle_demo_01',
  email: 'developer@oopsoracle.com',
  username: 'JavaMaster',
  fullName: 'Alex Vance',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  bio: "Mastering Java & LeetCode Hard problems on OOP'S ORACLE.",
  currentStreak: 0,
  longestStreak: 0,
  createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
};

// All in-memory collections — fresh on every server start
const submissions = [];
const coursePurchases = [];    // Confirmed paid & verified purchases
const paymentOrders = [];      // Raw Razorpay orders (pending → captured / failed)
const lessonProgress = [];

const users = [{ ...defaultUser, passwordHash: 'demo123' }];

const userHeatmaps = { usr_oracle_demo_01: {} };

export const store = {
  users,
  submissions,
  coursePurchases,
  paymentOrders,
  lessonProgress,
  userHeatmaps,

  // ── Users ─────────────────────────────────────────────────────────────
  findUserByEmail(email) {
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  findUserById(id) {
    return users.find(u => u.id === id);
  },

  createUser({ email, username, fullName, password }) {
    const id = 'usr_' + crypto.randomBytes(6).toString('hex');
    const newUser = {
      id, email, username, fullName,
      passwordHash: password,
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
      bio: "Java Developer preparing for tech interviews on OOP'S ORACLE.",
      currentStreak: 1,
      longestStreak: 1,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    userHeatmaps[id] = { [new Date().toISOString().split('T')[0]]: 1 };
    return newUser;
  },

  updateUser(id, updates) {
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    return users[idx];
  },

  // ── Submissions ───────────────────────────────────────────────────────
  addSubmission(submission) {
    const sub = {
      id: 'sub_' + crypto.randomBytes(6).toString('hex'),
      submittedAt: new Date().toISOString(),
      ...submission
    };
    submissions.unshift(sub);
    const dateStr = new Date().toISOString().split('T')[0];
    if (!userHeatmaps[sub.userId]) userHeatmaps[sub.userId] = {};
    userHeatmaps[sub.userId][dateStr] = (userHeatmaps[sub.userId][dateStr] || 0) + 1;
    return sub;
  },

  getUserSubmissions(userId) {
    return submissions.filter(s => s.userId === userId);
  },

  // ── Payment Orders (Razorpay) ─────────────────────────────────────────
  createPaymentOrder({ userId, courseId, razorpayOrderId, amount, currency, isSimulation }) {
    const record = {
      id: 'por_' + crypto.randomBytes(6).toString('hex'),
      userId,
      courseId: Number(courseId),
      razorpayOrderId,
      amount: Number(amount) || 500,
      currency: currency || 'INR',
      status: 'pending',          // pending | captured | failed | cancelled
      isSimulation: !!isSimulation,
      razorpayPaymentId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    paymentOrders.push(record);
    return record;
  },

  getPaymentOrderByRzpId(razorpayOrderId) {
    return paymentOrders.find(o => o.razorpayOrderId === razorpayOrderId);
  },

  updatePaymentOrderStatus(razorpayOrderId, status, razorpayPaymentId = null) {
    const record = paymentOrders.find(o => o.razorpayOrderId === razorpayOrderId);
    if (record) {
      record.status = status;
      record.updatedAt = new Date().toISOString();
      if (razorpayPaymentId) record.razorpayPaymentId = razorpayPaymentId;
    }
    return record;
  },

  // ── Course Purchases (confirmed) ──────────────────────────────────────
  hasPurchasedCourse(userId, courseId) {
    return coursePurchases.some(
      p => p.userId === userId && p.courseId === Number(courseId)
    );
  },

  getUserPurchases(userId) {
    return coursePurchases.filter(p => p.userId === userId);
  },

  addCoursePurchase({ userId, courseId, amount, razorpayPaymentId, razorpayOrderId, isSimulation }) {
    // Idempotent: skip if already purchased
    if (this.hasPurchasedCourse(userId, courseId)) {
      return coursePurchases.find(p => p.userId === userId && p.courseId === Number(courseId));
    }
    const purchase = {
      id: 'pur_' + crypto.randomBytes(6).toString('hex'),
      userId,
      courseId: Number(courseId),
      amount: Number(amount) || 5.00,
      currency: 'INR',
      razorpayPaymentId: razorpayPaymentId || null,
      razorpayOrderId: razorpayOrderId || null,
      isSimulation: !!isSimulation,
      status: 'captured',
      purchasedAt: new Date().toISOString()
    };
    coursePurchases.push(purchase);
    return purchase;
  },

  // ── Lesson Progress ───────────────────────────────────────────────────
  markLessonComplete({ userId, courseId, lessonId }) {
    const existing = lessonProgress.find(
      lp => lp.userId === userId && lp.lessonId === Number(lessonId)
    );
    if (!existing) {
      lessonProgress.push({
        userId,
        courseId: Number(courseId),
        lessonId: Number(lessonId),
        completed: true,
        completedAt: new Date().toISOString()
      });
    }
    return { success: true };
  },

  getUserLessonProgress(userId, courseId) {
    return lessonProgress.filter(
      lp => lp.userId === userId && (!courseId || lp.courseId === Number(courseId))
    );
  },

  /**
   * Returns true only when the user has completed EVERY lesson in a course.
   * @param {string} userId
   * @param {number} courseId
   * @param {number} totalLessons  - total lessons in the course (passed in)
   */
  isCourseCompleted(userId, courseId, totalLessons) {
    if (!totalLessons || totalLessons === 0) return false;
    const completedCount = lessonProgress.filter(
      lp => lp.userId === userId && lp.courseId === Number(courseId) && lp.completed
    ).length;
    return completedCount >= totalLessons;
  },

  // ── Heatmap ───────────────────────────────────────────────────────────
  getUserHeatmap(userId) {
    if (!userHeatmaps[userId]) userHeatmaps[userId] = {};
    return userHeatmaps[userId];
  }
};
