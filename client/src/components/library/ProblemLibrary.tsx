import React, { useState, useEffect } from 'react';
import { Search, Shuffle, CheckCircle, Circle, ArrowUpDown, ChevronLeft, ChevronRight, Sparkles, Filter } from 'lucide-react';
import { api } from '../../services/api';
import { Problem } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface ProblemLibraryProps {
  onOpenProblem: (slug: string) => void;
}

export const ProblemLibrary: React.FC<ProblemLibraryProps> = ({ onOpenProblem }) => {
  const { isDark } = useTheme();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('All');
  const [topic, setTopic] = useState('All');
  const [status, setStatus] = useState('All');
  const [sortBy, setSortBy] = useState('id');
  const [order, setOrder] = useState('asc');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 520,
    limit: 25
  });
  const [topicsList, setTopicsList] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalProblems: 520,
    easyCount: 180,
    mediumCount: 240,
    hardCount: 100,
    userSolvedTotal: 4
  });

  const fetchProblemsList = async () => {
    try {
      setLoading(true);
      const res = await api.getProblems({
        page,
        limit: 25,
        difficulty,
        topic,
        status,
        search,
        sortBy,
        order
      });

      setProblems(res.problems || []);
      setPagination(res.pagination);
      if (res.topics) setTopicsList(res.topics);
      if (res.stats) setStats(res.stats);
    } catch (err) {
      console.error('Error fetching problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblemsList();
  }, [page, difficulty, topic, status, sortBy, order]);

  // Handle Search submit / debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProblemsList();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Pick Random Problem
  const handlePickRandom = async () => {
    try {
      const res = await api.getRandomProblem();
      if (res?.slug) {
        onOpenProblem(res.slug);
      }
    } catch (err) {
      console.error('Random pick error:', err);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setOrder('asc');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

      {/* Header & Quick Category Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center space-x-2.5 ${isDark ? 'text-white' : 'text-[#172033]'}`}>
            <span>Interview Problem Repository</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#F89820]/15 text-[#F89820] border border-[#F89820]/30">
              500+ Curated Problems
            </span>
          </h1>
          <p className={`text-xs font-mono mt-1 ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>
            Standard algorithmic questions frequently asked at Google, Amazon, Microsoft, TCS, and Infosys.
          </p>
        </div>

        {/* Random Pick Button */}
        <button
          onClick={handlePickRandom}
          className={`self-start md:self-auto px-4 py-2 rounded-xl border font-mono text-xs font-semibold transition flex items-center space-x-2 group ${
            isDark
              ? 'bg-[#151F32] hover:bg-[#F89820] hover:text-black border-white/10 text-white'
              : 'bg-white hover:bg-[#F89820] hover:text-black hover:border-[#F89820] border-[#E2E8F0] text-[#172033] shadow-sm'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5 group-hover:rotate-180 transition duration-300" />
          <span>Pick Random Problem</span>
        </button>
      </div>

      {/* Quick Difficulty Pills Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => { setDifficulty('All'); setPage(1); }}
          className={`p-3 rounded-xl border cursor-pointer transition ${
            difficulty === 'All'
              ? isDark ? 'bg-[#151F32] border-[#F89820]/50' : 'bg-white border-[#F89820] shadow-sm ring-1 ring-[#F89820]/30'
              : isDark ? 'bg-[#0B1120] border-white/5 hover:border-white/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className={`text-[11px] font-mono ${isDark ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>ALL PROBLEMS</div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#172033]'}`}>{stats.totalProblems}</div>
        </div>

        <div
          onClick={() => { setDifficulty('Easy'); setPage(1); }}
          className={`p-3 rounded-xl border cursor-pointer transition ${
            difficulty === 'Easy'
              ? isDark ? 'bg-[#151F32] border-[#22C55E]/60' : 'bg-white border-[#16A34A] shadow-sm ring-1 ring-[#16A34A]/30'
              : isDark ? 'bg-[#0B1120] border-white/5 hover:border-white/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="text-[11px] font-mono text-[#16A34A]">EASY</div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#172033]'}`}>{stats.easyCount}</div>
        </div>

        <div
          onClick={() => { setDifficulty('Medium'); setPage(1); }}
          className={`p-3 rounded-xl border cursor-pointer transition ${
            difficulty === 'Medium'
              ? isDark ? 'bg-[#151F32] border-[#F89820]/60' : 'bg-white border-[#F89820] shadow-sm ring-1 ring-[#F89820]/30'
              : isDark ? 'bg-[#0B1120] border-white/5 hover:border-white/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="text-[11px] font-mono text-[#F89820]">MEDIUM</div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#172033]'}`}>{stats.mediumCount}</div>
        </div>

        <div
          onClick={() => { setDifficulty('Hard'); setPage(1); }}
          className={`p-3 rounded-xl border cursor-pointer transition ${
            difficulty === 'Hard'
              ? isDark ? 'bg-[#151F32] border-red-500/60' : 'bg-white border-[#DC2626] shadow-sm ring-1 ring-[#DC2626]/30'
              : isDark ? 'bg-[#0B1120] border-white/5 hover:border-white/20' : 'bg-[#F8FAFC] border-[#E2E8F0] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="text-[11px] font-mono text-[#DC2626]">HARD</div>
          <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-[#172033]'}`}>{stats.hardCount}</div>
        </div>
      </div>

      {/* FILTER & SEARCH CONTROLS */}
      <div className="glass-card p-4 rounded-xl border border-white/5 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">

          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by problem title, keyword, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-xs font-mono text-white placeholder-gray-500 focus:outline-none focus:border-[#F89820]"
            />
          </div>

          {/* Topic Dropdown */}
          <div className="md:col-span-4">
            <select
              value={topic}
              onChange={(e) => { setTopic(e.target.value); setPage(1); }}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F89820]"
            >
              <option value="All">All Topics (Arrays, Trees, DP, Graphs...)</option>
              {topicsList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3">
            <select
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full bg-[#0B1120] border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-[#F89820]"
            >
              <option value="All">All Statuses</option>
              <option value="Solved">Solved Only</option>
              <option value="Unsolved">Unsolved Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* PROBLEMS TABLE */}
      <div className={`rounded-xl overflow-hidden border shadow-sm ${
        isDark ? 'border-white/5 bg-[#151F32]/80' : 'border-[#E2E8F0] bg-white'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`border-b select-none ${
              isDark ? 'bg-[#0B1120] text-[#94A3B8] border-white/5' : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0]'
            }`}>
              <tr>
                <th className="py-3 px-4 w-12 text-center">Status</th>
                <th
                  onClick={() => handleSort('id')}
                  className={`py-3 px-4 w-20 cursor-pointer transition ${isDark ? 'hover:text-white' : 'hover:text-[#172033]'}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('title')}
                  className={`py-3 px-4 cursor-pointer transition ${isDark ? 'hover:text-white' : 'hover:text-[#172033]'}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>Title</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('difficulty')}
                  className={`py-3 px-4 w-28 cursor-pointer transition ${isDark ? 'hover:text-white' : 'hover:text-[#172033]'}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>Difficulty</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 w-36">Topic</th>
                <th
                  onClick={() => handleSort('acceptanceRate')}
                  className={`py-3 px-4 w-28 cursor-pointer transition ${isDark ? 'hover:text-white' : 'hover:text-[#172033]'}`}
                >
                  <div className="flex items-center space-x-1">
                    <span>Acceptance</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 w-40">Companies</th>
                <th className="py-3 px-4 w-24 text-center">Action</th>
              </tr>
            </thead>

            <tbody className={`divide-y ${isDark ? 'divide-white/5 text-gray-300' : 'divide-[#E2E8F0] text-[#334155]'}`}>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500 font-mono">
                    <div className="w-6 h-6 border-2 border-[#F89820] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading problems from OOP'S ORACLE engine...</span>
                  </td>
                </tr>
              ) : problems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500 font-mono">
                    No problems match your selected filters.
                  </td>
                </tr>
              ) : (
                problems.map((problem) => {
                  const diffColor =
                    problem.difficulty === 'Easy'
                      ? 'text-[#16A34A]'
                      : problem.difficulty === 'Medium'
                      ? 'text-[#F89820]'
                      : 'text-[#DC2626]';

                  return (
                    <tr
                      key={problem.id}
                      onClick={() => onOpenProblem(problem.slug)}
                      className={`transition cursor-pointer group ${
                        isDark ? 'hover:bg-[#1B263B]' : 'hover:bg-[#F8FAFC]'
                      }`}
                    >
                      {/* Solved Status */}
                      <td className="py-3 px-4 text-center">
                        {problem.isSolved ? (
                          <CheckCircle className="w-4 h-4 text-[#16A34A] mx-auto" />
                        ) : (
                          <Circle className={`w-4 h-4 mx-auto ${isDark ? 'text-gray-600' : 'text-[#CBD5E1]'}`} />
                        )}
                      </td>

                      {/* ID */}
                      <td className={`py-3 px-4 font-semibold transition ${
                        isDark ? 'text-gray-400 group-hover:text-white' : 'text-[#64748B] group-hover:text-[#172033]'
                      }`}>
                        #{problem.id}
                      </td>

                      {/* Title */}
                      <td className={`py-3 px-4 font-medium transition ${
                        isDark ? 'text-white group-hover:text-[#F89820]' : 'text-[#172033] group-hover:text-[#E88712]'
                      }`}>
                        <span className="font-sans font-semibold text-sm">
                          {problem.title}
                        </span>
                      </td>

                      {/* Difficulty */}
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${diffColor}`}>
                          {problem.difficulty}
                        </span>
                      </td>

                      {/* Topic */}
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>
                        {problem.topic}
                      </td>

                      {/* Acceptance Rate */}
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>
                        {problem.acceptanceRate}%
                      </td>

                      {/* Companies */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {problem.companyTags?.slice(0, 2).map((comp) => (
                            <span
                              key={comp}
                              className={`px-1.5 py-0.5 rounded text-[10px] border truncate max-w-[70px] ${
                                isDark
                                  ? 'bg-white/5 text-gray-400 border-white/5'
                                  : 'bg-[#F1F5F9] text-[#64748B] border-[#E2E8F0]'
                              }`}
                            >
                              {comp}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenProblem(problem.slug);
                          }}
                          className={`px-3 py-1 rounded text-xs font-semibold transition ${
                            isDark
                              ? 'bg-[#0B1120] group-hover:bg-[#F89820] group-hover:text-black text-white'
                              : 'bg-[#F1F5F9] group-hover:bg-[#F89820] group-hover:text-black text-[#172033]'
                          }`}
                        >
                          Solve
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className={`px-4 py-3 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono ${
          isDark ? 'bg-[#0B1120] border-white/5 text-gray-400' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
        }`}>
          <div>
            Showing <strong className={isDark ? 'text-white' : 'text-[#172033]'}>{(page - 1) * 25 + 1}</strong> to{' '}
            <strong className={isDark ? 'text-white' : 'text-[#172033]'}>{Math.min(page * 25, pagination.totalItems)}</strong> of{' '}
            <strong className="text-[#F89820]">{pagination.totalItems}</strong> problems
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className={`p-1.5 rounded-lg border disabled:opacity-40 transition ${
                isDark ? 'bg-[#151F32] hover:bg-[#1B263B] text-white border-white/5' : 'bg-white hover:bg-[#F1F5F9] text-[#172033] border-[#E2E8F0]'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className={`px-3 py-1 rounded-lg font-semibold border ${
              isDark ? 'bg-[#151F32] text-white border-white/5' : 'bg-white text-[#172033] border-[#E2E8F0]'
            }`}>
              Page {page} of {pagination.totalPages}
            </span>

            <button
              onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
              disabled={page >= pagination.totalPages}
              className={`p-1.5 rounded-lg border disabled:opacity-40 transition ${
                isDark ? 'bg-[#151F32] hover:bg-[#1B263B] text-white border-white/5' : 'bg-white hover:bg-[#F1F5F9] text-[#172033] border-[#E2E8F0]'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
