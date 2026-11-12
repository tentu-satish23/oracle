import { Problem, Course, Lesson, Contest, User, Submission } from '../types';

const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('oracle_token') || '';
  const user = JSON.parse(localStorage.getItem('oracle_user') || '{}');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'x-user-id': user.id || 'usr_oracle_demo_01'
  };
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async signup(payload: { fullName: string; username: string; email: string; password: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to sign up');
    return data;
  },

  async demoLogin(): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to demo login');
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ success: boolean; message: string; email: string; resetLink?: string; delivered?: boolean; needsSmtpConfig?: boolean }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send reset link');
    return data;
  },

  async verifyResetToken(token: string): Promise<{ valid: boolean; email: string; username: string }> {
    const res = await fetch(`${API_BASE}/auth/verify-reset-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Invalid or expired token');
    return data;
  },

  async resetPassword(payload: { token: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset password');
    return data;
  },

  async changePassword(payload: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to change password');
    return data;
  },

  // Problems
  async getProblems(params: {
    page?: number;
    limit?: number;
    difficulty?: string;
    topic?: string;
    status?: string;
    search?: string;
    sortBy?: string;
    order?: string;
  } = {}) {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.difficulty) query.set('difficulty', params.difficulty);
    if (params.topic) query.set('topic', params.topic);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.sortBy) query.set('sortBy', params.sortBy);
    if (params.order) query.set('order', params.order);

    const res = await fetch(`${API_BASE}/problems?${query.toString()}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch problems');
    return res.json();
  },

  async getProblem(slugOrId: string): Promise<Problem> {
    const res = await fetch(`${API_BASE}/problems/${slugOrId}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to load problem');
    return res.json();
  },

  async getRandomProblem(): Promise<{ slug: string; id: number }> {
    const res = await fetch(`${API_BASE}/problems/random`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Execution
  async runCode(payload: { code: string; problemSlug: string; customTestCases?: any[]; checkAll?: boolean }) {
    const res = await fetch(`${API_BASE}/execute/run`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async submitCode(payload: { code: string; problemSlug: string; userId?: string }) {
    const user = JSON.parse(localStorage.getItem('oracle_user') || '{}');
    const res = await fetch(`${API_BASE}/execute/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ ...payload, userId: user.id || 'usr_oracle_demo_01' })
    });
    return res.json();
  },

  // Courses (100% Free)
  async getCourses(): Promise<{ courses: Course[]; totalCourses: number }> {
    const res = await fetch(`${API_BASE}/courses`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getCourse(slugOrId: string): Promise<Course> {
    const res = await fetch(`${API_BASE}/courses/${slugOrId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getLesson(courseIdOrSlug: string | number, lessonId: string | number): Promise<{ courseId: number; courseTitle: string; courseSlug: string; totalLessons: number; lesson: Lesson }> {
    const res = await fetch(`${API_BASE}/courses/${courseIdOrSlug}/lessons/${lessonId}`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Lesson content is currently unavailable');
    }
    return res.json();
  },

  async completeLesson(courseId: number, lessonId: number) {
    const res = await fetch(`${API_BASE}/courses/complete-lesson`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId, lessonId })
    });
    return res.json();
  },

  async getPaymentStatus(orderId: string) {
    const res = await fetch(`${API_BASE}/payments/status/${orderId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  // Payments (Real Razorpay)
  async createPaymentOrder(courseId: number) {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ courseId })
    });
    const data = await res.json();
    // Throw on duplicate purchase so caller can handle it
    if (res.status === 409) {
      const err: any = new Error(data.message || 'already_purchased');
      err.alreadyPurchased = true;
      throw err;
    }
    if (!res.ok) throw new Error(data.error || 'Failed to create order');
    return data;
  },

  async verifyPayment(payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature?: string;
    courseId: number;
    isSimulation?: boolean;
  }) {
    const res = await fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Contests
  async getContests(): Promise<{ contests: Contest[] }> {
    const res = await fetch(`${API_BASE}/contests`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async getContest(slug: string): Promise<Contest> {
    const res = await fetch(`${API_BASE}/contests/${slug}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async submitContest(slug: string, payload: { problemId: number; code: string; username?: string }) {
    const res = await fetch(`${API_BASE}/contests/${slug}/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async runContestCode(slug: string, payload: { problemId: number; code: string; customTestCases?: any[]; checkAll?: boolean }) {
    const res = await fetch(`${API_BASE}/contests/${slug}/run`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  // Profile
  async getProfile(userId: string) {
    const res = await fetch(`${API_BASE}/profile/${userId}`, {
      headers: getHeaders()
    });
    return res.json();
  },

  async updateProfile(userId: string, data: { fullName?: string; bio?: string; avatarUrl?: string }) {
    const res = await fetch(`${API_BASE}/profile/${userId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
