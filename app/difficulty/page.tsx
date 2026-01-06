"use client"
import Link from "next/link";


export default function DifficultyPage() {
    const levels = [
        {
            id: "easy",
            title: "Beginner",
            description: "Focus on the most common 50 verbs. Perfect for starting out.",
            color: "from-emerald-500/20 to-emerald-500/5",
            borderColor: "border-emerald-500/20 hover:border-emerald-500/50",
            iconColor: "text-emerald-400",
            count: "50 Verbs",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
        {
            id: "medium",
            title: "Intermediate",
            description: "Master the top 120 verbs. The core of daily English.",
            color: "from-indigo-500/20 to-indigo-500/5",
            borderColor: "border-indigo-500/20 hover:border-indigo-500/50",
            iconColor: "text-indigo-400",
            count: "120 Verbs",
            popular: true,
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
                </svg>
            ),
        },
        {
            id: "hard",
            title: "Expert",
            description: "Challenge yourself with all 200+ irregular verbs.",
            color: "from-rose-500/20 to-rose-500/5",
            borderColor: "border-rose-500/20 hover:border-rose-500/50",
            iconColor: "text-rose-400",
            count: "All Verbs",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-4.546 1.97 3.75 3.75 0 0 0 4.051 5.498Z" />
                </svg>
            ),
        },
        {
            id: "endless_blitz",
            title: "Endless Blitz",
            description: "Speed is everything. Complete all verbs against the clock.",
            color: "from-amber-500/20 to-amber-500/5",
            borderColor: "border-amber-500/20 hover:border-amber-500/50",
            iconColor: "text-amber-400",
            count: "Countdown ON",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            ),
        },
        {
            id: "endless_zen",
            title: "Endless Zen",
            description: "No pressure, just you and the verbs. Practice indefinitely.",
            color: "from-cyan-500/20 to-cyan-500/5",
            borderColor: "border-cyan-500/20 hover:border-cyan-500/50",
            iconColor: "text-cyan-400",
            count: "All Verbs",
            icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            ),
        },
    ];

    const difficultySelectionHandler = (diff: string) => {
        if (sessionStorage.getItem("dif")) {
            const removedDifficultySession = sessionStorage.removeItem("diff")
        }

        const difficultySession: void = sessionStorage.setItem("diff", diff)

        if (diff !== 'endless_no_count' && diff !== 'endless_with_count') {
            // Endless mode must be active
        }

        if (diff === 'easy') {
            // Easy mode must be active

        }

        if (diff === 'medium') {
            // Medium mode must be active
        }

        if (diff === 'hard') {
            // Hard mode must be active
        }

        window.location.href = '/exam'
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 relative">
            {/* Dekoratif Işıklar */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 blur-[120px] rounded-full -z-10"></div>

            <div className="max-w-6xl w-full">
                <div className="text-center mb-16">
                    <span className="text-indigo-400 text-sm font-bold tracking-[0.3em] uppercase mb-4 block">Challenge Mode</span>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-4">
                        Pick Your <span className="bg-gradient-to-r from-indigo-400 to-slate-400 bg-clip-text text-transparent">Path</span>
                    </h1>
                </div>

                {/* Kartlar - Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {levels.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => difficultySelectionHandler(level.id)} // Seçim fonksiyonunuzu buraya bağlayabilirsiniz
                            className={`group relative flex flex-col cursor-pointer p-8 rounded-[2rem] bg-white/5 border ${level.borderColor} transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl text-left w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/50`}
                        >
                            {/* Arka Plan Gradient Efekti */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${level.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                            {level.popular && (
                                <div className="absolute top-5 right-5 z-20">
                                    <span className="bg-indigo-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-indigo-500/20">
                                        Recommended
                                    </span>
                                </div>
                            )}

                            <div className="relative z-10 w-full">
                                <div className={`${level.iconColor} mb-6 p-3 bg-white/5 rounded-2xl w-fit group-hover:scale-110 transition-transform duration-500`}>
                                    {level.icon}
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-white transition-colors">
                                    {level.title}
                                </h3>

                                <p className="text-slate-400 text-sm leading-relaxed mb-8 h-10 line-clamp-2">
                                    {level.description}
                                </p>

                                <div className="flex items-center justify-between mt-auto w-full">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        {level.count}
                                    </span>
                                    <div className={`opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 ${level.iconColor}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                <div className="mt-16 text-center">
                    <Link href="/" className="px-8 py-3 rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-all inline-flex items-center gap-2 text-sm font-bold">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}