export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-bold text-white">
          StudyPilot AI
        </h1>

        <p className="text-slate-400">
          Your intelligent study companion.
        </p>

        <button className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    </main>
  );
}