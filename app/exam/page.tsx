"use client";

import { useState, useEffect, useRef } from "react";
import { VerbRandomizer, VerbForm, ExamResult, IDifficultyConfig } from "../interfaces";
import { GameManager } from "../lib/GameManager";
import { useRouter } from "next/navigation";

type GameStatus = 'playing' | 'correct' | 'wrong' | 'timeout';
type GameDiff = 'easy' | 'medium' | 'hard' | 'endless_blitz' | 'endless_zen'

function Exam() {
    const router = useRouter()
    // 1. GameManager'ı useRef ile tanımlıyoruz (Bellekte sabit kalır)
    // Zorluğu sessionStorage'dan okuyoruz (Client-side olduğu için useEffect içinde veya başlangıçta kontrol edebiliriz)
    const engine = useRef<GameManager | null>(null);

    // State'ler
    const [currentQuestion, setCurrentQuestion] = useState<VerbRandomizer | null>(null);
    const [status, setStatus] = useState<GameStatus>('playing');
    const [timeLeft, setTimeLeft] = useState(10);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [questionCountTime, setQuestionCountTime] = useState<number | null>()
    const [difficulty, setDifficulty] = useState<GameDiff>('medium')

    const [quizQuestions, setQuizQuestions] = useState<VerbRandomizer[]>([])
    const [quizType, setQuizType] = useState<string>('')

    // --- SORU SAYACI İÇİN STATİK DEĞERLER ---
    // Daha sonra bunları engine.current.totalQuestions gibi dinamik hale getirebilirsin
    const [currentStep, setCurrentStep] = useState<number>(0);
    const [totalSteps, setTotalSteps] = useState<number>(10)

    // 2. İlk Kurulum (Setup)
    useEffect(() => {
        sessionStorage.removeItem('userExamResult')
        const diff = (sessionStorage.getItem("diff") as GameDiff) || 'medium';
        setDifficulty(diff)
        setCurrentStep(0)
        // Instance oluşturma
        engine.current = new GameManager(irregularVerbs, diff);
        setQuestionCountTime(engine.current.getTimerValue() || null)

        if (['easy', 'medium', 'hard'].includes(diff)) {
            const quiz: VerbRandomizer[] = engine.current.startGame()
            setQuizQuestions(quiz)
            setCurrentQuestion(quiz[currentStep])
            setCurrentStep(currentStep + 1)
        } else {
            // İlk soruyu üret -endless için-
            const firstQuestion = engine.current.randomQuestionGenerate();
            setCurrentQuestion(firstQuestion);
        }
        setQuizType(engine.current.getQuizType())
        setTotalSteps(engine.current.getTotalQuestionCount())
        setTimeLeft(typeof engine.current.getTimerValue() === 'number' ? engine.current.getTimerValue() as number : 10);
    }, []);

    // Zamanlayıcı Mantığı (Aynı kalıyor ama timer değeri engine'den geliyor)
    useEffect(() => {
        if (status !== 'playing' || !currentQuestion) return;

        if (questionCountTime) {

            if ((questionCountTime !== null) && timeLeft <= 0) {
                setStatus('timeout');
                setStreak(0);
                return;
            }

            const timer = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(timer);
        }

    }, [timeLeft, status, currentQuestion]);

    // Cevap Kontrolü ve Yeni Soruya Geçiş
    const handleCheck = () => {
        if (!currentQuestion || !engine.current) return;

        // Doğru cevap kontrolü (Manager'da saklanan orijinal verb listesinden veya question objesinden bakabilirsin)
        // Senin interfaces yapına göre:
        const correctAnswer = irregularVerbs.find(v => v[currentQuestion.pickedVerbVersion as keyof VerbForm] === currentQuestion.pickedVerb)?.[currentQuestion.question.verbKey as keyof VerbForm];

        if (userAnswer.trim().toLowerCase() === String(correctAnswer).toLowerCase()) {
            setStatus('correct');
            engine.current.updateScore(); // Class içindeki skoru artır
            setScore(engine.current.score); // UI'daki skoru güncelle
            setStreak(prev => prev + 1);
        } else {
            setStatus('wrong');
            setStreak(0);
        }
    };

    const nextQuestion = () => {
        if (!engine.current) return;

        if (!currentQuestion) return;

        const correctAnswer = irregularVerbs.find(v => v[currentQuestion.pickedVerbVersion as keyof VerbForm] === currentQuestion.pickedVerb)?.[currentQuestion.question.verbKey as keyof VerbForm];

        const currentQuestionResult: ExamResult = {
            answer: userAnswer.toLowerCase(),
            questionData: {
                question: currentQuestion?.question.question || "unknown",
                shownVerb: currentQuestion?.pickedVerb || "unknown",
                shownVerbForm: currentQuestion?.pickedVerbVersion || "unknown",
            },
            timeLeft: timeLeft,
            isInvalidAnswer: userAnswer.trim().toLowerCase() !== String(correctAnswer).toLowerCase(),
            correctAnswer: String(correctAnswer),
            // Eksik olan ve hataya sebep olan alanlar:
            currentQuestion: currentStep, // veya o anki index
            totalQuestion: totalSteps,
            completedQuestionLocations: [], // Şimdilik boş bir dizi veya mevcut veriyi verebilirsin
        }

        engine.current.updateExamResult(currentQuestionResult)

        // Next Question for endless
        if (quizType === 'endless') {

            const next = engine.current.randomQuestionGenerate();
            setCurrentQuestion(next);
        } else {
            if (currentQuestion?.isLastQuestion) {
                const quizResult = JSON.stringify(engine.current.getExamResult())
                sessionStorage.setItem('userExamResult', quizResult)
                router.push('/result');
            } else {
                if (currentStep < totalSteps) {
                    setCurrentStep(currentStep + 1)
                    setCurrentQuestion(quizQuestions[currentStep])
                }
            }
        }


        setUserAnswer("");
        setStatus('playing');

        // Zorluk ayarındaki timer'ı tekrar kur
        if (questionCountTime) {
            const timerVal = engine.current.getTimerValue();
            setTimeLeft(typeof timerVal === 'number' ? timerVal : 99);
        }
    };
    console.log(quizQuestions);

    if (!currentQuestion) return <div>Loading...</div>;


    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 mt-10 px-4">
            {/* ÜST PANEL: Score, Timer ve Streak */}
            <div className="flex gap-6 w-full max-w-2xl justify-between px-2">
                {/* Score Card */}
                <div className="group relative bg-white/5 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all duration-300">
                    <div className="flex flex-col">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Score
                        </span>
                        <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-slate-400 bg-clip-text text-transparent">{score}</span>
                    </div>
                </div>

                {/* Timer */}
                {questionCountTime && (
                    <div className="relative flex items-center justify-center">
                        <svg className="w-20 h-20 transform -rotate-90">
                            <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" fill="transparent" className="text-white/5" />
                            <circle
                                cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="5" fill="transparent"
                                strokeDasharray={213.6}
                                strokeDashoffset={213.6 - (213.6 * timeLeft) / questionCountTime}
                                strokeLinecap="round"
                                className={`transition-all duration-1000 ${timeLeft <= 3 ? 'text-red-500' : 'text-indigo-500'}`}
                            />
                        </svg>
                        <span className={`absolute font-black text-2xl ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                            {timeLeft}
                        </span>
                    </div>
                )}

                {/* Streak Card */}
                <div className="group relative bg-white/5 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all duration-300">
                    <div className="flex flex-col items-end">
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                            Streak
                        </span>
                        <span className="text-3xl font-black bg-gradient-to-r from-indigo-400 to-slate-400 bg-clip-text text-transparent">x{streak}</span>
                    </div>
                </div>
            </div>

            <div className="w-full max-w-2xl space-y-6">
                {/* ANA KART */}
                <div className={`relative p-10 md:p-14 bg-white/5 backdrop-blur-sm rounded-[2.5rem] border-2 transition-all duration-700 shadow-2xl overflow-hidden
      ${status === 'correct' ? 'border-green-500/40' :
                        status === 'wrong' ? 'border-red-500/40' :
                            status === 'timeout' ? 'border-orange-500/40' : 'border-white/10'}`}
                >
                    {/* Subtle Background Effect */}
                    {status !== 'playing' && (
                        <div className={`absolute inset-0 opacity-5 ${status === 'correct' ? 'bg-green-500' :
                            status === 'wrong' ? 'bg-red-500' :
                                'bg-orange-500'
                            }`}></div>
                    )}

                    <div className="relative z-10">
                        {/* Üst Bilgi */}
                        <div className="flex justify-between items-center mb-12">
                            <span className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-[11px] font-black text-indigo-400 uppercase tracking-[0.25em] border border-white/10">
                                {currentQuestion.pickedVerbVersion} Form
                            </span>
                            {quizType !== 'endless' && (
                                <span className="px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    {currentStep} / {totalSteps}
                                </span>
                            )}
                        </div>

                        {/* Ana Kelime */}
                        <div className="text-center mb-6">
                            <h2 className={`text-7xl md:text-9xl font-black tracking-tighter transition-all duration-500 ${status === 'correct' ? 'text-green-400' :
                                status === 'wrong' ? 'text-red-400' :
                                    status === 'timeout' ? 'text-orange-400' :
                                        'bg-gradient-to-r from-indigo-400 to-slate-400 bg-clip-text text-transparent'
                                }`}>
                                {currentQuestion.pickedVerb}
                            </h2>
                            <p className="mt-6 text-slate-400 font-semibold text-xl tracking-wide">
                                {currentQuestion.question.question}
                            </p>
                        </div>

                        {/* SONUÇ PANELİ */}
                        {['correct', 'wrong', 'timeout'].includes(status) && (
                            <div className="mt-14 pt-10 border-t border-white/10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="flex flex-col items-center gap-8">
                                    <div className="text-center">
                                        <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl mb-4 border backdrop-blur-sm ${status === 'correct' ? 'bg-green-500/10 border-green-400/30' : 'bg-red-500/10 border-red-400/30'
                                            }`}>
                                            {status === 'correct' ? (
                                                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            )}
                                            <span className={`text-sm font-black uppercase tracking-[0.3em] ${status === 'correct' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {status === 'correct' ? '✦ Perfect ✦' : '✦ Keep Going ✦'}
                                            </span>
                                        </div>
                                        {status !== 'correct' && (
                                            <div className="text-white text-2xl font-bold">
                                                Correct answer: <span className="text-green-400">{currentQuestion.correctAnswer}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Final Mesajı */}
                                    {currentQuestion.isLastQuestion && (
                                        <div className="bg-indigo-500/10 px-8 py-4 rounded-3xl border border-indigo-400/30 backdrop-blur-sm">
                                            <p className="text-indigo-300 text-sm font-black uppercase tracking-[0.3em] text-center flex items-center gap-2 justify-center">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                Quiz Completed!
                                            </p>
                                        </div>
                                    )}

                                    <button
                                        onClick={nextQuestion}
                                        className="group relative w-full overflow-hidden rounded-3xl bg-white text-black py-6 font-black text-lg transition-all hover:scale-[1.02] active:scale-95"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <span className="relative z-10 group-hover:text-white flex items-center justify-center gap-3 tracking-wide transition-colors">
                                            {currentQuestion.isLastQuestion ? 'SEE MY FINAL SCORE' : 'NEXT VERB'}
                                            <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* INPUT ALANI */}
                {status === 'playing' && (
                    <div className="animate-in fade-in zoom-in duration-500">
                        <div className="bg-white/5 backdrop-blur-sm p-2 rounded-[2.5rem] border border-white/10 flex items-center gap-2 hover:border-indigo-400/30 transition-all">
                            <input
                                type="text"
                                value={userAnswer}
                                autoFocus
                                onChange={(e) => setUserAnswer(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                                placeholder={`Type the ${currentQuestion.question.verbKey} form...`}
                                className="flex-1 bg-transparent px-8 py-5 text-white outline-none text-xl font-semibold placeholder:text-slate-500 tracking-wide"
                            />
                            <button
                                onClick={handleCheck}
                                className="bg-white text-black h-16 px-10 rounded-[2rem] font-black hover:bg-gradient-to-r hover:from-indigo-500 hover:to-slate-500 hover:text-white transition-all active:scale-95"
                            >
                                CHECK
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Exam;

export const irregularVerbs: VerbForm[] = [
    // --- İlk 16 Fiil (Sizin Listelediğiniz) ---
    { v1: "be", v2: "was/were", v3: "been", turkishMeaning: "olmak" },
    { v1: "have", v2: "had", v3: "had", turkishMeaning: "sahip olmak" },
    { v1: "do", v2: "did", v3: "done", turkishMeaning: "yapmak" },
    { v1: "say", v2: "said", v3: "said", turkishMeaning: "söylemek" },
    { v1: "go", v2: "went", v3: "gone", turkishMeaning: "gitmek" },
    { v1: "get", v2: "got", v3: "got/gotten", turkishMeaning: "almak, olmak" },
    { v1: "make", v2: "made", v3: "made", turkishMeaning: "yapmak, etmek" },
    { v1: "know", v2: "knew", v3: "known", turkishMeaning: "bilmek" },
    { v1: "think", v2: "thought", v3: "thought", turkishMeaning: "düşünmek" },
    { v1: "take", v2: "took", v3: "taken", turkishMeaning: "almak, götürmek" },
    { v1: "see", v2: "saw", v3: "seen", turkishMeaning: "görmek" },
    { v1: "give", v2: "gave", v3: "given", turkishMeaning: "vermek" },
    { v1: "tell", v2: "told", v3: "told", turkishMeaning: "anlatmak, söylemek" },
    { v1: "feel", v2: "felt", v3: "felt", turkishMeaning: "hissetmek" },
    { v1: "find", v2: "found", v3: "found", turkishMeaning: "bulmak" },
    { v1: "mean", v2: "meant", v3: "meant", turkishMeaning: "anlamına gelmek" },
    { v1: "leave", v2: "left", v3: "left", turkishMeaning: "ayrılmak, bırakmak" },
    { v1: "put", v2: "put", v3: "put", turkishMeaning: "koymak" },
    { v1: "keep", v2: "kept", v3: "kept", turkishMeaning: "tutmak, saklamak" },
    { v1: "let", v2: "let", v3: "let", turkishMeaning: "izin vermek" },
    { v1: "begin", v2: "began", v3: "begun", turkishMeaning: "başlamak" },
    { v1: "show", v2: "showed", v3: "shown/showed", turkishMeaning: "göstermek" },
    { v1: "hear", v2: "heard", v3: "heard", turkishMeaning: "duymak" },
    { v1: "run", v2: "ran", v3: "run", turkishMeaning: "koşmak" },
    { v1: "hold", v2: "held", v3: "held", turkishMeaning: "tutmak" },
    { v1: "bring", v2: "brought", v3: "brought", turkishMeaning: "getirmek" },
    { v1: "write", v2: "wrote", v3: "written", turkishMeaning: "yazmak" },
    { v1: "stand", v2: "stood", v3: "stood", turkishMeaning: "durmak, ayakta durmak" },
    { v1: "lose", v2: "lost", v3: "lost", turkishMeaning: "kaybetmek" },
    { v1: "meet", v2: "met", v3: "met", turkishMeaning: "buluşmak, tanışmak" },
    { v1: "pay", v2: "paid", v3: "paid", turkishMeaning: "ödemek" },
    { v1: "set", v2: "set", v3: "set", turkishMeaning: "kurmak, ayarlamak" },
    { v1: "understand", v2: "understood", v3: "understood", turkishMeaning: "anlamak" },
    { v1: "build", v2: "built", v3: "built", turkishMeaning: "inşa etmek" },
    { v1: "fall", v2: "fell", v3: "fallen", turkishMeaning: "düşmek" },
    { v1: "cut", v2: "cut", v3: "cut", turkishMeaning: "kesmek" },
    { v1: "rise", v2: "rose", v3: "risen", turkishMeaning: "yükselmek" },
    { v1: "sell", v2: "sold", v3: "sold", turkishMeaning: "satmak" },
    { v1: "fly", v2: "flew", v3: "flown", turkishMeaning: "uçmak" },
    { v1: "catch", v2: "caught", v3: "caught", turkishMeaning: "yakalamak" },
    { v1: "buy", v2: "bought", v3: "bought", turkishMeaning: "satın almak" },
    { v1: "wear", v2: "wore", v3: "worn", turkishMeaning: "giymek" },
    { v1: "drive", v2: "drove", v3: "driven", turkishMeaning: "sürmek" },
    { v1: "break", v2: "broke", v3: "broken", turkishMeaning: "kırmak" },
    { v1: "shut", v2: "shut", v3: "shut", turkishMeaning: "kapatmak" },
    { v1: "spend", v2: "spent", v3: "spent", turkishMeaning: "harcamak" },
    { v1: "draw", v2: "drew", v3: "drawn", turkishMeaning: "çizmek" },
    { v1: "fight", v2: "fought", v3: "fought", turkishMeaning: "dövüşmek, savaşmak" },
    { v1: "win", v2: "won", v3: "won", turkishMeaning: "kazanmak" },
    { v1: "sing", v2: "sang", v3: "sung", turkishMeaning: "şarkı söylemek" },
    { v1: "swim", v2: "swam", v3: "swum", turkishMeaning: "yüzmek" },
    { v1: "read", v2: "read", v3: "read", turkishMeaning: "okumak" },
    { v1: "teach", v2: "taught", v3: "taught", turkishMeaning: "öğretmek" },
    { v1: "sleep", v2: "slept", v3: "slept", turkishMeaning: "uyumak" },
    { v1: "hit", v2: "hit", v3: "hit", turkishMeaning: "vurmak" },
    { v1: "drink", v2: "drank", v3: "drunk", turkishMeaning: "içmek" },
    { v1: "speak", v2: "spoke", v3: "spoken", turkishMeaning: "konuşmak" },
    { v1: "eat", v2: "ate", v3: "eaten", turkishMeaning: "yemek yemek" },
    { v1: "forget", v2: "forgot", v3: "forgotten", turkishMeaning: "unutmak" },
    { v1: "throw", v2: "threw", v3: "thrown", turkishMeaning: "fırlatmak" },
    { v1: "cost", v2: "cost", v3: "cost", turkishMeaning: "maliyetinde olmak" },
    { v1: "feed", v2: "fed", v3: "fed", turkishMeaning: "beslemek" },
    { v1: "lend", v2: "lent", v3: "lent", turkishMeaning: "ödünç vermek" },
    { v1: "send", v2: "sent", v3: "sent", turkishMeaning: "göndermek" },
    { v1: "deal", v2: "dealt", v3: "dealt", turkishMeaning: "ilgilenmek, anlaşmak" },
    { v1: "bite", v2: "bit", v3: "bitten", turkishMeaning: "ısırmak" },
    { v1: "grow", v2: "grew", v3: "grown", turkishMeaning: "büyümek" },
    { v1: "choose", v2: "chose", v3: "chosen", turkishMeaning: "seçmek" },
    { v1: "hang", v2: "hung", v3: "hung", turkishMeaning: "asmak" },
    { v1: "wake", v2: "woke", v3: "woken", turkishMeaning: "uyanmak" },
    { v1: "steal", v2: "stole", v3: "stolen", turkishMeaning: "çalmak" },
    { v1: "swear", v2: "swore", v3: "sworn", turkishMeaning: "yemin etmek" },
    { v1: "bend", v2: "bent", v3: "bent", turkishMeaning: "eğmek" },
    { v1: "ride", v2: "rode", v3: "ridden", turkishMeaning: "binmek (ata, bisiklete)" },
    { v1: "hide", v2: "hid", v3: "hidden", turkishMeaning: "saklanmak" },
    { v1: "hurt", v2: "hurt", v3: "hurt", turkishMeaning: "incitmek" },
    { v1: "blow", v2: "blew", v3: "blown", turkishMeaning: "esmek, üflemek" },
    { v1: "forgive", v2: "forgave", v3: "forgiven", turkishMeaning: "affetmek" },
    { v1: "stick", v2: "stuck", v3: "stuck", turkishMeaning: "yapıştırmak, saplanmak" },
    { v1: "freeze", v2: "froze", v3: "frozen", turkishMeaning: "donmak" },
    { v1: "shine", v2: "shone", v3: "shone", turkishMeaning: "parlamak" },
    { v1: "spring", v2: "sprang", v3: "sprung", turkishMeaning: "fırlamak, zıplamak" },
    { v1: "creep", v2: "crept", v3: "crept", turkishMeaning: "sürünmek" },
    { v1: "kneel", v2: "knelt", v3: "knelt", turkishMeaning: "diz çökmek" },
    { v1: "seek", v2: "sought", v3: "sought", turkishMeaning: "aramak, araştırmak" },
    { v1: "spoil", v2: "spoiled/spoilt", v3: "spoiled/spoilt", turkishMeaning: "mahvetmek" },
    { v1: "bind", v2: "bound", v3: "bound", turkishMeaning: "bağlamak" },
    { v1: "dig", v2: "dug", v3: "dug", turkishMeaning: "kazmak" },
    { v1: "swing", v2: "swung", v3: "swung", turkishMeaning: "sallanmak" },
    { v1: "lay", v2: "laid", v3: "laid", turkishMeaning: "yatırmak, sermek" },
    { v1: "mow", v2: "mowed", v3: "mown/mowed", turkishMeaning: "biçmek" },
    { v1: "sow", v2: "sowed", v3: "sown/sowed", turkishMeaning: "ekmek (tohum)" },
    { v1: "bear", v2: "bore", v3: "borne/born", turkishMeaning: "taşımak, doğurmak" },
    { v1: "lie", v2: "lay", v3: "lain", turkishMeaning: "uzanmak" },
    { v1: "strike", v2: "struck", v3: "struck/stricken", turkishMeaning: "vurmak, çarpmak" },
    { v1: "sink", v2: "sank", v3: "sunk", turkishMeaning: "batmak" },
    { v1: "smell", v2: "smelled/smelt", v3: "smelled/smelt", turkishMeaning: "koklamak" },
    { v1: "tear", v2: "tore", v3: "torn", turkishMeaning: "yırtmak" },
    { v1: "weep", v2: "wept", v3: "wept", turkishMeaning: "ağlamak, sızlamak" },
    { v1: "bid", v2: "bid/bade", v3: "bid/bidden", turkishMeaning: "teklif vermek" },
    { v1: "cast", v2: "cast", v3: "cast", turkishMeaning: "atmak, fırlatmak" },
    { v1: "flee", v2: "fled", v3: "fled", turkishMeaning: "kaçmak" },
    { v1: "withdraw", v2: "withdrew", v3: "withdrawn", turkishMeaning: "çekmek (geri)" },
    { v1: "wring", v2: "wrung", v3: "wrung", turkishMeaning: "sıkmak, burmak" }
];