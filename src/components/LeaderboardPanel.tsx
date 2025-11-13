'use client';

import React, { useState } from 'react';
import { 
  Medal as MedalIcon, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  CheckCircle,
  XCircle,
  MinusCircle
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
  
  // TODO: Replace with actual API call to /api/analysis/leaderboard/[testId]
  // For now, using dummy data
  const [fullLeaderboardData] = useState<LeaderboardEntry[]>(() => {
    // Dummy data - will be replaced with API call
    const dummyData: LeaderboardEntry[] = [];
    for (let i = 1; i <= 100; i++) {
      dummyData.push({
        rank: i,
        userId: `user-${i}`,
        name: i === 52 ? 'You' : `Student ${i}`,
        score: 200 - (i * 0.5),
        totalMarks: 200,
        correct: Math.max(0, 85 - i),
        incorrect: Math.min(85, Math.floor(i / 2)),
        skipped: Math.min(85, Math.floor(i / 5)),
        timeTaken: 7200 + (i * 60),
        isCurrentUser: i === 52
      });
    }
    return dummyData;
  });

  // Find the user's page
  const userIndex = fullLeaderboardData.findIndex(item => item.isCurrentUser);
  const initialPage = userIndex >= 0 ? Math.floor(userIndex / itemsPerPage) + 1 : 1;
  
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(fullLeaderboardData.length / itemsPerPage);

  // Get pagination items
  const paginationRange = usePagination({ totalPages, currentPage });

  // Calculate data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLeaderboardData = fullLeaderboardData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
            {currentLeaderboardData.map((row) => {
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
          disabled={currentPage === 1}
          className="flex items-center justify-center w-9 h-9 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} />
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
              className={`flex items-center justify-center w-9 h-9 border rounded-md text-sm font-medium transition-colors
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
          disabled={currentPage === totalPages}
          className="flex items-center justify-center w-9 h-9 text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={18} />
        </button>
      </nav>
    </div>
  );
};
