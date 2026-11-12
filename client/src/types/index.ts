export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  input: string;
  expectedOutput: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface ProblemExample {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: number;
  slug: string;
  title: string;
  difficulty: Difficulty;
  topic: string;
  companyTags: string[];
  acceptanceRate: number;
  description: string;
  inputFormat: string;
  outputFormat: string;
  examples: ProblemExample[];
  constraints: string[];
  starterCode: string;
  hints: string[];
  editorial?: string;
  testCases: TestCase[];
  isSolved?: boolean;
  discussions?: {
    author: string;
    text: string;
    upvotes: number;
    time: string;
  }[];
  userSubmissions?: Submission[];
}

export interface Submission {
  id: string;
  userId: string;
  problemId: number;
  problemTitle: string;
  problemDifficulty: Difficulty;
  language: string;
  code?: string;
  status: 'Accepted' | 'Wrong Answer' | 'Compilation Error' | 'Runtime Error' | 'Time Limit Exceeded';
  runtime: number;
  memory: number;
  passedTests: number;
  totalTests: number;
  errorMessage?: string;
  submittedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  currentStreak: number;
  longestStreak: number;
  createdAt: string;
}

export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  output: string;
}

export interface CommonMistake {
  title: string;
  description: string;
  badCode?: string;
  goodCode?: string;
}

export interface InterviewQuestion {
  question: string;
  answer: string;
}

export interface LessonTestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface LessonPracticeProblem {
  title: string;
  description: string;
  starterCode?: string;
  solution?: string;
  testCases?: LessonTestCase[];
}

export interface Lesson {
  id: number;
  courseId?: number;
  lessonNumber: number;
  title: string;
  module?: string;
  duration?: string;
  introduction?: string;
  definition?: string;
  explanation?: string;
  importantConcepts?: string[];
  syntax?: string;
  content: string;
  codeExamples?: CodeExample[];
  codeExample?: string;
  expectedOutput?: string;
  realWorldExample?: string;
  commonMistakes?: CommonMistake[];
  interviewQuestions?: InterviewQuestion[];
  practiceQuestions?: { question: string; answer: string }[];
  practiceProblems?: LessonPracticeProblem[];
  miniExercise?: {
    prompt: string;
    starterCode: string;
    solution: string;
  };
  summary?: string;
  keyPoints?: string[];
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  isFreePreview?: boolean;
  isLocked?: boolean;
  isCompleted?: boolean;
}

export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  totalLessons: number;
  estimatedDuration: string;
  priceINR: number;
  thumbnail: string;
  isPurchased?: boolean;
  isFree?: boolean;
  isCompleted?: boolean;
  completedLessons?: number;
  progressPercent?: number;
  lessons?: Lesson[];
}

export interface ContestProblem {
  id: number;
  problemId: number;
  title: string;
  difficulty: Difficulty;
  points: number;
  description?: string;
  inputFormat?: string;
  outputFormat?: string;
  examples?: ProblemExample[];
  constraints?: string[];
  starterCode?: string;
  slug?: string;
  testCases?: TestCase[];
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar: string;
  solvedCount: number;
  totalScore: number;
  finishTime: string;
  penalty: number;
}

export interface Contest {
  id: number;
  slug: string;
  type: 'Daily' | 'Weekly' | 'Monthly';
  title: string;
  description: string;
  difficulty: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalPoints: number;
  participantsCount: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  problems: ContestProblem[];
  rules: string[];
  leaderboard: LeaderboardEntry[];
}
