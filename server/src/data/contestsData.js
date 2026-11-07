/**
 * OOP'S ORACLE - Contest System Data
 * Daily, Weekly, and Monthly contests with questions, rules, timers, and leaderboards.
 */

export const CONTESTS_DATA = [
  {
    id: 1,
    slug: 'daily-challenge-oracle-speed',
    type: 'Daily',
    title: 'Daily Oracle Speed Sprint #142',
    description: 'Solve today\'s curated Java interview challenge within 45 minutes. Tests speed, accuracy, and optimal memory management.',
    difficulty: 'Medium',
    startTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // Ongoing today
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    durationMinutes: 45,
    totalPoints: 100,
    participantsCount: 1420,
    status: 'ACTIVE',
    problems: [
      {
        id: 1,
        problemId: 1,
        title: 'Two Sum',
        difficulty: 'Easy',
        points: 40
      },
      {
        id: 2,
        problemId: 16,
        title: 'Longest Substring Without Repeating Characters',
        difficulty: 'Medium',
        points: 60
      }
    ],
    rules: [
      'Each participant gets 45 minutes from the moment they click "Start Contest".',
      'Java 17 is the official language.',
      'Hidden test cases must be passed for full score.',
      'A 5-minute penalty is added for each rejected submission.'
    ],
    leaderboard: [
      { rank: 1, username: 'Arjun_Sharma', avatar: '👨‍💻', solvedCount: 2, totalScore: 100, finishTime: '18m 12s', penalty: 0 },
      { rank: 2, username: 'Elena_Rostova', avatar: '👩‍💻', solvedCount: 2, totalScore: 100, finishTime: '21m 45s', penalty: 5 },
      { rank: 3, username: 'Karthik_V', avatar: '⚡', solvedCount: 2, totalScore: 100, finishTime: '24m 10s', penalty: 0 },
      { rank: 4, username: 'Sarah_Connor', avatar: '🛡️', solvedCount: 2, totalScore: 100, finishTime: '29m 33s', penalty: 10 },
      { rank: 5, username: 'Dev_Rohan', avatar: '☕', solvedCount: 1, totalScore: 40, finishTime: '12m 04s', penalty: 0 }
    ]
  },

  {
    id: 2,
    slug: 'weekly-oracle-grand-contest-28',
    type: 'Weekly',
    title: 'Weekly Grand Contest #28 (DSA Special)',
    description: '4 Interview-grade algorithmic challenges ranging from warm-up to Google/Amazon tier. Rated contest updating your global Oracle rank.',
    difficulty: 'Medium - Hard',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 18).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 20).toISOString(),
    durationMinutes: 90,
    totalPoints: 1800,
    participantsCount: 3840,
    status: 'UPCOMING',
    problems: [
      { id: 1, problemId: 2, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy', points: 300 },
      { id: 2, problemId: 18, title: 'Container With Most Water', difficulty: 'Medium', points: 400 },
      { id: 3, problemId: 20, title: 'Product of Array Except Self', difficulty: 'Medium', points: 500 },
      { id: 4, problemId: 36, title: 'Trapping Rain Water', difficulty: 'Hard', points: 600 }
    ],
    rules: [
      'Contest duration is exactly 90 minutes.',
      'Rankings depend on total points scored and total elapsed time + penalties.',
      'Plagiarism checks are automatically executed post-contest.'
    ],
    leaderboard: [
      { rank: 1, username: 'ByteMaster_99', avatar: '👑', solvedCount: 4, totalScore: 1800, finishTime: '52m 14s', penalty: 0 },
      { rank: 2, username: 'Priya_Nair', avatar: '🚀', solvedCount: 4, totalScore: 1800, finishTime: '61m 20s', penalty: 5 },
      { rank: 3, username: 'Alex_Chen', avatar: '💻', solvedCount: 4, totalScore: 1800, finishTime: '72m 44s', penalty: 10 }
    ]
  },

  {
    id: 3,
    slug: 'monthly-championship-november-cup',
    type: 'Monthly',
    title: 'OOP\'S ORACLE Championship: Grand Master Cup',
    description: 'The pinnacle monthly tournament. 5 Advanced challenges designed by Principal Engineers from top tier tech giants.',
    difficulty: 'Hard',
    startTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 180).toISOString(),
    durationMinutes: 180,
    totalPoints: 3000,
    participantsCount: 8920,
    status: 'UPCOMING',
    problems: [
      { id: 1, problemId: 17, title: '3Sum', difficulty: 'Medium', points: 500 },
      { id: 2, problemId: 19, title: 'Group Anagrams', difficulty: 'Medium', points: 500 },
      { id: 3, problemId: 36, title: 'Trapping Rain Water', difficulty: 'Hard', points: 600 },
      { id: 4, problemId: 37, title: 'Median of Two Sorted Arrays', difficulty: 'Hard', points: 700 },
      { id: 5, problemId: 38, title: 'N-Queens', difficulty: 'Hard', points: 700 }
    ],
    rules: [
      '3-Hour high intensity coding championship.',
      'Top 3 winners receive OOP\'S ORACLE Pro Badges & Hall of Fame status.',
      'Server-side evaluation with anti-cheat telemetry.'
    ],
    leaderboard: [
      { rank: 1, username: 'Oracle_Titan', avatar: '🏆', solvedCount: 5, totalScore: 3000, finishTime: '1h 42m', penalty: 0 },
      { rank: 2, username: 'CodeAlchemist', avatar: '⭐', solvedCount: 5, totalScore: 3000, finishTime: '2h 10m', penalty: 15 },
      { rank: 3, username: 'Aravind_Reddy', avatar: '🔥', solvedCount: 5, totalScore: 3000, finishTime: '2h 25m', penalty: 5 }
    ]
  }
];
