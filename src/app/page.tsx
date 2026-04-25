export default function Home() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 text-center relative overflow-hidden">
      {/* Background ambient glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cobalt/20 rounded-full blur-[120px] -z-10" />

      <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
        Invest in Lagos Transport. <br />
        <span className="text-slate-light text-3xl md:text-5xl lg:text-6xl">
          We Take the Risk, You Take the Returns.
        </span>
      </h1>
      
      <p className="max-w-2xl text-lg md:text-xl text-slate-light mb-10">
        Professional, hassle-free vehicle management for Tricycles, Uber Cars, and Minibuses. Guaranteed weekly payouts, backed by a concrete agreement.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <button className="px-8 py-4 bg-signal-red hover:bg-signal-red/90 text-crisp-white font-semibold rounded-lg transition-colors">
          Get an Investment Proposal
        </button>
        <button className="px-8 py-4 bg-void-light border border-cobalt hover:bg-cobalt text-crisp-white font-semibold rounded-lg transition-colors">
          Explore Our Portfolios
        </button>
      </div>
    </section>
  );
}
