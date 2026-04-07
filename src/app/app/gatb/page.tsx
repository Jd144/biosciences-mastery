import Link from 'next/link'
import {
  Calendar,
  Clock,
  FileText,
  BookOpen,
  Target,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Award,
  BarChart2,
  Layers,
  ExternalLink,
} from 'lucide-react'

const keyDates = [
  { event: 'Registration Window Opens', date: '19 March 2026', status: 'done' },
  { event: 'Last Date to Apply (Application Form)', date: '9 April 2026 (up to 5:00 PM)', status: 'done' },
  { event: 'Correction Window', date: '11 April – 13 April 2026', status: 'done' },
  { event: 'Admit Card Release', date: 'Expected in May 2026', status: 'upcoming' },
  { event: 'GAT-B 2026 Exam Date', date: '17 May 2026 (Sunday)', status: 'exam' },
]

const examSections = [
  {
    section: 'Section A',
    totalQ: '60',
    attemptQ: '60 (Compulsory)',
    marks: '60',
    focus: '10+2 level Physics, Chemistry, Mathematics & Biology',
    marking: '+1 correct / −0.5 incorrect',
  },
  {
    section: 'Section B',
    totalQ: '100',
    attemptQ: '60 (Choice-based)',
    marks: '180',
    focus: 'Graduate-level Life Sciences & Biotechnology',
    marking: '+3 correct / −1 incorrect',
  },
]

const syllabusSubjects = [
  {
    emoji: '🔬',
    name: 'Section A – Core Sciences (10+2)',
    slug: null,
    topics: [
      'Physics – NCERT Class 11 & 12',
      'Chemistry – NCERT Class 11 & 12',
      'Mathematics – NCERT Class 11 & 12',
      'Biology – NCERT Class 11 & 12',
    ],
    note: 'Based on NCERT Class 11 & 12 curriculum',
  },
  {
    emoji: '🧪',
    name: 'Biochemistry',
    slug: 'biochemistry',
    topics: [
      'Biomolecules (Carbohydrates, Proteins, Lipids, Nucleic Acids)',
      'Metabolism – Glycolysis, TCA, ETC',
      'Enzyme Kinetics',
      'Vitamins & Cofactors',
      'Signal Transduction',
    ],
    note: 'Section B – Graduate level',
  },
  {
    emoji: '🧬',
    name: 'Molecular Biology',
    slug: 'molecular-biology-genetics',
    topics: [
      'DNA Replication, Repair, Recombination',
      'Transcription & Translation',
      'Gene Regulation',
      'Mendelian & Non-Mendelian Genetics',
      'Mutations & Chromosomal Aberrations',
    ],
    note: 'Section B – Graduate level',
  },
  {
    emoji: '🛡️',
    name: 'Immunology',
    slug: 'immunology',
    topics: [
      'Innate & Adaptive Immunity',
      'Antibody Structure & Function',
      'Antigen-Antibody Reactions',
      'MHC & T-cell Biology',
      'Vaccines & Immunotherapy',
    ],
    note: 'Section B – Graduate level',
  },
  {
    emoji: '💻',
    name: 'Bioinformatics',
    slug: 'bioinformatics',
    topics: [
      'Sequence Alignment (BLAST, ClustalW)',
      'Databases (NCBI, UniProt, PDB)',
      'Phylogenetics',
      'Structural Bioinformatics',
      'Genomics & Proteomics Tools',
    ],
    note: 'Section B – Graduate level',
  },
  {
    emoji: '⚙️',
    name: 'Bioprocess Engineering',
    slug: 'animal-biotechnology-bioprocessing',
    topics: [
      'Fermentation Technology',
      'Bioreactor Design & Operation',
      'Upstream & Downstream Processing',
      'Sterilization & Disinfection',
      'Scale-up Strategies',
    ],
    note: 'Section B – Graduate level',
  },
]

const pyqYears = [
  { year: '2024', paper: 'GAT-B 2024', questions: 120, available: true },
  { year: '2023', paper: 'GAT-B 2023', questions: 120, available: true },
  { year: '2022', paper: 'GAT-B 2022', questions: 120, available: true },
  { year: '2021', paper: 'GAT-B 2021', questions: 120, available: true },
  { year: '2020', paper: 'GAT-B 2020', questions: 120, available: true },
]

export default function GATBPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
            GAT-B 2026
          </span>
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
            Conducted by NTA
          </span>
          <span className="bg-green-400/30 text-white text-xs font-medium px-3 py-1 rounded-full">
            Official Details
          </span>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">GAT-B 2026 – Official Exam Guide</h1>
        <p className="text-emerald-100 text-sm max-w-2xl mb-6">
          Graduate Aptitude Test in Biotechnology (GAT-B) 2026 — conducted by NTA on behalf of
          the Department of Biotechnology (DBT). All details below are as per the official NTA notification.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Exam Date', value: '17 May 2026', icon: Calendar },
            { label: 'Duration', value: '3 Hours (180 min)', icon: Clock },
            { label: 'Total Questions', value: '160 MCQs (Attempt 120)', icon: FileText },
            { label: 'Mode', value: 'CBT – English Only', icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
              <p className="text-xs text-emerald-200">{label}</p>
              <p className="font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Official Registration Banner */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 mb-8 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-emerald-800 text-sm">Official Registration — GAT-B 2026</p>
          <p className="text-emerald-700 text-xs mt-0.5 mb-2">
            Register through the official NTA portal. Last date: <strong>9 April 2026 (up to 5:00 PM)</strong>.
          </p>
          <a
            href="https://exams.nta.ac.in/GAT-BET/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Apply at exams.nta.ac.in/GAT-BET/
          </a>
        </div>
      </div>

      {/* Key Dates */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Key Dates – GAT-B 2026</h2>
          <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Official Schedule</span>
        </div>
        <div className="divide-y divide-gray-50">
          {keyDates.map((item) => (
            <div key={item.event} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                {item.status === 'exam' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                ) : item.status === 'done' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400 shrink-0" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-300 shrink-0" />
                )}
                <span className={`text-sm font-medium ${item.status === 'exam' ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {item.event}
                </span>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                item.status === 'exam'
                  ? 'bg-emerald-100 text-emerald-700'
                  : item.status === 'done'
                  ? 'bg-blue-50 text-blue-600'
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Exam Pattern */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Exam Structure</h2>
          <span className="ml-auto text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Official Pattern</span>
        </div>
        <div className="p-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-5 text-xs text-blue-800">
            <span className="font-semibold">Total:</span> 160 MCQs — candidates must attempt exactly 120 questions (Section A: all 60, Section B: any 60 out of 100).
            Total marks: <strong>240</strong>. Medium: <strong>English only</strong>.
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-l-lg">Section</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Total Qs</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">To Attempt</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Max Marks</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-r-lg">Focus Area</th>
                </tr>
              </thead>
              <tbody>
                {examSections.map((row, i) => (
                  <tr key={row.section} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 font-bold text-gray-800">{row.section}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.totalQ}</td>
                    <td className="px-4 py-3 text-center font-semibold text-emerald-700">{row.attemptQ}</td>
                    <td className="px-4 py-3 text-center font-bold text-gray-700">{row.marks}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.focus}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50">
                  <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">160</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">120</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">240</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">3 hours (CBT)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Marking Scheme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border bg-blue-50 border-blue-200 text-blue-700 p-4">
              <p className="font-bold text-sm mb-1">Section A</p>
              <p className="text-xs opacity-80 mb-2">60 compulsory MCQs</p>
              <div className="space-y-1 text-xs font-medium">
                <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> +1 for correct answer</div>
                <div className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-red-500" /> −0.5 for incorrect answer</div>
                <div className="flex items-center gap-1 text-gray-500">Zero for unattempted</div>
              </div>
            </div>
            <div className="rounded-xl border bg-emerald-50 border-emerald-200 text-emerald-700 p-4">
              <p className="font-bold text-sm mb-1">Section B</p>
              <p className="text-xs opacity-80 mb-2">Attempt any 60 of 100 MCQs</p>
              <div className="space-y-1 text-xs font-medium">
                <div className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-green-600" /> +3 for correct answer</div>
                <div className="flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5 text-red-500" /> −1 for incorrect answer</div>
                <div className="flex items-center gap-1 text-gray-500">Zero for unattempted</div>
              </div>
            </div>
            <div className="rounded-xl border bg-gray-50 border-gray-200 text-gray-700 p-4">
              <p className="font-bold text-sm mb-1">Important Note</p>
              <p className="text-xs opacity-80 mb-2">Negative marking applies in both sections</p>
              <div className="space-y-1 text-xs font-medium">
                <div className="flex items-center gap-1 text-gray-600">Unattempted questions carry zero marks (no penalty)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Syllabus Overview */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Syllabus Overview</h2>
          </div>
          <Link
            href="/app/subjects"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
          >
            Study Topics <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 text-xs text-amber-800">
            <span className="font-semibold">Full Syllabus PDF:</span> Download the complete syllabus from the official NTA website or the Regional Centre for Biotechnology (RCB).
            &nbsp;
            <a href="https://exams.nta.ac.in/GAT-BET/" target="_blank" rel="noopener noreferrer" className="underline font-medium">
              exams.nta.ac.in/GAT-BET/
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {syllabusSubjects.map((subject) => (
              <div
                key={subject.name}
                className="border border-gray-100 rounded-xl p-4 hover:border-emerald-200 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{subject.emoji}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{subject.name}</h3>
                      <p className="text-xs text-gray-400">{subject.note}</p>
                    </div>
                  </div>
                  {subject.slug && (
                    <Link
                      href={`/app/subjects/${subject.slug}`}
                      className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-0.5 shrink-0"
                    >
                      Study <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
                <ul className="space-y-1">
                  {subject.topics.map((topic) => (
                    <li key={topic} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" />
                      {topic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Practice Content Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-purple-800 text-sm">BioSciences Mastery – Practice Content (Below)</p>
          <p className="text-purple-700 text-xs mt-0.5">
            The sections below (Previous Year Questions, Preparation Tips) are part of the BioSciences Mastery
            practice platform. They are for preparation purposes only and are separate from the official GAT-B exam
            information above.
          </p>
        </div>
      </div>

      {/* PYQ Section */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Previous Year Questions (PYQ)</h2>
        </div>
        <div className="p-6">
          <p className="text-gray-500 text-sm mb-4">
            Practice past GAT-B question papers. PYQs are available topic-wise inside each subject.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-6">
            {pyqYears.map((y) => (
              <div
                key={y.year}
                className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center"
              >
                <p className="font-bold text-emerald-700 text-lg">{y.year}</p>
                <p className="text-xs text-emerald-600 mb-1">{y.paper}</p>
                <p className="text-xs text-gray-500">{y.questions} questions</p>
                <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium mt-1">
                  <CheckCircle className="w-3 h-3" /> Available
                </span>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Topic-wise PYQs are included inside each subject. Go to any subject &rarr; select a topic &rarr; access PYQ section.
            </p>
            <Link
              href="/app/subjects"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" /> Browse Subjects &amp; PYQs
            </Link>
          </div>
        </div>
      </section>

      {/* Preparation Tips */}
      <section className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Preparation Strategy for GAT-B 2026
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Section A is fully compulsory — revise NCERT Class 11 & 12 (Physics, Chemistry, Maths, Biology) thoroughly',
            'Section B has negative marking (−1 per wrong) — attempt only well-prepared topics to maximize score',
            'Section B marks are weighted 3× — focus on high-confidence graduate-level topics for maximum gain',
            'Key Section B areas: Biochemistry, Molecular Biology, Immunology, Bioinformatics, Bioprocess Engineering',
            'Solve past GAT-B papers to understand difficulty level and frequently asked topics',
            'Register before 9 April 2026 at exams.nta.ac.in/GAT-BET/ — do not miss the deadline',
          ].map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-sm text-gray-700">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              {tip}
            </div>
          ))}
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/app/subjects"
          className="bg-white border-2 border-emerald-200 hover:border-emerald-400 rounded-xl p-5 flex items-center gap-4 transition-all group"
        >
          <div className="bg-emerald-100 p-3 rounded-xl group-hover:bg-emerald-200 transition-colors">
            <BookOpen className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <p className="font-bold text-gray-900">Start Studying</p>
            <p className="text-sm text-gray-500">Browse all GAT-B subjects</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
        </Link>
        <a
          href="https://exams.nta.ac.in/GAT-BET/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-5 flex items-center gap-4 text-white transition-all group hover:opacity-90"
        >
          <div className="bg-white/20 p-3 rounded-xl">
            <Award className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <p className="font-bold">Official Registration</p>
            <p className="text-sm text-emerald-100">Apply at exams.nta.ac.in/GAT-BET/</p>
          </div>
          <ExternalLink className="w-5 h-5 text-white/70 ml-auto" />
        </a>
      </section>
    </div>
  )
}
