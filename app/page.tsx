import Link from "next/link"

async function Home() {


  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center">
      {/* Dekoratif Arka Plan Işığı */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-600/20 blur-[120px] rounded-full -z-10"></div>

      <div className="max-w-3xl flex flex-col items-center gap-6">
        <span className="px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium tracking-wide animate-pulse">
          Verb Learning
        </span>
       

        <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-none">
          Master English <br />
          <span className="bg-gradient-to-r from-indigo-400 via-white to-slate-400 bg-clip-text text-transparent">
            Irregular Verbs
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
          Stop memorizing lists. Practice with an interactive, minimalist tool designed to help you master the hardest part of English grammar.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center">
          <Link
            href="/difficulty"
            className="px-10 py-4 bg-white text-black font-bold rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 shadow-[0_0_30px_rgba(255,255,255,0.2)] text-lg inline-block"
          >
            Start Practicing
          </Link>

          <Link href="/how-it-works" className="px-10 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-lg">
            How it works?
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-8 w-full max-w-2xl">
          <div>
            <div className="text-2xl font-bold text-white">200+</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">Verbs</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">3 Levels</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">Difficulty</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">∞</div>
            <div className="text-sm text-slate-500 uppercase tracking-widest">Practice</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home