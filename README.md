# ☕ OOP'S ORACLE

> **Master Java. Master Logic. Build Your Future.**

**OOP'S ORACLE** is a production-quality Java learning, technical interview preparation, coding practice, and competitive programming platform inspired by LeetCode, with original branding, a cinematic opening experience, and an extensive repository of 520+ curated problems.

---

## 🌟 Key Features

### 1. 🎬 Cinematic 3D Coffee Intro (First Impression)
- High-budget cinematic title reveal before login/signup.
- **Scene 1 (Studio Reveal):** Dark black/navy obsidian studio setting with dramatic lighting, 3D kettle and ceramic coffee cup.
- **Scene 2 (Coffee Pouring):** Kettle slowly tilts and pours rich roasted black coffee into the ceramic cup with realistic fluid movement.
- **Scene 3 (Hot Java Steam):** Volumetric steam rises from the hot coffee surface.
- **Scene 4 (Brand Vapor Reveal):** Steam particles seamlessly coalesce and illuminate the exact brand name **OOP'S ORACLE** and the tagline *"Master Java. Master Logic. Build Your Future."*
- **Scene 5 (Smooth Transition):** Smoke expands and smoothly reveals the developer login/signup interface.
- **Procedural Acoustic Engine:** Web Audio API liquid pouring acoustics (frequency rises as cup fills), volumetric steam hiss, and golden reveal chord.
- **Controls:** Skip Intro, Mute/Unmute, and Replay anytime from settings.

### 2. 🔐 Authentication & Security
- Split-screen developer-focused authentication.
- Full validation, password strength meter, password visibility toggle.
- **Instant Demo Access:** 1-Click quick login as Java Master for rapid evaluation.
- Supabase Auth integration with local database persistence fallback.

### 3. 📊 Developer Dashboard
- Daily coding challenge banner with 1-click workspace launch.
- Real-time statistics: Total solved, Easy / Medium / Hard breakdown, Acceptance rate %, and coding streak counter.
- **GitHub-Style Activity Heatmap:** 365-day interactive grid with color intensity.
- Recently solved problems, active course progress, and upcoming contests schedule.

### 4. 📚 Curated Problem Library (520+ Java Questions)
- Rich repository covering Easy, Medium, and Hard across 17 DSA topics:
  - *Arrays, Strings, Hashing, Two Pointers, Sliding Window, Binary Search, Linked Lists, Stacks, Queues, Trees, Binary Search Trees, Graphs, Dynamic Programming, Greedy Algorithms, Backtracking, Heaps, Tries.*
- Real interview questions asked at **Google, Amazon, Microsoft, TCS, Infosys, Accenture, Meta, Oracle, Adobe, and Goldman Sachs**.
- Filters: Search by title/company, Difficulty tabs (Easy: Green, Medium: Orange, Hard: Red), Topic selector, Solved/Unsolved status.
- **Pick Random Problem:** 1-click "Pick One" random problem selector.

### 5. 💻 LeetCode-Grade Coding Workspace
- Dual split-screen interface:
  - **Left Panel:** Problem statement, formatted sample inputs/outputs with explanations, constraints, collapsible hints, full editorial solution with $O(...)$ time and space analysis, submissions history, and community discussion.
  - **Right Panel:** Monaco Editor with syntax highlighting for Java 17 LTS, bracket colorization, reset code, copy code, fullscreen mode, and draft persistence.
  - **Bottom Console:** Interactive test cases, custom input editor, real-time stdout, execution logs, and runtime/memory usage comparison against peers.
- **Execution Engine:** Local JDK 17 runner and Judge0 API support with strict memory limits and execution timeouts.
- **Confetti Celebration:** Triggers dynamic confetti upon `Accepted` verdict.

### 6. 🏆 Competitive Contests
- **Daily Contest:** Daily Oracle speed sprint (45 mins) testing speed and accuracy.
- **Weekly Contest:** 4 DSA problems (Easy → Medium → Hard) with live countdown timer and 5-minute penalty scoring.
- **Monthly Championship:** 5 Advanced challenges with global leaderboards and Hall of Fame ranks.
- Dedicated contest arena with question selector (Q1, Q2, Q3, Q4) and automated real-time leaderboard scoring.

### 7. 🎓 Java Courses Platform (Strict ₹5 INR Pricing)
- 20 complete, structured Java courses:
  1. *Java Programming Fundamentals*
  2. *Variables and Data Types*
  3. *Operators and Control Statements*
  4. *Arrays and Strings*
  5. *Methods and Recursion*
  6. *Object-Oriented Programming*
  7. *Classes and Objects*
  8. *Inheritance and Polymorphism*
  9. *Abstraction and Encapsulation*
  10. *Interfaces and Packages*
  11. *Exception Handling*
  12. *Java Collections Framework*
  13. *Generics*
  14. *Multithreading & Concurrency*
  15. *File Handling & NIO*
  16. *JDBC and Database Connectivity*
  17. *Java 8 Features*
  18. *Data Structures and Algorithms Using Java*
  19. *Java Interview Preparation*
  20. *Advanced Java Concepts*
- **Fixed Pricing:** Every single individual course costs exactly **₹5 INR**!
- **Payment Verification:** Server-side cryptographic HMAC SHA-256 verification (Razorpay integration + built-in instant test simulation mode).
- **Interactive Classroom:** Concept breakdowns, runnable Java code snippets, expected console output, and checkpoint quizzes.

### 8. 👤 Profile & Progress Tracking
- User header with custom avatar, bio, join date, and profile editing.
- Detailed submission history log (runtime, memory, status, timestamp).
- Contest participation ranking and enrolled courses.
- Replay intro animation button.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide React |
| **Animations & 3D** | Three.js, GSAP, Framer Motion, HTML5 Web Audio API |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) |
| **Backend** | Node.js, Express.js |
| **Database** | Supabase PostgreSQL + Local persistent state store |
| **Payments** | Razorpay SDK (Server-side HMAC SHA-256 verification) |
| **Java Execution** | Local JDK 17 compiler & runner / Judge0 Isolated Execution API |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java JDK (JDK 17 LTS recommended)

### Installation

1. **Clone or enter the project directory:**
   ```bash
   cd "oops oracle"
   ```

2. **Install dependencies:**
   ```bash
   # Install server dependencies
   cd server && npm install
   
   # Install client dependencies
   cd ../client && npm install
   ```

3. **Start the application:**
   You can run the full-stack server on `http://localhost:5000`:
   ```bash
   # From root or server directory
   node server/src/index.js
   ```

   Or run frontend with hot-reload in development:
   ```bash
   cd client && npm run dev
   # Client runs at http://localhost:5173
   ```

4. **Open in browser:**
   Navigate to [http://localhost:5000](http://localhost:5000) or [http://localhost:5173](http://localhost:5173) to experience the cinematic coffee kettle intro!

---

## 🔑 Environment Variables Configuration

Copy `.env.example` to `server/.env` and configure your credentials:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Supabase PostgreSQL & Auth Credentials (Optional, local store works out-of-the-box)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Razorpay Payment Gateway (₹5 INR course checkout)
# If left blank, OOP'S ORACLE automatically operates in Simulation Test Mode
RAZORPAY_KEY_ID=rzp_test_YourRazorpayKeyId
RAZORPAY_KEY_SECRET=YourRazorpaySecretKey

# Judge0 API for remote isolated code execution (Optional, uses local JDK 17 by default)
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
JUDGE0_API_KEY=your_rapidapi_judge0_key_here
```

### Database Setup with Supabase (Optional)
Run the complete SQL schema found in `supabase-schema.sql` inside the Supabase SQL Editor. It creates all tables, foreign keys, row-level security (RLS) policies, and performance indexes.

---

## ☕ Demo Accounts

Use 1-click **"Demo Login"** on the login page, or use:
- **Email:** `developer@oopsoracle.com`
- **Password:** `demo123`

---

*Designed and engineered with passion for Java engineers worldwide.*
*Tagline: Master Java. Master Logic. Build Your Future.*
