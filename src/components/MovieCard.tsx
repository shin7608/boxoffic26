import { motion } from "motion/react";
import { DailyBoxOffice } from "../types";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MovieCardProps {
  key?: string | number;
  movie: DailyBoxOffice;
  onClick: (movie: DailyBoxOffice) => void | Promise<void>;
  index: number;
}

export function MovieCard({ movie, onClick, index }: MovieCardProps) {
  const rankInten = parseInt(movie.rankInten, 10);
  const isRank1 = movie.rank === '1';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onClick(movie)}
      className={`group flex items-center p-4 rounded-2xl cursor-pointer transition-all ${
        isRank1 
          ? "bg-indigo-600/10 border border-indigo-500/30" 
          : "bg-slate-900/40 border border-transparent hover:border-slate-700"
      }`}
    >
      <div className={`w-12 sm:w-16 text-3xl font-black italic ${isRank1 ? "text-indigo-400" : "text-slate-700"}`}>
        {movie.rank.padStart(2, '0')}
      </div>
      
      <div className="flex-1 px-2 sm:px-4 min-w-0">
        <div className="text-lg font-bold text-white truncate">{movie.movieNm}</div>
        <div className={`text-xs uppercase tracking-tighter truncate ${isRank1 ? "text-slate-400" : "text-slate-500"}`}>
          Opened: {movie.openDt.replace(/-/g, '.')}
        </div>
      </div>
      
      <div className="text-right">
        <div className={`text-sm font-medium ${isRank1 ? "font-bold text-slate-200" : "text-slate-400"}`}>
          {parseInt(movie.audiCnt).toLocaleString()}명
        </div>
        
        <div className="mt-1 flex items-center justify-end">
          {rankInten > 0 && <span className="text-[10px] text-rose-500 font-bold flex items-center uppercase"><TrendingUp size={12} className="mr-0.5" />{rankInten} Step</span>}
          {rankInten < 0 && <span className="text-[10px] text-blue-400 font-bold flex items-center uppercase"><TrendingDown size={12} className="mr-0.5" />{Math.abs(rankInten)} Step</span>}
          {rankInten === 0 && movie.rankOldAndNew === "NEW" && <span className="text-[10px] text-emerald-400 font-bold flex items-center uppercase">New</span>}
          {rankInten === 0 && movie.rankOldAndNew === "OLD" && <span className="text-[10px] text-slate-500 font-bold flex items-center"><span className="w-2 h-0.5 bg-slate-600 block mr-1"></span>Keep</span>}
        </div>
      </div>
    </motion.div>
  );
}
