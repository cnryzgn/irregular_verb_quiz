"use client";

import { useState, useEffect, useRef } from "react";
import {
  VerbRandomizer,
  VerbForm,
  ExamResult,
  IDifficultyConfig,
} from "../interfaces";
import { GameManager } from "../lib/GameManager";
import { useRouter } from "next/navigation";
import {
  checkIsAnswerInvalid,
  getCorrectVerbAnswer,
} from "../utils/handleMultiPartAnswer";
import Loading from "../components/Loading/Loading";

type GameStatus = "playing" | "correct" | "wrong" | "timeout";
type GameDiff = "easy" | "medium" | "hard" | "endless_blitz" | "endless_zen";

function Exam() {
  const router = useRouter();
  // 1. GameManager'ı useRef ile tanımlıyoruz (Bellekte sabit kalır)
  // Zorluğu sessionStorage'dan okuyoruz (Client-side olduğu için useEffect içinde veya başlangıçta kontrol edebiliriz)
  const engine = useRef<GameManager | null>(null);

  // State'ler
  const [currentQuestion, setCurrentQuestion] = useState<VerbRandomizer | null>(
    null
  );
  const [status, setStatus] = useState<GameStatus>("playing");
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [questionCountTime, setQuestionCountTime] = useState<number | null>();
  const [difficulty, setDifficulty] = useState<GameDiff>("medium");
  const [isLoading, setIsLoading] = useState(false);

  const [quizQuestions, setQuizQuestions] = useState<VerbRandomizer[]>([]);
  const [quizType, setQuizType] = useState<string>("");

  // --- SORU SAYACI İÇİN STATİK DEĞERLER ---
  // Daha sonra bunları engine.current.totalQuestions gibi dinamik hale getirebilirsin
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [totalSteps, setTotalSteps] = useState<number>(10);

  // 2. İlk Kurulum (Setup)
  useEffect(() => {
    sessionStorage.removeItem("userExamResult");
    const diff = (sessionStorage.getItem("diff") as GameDiff) || "medium";
    setDifficulty(diff);
    setCurrentStep(0);
    // Instance oluşturma
    engine.current = new GameManager(irregularVerbs, diff);
    setQuestionCountTime(engine.current.getTimerValue() || null);

    if (["easy", "medium", "hard"].includes(diff)) {
      const quiz: VerbRandomizer[] = engine.current.startGame();
      setQuizQuestions(quiz);
      setCurrentQuestion(quiz[currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      // İlk soruyu üret -endless için-
      const firstQuestion = engine.current.randomQuestionGenerate();
      setCurrentQuestion(firstQuestion);
    }
    setQuizType(engine.current.getQuizType());
    setTotalSteps(engine.current.getTotalQuestionCount());
    setTimeLeft(
      typeof engine.current.getTimerValue() === "number"
        ? (engine.current.getTimerValue() as number)
        : 10
    );
  }, []);

  // Zamanlayıcı Mantığı (Aynı kalıyor ama timer değeri engine'den geliyor)
  useEffect(() => {
    if (status !== "playing" || !currentQuestion) return;

    if (questionCountTime) {
      if (questionCountTime !== null && timeLeft <= 0) {
        setStatus("timeout");
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

    const correctAnswer = getCorrectVerbAnswer(currentQuestion, irregularVerbs);
    // Artık split/slash olayını helper fonksiyonumuz hallediyor
    const isInvalid = checkIsAnswerInvalid(userAnswer, correctAnswer);

    if (!isInvalid) {
      // DOĞRU CEVAP
      setStatus("correct");
      engine.current.updateScore();
      setScore(engine.current.score);
      setStreak((prev) => prev + 1);
    } else {
      // YANLIŞ CEVAP
      setStatus("wrong");
      setStreak(0);
    }
  };

  console.log("quiz");
  console.log(quizQuestions);

  const nextQuestion = () => {
    setIsLoading(true);
    if (!engine.current) return;

    if (!currentQuestion) return;

    // const correctAnswer = irregularVerbs.find(v => v[currentQuestion.pickedVerbVersion as keyof VerbForm] === currentQuestion.pickedVerb)?.[currentQuestion.question.verbKey as keyof VerbForm];
    const correctAnswer = getCorrectVerbAnswer(currentQuestion, irregularVerbs);
    const isInvalid = checkIsAnswerInvalid(userAnswer, correctAnswer);
    console.log("correct answer: " + correctAnswer);

    const currentQuestionResult: ExamResult = {
      answer: userAnswer.toLowerCase(),
      questionData: {
        turkishMeaning: "test",
        question: currentQuestion?.question.question || "unknown",
        shownVerb: currentQuestion?.pickedVerb || "unknown",
        shownVerbForm: currentQuestion?.pickedVerbVersion || "unknown",
      },
      timeLeft: timeLeft,
      isInvalidAnswer:
        userAnswer.trim().toLowerCase() !== String(correctAnswer).toLowerCase(),
      correctAnswer: String(correctAnswer),
      // Eksik olan ve hataya sebep olan alanlar:
      currentQuestion: currentStep, // veya o anki index
      totalQuestion: totalSteps,
      completedQuestionLocations: [], // Şimdilik boş bir dizi veya mevcut veriyi verebilirsin
    };

    engine.current.updateExamResult(currentQuestionResult);

    // Next Question for endless
    if (quizType === "endless") {
      const next = engine.current.randomQuestionGenerate();
      setCurrentQuestion(next);
    } else {
      if (currentQuestion?.isLastQuestion) {
        const quizResult = JSON.stringify(engine.current.getExamResult());
        sessionStorage.setItem("userExamResult", quizResult);
        setIsLoading(false);
        router.push("/result");
      } else {
        if (currentStep < totalSteps) {
          setCurrentStep(currentStep + 1);
          setCurrentQuestion(quizQuestions[currentStep]);
          setIsLoading(false);
        }
      }
    }

    setUserAnswer("");
    setStatus("playing");
    setShowHint(false);

    // Zorluk ayarındaki timer'ı tekrar kur
    if (questionCountTime) {
      const timerVal = engine.current.getTimerValue();
      setTimeLeft(typeof timerVal === "number" ? timerVal : 99);
    }
    setIsLoading(false);
  };
  console.log(quizQuestions);

  if (!currentQuestion || isLoading)
    return (
      <div>
        <Loading />
      </div>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] gap-4 md:gap-6 mt-4 md:mt-10 px-4 w-full max-w-4xl mx-auto">
      {/* ÜST PANEL: Score, Timer ve Streak */}
      <div className="flex flex-row items-center justify-between w-full max-w-2xl px-2 gap-2 md:gap-6">
        {/* Score Card */}
        <div className="flex-1 bg-white/5 backdrop-blur-sm px-3 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/10">
          <div className="flex flex-col items-start">
            <span className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
              <svg
                className="w-2 h-2 md:w-3 md:h-3 text-yellow-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Score
            </span>
            <span className="text-xl md:text-3xl font-black bg-gradient-to-r from-indigo-400 to-white bg-clip-text text-transparent">
              {score}
            </span>
          </div>
        </div>

        {/* Timer */}
        {questionCountTime && (
          <div className="relative flex items-center justify-center scale-90 md:scale-110">
            <svg className="w-16 h-16 md:w-20 md:h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                strokeWidth="6"
                fill="transparent"
                strokeDasharray={213.6}
                strokeDashoffset={
                  213.6 - (213.6 * timeLeft) / questionCountTime
                }
                strokeLinecap="round"
                className={`transition-all duration-1000 ${
                  timeLeft <= 3 ? "text-red-500" : "text-indigo-500"
                }`}
              />
            </svg>
            <span
              className={`absolute font-black text-xl md:text-2xl ${
                timeLeft <= 3 ? "text-red-500 animate-pulse" : "text-white"
              }`}
            >
              {timeLeft}
            </span>
          </div>
        )}

        {/* Streak Card */}
        <div className="flex-1 bg-white/5 backdrop-blur-sm px-3 py-3 md:px-6 md:py-4 rounded-xl md:rounded-2xl border border-white/10">
          <div className="flex flex-col items-end">
            <span className="text-slate-500 text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1">
              <svg
                className="w-2 h-2 md:w-3 md:h-3 text-orange-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                  clipRule="evenodd"
                />
              </svg>
              Streak
            </span>
            <span className="text-xl md:text-3xl font-black bg-gradient-to-r from-orange-400 to-white bg-clip-text text-transparent">
              x{streak}
            </span>
          </div>
        </div>
      </div>

      {/* YENİ NESİL PROGRESS BAR (UX Geliştirme) */}
      {quizType !== "endless" && (
        <div className="w-full max-w-2xl px-2 mt-2">
          <div className="flex justify-between items-end mb-2 px-1">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">
              Quiz Progress
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase">
              Step {currentStep} / {totalSteps}
            </span>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full border border-white/10 p-[2px] overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-6">
        {/* ANA KART */}
        <div
          className={`relative p-8 md:p-14 bg-white/[0.03] backdrop-blur-xl rounded-[2.5rem] md:rounded-[3.5rem] border-2 transition-all duration-700 shadow-2xl overflow-hidden
            ${
              status === "correct"
                ? "border-green-500/40 bg-green-500/5"
                : status === "wrong"
                ? "border-red-500/40 bg-red-500/5"
                : status === "timeout"
                ? "border-orange-500/40 bg-orange-500/5"
                : "border-white/10"
            }`}
        >
          <div className="relative z-10">
            {/* LAMBA GÖSTERGESİ */}
            <div className="flex flex-col items-center mb-10 md:mb-14">
              <div className="flex items-center gap-4 md:gap-6 bg-black/20 p-2 md:p-3 rounded-full border border-white/5 backdrop-blur-md">
                {[1, 2, 3].map((v) => {
                  const isActive =
                    currentQuestion.pickedVerbVersion === `v${v}`;

                  // Hata veren kısım burasıydı, Record ekleyerek düzelttik:
                  const colors: Record<number, string> = {
                    1: "shadow-indigo-500/50 bg-indigo-500 border-indigo-400",
                    2: "shadow-violet-500/50 bg-violet-500 border-violet-400",
                    3: "shadow-fuchsia-500/50 bg-fuchsia-500 border-fuchsia-400",
                  };

                  return (
                    <div key={v} className="flex items-center">
                      <div
                        className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center font-black text-sm md:text-lg transition-all duration-500 border-2
          ${
            isActive
              ? `${colors[v]} text-white scale-110 shadow-[0_0_20px_rgba(0,0,0,0.2)] ring-4 ring-white/10`
              : "bg-white/5 border-white/5 text-slate-600 opacity-40"
          }`}
                      >
                        V{v}
                        {isActive && (
                          <span className="absolute inset-0 rounded-full animate-pulse bg-current opacity-20 pointer-events-none"></span>
                        )}
                      </div>
                      {v < 3 && (
                        <div className="w-2 md:w-4 h-[2px] bg-white/5 ml-4 md:ml-6" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ana Kelime */}
            <div className="text-center mb-6">
              <div
                className={`h-10 transition-all duration-500 mb-2 ${
                  showHint
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 -translate-y-4"
                }`}
              >
                <span className="px-4 py-2 bg-amber-500/10 text-amber-400 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-xl border border-amber-500/20">
                  💡 {currentQuestion.turkishMeaning || "..."}
                </span>
              </div>

              <h2
                className={`text-6xl md:text-7xl font-black tracking-tighter mb-6 transition-all duration-500 ${
                  status === "correct"
                    ? "text-green-400"
                    : status === "wrong"
                    ? "text-red-400"
                    : status === "timeout"
                    ? "text-orange-400"
                    : "text-white"
                }`}
              >
                {currentQuestion.pickedVerb}
              </h2>

              <div className="inline-flex flex-col items-center gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  PLEASE WRITE
                </span>
                <div className="px-6 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>
                  <p className="text-indigo-400 font-black text-xl md:text-2xl uppercase tracking-tight">
                    {currentQuestion.question.verbKey}{" "}
                    <span className="text-slate-500 font-medium">Form</span>
                  </p>
                </div>
              </div>
            </div>

            {/* SONUÇ PANELİ */}
            {["correct", "wrong", "timeout"].includes(status) && (
              <div className="mt-8 md:mt-12 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="flex flex-col items-center gap-6">
                  {status === "correct" && (
                    <div className="flex flex-col items-center gap-4 w-full">
                      <p className="text-slate-500 text-xs font-black uppercase tracking-widest">
                        You Answered
                      </p>
                      <div className="text-green-400 text-4xl md:text-6xl font-black tracking-tight bg-green-500/10 px-10 py-4 rounded-3xl border-2 border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.15)]">
                        {userAnswer}
                      </div>
                    </div>
                  )}

                  {(status === "wrong" || status === "timeout") && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
                      <div className="flex flex-col items-center p-4 bg-red-500/5 rounded-2xl border border-red-500/20">
                        <p className="text-red-500/60 text-[10px] font-black uppercase mb-2">
                          Your Answer
                        </p>
                        <span className="text-red-400 text-2xl font-black line-through opacity-70">
                          {userAnswer || "Empty"}
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                        <p className="text-green-500/60 text-[10px] font-black uppercase mb-2">
                          Correct Answer
                        </p>
                        <span className="text-green-400 text-2xl font-black">
                          {currentQuestion.correctAnswer}
                        </span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={nextQuestion}
                    className="group relative w-full max-w-sm overflow-hidden rounded-2xl bg-white text-black py-5 font-black text-lg transition-all active:scale-95 shadow-[0_20px_40px_-15px_rgba(255,255,255,0.3)] hover:bg-indigo-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-3">
                      {currentQuestion.isLastQuestion
                        ? "SEE RESULTS"
                        : "NEXT VERB"}
                      <svg
                        className="w-6 h-6 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* INPUT ALANI */}
        {status === "playing" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full px-2">
            <div className="flex flex-col gap-4">
              <div
                className={`relative flex flex-col md:flex-row items-stretch gap-3 p-3 rounded-[2.5rem] md:rounded-full transition-all duration-300 bg-white/[0.04] backdrop-blur-3xl border-2
                        ${
                          userAnswer
                            ? "border-indigo-500/50 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
                            : "border-white/10"
                        }
                        focus-within:border-indigo-400 focus-within:bg-white/[0.07]`}
              >
                <input
                  type="text"
                  value={userAnswer}
                  autoFocus
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCheck();
                    if (e.key === "," || e.key === ".") {
                      if (userAnswer === "") {
                        e.preventDefault();
                        setShowHint(true);
                      }
                    }
                  }}
                  placeholder={`Enter ${currentQuestion.question.verbKey}...`}
                  className="flex-1 bg-transparent px-8 py-5 text-white outline-none text-2xl font-bold placeholder:text-slate-700 text-center md:text-left tracking-wide"
                />
                <button
                  onClick={handleCheck}
                  className={`py-5 px-12 rounded-full font-black tracking-widest transition-all active:scale-95
                                ${
                                  userAnswer.length > 0
                                    ? "bg-indigo-600 text-white shadow-xl hover:bg-indigo-500"
                                    : "bg-white/10 text-slate-500"
                                }`}
                >
                  CHECK
                </button>
              </div>
              {/* Alt Bilgi Alanı */}
              <div className="flex justify-start items-center px-8">
                <div className="flex items-center gap-2">
                  <kbd className="hidden md:inline-flex h-6 w-6 items-center justify-center rounded border border-slate-700 bg-slate-800 text-[10px] font-medium text-slate-400">
                    .
                  </kbd>
                  <span className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
                    Press point for hint
                  </span>
                </div>
              </div>
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
  {
    v1: "stand",
    v2: "stood",
    v3: "stood",
    turkishMeaning: "durmak, ayakta durmak",
  },
  { v1: "lose", v2: "lost", v3: "lost", turkishMeaning: "kaybetmek" },
  { v1: "meet", v2: "met", v3: "met", turkishMeaning: "buluşmak, tanışmak" },
  { v1: "pay", v2: "paid", v3: "paid", turkishMeaning: "ödemek" },
  { v1: "set", v2: "set", v3: "set", turkishMeaning: "kurmak, ayarlamak" },
  {
    v1: "understand",
    v2: "understood",
    v3: "understood",
    turkishMeaning: "anlamak",
  },
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
  {
    v1: "fight",
    v2: "fought",
    v3: "fought",
    turkishMeaning: "dövüşmek, savaşmak",
  },
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
  {
    v1: "deal",
    v2: "dealt",
    v3: "dealt",
    turkishMeaning: "ilgilenmek, anlaşmak",
  },
  { v1: "bite", v2: "bit", v3: "bitten", turkishMeaning: "ısırmak" },
  { v1: "grow", v2: "grew", v3: "grown", turkishMeaning: "büyümek" },
  { v1: "choose", v2: "chose", v3: "chosen", turkishMeaning: "seçmek" },
  { v1: "hang", v2: "hung", v3: "hung", turkishMeaning: "asmak" },
  { v1: "wake", v2: "woke", v3: "woken", turkishMeaning: "uyanmak" },
  { v1: "steal", v2: "stole", v3: "stolen", turkishMeaning: "çalmak" },
  { v1: "swear", v2: "swore", v3: "sworn", turkishMeaning: "yemin etmek" },
  { v1: "bend", v2: "bent", v3: "bent", turkishMeaning: "eğmek" },
  {
    v1: "ride",
    v2: "rode",
    v3: "ridden",
    turkishMeaning: "binmek (ata, bisiklete)",
  },
  { v1: "hide", v2: "hid", v3: "hidden", turkishMeaning: "saklanmak" },
  { v1: "hurt", v2: "hurt", v3: "hurt", turkishMeaning: "incitmek" },
  { v1: "blow", v2: "blew", v3: "blown", turkishMeaning: "esmek, üflemek" },
  { v1: "forgive", v2: "forgave", v3: "forgiven", turkishMeaning: "affetmek" },
  {
    v1: "stick",
    v2: "stuck",
    v3: "stuck",
    turkishMeaning: "yapıştırmak, saplanmak",
  },
  { v1: "freeze", v2: "froze", v3: "frozen", turkishMeaning: "donmak" },
  { v1: "shine", v2: "shone", v3: "shone", turkishMeaning: "parlamak" },
  {
    v1: "spring",
    v2: "sprang",
    v3: "sprung",
    turkishMeaning: "fırlamak, zıplamak",
  },
  { v1: "creep", v2: "crept", v3: "crept", turkishMeaning: "sürünmek" },
  { v1: "kneel", v2: "knelt", v3: "knelt", turkishMeaning: "diz çökmek" },
  {
    v1: "seek",
    v2: "sought",
    v3: "sought",
    turkishMeaning: "aramak, araştırmak",
  },
  {
    v1: "spoil",
    v2: "spoiled/spoilt",
    v3: "spoiled/spoilt",
    turkishMeaning: "mahvetmek",
  },
  { v1: "bind", v2: "bound", v3: "bound", turkishMeaning: "bağlamak" },
  { v1: "dig", v2: "dug", v3: "dug", turkishMeaning: "kazmak" },
  { v1: "swing", v2: "swung", v3: "swung", turkishMeaning: "sallanmak" },
  { v1: "lay", v2: "laid", v3: "laid", turkishMeaning: "yatırmak, sermek" },
  { v1: "mow", v2: "mowed", v3: "mown/mowed", turkishMeaning: "biçmek" },
  { v1: "sow", v2: "sowed", v3: "sown/sowed", turkishMeaning: "ekmek (tohum)" },
  {
    v1: "bear",
    v2: "bore",
    v3: "borne/born",
    turkishMeaning: "taşımak, doğurmak",
  },
  { v1: "lie", v2: "lay", v3: "lain", turkishMeaning: "uzanmak" },
  {
    v1: "strike",
    v2: "struck",
    v3: "struck/stricken",
    turkishMeaning: "vurmak, çarpmak",
  },
  { v1: "sink", v2: "sank", v3: "sunk", turkishMeaning: "batmak" },
  {
    v1: "smell",
    v2: "smelled/smelt",
    v3: "smelled/smelt",
    turkishMeaning: "koklamak",
  },
  { v1: "tear", v2: "tore", v3: "torn", turkishMeaning: "yırtmak" },
  { v1: "weep", v2: "wept", v3: "wept", turkishMeaning: "ağlamak, sızlamak" },
  {
    v1: "bid",
    v2: "bid/bade",
    v3: "bid/bidden",
    turkishMeaning: "teklif vermek",
  },
  { v1: "cast", v2: "cast", v3: "cast", turkishMeaning: "atmak, fırlatmak" },
  { v1: "flee", v2: "fled", v3: "fled", turkishMeaning: "kaçmak" },
  {
    v1: "withdraw",
    v2: "withdrew",
    v3: "withdrawn",
    turkishMeaning: "çekmek (geri)",
  },
  { v1: "wring", v2: "wrung", v3: "wrung", turkishMeaning: "sıkmak, burmak" },
];
