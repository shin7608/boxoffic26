import { motion, AnimatePresence } from "motion/react";
import { MovieInfo } from "../types";
import { X, MessageSquare, Sparkles } from "lucide-react";
import { useState } from "react";
import { generateReview } from "../api";

interface MovieModalProps {
  movieInfo: MovieInfo | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  title: string;
}

export function MovieModal({ movieInfo, isOpen, onClose, isLoading, title }: MovieModalProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [simpleReview, setSimpleReview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReview, setGeneratedReview] = useState("");

  // Reset state when closing or changing movie
  const handleClose = () => {
    setShowReviewForm(false);
    setSimpleReview("");
    setGeneratedReview("");
    onClose();
  };

  const handleGenerate = async () => {
    if (!simpleReview.trim()) return;
    setIsGenerating(true);
    try {
      const result = await generateReview(title, simpleReview);
      setGeneratedReview(result);
    } catch (error: any) {
      console.error(error);
      setGeneratedReview(error?.message || "오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-2xl bg-slate-800/90 rounded-[32px] border border-slate-700/50 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-white bg-slate-900/50 hover:bg-slate-900 rounded-full transition-colors"
          >
            <X size={20} />
          </button>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32">
               <div className="w-8 h-8 border-2 border-slate-700 border-t-indigo-500 rounded-full animate-spin"></div>
            </div>
          ) : movieInfo ? (
             <div className="flex flex-col overflow-y-auto">
                <div className="h-48 sm:h-64 bg-gradient-to-br from-indigo-900 to-slate-800 flex items-center justify-center relative shrink-0">
                  <div className="text-center">
                    <div className="text-5xl mb-2 opacity-50">🎬</div>
                    <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">Poster Preview</div>
                  </div>
                  <div className="absolute top-6 left-6 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                    {movieInfo.audits?.[0]?.watchGradeNm || '등급미상'}
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-6 gap-4">
                    <div>
                      <h3 className="text-3xl font-black text-white leading-tight">{title}</h3>
                      <p className="text-indigo-400 font-medium italic mt-1">{movieInfo.genres.map(g => g.genreNm).join(', ')}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <div className="text-xs text-slate-500 uppercase font-bold mb-1">Release Date</div>
                      <div className="text-white font-mono">{movieInfo.openDt.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Director</h4>
                        <p className="text-slate-200 font-semibold">{movieInfo.directors.map(d => d.peopleNm).join(', ') || '-'}</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Main Cast</h4>
                        <p className="text-slate-200 text-sm leading-relaxed">
                          {movieInfo.actors.slice(0, 5).map(a => a.peopleNm).join(', ')}
                          {movieInfo.actors.length > 5 && ' ...'}
                          {movieInfo.actors.length === 0 && '-'}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Runtime</h4>
                        <p className="text-slate-200 font-semibold">{movieInfo.showTm} Minutes</p>
                      </div>
                      <div>
                        <h4 className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Production</h4>
                        <p className="text-slate-200 text-sm italic">
                          {movieInfo.companys.filter(c => c.companyPartNm === '제작사' || c.companyPartNm === '배급사').map(c => c.companyNm).join(', ') || '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-slate-700/50 flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 py-4 bg-white text-slate-900 font-black rounded-2xl hover:bg-slate-200 transition-colors uppercase tracking-widest text-sm shadow-xl">
                      예매하기 (Ticketing)
                    </button>
                    <button 
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-500 transition-colors uppercase tracking-widest text-sm shadow-xl flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={16} />
                      AI 감상평 쓰기
                    </button>
                  </div>

                  {showReviewForm && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
                        className="bg-slate-900/50 border border-slate-700 rounded-2xl p-6"
                     >
                        <h4 className="flex items-center gap-2 text-indigo-400 font-bold mb-4">
                           <Sparkles size={18} />
                           AI 상세 리뷰 작성기
                        </h4>
                        <textarea 
                           placeholder="이 영화에 대한 짧은 생각이나 감상을 적어주세요. (예: 액션이 너무 멋졌어, 감동적이야 등)"
                           className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none min-h-[100px] mb-4 text-sm"
                           value={simpleReview}
                           onChange={(e) => setSimpleReview(e.target.value)}
                        />
                        <div className="flex justify-end">
                           <button 
                              onClick={handleGenerate}
                              disabled={isGenerating || !simpleReview.trim()}
                              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                           >
                              {isGenerating ? (
                                 <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> 작성 중...</>
                              ) : (
                                 "상세 감상평 생성"
                              )}
                           </button>
                        </div>

                        {generatedReview && (
                           <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-6 p-5 bg-slate-950 rounded-xl border border-indigo-500/30 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap"
                           >
                              {generatedReview}
                           </motion.div>
                        )}
                     </motion.div>
                  )}
                </div>
             </div>
          ) : (
             <div className="py-32 text-center text-slate-500">Failed to load movie info.</div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
