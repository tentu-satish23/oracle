-- ====================================================================
-- OOP'S ORACLE: Production Supabase PostgreSQL Schema
-- Tagline: Master Java. Master Logic. Build Your Future.
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT DEFAULT '',
    bio TEXT DEFAULT 'Passionate Java Developer solving algorithms on OOP''S ORACLE',
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_active_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. PROBLEMS TABLE (500+ Curated Java Problems)
CREATE TABLE IF NOT EXISTS public.problems (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
    topic TEXT NOT NULL,
    company_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    acceptance_rate NUMERIC(5,2) DEFAULT 65.5,
    description TEXT NOT NULL,
    input_format TEXT NOT NULL,
    output_format TEXT NOT NULL,
    constraints TEXT[] DEFAULT ARRAY[]::TEXT[],
    starter_code TEXT NOT NULL,
    hints TEXT[] DEFAULT ARRAY[]::TEXT[],
    editorial TEXT DEFAULT '',
    time_limit_ms INT DEFAULT 2000,
    memory_limit_mb INT DEFAULT 256,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. PROBLEM TEST CASES TABLE
CREATE TABLE IF NOT EXISTS public.problem_test_cases (
    id SERIAL PRIMARY KEY,
    problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
    is_hidden BOOLEAN DEFAULT FALSE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    explanation TEXT DEFAULT ''
);

-- 4. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
    language TEXT DEFAULT 'Java',
    code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('Accepted', 'Wrong Answer', 'Compilation Error', 'Runtime Error', 'Time Limit Exceeded')),
    runtime_ms INT DEFAULT 0,
    memory_mb NUMERIC(6,2) DEFAULT 0,
    passed_test_cases INT DEFAULT 0,
    total_test_cases INT DEFAULT 0,
    error_message TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. COURSES TABLE (20 Java Courses, ₹5 each)
CREATE TABLE IF NOT EXISTS public.courses (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
    total_lessons INT DEFAULT 10,
    estimated_duration TEXT DEFAULT '4 hours',
    price_inr NUMERIC(10,2) DEFAULT 5.00,
    thumbnail_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.lessons (
    id SERIAL PRIMARY KEY,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    lesson_number INT NOT NULL,
    title TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    code_example TEXT DEFAULT '',
    expected_output TEXT DEFAULT '',
    exercise_prompt TEXT DEFAULT '',
    starter_exercise_code TEXT DEFAULT '',
    quiz_question TEXT DEFAULT '',
    quiz_options JSONB DEFAULT '[]'::JSONB,
    quiz_correct_index INT DEFAULT 0,
    is_free_preview BOOLEAN DEFAULT FALSE
);

-- 7. COURSE PURCHASES (Strictly verified on server)
CREATE TABLE IF NOT EXISTS public.course_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    course_id INT REFERENCES public.courses(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL DEFAULT 5.00,
    currency TEXT DEFAULT 'INR',
    razorpay_order_id TEXT NOT NULL,
    razorpay_payment_id TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- 8. LESSON PROGRESS TABLE
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id INT REFERENCES public.lessons(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT TRUE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- 9. CONTESTS TABLE
CREATE TABLE IF NOT EXISTS public.contests (
    id SERIAL PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Daily', 'Weekly', 'Monthly')),
    description TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL,
    banner_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. CONTEST PROBLEMS TABLE
CREATE TABLE IF NOT EXISTS public.contest_problems (
    id SERIAL PRIMARY KEY,
    contest_id INT REFERENCES public.contests(id) ON DELETE CASCADE,
    problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
    problem_order INT NOT NULL,
    points INT DEFAULT 100
);

-- 11. CONTEST PARTICIPANTS
CREATE TABLE IF NOT EXISTS public.contest_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id INT REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    score INT DEFAULT 0,
    penalty_seconds INT DEFAULT 0,
    rank INT DEFAULT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contest_id, user_id)
);

-- 12. CONTEST SUBMISSIONS
CREATE TABLE IF NOT EXISTS public.contest_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id INT REFERENCES public.contests(id) ON DELETE CASCADE,
    problem_id INT REFERENCES public.problems(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    status TEXT NOT NULL,
    points_awarded INT DEFAULT 0,
    penalty_applied INT DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Public can read profiles, users can only update their own profile
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Problems: Anyone can view problem descriptions
CREATE POLICY "Problems are viewable by everyone" ON public.problems FOR SELECT USING (true);

-- Test cases: Only visible test cases (is_hidden = false) are readable by client!
CREATE POLICY "Public test cases viewable by everyone" ON public.problem_test_cases FOR SELECT USING (is_hidden = false);

-- Submissions: Users can view their own submissions
CREATE POLICY "Users can view own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Courses: Anyone can view courses
CREATE POLICY "Courses viewable by everyone" ON public.courses FOR SELECT USING (true);

-- Course purchases: Users can only see their own purchases
CREATE POLICY "Users can view own purchases" ON public.course_purchases FOR SELECT USING (auth.uid() = user_id);

-- Lesson progress: Users can view and manage their own progress
CREATE POLICY "Users can manage own lesson progress" ON public.lesson_progress FOR ALL USING (auth.uid() = user_id);

-- Contests: Contests viewable by everyone
CREATE POLICY "Contests are viewable by everyone" ON public.contests FOR SELECT USING (true);
CREATE POLICY "Participants viewable by everyone" ON public.contest_participants FOR SELECT USING (true);

-- Notifications: Users only see their notifications
CREATE POLICY "Users view own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Indexes for lightning performance
CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX IF NOT EXISTS idx_problems_topic ON public.problems(topic);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_problem_id ON public.submissions(problem_id);
