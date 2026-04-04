import Link from 'next/link'
import { BookOpen, CheckCircle, Star, Zap, Brain, Award } from 'lucide-react'
import Button from '@/components/ui/Button'

const subjects = [
  { emoji: '🧪', name: 'Biochemistry', topics: 6 },
  { emoji: '🦠', name: 'Microbiology', topics: 7 },
  { emoji: '🔬', name: 'Cell Biology', topics: 4 },
  { emoji: '🧬', name: 'Molecular Biology & Genetics', topics: 12 },
  { emoji: '🔭', name: 'Bioanalytical Techniques', topics: 6 },
  { emoji: '🛡️', name: 'Immunology', topics: 12 },
  { emoji: '💻', name: 'Bioinformatics', topics: 5 },
  { emoji: '🧫', name: 'Recombinant DNA Technology', topics: 12 },
  { emoji: '🌱', name: 'Plant Biotechnology', topics: 14 },
  { emoji: '🐭', name: 'Animal Biotechnology & Bioprocessing', topics: 23 },
]

const features = [
  { icon: BookOpen, title: 'Comprehensive Notes', desc: 'Short + detailed notes for every topic' },
  { icon: Brain, title: 'AI Doubt Solver', desc: 'Ask doubts on any topic, get instant answers' },
  { icon: Zap, title: 'AI Notes Generator', desc: 'Generate personalized study notes with one click' },
  { icon: Award, title: 'PYQ Bank', desc: 'Last 10 years official GAT-B questions, topic-wise' },
  { icon: Star, title: 'Quiz System', desc: '10 quizzes × 30 questions per topic' },
  { icon: CheckCircle, title: 'Lifetime Access', desc: 'Pay once, access forever — no subscription' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">BioSciences Mastery</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm" className="border-white text-white hover:bg-white/10">
              Login / Sign Up
            </Button>
          </Link>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 text-sm mb-6">
            <Star className="w-4 h-4 text-yellow-300" />
            India&apos;s #1 GAT-B Preparation Platform
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Master GAT-B with<br />
            <span className="text-yellow-300">Confidence</span>
          </h1>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Complete study material, PYQs, quizzes, and AI tools for all 10 GAT-B subjects.
            One-time payment. Lifetime access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold w-full sm:w-auto">
                Start Preparing Free 🚀
              </Button>
            </Link>
            <a href="#pricing">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto">
                View Pricing ₹449 onwards
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything you need to crack GAT-B</h2>
            <p className="text-gray-600 text-lg">Comprehensive resources in one platform</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">All 10 GAT-B Subjects Covered</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {subjects.map((s) => (
              <div key={s.name} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm text-center">
                <div className="text-3xl mb-2">{s.emoji}</div>
                <h3 className="font-semibold text-gray-800 text-sm mb-1">{s.name}</h3>
                <p className="text-xs text-gray-400">{s.topics} topics</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Simple, Lifetime Pricing</h2>
            <p className="text-gray-600">Pay once. Access forever. No subscriptions.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Single Subject */}
            <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-700 mb-2">Single Subject</h3>
              <div className="text-5xl font-extrabold text-gray-900 mb-1">₹449</div>
              <p className="text-gray-500 text-sm mb-6">per subject • lifetime</p>
              <ul className="space-y-3 mb-8">
                {['Complete notes', 'Flowcharts & diagrams', 'Official PYQ bank', '10 quizzes × 30 questions', 'AI Doubt Solver', 'AI Notes Generator'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button variant="outline" className="w-full">Buy a Subject</Button>
              </Link>
            </div>

            {/* Full Course */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-2xl p-8 border-2 border-emerald-600 shadow-lg text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-1 rounded-full">
                BEST VALUE
              </div>
              <h3 className="text-lg font-bold text-emerald-100 mb-2">Full Course</h3>
              <div className="text-5xl font-extrabold mb-1">₹999</div>
              <p className="text-emerald-200 text-sm mb-6">all 10 subjects • lifetime</p>
              <ul className="space-y-3 mb-8">
                {['All 10 GAT-B subjects', 'Everything in Single Subject', 'Save vs buying separately', 'Priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-emerald-100">
                    <CheckCircle className="w-4 h-4 text-yellow-300 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/login">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold">
                  Buy Full Course
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-white">BioSciences Mastery</span>
          </div>
          <p className="text-sm">GAT-B preparation platform for India • Secure payments via Razorpay</p>
          <p className="text-xs mt-2">© 2025 BioSciences Mastery. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
