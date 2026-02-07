import { Link } from 'react-router-dom'

const designs = [
  {
    id: 1,
    path: "/design-1",
    name: "Bauhaus Blueprint",
    tagline: "Geometric precision with primary color blocking",
    gradient: "from-red-600 via-blue-700 to-yellow-500",
    accent: "bg-red-600",
    emoji: "◼",
  },
  {
    id: 2,
    path: "/design-2",
    name: "Terminal Green",
    tagline: "Hacker-style retro terminal with phosphor glow",
    gradient: "from-gray-950 via-green-950 to-gray-950",
    accent: "bg-green-400",
    emoji: "▶",
  },
  {
    id: 3,
    path: "/design-3",
    name: "Glassmorphism Luxe",
    tagline: "Premium frosted glass with floating translucent layers",
    gradient: "from-violet-950 via-indigo-900 to-slate-900",
    accent: "bg-violet-400",
    emoji: "◆",
  },
  {
    id: 4,
    path: "/design-4",
    name: "Ankara Heritage",
    tagline: "Warm African textile patterns with artisanal warmth",
    gradient: "from-amber-800 via-red-800 to-teal-900",
    accent: "bg-amber-600",
    emoji: "▲",
  },
  {
    id: 5,
    path: "/design-5",
    name: "Neo-Brutalist",
    tagline: "Raw anti-design with thick borders and offset shadows",
    gradient: "from-yellow-400 via-pink-400 to-blue-400",
    accent: "bg-yellow-400",
    emoji: "★",
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      {/* Header */}
      <header className="pt-16 pb-8 text-center px-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-sm text-gray-300 mb-6">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Made for Kenya
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
          Workplace
          <span className="block bg-gradient-to-r from-amber-400 via-green-400 to-red-400 bg-clip-text text-transparent">
            Budgeting
          </span>
        </h1>
        <p className="text-lg text-gray-400 max-w-xl mx-auto">
          Know your real take-home salary. 5 unique design concepts for the ultimate
          Kenyan salary calculator &mdash; pick your favourite.
        </p>
      </header>

      {/* Design Cards Grid */}
      <main className="max-w-6xl mx-auto px-6 pb-20">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <Link
              key={design.id}
              to={design.path}
              className="group relative overflow-hidden rounded-2xl border border-white/10 hover:border-white/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            >
              {/* Card gradient background */}
              <div className={`h-48 bg-gradient-to-br ${design.gradient} flex items-center justify-center`}>
                <span className="text-7xl group-hover:scale-110 transition-transform duration-300 opacity-80">
                  {design.emoji}
                </span>
              </div>

              {/* Card content */}
              <div className="p-6 bg-gray-900/80 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold">
                    Design {design.id}
                  </h2>
                  <span className={`w-3 h-3 rounded-full ${design.accent}`} />
                </div>
                <h3 className="text-lg font-semibold text-white/90 mb-1">
                  {design.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {design.tagline}
                </p>
                <div className="mt-4 flex items-center gap-2 text-sm text-gray-500 group-hover:text-white/70 transition-colors">
                  <span>View design</span>
                  <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                </div>
              </div>
            </Link>
          ))}

          {/* Info card */}
          <div className="rounded-2xl border border-dashed border-white/10 p-6 flex flex-col justify-center items-center text-center bg-white/[0.02]">
            <div className="text-4xl mb-3">🇰🇪</div>
            <h3 className="font-semibold text-white/80 mb-2">Built for Nairobi</h3>
            <p className="text-sm text-gray-500 max-w-[200px]">
              PAYE, NSSF, SHIF, Housing Levy &mdash; all calculated with 2026 Kenyan tax brackets.
            </p>
          </div>
        </div>

        {/* Features bar */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {["User Input Form", "Tax Calculator", "Expenses Dashboard", "Growth Projections", "Salary Comparison", "Rent Lookup", "Food Costs", "Travel Costs"].map((feature) => (
            <span
              key={feature}
              className="px-3 py-1.5 rounded-full bg-white/5 text-xs text-gray-400 border border-white/10"
            >
              {feature}
            </span>
          ))}
        </div>
      </main>
    </div>
  )
}
