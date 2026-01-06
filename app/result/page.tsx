"use client"

import { useEffect, useState } from "react";

// Tip tanımlaması (TypeScript için)
interface ExamQuestion {
    answer: string;
    timeLeft: number;
    isInvalidAnswer: boolean; // Not: Genelde 'true' ise yanlış kabul edilir
    questionData: {
        shownVerb: string;
        shownVerbForm: string;
        question: {
            v1: string;
            v2: string;
            v3: string;
            meaning: string;
        },
        correctAnswer: string
    }
}

function Result() {
    const [examResult, setExamResult] = useState<ExamQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const resultStr = sessionStorage.getItem('userExamResult');

        if (!resultStr) {
            window.location.href = '/difficulty'
        }

        if (resultStr) {
            setExamResult(JSON.parse(resultStr));
        }
        setIsLoading(false);
    }, []);

    // İstatistikleri hesapla
    const total = examResult.length;
    const correctCount = examResult.filter(q => !q.isInvalidAnswer).length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Toplam harcanan süreyi hesapla (örneğin her soru 10 saniye ise)
    const totalTimeSpent = examResult.reduce((acc, curr) => acc + (10 - curr.timeLeft), 0);
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };


    if (isLoading) return <div className="text-white text-center mt-20">Loading...</div>;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 bg-[#0f172a]">
            <div className={`w-full max-w-2xl bg-[#1e293b]/40 border border-white/10 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-xl relative overflow-hidden transition-all duration-1000`}
                style={{
                    boxShadow: percentage === 100
                        ? '0 0 50px -12px rgba(251, 191, 36, 0.3)' // Altın Parlaması
                        : percentage > 50
                            ? '0 0 50px -12px rgba(52, 211, 153, 0.25)' // Yeşil Parlaması
                            : '0 0 50px -12px rgba(251, 113, 133, 0.25)' // Kırmızı Parlaması
                }}
            >

                {/* Dinamik Arka Plan Efekti */}
                <div className={`absolute -top-20 -left-20 w-64 h-64 blur-[100px] rounded-full ${percentage > 50 ? 'bg-green-500/10' : 'bg-red-500/10'}`}></div>

                <div className="text-center relative z-10">
                    <h2 className="text-slate-400 uppercase tracking-[0.3em] font-bold text-sm mb-2">Quiz Completed</h2>
                    <h1 className={`text-5xl md:text-6xl font-black mb-8 pb-2 bg-clip-text text-transparent bg-gradient-to-r ${percentage === 100
                        ? "from-yellow-400 via-amber-500 to-yellow-600 drop-shadow-[0_0_15px_rgba(251,191,36,0.4)]" // Altın sarısı (Mükemmel)
                        : percentage > 50
                            ? "from-emerald-400 to-cyan-500 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" // Yeşil-Mavi (Başarılı)
                            : "from-rose-400 to-orange-500 drop-shadow-[0_0_15px_rgba(251,113,133,0.3)]" // Kırmızı-Turuncu (Gelişmeli)
                        }`}>
                        {percentage === 100 ? "Perfect Score!" : percentage > 50 ? "Great Job, Champ!" : "Keep Practicing!"}
                    </h1>

                    {/* Skor Halkası */}
                    <div className="relative w-48 h-48 mx-auto mb-10">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                            <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="8" fill="transparent"
                                strokeDasharray={553}
                                strokeDashoffset={553 - (553 * percentage) / 100}
                                className={`${percentage > 50 ? 'text-indigo-500' : 'text-orange-500'} transition-all duration-1000 ease-out`}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black text-white">{percentage}%</span>
                            <span className="text-sm text-slate-500 font-bold uppercase">Accuracy</span>
                        </div>
                    </div>

                    {/* Detaylı İstatistikler */}
                    <div className="grid grid-cols-2 gap-4 mb-10">
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="text-slate-500 text-xs uppercase font-bold mb-1 text-left">Correct Answers</div>
                            <div className="text-3xl font-mono text-green-400 text-left">{correctCount} / {total}</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="text-slate-500 text-xs uppercase font-bold mb-1 text-left">Time Spent</div>
                            <div className="text-3xl font-mono text-indigo-300 text-left">{formatTime(totalTimeSpent)}</div>
                        </div>
                    </div>

                    {/* Soru Detayları (Review Section) */}
                    <div className="text-left mb-10">
                        <h3 className="text-white font-bold mb-4 px-2">Question Review</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {examResult.map((item, index) => (
                                <div key={index} className="flex flex-col bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all group">

                                    {/* Üst Kısım: Verb Bilgisi ve Status Tag */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md">
                                            Verb: {item.questionData.shownVerb} ({item.questionData.shownVerbForm})
                                        </div>
                                        <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase ${item.isInvalidAnswer ? "bg-red-500/20 text-red-400" : "bg-green-400/20 text-green-400"
                                            }`}>
                                            {item.isInvalidAnswer ? "Wrong" : "Correct"}
                                        </span>
                                    </div>

                                    {/* Orta Kısım: Kullanıcı Cevabı */}
                                    <div className="flex flex-col gap-1">
                                        <div className="text-sm text-slate-400">Your Entry:
                                            <span className={`ml-2 font-mono font-bold ${item.isInvalidAnswer ? "text-red-400" : "text-green-400"}`}>
                                                {item.answer || "No Answer"}
                                            </span>
                                        </div>

                                        {/* ALT KISIM: SADECE YANLIŞSA DOĞRU CEVABI GÖSTER */}
                                        {item.isInvalidAnswer && (
                                            <div className="mt-3 py-2.5 px-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20 animate-in fade-in slide-in-from-top-1 duration-300">
                                                <p className="flex items-center text-xs text-indigo-300 font-medium">
                                                    <svg className="w-3 h-3 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span className="uppercase opacity-60 mr-2">Correct Answer:</span>
                                                    <span className="text-sm font-bold text-white tracking-wide">
                                                        {item.correctAnswer}
                                                    </span>
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Aksiyon Butonları */}
                    <div className="flex flex-col gap-4">
                        <button
                            onClick={() => window.location.href = '/difficulty'}
                            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-[0.98]"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>

            <a href="/" className="mt-8 text-slate-500 hover:text-white transition-colors text-sm font-medium underline underline-offset-8">
                Return to Home
            </a>
        </div>
    );
}

export default Result;