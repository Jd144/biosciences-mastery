-- ============================================================
-- BioSciences Mastery — Seed Data
-- Run AFTER schema.sql
-- ============================================================

-- ============================================================
-- SUBJECTS
-- ============================================================
INSERT INTO public.subjects (slug, name, description, order_index) VALUES
  ('biochemistry', 'Biochemistry', 'Study of chemical processes within and related to living organisms', 1),
  ('microbiology', 'Microbiology', 'Study of microorganisms including bacteria, viruses, fungi and algae', 2),
  ('cell-biology', 'Cell Biology', 'Study of cell structure, function, and behavior', 3),
  ('molecular-biology-genetics', 'Molecular Biology & Genetics', 'Study of molecular basis of biological activity and heredity', 4),
  ('bioanalytical-techniques', 'Bioanalytical Techniques', 'Methods and instruments used in biological research and analysis', 5),
  ('immunology', 'Immunology', 'Study of the immune system, its components and functions', 6),
  ('bioinformatics', 'Bioinformatics', 'Application of computational tools to biological data', 7),
  ('recombinant-dna-technology', 'Recombinant DNA Technology / Genetic Engineering', 'Manipulation of DNA using molecular tools and techniques', 8),
  ('plant-biotechnology', 'Plant Biotechnology', 'Application of biotechnological tools to plant science', 9),
  ('animal-biotechnology-bioprocessing', 'Animal Biotechnology & Bioprocessing', 'Animal cell technology and bioprocess engineering', 10)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- TOPICS — Biochemistry
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('biomolecules-structure-functions', 'Biomolecules — structure & functions', 1),
  ('biological-membranes-action-potential-transport', 'Biological membranes, action potential, transport', 2),
  ('enzymes-classification-kinetics-mechanism', 'Enzymes — classification, kinetics, mechanism', 3),
  ('metabolism-carbs-lipids-amino-acids-nucleic-acids', 'Metabolism — carbs, lipids, amino acids, nucleic acids', 4),
  ('photosynthesis-respiration-etc', 'Photosynthesis, respiration, ETC', 5),
  ('bioenergetics', 'Bioenergetics', 6)
) AS t(slug, title, order_index)
WHERE s.slug = 'biochemistry'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Microbiology
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('viruses-structure-classification', 'Viruses — structure & classification', 1),
  ('microbial-classification-diversity', 'Microbial classification & diversity (bacteria, algae, fungi)', 2),
  ('methods-in-microbiology', 'Methods in microbiology', 3),
  ('microbial-growth-and-nutrition', 'Microbial growth and nutrition', 4),
  ('aerobic-anaerobic-respiration', 'Aerobic & anaerobic respiration', 5),
  ('nitrogen-fixation', 'Nitrogen fixation', 6),
  ('microbial-diseases-host-pathogen-interaction', 'Microbial diseases & host-pathogen interaction', 7)
) AS t(slug, title, order_index)
WHERE s.slug = 'microbiology'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Cell Biology
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('prokaryotic-eukaryotic-cell-structure', 'Prokaryotic & eukaryotic cell structure', 1),
  ('cell-cycle-cell-growth-control', 'Cell cycle & cell growth control', 2),
  ('cell-cell-communication', 'Cell-cell communication', 3),
  ('cell-signaling-signal-transduction', 'Cell signaling & signal transduction', 4)
) AS t(slug, title, order_index)
WHERE s.slug = 'cell-biology'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Molecular Biology & Genetics
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('molecular-structure-genes-chromosomes', 'Molecular structure of genes & chromosomes', 1),
  ('mutations-mutagenesis', 'Mutations & mutagenesis', 2),
  ('dna-replication-transcription-translation', 'DNA replication, transcription, translation (prokaryotes + eukaryotes)', 3),
  ('regulatory-mechanisms', 'Regulatory mechanisms', 4),
  ('mendelian-inheritance-gene-interaction', 'Mendelian inheritance & gene interaction', 5),
  ('complementation-linkage', 'Complementation, linkage', 6),
  ('microbial-genetics-plasmids', 'Microbial genetics — plasmids, transformation, transduction, conjugation', 7),
  ('horizontal-gene-transfer-transposable-elements', 'Horizontal gene transfer & transposable elements', 8),
  ('rna-interference-rnai', 'RNA interference (RNAi)', 9),
  ('dna-damage-repair', 'DNA damage & repair', 10),
  ('chromosomal-variation', 'Chromosomal variation', 11),
  ('molecular-basis-genetic-diseases', 'Molecular basis of genetic diseases', 12)
) AS t(slug, title, order_index)
WHERE s.slug = 'molecular-biology-genetics'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Bioanalytical Techniques
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('microscopy', 'Microscopy — light, electron, fluorescent, confocal', 1),
  ('centrifugation', 'Centrifugation — high speed & ultracentrifugation', 2),
  ('spectroscopy', 'Spectroscopy — UV, Visible, CD, IR, FTIR, Raman, MS, NMR', 3),
  ('chromatography', 'Chromatography — ion exchange, gel filtration, HIC, affinity, GC, HPLC, FPLC', 4),
  ('electrophoresis', 'Electrophoresis', 5),
  ('microarray', 'Microarray', 6)
) AS t(slug, title, order_index)
WHERE s.slug = 'bioanalytical-techniques'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Immunology
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('history-of-immunology', 'History of Immunology', 1),
  ('innate-humoral-cell-mediated-immunity', 'Innate, humoral & cell-mediated immunity', 2),
  ('antigen-antibody-structure-function', 'Antigen & antibody structure/function', 3),
  ('molecular-basis-antibody-diversity', 'Molecular basis of antibody diversity', 4),
  ('antigen-antibody-reactions', 'Antigen-antibody reactions', 5),
  ('complement-system', 'Complement system', 6),
  ('primary-secondary-lymphoid-organs', 'Primary & secondary lymphoid organs', 7),
  ('b-cells-t-cells-macrophages', 'B cells, T cells, macrophages', 8),
  ('mhc-antigen-processing-presentation', 'MHC — antigen processing & presentation', 9),
  ('polyclonal-monoclonal-antibodies', 'Polyclonal & monoclonal antibodies', 10),
  ('immune-regulation-tolerance-hypersensitivity', 'Immune regulation, tolerance, hypersensitivity', 11),
  ('autoimmunity-graft-vs-host', 'Autoimmunity, Graft vs Host reaction', 12)
) AS t(slug, title, order_index)
WHERE s.slug = 'immunology'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Bioinformatics
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('major-databases-search-tools', 'Major databases & search tools', 1),
  ('sequence-structure-databases', 'Sequence & structure databases', 2),
  ('sequence-analysis', 'Sequence analysis — file formats, scoring matrices, alignment, phylogeny', 3),
  ('data-mining-genomics-proteomics', 'Data mining — genomics & proteomics tools', 4),
  ('molecular-dynamics-simulations', 'Molecular dynamics & simulations (force fields, protein-protein/nucleic acid/ligand interactions)', 5)
) AS t(slug, title, order_index)
WHERE s.slug = 'bioinformatics'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Recombinant DNA Technology
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('restriction-enzymes-modification', 'Restriction enzymes & modification', 1),
  ('vectors', 'Vectors — plasmid, bacteriophage, cosmids, Ti plasmid, YAC, mammalian & plant expression vectors', 2),
  ('cdna-genomic-dna-library', 'cDNA & genomic DNA library', 3),
  ('gene-isolation-cloning-expression', 'Gene isolation, cloning & expression', 4),
  ('transposons-gene-targeting', 'Transposons & gene targeting', 5),
  ('dna-labeling-sequencing-pcr', 'DNA labeling, sequencing, PCR', 6),
  ('dna-fingerprinting', 'DNA fingerprinting', 7),
  ('southern-northern-blotting', 'Southern & Northern blotting', 8),
  ('in-situ-hybridization-rapd-rflp', 'In-situ hybridization, RAPD, RFLP', 9),
  ('site-directed-mutagenesis', 'Site-directed mutagenesis', 10),
  ('gene-transfer-technologies', 'Gene transfer technologies', 11),
  ('gene-therapy', 'Gene therapy', 12)
) AS t(slug, title, order_index)
WHERE s.slug = 'recombinant-dna-technology'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Plant Biotechnology
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('totipotency-plant-regeneration', 'Totipotency, plant regeneration', 1),
  ('plant-growth-regulators-elicitors', 'Plant growth regulators & elicitors', 2),
  ('tissue-culture-cell-suspension-culture', 'Tissue culture & cell suspension culture', 3),
  ('secondary-metabolites-production', 'Secondary metabolites production', 4),
  ('hairy-root-culture', 'Hairy root culture', 5),
  ('transgenic-plants', 'Transgenic plants', 6),
  ('micropropagation-meristem-culture', 'Micropropagation, meristem culture', 7),
  ('anther-microspore-culture', 'Anther & microspore culture', 8),
  ('embryo-ovary-culture', 'Embryo & ovary culture', 9),
  ('protoplast-isolation-fusion', 'Protoplast isolation & fusion (somatic hybrids, cybrids)', 10),
  ('somaclones-synthetic-seeds', 'Somaclones, synthetic seeds', 11),
  ('in-vitro-germplasm-conservation-cryopreservation', 'In vitro germplasm conservation, cryopreservation', 12),
  ('transgenic-biotic-abiotic-stress-tolerance', 'Transgenic for biotic/abiotic stress tolerance', 13),
  ('gene-silencing-nanotechnology', 'Gene silencing, nanotechnology applications', 14)
) AS t(slug, title, order_index)
WHERE s.slug = 'plant-biotechnology'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- TOPICS — Animal Biotechnology & Bioprocessing
-- ============================================================
INSERT INTO public.topics (subject_id, slug, title, order_index)
SELECT s.id, t.slug, t.title, t.order_index
FROM public.subjects s
CROSS JOIN (VALUES
  ('animal-cell-culture-media-growth', 'Animal cell culture — media & growth conditions', 1),
  ('cell-preservation-anchorage-culture', 'Cell preservation, anchorage/non-anchorage dependent culture', 2),
  ('kinetics-of-cell-growth', 'Kinetics of cell growth', 3),
  ('micro-macrocarrier-culture', 'Micro & macrocarrier culture', 4),
  ('hybridoma-technology', 'Hybridoma technology', 5),
  ('stem-cell-technology', 'Stem cell technology', 6),
  ('animal-cloning', 'Animal cloning', 7),
  ('transgenic-animals', 'Transgenic animals', 8),
  ('chemical-engineering-principles', 'Chemical engineering principles in biological systems', 9),
  ('reactor-design', 'Reactor design — ideal & non-ideal, multiphase bioreactors', 10),
  ('mass-heat-transfer-rheology', 'Mass & heat transfer, rheology', 11),
  ('aeration-agitation', 'Aeration & agitation', 12),
  ('media-formulation-optimization', 'Media formulation & optimization', 13),
  ('microbial-growth-kinetics', 'Microbial growth kinetics', 14),
  ('sterilization-air-media', 'Sterilization of air & media', 15),
  ('batch-fed-batch-continuous-processes', 'Batch, fed-batch & continuous processes', 16),
  ('enzyme-reactors', 'Enzyme reactors', 17),
  ('instrumentation-control-optimization', 'Instrumentation, control & optimization', 18),
  ('scale-up-economics-feasibility', 'Scale-up, economics & feasibility', 19),
  ('biofuels-bioplastics-industrial-enzymes', 'Biofuels, bioplastics, industrial enzymes', 20),
  ('downstream-processing-chromatographic-membrane-separation', 'Downstream processing, chromatographic & membrane separation', 21),
  ('enzyme-cell-immobilization', 'Enzyme & cell immobilization', 22),
  ('bioremediation', 'Bioremediation', 23)
) AS t(slug, title, order_index)
WHERE s.slug = 'animal-biotechnology-bioprocessing'
ON CONFLICT (subject_id, slug) DO NOTHING;

-- ============================================================
-- BIOTECHNOLOGY EXAMS
-- ============================================================
INSERT INTO public.exams (code, name, description, official_link, syllabus_link, registration_link, study_resources_link)
VALUES
  ('GATE_BT', 'GATE Biotechnology', 'Graduate Aptitude Test in Engineering - Biotechnology. National level entrance test for M.Tech/PhD admissions.', 'https://gate2026.iitr.ac.in/', 'https://gate2026.iitr.ac.in/syllabus.html', 'https://goaps.iitr.ac.in/', 'https://gate2026.iitr.ac.in/'),
  ('CSIR_NET_LS', 'CSIR NET Life Sciences', 'CSIR UGC NET - Life Sciences for Junior Research Fellowship and Lectureship eligibility.', 'https://csirnet.nta.ac.in/', 'https://csirnet.nta.ac.in/syllabus/', 'https://csirnet.nta.ac.in/', 'https://csirhrdg.res.in/'),
  ('DBT_JRF', 'DBT-JRF', 'Department of Biotechnology - Junior Research Fellowship for PhD in Biotechnology/Life Sciences.', 'https://dbtindia.gov.in/', 'https://rcb.res.in/DBTPG/', 'https://rcb.res.in/DBTPG/', 'https://dbtindia.gov.in/schemes-programmes/research-development'),
  ('ICMR_JRF', 'ICMR-JRF', 'Indian Council of Medical Research - Junior Research Fellowship for biomedical sciences research.', 'https://www.icmr.gov.in/', 'https://www.icmr.gov.in/exam.html', 'https://www.icmr.gov.in/', 'https://main.icmr.nic.in/content/fellowships'),
  ('ICAR_NET', 'ICAR NET', 'Indian Council of Agricultural Research - NET for agricultural sciences research fellowship and lectureship.', 'https://icar.nta.ac.in/', 'https://icar.nta.ac.in/information-bulletin/', 'https://icar.nta.ac.in/', 'https://www.icar.org.in/')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.exam_details (exam_id, eligibility, exam_pattern, marking_scheme, duration, seats_approximate, fellowship_details, stipend_details, award_amount)
SELECT e.id,
  d.eligibility,
  d.exam_pattern,
  d.marking_scheme,
  d.duration,
  d.seats_approximate,
  d.fellowship_details,
  d.stipend_details,
  d.award_amount
FROM public.exams e
JOIN (
  VALUES
    ('GATE_BT', 'Bachelor degree holders in engineering/technology/science streams as per GATE notification.', 'Computer-based test. General Aptitude + Biotechnology sections.', '1-mark and 2-mark questions; negative marking applicable for MCQs.', '3 hours', 'Institutes dependent', NULL, NULL, NULL),
    ('CSIR_NET_LS', 'M.Sc./Integrated BS-MS/B.Tech/B.E/B.Pharma/MBBS or equivalent in Life Sciences related disciplines.', 'Single paper with Part A (General Aptitude), Part B and Part C (Life Sciences).', 'Mixed objective questions with partial negative marking.', '3 hours', 'JRF/LS category as notified', 'JRF and Lectureship eligibility.', 'As per CSIR/UGC norms', NULL),
    ('DBT_JRF', 'Master degree in Biotechnology/Life Sciences with required aggregate and category relaxations.', 'National Biotechnology Eligibility Test (objective format).', 'As per DBT BET information bulletin.', '3 hours', 'Category wise based on merit', 'DBT-Junior Research Fellowship for PhD.', 'As per DBT fellowship rules', 'Government fellowship rates apply'),
    ('ICMR_JRF', 'Postgraduate degree in basic professional courses with minimum marks as per ICMR notice.', 'Computer based objective test in biomedical sciences.', 'Negative marking and sectional distribution as notified.', '2 hours', 'Merit based shortlist', 'ICMR-JRF for biomedical PhD research.', 'As per ICMR fellowship norms', 'Government fellowship rates apply'),
    ('ICAR_NET', 'Master degree in relevant Agricultural disciplines from recognized universities.', 'Objective paper for Agricultural Research Services/NET eligibility.', 'As per ICAR NET notification.', '2 hours', 'Subject-wise merit based', 'Research and lectureship eligibility in agricultural sciences.', 'As per ICAR fellowship norms', NULL)
) AS d(code, eligibility, exam_pattern, marking_scheme, duration, seats_approximate, fellowship_details, stipend_details, award_amount)
ON d.code = e.code
ON CONFLICT (exam_id) DO NOTHING;

INSERT INTO public.exam_timelines (exam_id, event_type, event_date, event_label)
SELECT e.id, t.event_type, t.event_date, t.event_label
FROM public.exams e
JOIN (
  VALUES
    ('GATE_BT', 'registration_start', DATE '2025-08-28', 'Registration Opens'),
    ('GATE_BT', 'registration_end', DATE '2025-10-03', 'Registration Closes'),
    ('GATE_BT', 'admit_card_release', DATE '2026-01-02', 'Admit Card Release'),
    ('GATE_BT', 'exam_date', DATE '2026-02-07', 'Exam Date'),
    ('GATE_BT', 'result_date', DATE '2026-03-19', 'Result Date'),
    ('CSIR_NET_LS', 'registration_start', DATE '2026-03-01', 'Application Start'),
    ('CSIR_NET_LS', 'registration_end', DATE '2026-03-30', 'Application Deadline'),
    ('CSIR_NET_LS', 'admit_card_release', DATE '2026-06-10', 'Admit Card Release'),
    ('CSIR_NET_LS', 'exam_date', DATE '2026-06-28', 'Exam Date'),
    ('CSIR_NET_LS', 'result_date', DATE '2026-08-20', 'Result Announcement'),
    ('DBT_JRF', 'registration_start', DATE '2026-02-15', 'Application Start'),
    ('DBT_JRF', 'registration_end', DATE '2026-03-17', 'Application Deadline'),
    ('DBT_JRF', 'admit_card_release', DATE '2026-05-08', 'Admit Card Release'),
    ('DBT_JRF', 'exam_date', DATE '2026-05-17', 'Exam Date'),
    ('DBT_JRF', 'result_date', DATE '2026-06-30', 'Result Announcement'),
    ('ICMR_JRF', 'registration_start', DATE '2026-04-01', 'Application Start'),
    ('ICMR_JRF', 'registration_end', DATE '2026-04-30', 'Application Deadline'),
    ('ICMR_JRF', 'admit_card_release', DATE '2026-06-20', 'Admit Card Release'),
    ('ICMR_JRF', 'exam_date', DATE '2026-07-12', 'Exam Date'),
    ('ICMR_JRF', 'result_date', DATE '2026-08-25', 'Result Announcement'),
    ('ICAR_NET', 'registration_start', DATE '2026-02-20', 'Registration Start'),
    ('ICAR_NET', 'registration_end', DATE '2026-03-20', 'Registration Deadline'),
    ('ICAR_NET', 'admit_card_release', DATE '2026-05-25', 'Admit Card Release'),
    ('ICAR_NET', 'exam_date', DATE '2026-06-15', 'Exam Date'),
    ('ICAR_NET', 'result_date', DATE '2026-07-30', 'Result Date')
) AS t(code, event_type, event_date, event_label)
ON t.code = e.code
ON CONFLICT (exam_id, event_type) DO NOTHING;
