import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[90vh] px-4 text-center relative overflow-hidden">
      {/* Arka Plan Efekti - Hata hissi için hafif kırmızı/indigo karışımı */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 blur-[120px] rounded-full -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -z-10"></div>

      <div className="max-w-xl flex flex-col items-center gap-6">
        {/* Hata Kodu */}
        <h1 className="text-[12rem] font-black text-white/5 leading-none select-none">
          404
        </h1>

        <div className="-mt-20 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Lost in Translation?
          </h2>
          <p className="text-lg text-slate-400 mb-8 leading-relaxed px-6">
            Even irregular verbs have rules, but this page doesn't exist. 
            Let's get you back to the practice zone.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/"
              className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 shadow-xl"
            >
              Back to Home
            </Link>
            
            <Link 
              href="/difficulty"
              className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
            >
              Start Practicing
            </Link>
          </div>
        </div>

        {/* Küçük bir espri */}
        <p className="mt-12 text-xs font-mono text-slate-600 uppercase tracking-widest">
          Verb: Find / Found / Found (not this page though)
        </p>
      </div>
    </div>
  );
}