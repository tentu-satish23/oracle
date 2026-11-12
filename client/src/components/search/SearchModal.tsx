import React, { useState, useEffect } from 'react';
import { Search, X, Code, BookOpen, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { Problem } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (slug: string) => void;
  onSelectCourse: (slug: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
  onSelectCourse
}) => {
  const { isDark } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await api.getProblems({ search: query, limit: 8 });
        setResults(res.problems || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/70 backdrop-blur-sm">
      <div className={`w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${
        isDark ? 'bg-[#151F32] border-white/10' : 'bg-white border-[#E2E8F0]'
      }`}>

        {/* Input Bar */}
        <div className={`flex items-center px-4 py-3.5 border-b ${
          isDark ? 'border-white/10 bg-[#0B1120]' : 'border-[#E2E8F0] bg-[#F8FAFC]'
        }`}>
          <Search className="w-5 h-5 text-[#F89820] mr-3" />
          <input
            type="text"
            autoFocus
            placeholder="Search 500+ Java problems by title, topic, company, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={`w-full bg-transparent text-sm placeholder-gray-500 focus:outline-none font-mono ${
              isDark ? 'text-white' : 'text-[#172033]'
            }`}
          />
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-[#64748B] hover:text-[#172033]'}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className={`max-h-96 overflow-y-auto p-2 divide-y ${isDark ? 'divide-white/5' : 'divide-[#E2E8F0]'}`}>
          {loading && (
            <div className={`py-8 text-center text-xs font-mono ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>
              Searching OOP'S ORACLE database...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className={`py-8 text-center text-xs font-mono ${isDark ? 'text-gray-400' : 'text-[#64748B]'}`}>
              No problems found matching "{query}"
            </div>
          )}

          {!loading && results.map((prob) => {
            const diffColor =
              prob.difficulty === 'Easy'
                ? 'text-[#16A34A] bg-[#16A34A]/10'
                : prob.difficulty === 'Medium'
                ? 'text-[#F89820] bg-[#F89820]/10'
                : 'text-[#DC2626] bg-[#DC2626]/10';

            return (
              <div
                key={prob.id}
                onClick={() => {
                  onSelectProblem(prob.slug);
                  onClose();
                }}
                className={`p-3 rounded-lg cursor-pointer flex items-center justify-between transition group ${
                  isDark ? 'hover:bg-[#1B263B]' : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-mono font-bold transition ${
                    isDark ? 'bg-[#0B1120] text-gray-400 group-hover:text-[#F89820]' : 'bg-[#F1F5F9] text-[#64748B] group-hover:text-[#E88712]'
                  }`}>
                    #{prob.id}
                  </div>
                  <div>
                    <div className={`text-sm font-medium transition ${
                      isDark ? 'text-white group-hover:text-[#F89820]' : 'text-[#172033] group-hover:text-[#E88712]'
                    }`}>
                      {prob.title}
                    </div>
                    <div className={`flex items-center space-x-2 text-[11px] font-mono mt-0.5 ${
                      isDark ? 'text-gray-400' : 'text-[#64748B]'
                    }`}>
                      <span>{prob.topic}</span>
                      <span>•</span>
                      <span>{prob.companyTags?.slice(0, 2).join(', ')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${diffColor}`}>
                    {prob.difficulty}
                  </span>
                  <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition ${
                    isDark ? 'text-gray-500 group-hover:text-white' : 'text-[#94A3B8] group-hover:text-[#172033]'
                  }`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer shortcuts */}
        <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${
          isDark ? 'bg-[#0B1120] border-white/5 text-gray-500' : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
        }`}>
          <span>Navigate with arrows</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
