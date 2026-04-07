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
} from 'lucide-react'

const keyDates = [
  { event: 'GATE 2026 Notification', date: 'July 2025 (Expected)', status: 'upcoming' },
  { event: 'Application Form Opens', date: 'August 28, 2025 (Expected)', status: 'upcoming' },
  { event: 'Last Date to Apply', date: 'September 26, 2025 (Expected)', status: 'upcoming' },
  { event: 'Application Correction Window', date: 'October 2025 (Expected)', status: 'upcoming' },
  { event: 'Mock Test Available', date: 'November 2025 (Expected)', status: 'upcoming' },
  { event: 'Admit Card Download', date: 'January 2026 (Expected)', status: 'upcoming' },
  { event: 'GATE BT 2026 Exam Date', date: 'February 1, 2, 8, 9, 2026 (Expected)', status: 'exam' },
  { event: 'Answer Key Release', date: 'February 2026 (Expected)', status: 'upcoming' },
  { event: 'Result Declaration', date: 'March 16, 2026 (Expected)', status: 'upcoming' },
  { event: 'Score Card Download', date: 'March – May 2026 (Expected)', status: 'upcoming' },
]

const examPattern = [
  { section: 'General Aptitude', questions: '10', marks: '15', type: 'MCQ', note: 'Mandatory for all papers' },
  { section: 'Engineering Mathematics', questions: '~13–15 *', marks: '~13–15 *', type: 'MCQ / NAT', note: 'Part of BT Core section' },
  { section: 'Biotechnology Core', questions: '~40–42 *', marks: '~70 *', type: 'MCQ / MSQ / NAT', note: 'Subject-specific questions' },
]

const questionTypes = [
  {
    type: 'MCQ – Multiple Choice',
    description: '4 options, 1 correct answer',
    negative: 'Yes – 1/3 for 1-mark, 2/3 for 2-mark',
    color: 'bg-red-50 border-red-200 text-red-700',
  },
  {
    type: 'MSQ – Multiple Select',
    description: '4 options, ≥1 correct answer',
    negative: 'No negative marking; partial marking may apply for partially correct responses',
    color: 'bg-green-50 border-green-200 text-green-700',
  },
  {
    type: 'NAT – Numerical Answer',
    description: 'Type the exact number',
    negative: 'No negative marking',
    color: 'bg-blue-50 border-blue-200 text-blue-700',
  },
]

const syllabusSubjects = [
  {
    emoji: '🧮',
    name: 'Engineering Mathematics',
    slug: null,
    topics: [
      'Linear Algebra',
      'Calculus',
      'Differential Equations',
      'Probability & Statistics',
      'Numerical Methods',
    ],
    marks: '~15 marks',
  },
  {
    emoji: '🦠',
    name: 'Microbiology',
    slug: 'microbiology',
    topics: [
      'Historical Perspectives',
      'Microbial Diversity',
      'Prokaryotic & Eukaryotic Cells',
      'Viruses & Bacteriophages',
      'Microbial Nutrition & Growth',
      'Sterilization & Disinfection',
    ],
    marks: 'Part of 70-mark Core',
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
    marks: 'Part of 70-mark Core',
  },
  {
    emoji: '🧬',
    name: 'Molecular Biology & Genetics',
    slug: 'molecular-biology-genetics',
    topics: [
      'DNA Replication, Repair, Recombination',
      'Transcription & Translation',
      'Gene Regulation',
      'Mendelian & Non-Mendelian Genetics',
      'Mutations & Chromosomal Aberrations',
    ],
    marks: 'Part of 70-mark Core',
  },
  {
    emoji: '🧫',
    name: 'Recombinant DNA Technology',
    slug: 'recombinant-dna-technology',
    topics: [
      'Restriction Enzymes & Ligases',
      'Cloning Vectors',
      'PCR & its Variants',
      'Gene Libraries',
      'Expression Systems',
    ],
    marks: 'Part of 70-mark Core',
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
    marks: 'Part of 70-mark Core',
  },
  {
    emoji: '🌱',
    name: 'Plant Biotechnology',
    slug: 'plant-biotechnology',
    topics: [
      'Plant Tissue Culture',
      'Transgenic Plants',
      'Plant Secondary Metabolites',
      'Biofertilizers',
      'Molecular Pharming',
    ],
    marks: 'Part of 70-mark Core',
  },
  {
    emoji: '🐭',
    name: 'Animal Biotechnology & Bioprocessing',
    slug: 'animal-biotechnology-bioprocessing',
    topics: [
      'Animal Cell Culture',
      'Monoclonal Antibodies',
      'Transgenic Animals',
      'Fermentation Technology',
      'Downstream Processing',
    ],
    marks: 'Part of 70-mark Core',
  },
  {
    emoji: '🔬',
    name: 'Cell Biology',
    slug: 'cell-biology',
    topics: [
      'Cell Organelles & Functions',
      'Cell Division – Mitosis & Meiosis',
      'Cell Signaling',
      'Apoptosis',
      'Cancer Biology',
    ],
    marks: 'Part of 70-mark Core',
  },
  {
    emoji: '🔭',
    name: 'Bioanalytical Techniques',
    slug: 'bioanalytical-techniques',
    topics: [
      'Chromatography (HPLC, GC, Affinity)',
      'Electrophoresis (SDS-PAGE, 2D)',
      'Spectroscopy (UV-Vis, NMR, MS)',
      'Microscopy (Light, EM, Confocal)',
      'Biosensors & Flow Cytometry',
    ],
    marks: 'Part of 70-mark Core',
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
    marks: 'Part of 70-mark Core',
  },
]

const pyqYears = [
  { year: '2024', paper: 'GATE BT 2024', questions: 65, available: true },
  { year: '2023', paper: 'GATE BT 2023', questions: 65, available: true },
  { year: '2022', paper: 'GATE BT 2022', questions: 65, available: true },
  { year: '2021', paper: 'GATE BT 2021', questions: 65, available: true },
  { year: '2020', paper: 'GATE BT 2020', questions: 65, available: true },
]

export default function GATBPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center gap-2 mb-3">
          <span className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
            GATE BT 2026
          </span>
          <span className="bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full">
            Biotechnology Paper
          </span>
        </div>
        <h1 className="text-3xl font-extrabold mb-2">GATE Biotechnology 2026</h1>
        <p className="text-emerald-100 text-sm max-w-2xl mb-6">
          Complete exam guide — key dates, exam pattern, syllabus, and PYQs for GATE BT 2026.
          Conducted by IIT Kanpur (expected). All dates are tentative.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Duration', value: '3 Hours', icon: Clock },
            { label: 'Total Marks', value: '100 Marks', icon: Award },
            { label: 'Questions', value: '65 Questions', icon: FileText },
            { label: 'Mode', value: 'Online CBT', icon: Target },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
              <Icon className="w-5 h-5 mx-auto mb-1 text-yellow-300" />
              <p className="text-xs text-emerald-200">{label}</p>
              <p className="font-bold text-sm">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Important Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-800 text-sm">All dates are tentative for GATE 2026</p>
          <p className="text-amber-700 text-xs mt-0.5">
            Official dates will be announced by the organizing IIT. Keep checking the official GATE portal: gate2026.iitkgp.ac.in
          </p>
        </div>
      </div>

      {/* Key Dates */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-bold text-gray-900">Key Dates – GATE BT 2026</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {keyDates.map((item) => (
            <div key={item.event} className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-3">
                {item.status === 'exam' ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
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
          <h2 className="text-lg font-bold text-gray-900">Exam Pattern</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-l-lg">Section</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Questions</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Marks</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-700">Type</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-700 rounded-r-lg">Note</th>
                </tr>
              </thead>
              <tbody>
                {examPattern.map((row, i) => (
                  <tr key={row.section} className={i % 2 === 0 ? '' : 'bg-gray-50/50'}>
                    <td className="px-4 py-3 font-medium text-gray-800">{row.section}</td>
                    <td className="px-4 py-3 text-center text-gray-600">{row.questions}</td>
                    <td className="px-4 py-3 text-center font-bold text-emerald-700">{row.marks}</td>
                    <td className="px-4 py-3 text-center text-gray-600 text-xs">{row.type}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{row.note}</td>
                  </tr>
                ))}
                <tr className="bg-emerald-50">
                  <td className="px-4 py-3 font-bold text-gray-900">Total</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">65</td>
                  <td className="px-4 py-3 text-center font-bold text-emerald-700">100</td>
                  <td className="px-4 py-3 text-center text-gray-500 text-xs">Mixed</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">3 hours total</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-xs text-blue-800">
            <span className="font-semibold">* Note:</span> GATE BT consists of 65 questions (100 marks) with approximately 15 marks for General Aptitude, 13–15 marks for Engineering Mathematics, and about 70 marks for Biotechnology/Core subjects. The exact number of questions per section may vary every year. Refer to the official GATE notification for confirmed figures.
          </div>

          <h3 className="font-semibold text-gray-800 mb-3 text-sm">Question Types &amp; Marking Scheme</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {questionTypes.map((q) => (
              <div key={q.type} className={`rounded-xl border p-4 ${q.color}`}>
                <p className="font-bold text-sm mb-1">{q.type}</p>
                <p className="text-xs opacity-80 mb-2">{q.description}</p>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {q.negative.startsWith('No') ? (
                    <CheckCircle className="w-3.5 h-3.5" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  {q.negative}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syllabus & Subjects */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Syllabus – Subject Wise</h2>
          </div>
          <Link
            href="/app/subjects"
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
          >
            Study All Subjects <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <p className="text-xs text-gray-400">{subject.marks}</p>
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
      </section>

      {/* Practice Content Notice */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-8 flex items-start gap-3">
        <BookOpen className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-purple-800 text-sm">BioSciences Mastery – Practice Content</p>
          <p className="text-purple-700 text-xs mt-0.5">
            The sections below (Previous Year Questions, Syllabus topics, Preparation Tips) are part of the BioSciences Mastery practice platform. They are for preparation purposes and do not represent the official GATE exam format or question distribution.
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
            Practice last 5 years GATE BT question papers. PYQs are available topic-wise inside each subject.
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
          Preparation Strategy for GATE BT 2026
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            'Focus on high-weightage topics: Molecular Biology, Biochemistry, and Recombinant DNA Technology',
            'Engineering Mathematics (~15 marks) — practice Linear Algebra, Calculus, and Probability regularly',
            'Solve last 5 years PYQs topic-wise — understand question patterns and frequently repeated concepts',
            'General Aptitude (15 marks) — easy scoring section, practice verbal and numerical ability',
            'Use flashcards and short notes for quick revision of definitions, enzymes, and key reactions',
            'Attempt at least 2 full mock tests per week in the final 2 months before the exam',
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
            <p className="text-sm text-gray-500">Browse all 10 GATE BT subjects</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400 ml-auto" />
        </Link>
        <Link
          href="/app/buy/full"
          className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl p-5 flex items-center gap-4 text-white transition-all group hover:opacity-90"
        >
          <div className="bg-white/20 p-3 rounded-xl">
            <Award className="w-6 h-6 text-yellow-300" />
          </div>
          <div>
            <p className="font-bold">Unlock Full Course</p>
            <p className="text-sm text-emerald-100">All subjects + PYQs + AI + Quizzes — ₹999</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/70 ml-auto" />
        </Link>
      </section>
    </div>
  )
}
