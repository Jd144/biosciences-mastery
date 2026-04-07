import Link from 'next/link'
import {
  BookOpen,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Star,
  Award,
  Users,
  Target,
} from 'lucide-react'

const importantDates = [
  { event: 'Official Notification Release', date: 'February 2026', status: 'done' },
  { event: 'Online Application Start', date: 'March 2026', status: 'done' },
  { event: 'Application Last Date', date: 'April 2026', status: 'active' },
  { event: 'Admit Card Download', date: 'May–June 2026', status: 'upcoming' },
  { event: 'GAT-B 2026 Exam Date', date: 'June–July 2026', status: 'upcoming' },
  { event: 'Answer Key Release', date: 'July 2026', status: 'upcoming' },
  { event: 'Result Declaration', date: 'August–September 2026', status: 'upcoming' },
]

const examPattern = [
  { section: 'Part A — General Aptitude', questions: 10, marks: 10, negMarking: 'None', markingScheme: '+1 per correct' },
  { section: 'Part B — Biotechnology Core', questions: 55, marks: 165, negMarking: '−1 per wrong', markingScheme: '+3 per correct' },
]

const eligibility = [
  "M.Sc. / M.Tech. in Biotechnology or related Life Sciences disciplines",
  "B.Tech. / B.E. in Biotechnology or related fields",
  "Final year students appearing in qualifying examination are also eligible",
  "Minimum 55% marks in qualifying degree (50% for SC/ST/PwD)",
]

const syllabusSections = [
  { slug: 'biochemistry', name: 'Biochemistry', emoji: '🧪', topics: ['Biomolecules', 'Metabolism', 'Enzymology', 'Bioenergetics', 'Molecular Interactions'] },
  { slug: 'microbiology', name: 'Microbiology', emoji: '🦠', topics: ['Microbial Diversity', 'Bacterial Genetics', 'Virology', 'Immunomicrobiology', 'Fermentation'] },
  { slug: 'cell-biology', name: 'Cell Biology', emoji: '🔬', topics: ['Cell Structure', 'Cell Signalling', 'Cell Cycle', 'Organelles'] },
  { slug: 'molecular-biology-genetics', name: 'Molecular Biology & Genetics', emoji: '🧬', topics: ['DNA Replication', 'Transcription', 'Translation', 'Gene Regulation', 'Mutations & Repair'] },
  { slug: 'bioanalytical-techniques', name: 'Bioanalytical Techniques', emoji: '🔭', topics: ['Chromatography', 'Spectroscopy', 'Electrophoresis', 'Microscopy', 'Centrifugation'] },
  { slug: 'immunology', name: 'Immunology', emoji: '🛡️', topics: ['Antigens & Antibodies', 'Complement System', 'Cell-mediated Immunity', 'Hypersensitivity', 'Vaccines'] },
  { slug: 'bioinformatics', name: 'Bioinformatics', emoji: '💻', topics: ['Sequence Analysis', 'BLAST', 'Phylogenetics', 'Protein Structure', 'Databases'] },
  { slug: 'recombinant-dna-technology', name: 'Recombinant DNA Technology', emoji: '🧫', topics: ['Restriction Enzymes', 'Vectors & Cloning', 'PCR', 'Gene Expression', 'Genomic Libraries'] },
  { slug: 'plant-biotechnology', name: 'Plant Biotechnology', emoji: '🌱', topics: ['Tissue Culture', 'Transgenic Plants', 'Plant Hormones', 'Stress Biology', 'Crop Improvement'] },
  { slug: 'animal-biotechnology-bioprocessing', name: 'Animal Biotechnology & Bioprocessing', emoji: '🐭', topics: ['Cell Culture', 'Stem Cells', 'Transgenics', 'Bioreactors', 'Downstream Processing'] },
]

const pyqYears = [2024, 2023, 2022, 2021, 2020]

export default function GatB2026Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header / Nav */}
      <header className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg">BioSciences Mastery</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-emerald-100 hover:text-white text-sm hidden sm:block"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/30"
            >
              Login / Sign Up
            </Link>
          </div>
        </nav>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full px-4 py-2 text-sm mb-6 text-yellow-200">
            <Star className="w-4 h-4 text-yellow-300" />
            GAT-B 2026 — Complete Exam Guide
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            GAT-B 2026 Exam<br />
            <span className="text-yellow-300">All Details</span>
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
            Graduate Aptitude Test in Biotechnology 2026 — Dates, Pattern, Syllabus, PYQs & Preparation Resources
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/login"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3 rounded-xl text-sm"
            >
              Start Preparing Free 🚀
            </Link>
            <a
              href="#syllabus"
              className="border border-white/40 text-white hover:bg-white/10 px-6 py-3 rounded-xl text-sm font-medium"
            >
              View Syllabus ↓
            </a>
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-amber-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Dates shown are based on official GAT-B schedule patterns. Always verify with the{' '}
          <a
            href="https://www.jnu.ac.in"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-medium"
          >
            official JNU / DBT website
          </a>
          .
        </div>
      </div>

      {/* Quick Stats */}
      <section className="py-10 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { icon: FileText, label: 'Total Questions', value: '65 MCQs' },
              { icon: Clock, label: 'Exam Duration', value: '3 Hours' },
              { icon: Award, label: 'Maximum Marks', value: '175 Marks' },
              { icon: Users, label: 'Exam Mode', value: 'Computer-Based' },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="bg-emerald-100 w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Dates */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-100 p-2 rounded-xl">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">GAT-B 2026 Important Dates</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {importantDates.map((item, i) => (
              <div
                key={item.event}
                className={`flex items-center justify-between px-6 py-4 ${
                  i !== 0 ? 'border-t border-gray-100' : ''
                } ${item.status === 'active' ? 'bg-emerald-50' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      item.status === 'done'
                        ? 'bg-gray-400'
                        : item.status === 'active'
                        ? 'bg-emerald-500 ring-2 ring-emerald-200'
                        : 'bg-gray-200'
                    }`}
                  />
                  <span
                    className={`font-medium text-sm ${
                      item.status === 'active' ? 'text-emerald-800' : 'text-gray-700'
                    }`}
                  >
                    {item.event}
                    {item.status === 'active' && (
                      <span className="ml-2 bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold shrink-0 ${
                    item.status === 'active'
                      ? 'text-emerald-700'
                      : item.status === 'done'
                      ? 'text-gray-400'
                      : 'text-gray-600'
                  }`}
                >
                  {item.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Pattern */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-blue-100 p-2 rounded-xl">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Exam Pattern & Marking Scheme</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Pattern Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-800">Section-wise Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 text-gray-500 font-medium">Section</th>
                      <th className="text-center px-4 py-3 text-gray-500 font-medium">Q</th>
                      <th className="text-center px-4 py-3 text-gray-500 font-medium">Marks</th>
                      <th className="text-center px-4 py-3 text-gray-500 font-medium">Negative</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examPattern.map((row) => (
                      <tr key={row.section} className="border-b border-gray-50 last:border-0">
                        <td className="px-4 py-3 font-medium text-gray-700">{row.section}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{row.questions}</td>
                        <td className="px-4 py-3 text-center text-gray-600">{row.marks}</td>
                        <td className="px-4 py-3 text-center text-red-500 text-xs font-medium">{row.negMarking}</td>
                      </tr>
                    ))}
                    <tr className="bg-emerald-50">
                      <td className="px-4 py-3 font-bold text-gray-800">Total</td>
                      <td className="px-4 py-3 text-center font-bold text-gray-800">65</td>
                      <td className="px-4 py-3 text-center font-bold text-emerald-700">175</td>
                      <td className="px-4 py-3 text-center text-gray-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Key Highlights */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-bold text-gray-800 mb-5">Key Exam Highlights</h3>
              <ul className="space-y-4">
                {[
                  { label: 'Exam Duration', value: '3 Hours (180 minutes)' },
                  { label: 'Question Type', value: 'Multiple Choice Questions (MCQ)' },
                  { label: 'Part A Marking', value: '+1 correct, No negative marking' },
                  { label: 'Part B Marking', value: '+3 correct, −1 for wrong answer' },
                  { label: 'Language', value: 'English only' },
                  { label: 'Exam Mode', value: 'Computer-Based Test (CBT)' },
                  { label: 'Conducting Body', value: 'DBT / JNU, Govt. of India' },
                ].map(({ label, value }) => (
                  <li key={label} className="flex justify-between items-start gap-4 text-sm">
                    <span className="text-gray-500 shrink-0">{label}</span>
                    <span className="font-medium text-gray-800 text-right">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Marking Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex items-start gap-3">
            <Target className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>Strategy Tip:</strong> Part A (General Aptitude) has no negative marking — attempt all 10 questions.
              For Part B, each wrong answer costs you 1 mark, so skip questions you are unsure about to avoid losing +3 potential.
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-purple-100 p-2 rounded-xl">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Eligibility Criteria</h2>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <ul className="space-y-3">
              {eligibility.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Syllabus */}
      <section id="syllabus" className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">GAT-B 2026 Syllabus</h2>
            <p className="text-gray-500">
              All 10 subject areas covered in Part B of GAT-B. Click on a subject to start studying.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {syllabusSections.map((subject) => (
              <div
                key={subject.slug}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:border-emerald-200 hover:shadow-md transition-all"
              >
                <div className="p-5">
                  <div className="text-3xl mb-3">{subject.emoji}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-3">{subject.name}</h3>
                  <ul className="space-y-1 mb-4">
                    {subject.topics.slice(0, 4).map((topic) => (
                      <li key={topic} className="text-xs text-gray-500 flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                        {topic}
                      </li>
                    ))}
                    {subject.topics.length > 4 && (
                      <li className="text-xs text-gray-400 italic pl-3">
                        +{subject.topics.length - 4} more topics…
                      </li>
                    )}
                  </ul>
                  <Link
                    href="/login"
                    className="block w-full text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    Study This Subject →
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3 rounded-xl"
            >
              <BookOpen className="w-5 h-5" />
              Access Full Syllabus & Study Material
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PYQ Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-amber-100 p-2 rounded-xl">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Previous Year Questions (PYQ)</h2>
              <p className="text-gray-500 text-sm">Last 5 years official GAT-B questions, topic-wise</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-8">
            {pyqYears.map((year) => (
              <div
                key={year}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center hover:border-amber-200 hover:shadow-md transition-all"
              >
                <div className="text-2xl font-extrabold text-gray-800 mb-1">{year}</div>
                <div className="text-xs text-gray-400">GAT-B PYQ</div>
                <Link
                  href="/login"
                  className="block mt-3 text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  Access →
                </Link>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Star className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-amber-900 mb-1">Why Practice PYQs?</h3>
                <p className="text-amber-800 text-sm">
                  Analyzing previous year questions is the most effective GAT-B preparation strategy.
                  60–70% of questions are conceptually repeated from prior years.
                </p>
              </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 ml-8">
              {[
                'Understand the exact question style and difficulty',
                'Identify high-weightage topics per subject',
                'Track answer patterns and eliminate options faster',
                'Build exam confidence with timed practice',
              ].map((tip) => (
                <li key={tip} className="text-xs text-amber-700 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-extrabold mb-4">Start Your GAT-B 2026 Preparation Today</h2>
          <p className="text-emerald-100 text-lg mb-8">
            Short notes, PYQs, 50-question quizzes, and AI tools — everything you need in one platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl text-sm"
            >
              Start Preparing Free 🚀
            </Link>
            <Link
              href="/#pricing"
              className="border border-white/40 text-white hover:bg-white/10 px-8 py-3 rounded-xl text-sm font-medium"
            >
              View Pricing Plans
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
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
