'use client';

import React, { useState, useEffect } from 'react';
import { 
  Medal as MedalIcon, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MinusCircle,
  Loader2
} from 'lucide-react';
import { usePagination, DOTS } from '@/hooks/usePagination';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  totalMarks: number;
  correct: number;
  incorrect: number;
  skipped: number;
  timeTaken: number; // in seconds
  isCurrentUser: boolean;
}

interface LeaderboardPanelProps {
  testId: number | null;
  currentUserId: string;
}

/**
 * Medal Component for top 3 ranks
 * Displays gold, silver, or bronze medal icons
 */
const Medal: React.FC<{ rank: number }> = ({ rank }) => {
  const medalStyles = {
    gold: 'text-yellow-500',
    silver: 'text-slate-500',
    bronze: 'text-orange-600'
  };
  
  const style = rank === 1 ? medalStyles.gold : rank === 2 ? medalStyles.silver : medalStyles.bronze;
  
  return (
    <span className={`flex items-center justify-center w-6 h-6 ${style}`}>
      <MedalIcon size={20} strokeWidth={2.5} />
    </span>
  );
};

/**
 * Format time in seconds to HH:MM:SS format
 */
const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const LeaderboardPanel: React.FC<LeaderboardPanelProps> = ({ testId, currentUserId }) => {
  const itemsPerPage = 10;
  
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState(0);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isChangingPage, setIsChangingPage] = useState(false);

  // Fetch leaderboard data
  useEffect(() => {
    if (!testId) {
      setError('Test ID not available');
      setLoading(false);
      return;
    }

    const fetchLeaderboard = async () => {
      try {
        setError(null);
        const response = await fetch(`/api/analysis/leaderboard/${testId}?page=${currentPage}&limit=${itemsPerPage}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }

        const data = await response.json();
        setLeaderboardData(data.entries || []);
        setTotalEntries(data.totalEntries || 0);
        setCurrentUserRank(data.currentUserRank);
        
        // Set initial page to user's page on first load
        if (loading && data.currentUserRank) {
          const userPage = Math.floor((data.currentUserRank - 1) / itemsPerPage) + 1;
          if (userPage !== currentPage) {
            setCurrentPage(userPage);
            return; // Will trigger another fetch with correct page
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
      } finally {
        setLoading(false);
        setIsChangingPage(false);
      }
    };

    fetchLeaderboard();
  }, [testId, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(totalEntries / itemsPerPage);

  // Get pagination items
  const paginationRange = usePagination({ totalPages, currentPage });

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && !isChangingPage) {
      setIsChangingPage(true);
      setCurrentPage(page);
    }
  };

  const retryFetch = () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
  };

  // Loading state
  if (loading) {
    return (
      <div role="tabpanel" aria-labelledby="tab-leaderboard">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Leaderboard</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="ml-3 text-slate-600">Loading leaderboard...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div role="tabpanel" aria-labelledby="tab-leaderboard">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Leaderboard</h2>
        <div className="text-center py-12">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <button
            onClick={retryFetch}
            className="bg-indigo-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (leaderboardData.length === 0) {
    return (
      <div role="tabpanel" aria-labelledby="tab-leaderboard">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">Leaderboard</h2>
        <div className="text-center py-12">
          <p className="text-slate-600">No leaderboard data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div role="tabpanel" aria-labelledby="tab-leaderboard">
      <h2 className="text-xl font-semibold text-slate-800 mb-4">Leaderboard</h2>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Name
              </th>
              <th className="p-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Score
              </th>
              <th className="p-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Breakdown
              </th>
              <th className="p-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Time Taken
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {leaderboardData.map((row) => {
              const numberClass = row.isCurrentUser ? 'font-bold text-indigo-700' : 'text-slate-600';
              
              return (
                <tr 
                  key={row.rank} 
                  className={row.isCurrentUser ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}
                >
                  <td className={`p-4 whitespace-nowrap text-sm font-medium ${row.isCurrentUser ? 'text-indigo-700 font-bold' : 'text-slate-900'}`}>
                    <div className="flex items-center space-x-2">
                      {row.rank <= 3 && <Medal rank={row.rank} />}
                      <span>{row.rank}</span>
                    </div>
                  </td>
                  <td className={`p-4 whitespace-nowrap text-sm font-medium ${row.isCurrentUser ? 'text-indigo-700 font-bold' : 'text-slate-900'}`}>
                    {row.name}
                  </td>
                  <td className={`p-4 whitespace-nowrap text-sm ${row.isCurrentUser ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                    {row.score.toFixed(2)} / {row.totalMarks}
                  </td>
                  <td className="p-4 whitespace-nowrap text-sm text-center">
                    <div className="flex items-center justify-center space-x-3">
                      <span className="flex items-center text-indigo-600" title="Correct">
                        <CheckCircle size={14} className="mr-0.5" />
                        <span className={numberClass}>{row.correct}</span>
                      </span>
                      <span className="flex items-center text-amber-600" title="Incorrect">
                        <XCircle size={14} className="mr-0.5" />
                        <span className={numberClass}>{row.incorrect}</span>
                      </span>
                      <span className="flex items-center text-slate-500" title="Skipped">
                        <MinusCircle size={14} className="mr-0.5" />
                        <span className={numberClass}>{row.skipped}</span>
                      </span>
                    </div>
                  </td>
                  <td className={`p-4 whitespace-nowrap text-sm text-right ${row.isCurrentUser ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                    {formatTime(row.timeTaken)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <nav className="flex items-center justify-center space-x-1 mt-6">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage === 1 || isChangingPage}
          className="flex items-center justify-center w-9 h-9 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          {isChangingPage && currentPage > 1 ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ChevronLeft size={18} />
          )}
        </button>

        {paginationRange.map((pageNumber, index) => {
          const key = `page-${pageNumber}-index-${index}`;
          if (pageNumber === DOTS) {
            return (
              <span key={key} className="flex items-center justify-center w-9 h-9 text-slate-600">
                <MoreHorizontal size={18} />
              </span>
            );
          }

          const isActive = pageNumber === currentPage;
          return (
            <button
              key={key}
              onClick={() => goToPage(pageNumber as number)}
              disabled={isChangingPage}
              className={`flex items-center justify-center w-9 h-9 border rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                ${isActive 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }
              `}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage === totalPages || isChangingPage}
          className="flex items-center justify-center w-9 h-9 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          {isChangingPage && currentPage < totalPages ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <ChevronRight size={18} />
          )}
        </button>
      </nav>
    </div>
  );
};
