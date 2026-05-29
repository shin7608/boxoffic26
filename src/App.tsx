/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { DailyBoxOffice, MovieInfo } from './types';
import { fetchBoxOffice, fetchMovieInfo } from './api';
import { MovieCard } from './components/MovieCard';
import { MovieModal } from './components/MovieModal';
import { Calendar, Film } from 'lucide-react';

function getYesterdayString(): string {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export default function App() {
  const yesterday = getYesterdayString();
  const [selectedDate, setSelectedDate] = useState<string>(yesterday);
  const [boxOfficeList, setBoxOfficeList] = useState<DailyBoxOffice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedMovie, setSelectedMovie] = useState<DailyBoxOffice | null>(null);
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isInfoLoading, setIsInfoLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchBoxOffice(selectedDate);
        setBoxOfficeList(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [selectedDate]);

  const handleMovieClick = async (movie: DailyBoxOffice) => {
    setSelectedMovie(movie);
    setIsModalOpen(true);
    setIsInfoLoading(true);
    setMovieInfo(null);
    try {
      const info = await fetchMovieInfo(movie.movieCd);
      setMovieInfo(info);
    } catch (err) {
      console.error(err);
    } finally {
      setIsInfoLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-slate-200 font-sans">
      <header className="flex flex-col sm:flex-row items-center justify-between px-8 py-6 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center space-x-3 mb-4 sm:mb-0">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Film className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">KOBIS <span className="text-indigo-400">BOXOFFICE</span></h1>
        </div>
        
        <div className="flex items-center space-x-4 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
          <span className="hidden sm:inline-block text-sm font-medium px-3 text-slate-400">상영 일자 선택</span>
          <input 
            type="date" 
            value={selectedDate}
            max={yesterday}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm font-semibold text-white focus:ring-2 focus:ring-indigo-500 outline-none [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
          />
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-6 sm:p-8 flex flex-col">
        <div className="px-8 py-4 bg-slate-900/20 mb-4 rounded-xl">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500">일간 박스오피스 순위 ({selectedDate.replace(/-/g, '.')})</h2>
        </div>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 flex-1">
            <div className="w-10 h-10 border-2 border-slate-800 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 font-medium">Fetching box office data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl text-center">
            {error}
          </div>
        ) : boxOfficeList.length === 0 ? (
          <div className="text-center py-20 text-slate-500 flex-1 flex flex-col items-center justify-center">
            No box office data available for this date.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {boxOfficeList.map((movie, index) => (
              <MovieCard 
                key={movie.movieCd} 
                index={index} 
                movie={movie} 
                onClick={handleMovieClick} 
              />
            ))}
          </div>
        )}
      </main>

      <footer className="px-8 py-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 mt-auto">
        <div className="text-[10px] font-bold text-slate-500 tracking-widest uppercase">
          Source: KOBIS (Korean Film Council) API Service
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-[10px] font-bold text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            API CONNECTION SECURE
          </div>
          <div className="text-[10px] text-slate-600 hidden sm:block">Environment: SECURE_VAULT_ACTIVE</div>
        </div>
      </footer>

      <MovieModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        movieInfo={movieInfo}
        title={selectedMovie?.movieNm || ''}
        isLoading={isInfoLoading}
      />
    </div>
  );
}
