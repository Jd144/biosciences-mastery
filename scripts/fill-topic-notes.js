// This script will populate all topics with short and detailed notes for revision.
// Run: node scripts/fill-topic-notes.js

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY env vars.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Example notes generator (replace with real content as needed)
function generateNotes(subject, topic) {
  return {
    short_notes_md: `# ${topic.title}\n\n- Key facts about ${topic.title} in ${subject.name}.\n- Important points for quick revision.\n- Definitions, diagrams, and mnemonics.\n- Main summary for fast recall.`,
    detailed_notes_md: `# ${topic.title} (Full Detailed Notes)\n\n## Introduction\n${topic.title} is a fundamental topic in ${subject.name}. This section covers all essential concepts, mechanisms, and applications.\n\n## Table of Contents\n1. Introduction\n2. Historical Background\n3. Key Concepts\n4. Mechanisms and Processes\n5. Diagrams and Illustrations\n6. Case Studies / Examples\n7. Summary Tables\n8. Mnemonics and Memory Aids\n9. Practice Questions\n10. Summary\n\n## 1. Introduction\n${topic.title} is important because...\n\n## 2. Historical Background\n- Origin and discovery of ${topic.title}.\n- Major contributors and milestones.\n\n## 3. Key Concepts\n- Concept 1: Detailed explanation with examples.\n- Concept 2: In-depth discussion, diagrams, and real-life relevance.\n- Concept 3: Step-by-step breakdown.\n- Concept 4: Advanced points and exceptions.\n\n## 4. Mechanisms and Processes\n- Describe the main processes involved in ${topic.title}.\n- Include stepwise mechanisms, flowcharts, and explanations.\n\n## 5. Diagrams and Illustrations\n- [Insert detailed diagram here: label all parts, explain each step.]\n- [Add flowchart if applicable.]\n\n## 6. Case Studies / Examples\n- Example 1: ...\n- Example 2: ...\n- Example 3: ...\n\n## 7. Summary Tables\n| Point | Detail |\n|-------|--------|\n| 1     | ...    |\n| 2     | ...    |\n| 3     | ...    |\n| 4     | ...    |\n\n## 8. Mnemonics and Memory Aids\n- Mnemonic 1: ...\n- Mnemonic 2: ...\n\n## 9. Practice Questions\n1. Explain the main concepts of ${topic.title} with examples.\n2. Draw and label the main diagram.\n3. Solve this case: ...\n4. List and explain all mechanisms.\n5. Write short notes on key points.\n\n## 10. Summary\n- Recap all important points.\n- Highlight exam tips and common mistakes.\n\n---\nRead these notes thoroughly. With focus, you can master this topic in about 1 hour.\n\n---\n\n[Add more content as needed for your syllabus. Expand each section with real data for your subjects.]`,
  };
}

async function main() {
  // Fetch all subjects
  const { data: subjects, error: subErr } = await supabase.from('subjects').select('*');
  if (subErr) throw subErr;

  for (const subject of subjects) {
    // Fetch topics for each subject
    const { data: topics, error: topErr } = await supabase.from('topics').select('*').eq('subject_id', subject.id);
    if (topErr) throw topErr;

    for (const topic of topics) {
      const notes = generateNotes(subject, topic);
      // Upsert topic_content
      const { error } = await supabase.from('topic_content').upsert({
        topic_id: topic.id,
        language: 'en',
        ...notes,
        updated_at: new Date().toISOString(),
      }, { onConflict: ['topic_id', 'language'] });
      if (error) {
        console.error(`Failed for topic ${topic.title}:`, error.message);
      } else {
        console.log(`Filled notes for: ${subject.name} > ${topic.title}`);
      }
    }
  }
  console.log('All topics filled.');
}

main().catch(e => { console.error(e); process.exit(1); });
