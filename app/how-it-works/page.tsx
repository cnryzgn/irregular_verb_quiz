import Link from 'next/link';

export default async function HowItWorks() {
  const steps = [
    {
      title: "Randomized Challenge",
      desc: "Our system picks a random irregular verb and shows you one of its forms (V1, V2, or V3).",
      icon: "🎲",
      color: "from-blue-500/20 to-indigo-500/20"
    },
    {
      title: "Active Recall",
      desc: "You are asked to provide a different form. This forces your brain to retrieve the information, strengthening memory.",
      icon: "🧠",
      color: "from-indigo-500/20 to-purple-500/20"
    },
    {
      title: "Instant Feedback",
      desc: "Submit your answer and get immediate results. Learn from mistakes instantly to improve faster.",
      icon: "⚡",
      color: "from-purple-500/20 to-pink-500/20"
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4 relative overflow-hidden">
      {/* Arka Plan Dekorasyonu */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full -z-10"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/10 blur-[150px] rounded-full -z-10"></div>

      <div className="max-w-5xl w-full relative z-10">
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            How it <span className="text-indigo-500">Works</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto">
            Traditional memorization is boring. We use science-backed methods to help you internalize irregular verbs naturally.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all duration-300 hover:-translate-y-2"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-3xl mb-6 border border-white/10 group-hover:scale-110 transition-transform`}>
                {step.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 rounded-[32px] bg-gradient-to-r from-indigo-600 to-purple-700 text-center relative overflow-hidden group">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to start?</h2>
                <p className="text-indigo-100 mb-8 max-w-md mx-auto">Join thousands of learners mastering English verbs every day.</p>
                <Link 
                    href="/content" 
                    className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:shadow-xl transition-all active:scale-95 inline-block"
                >
                    Get Started Now
                </Link>
            </div>
            {/* Kart içi dekoratif ışık */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-3xl -mr-20 -mt-20 rounded-full"></div>
        </div>

        <div className="mt-12 text-center">
            <Link href="/" className="text-slate-500 hover:text-white transition-colors">
                ← Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}