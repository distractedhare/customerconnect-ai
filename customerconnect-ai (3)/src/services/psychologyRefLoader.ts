// Loads and parses the sales-psychology-reference.md file
// This file is authored in Cowork and consumed here. DO NOT edit the source .md.

import psychologyMd from '../data/sales-psychology-reference.md?raw';

interface PsychologySection {
  title: string;
  content: string;
}

let parsedSections: PsychologySection[] | null = null;

/** Parse the markdown into sections by heading */
function parseSections(markdown: string): PsychologySection[] {
  const sections: PsychologySection[] = [];
  const lines = markdown.split('\n');
  let currentTitle = '';
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.+)/);
    if (headingMatch) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
      }
      currentTitle = headingMatch[1];
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentContent.join('\n').trim() });
  }

  return sections;
}

/** Get all parsed sections */
export function getPsychologySections(): PsychologySection[] {
  if (!parsedSections) {
    parsedSections = parseSections(psychologyMd);
  }
  return parsedSections;
}

/** Get a specific section by keyword match in the title */
export function getSection(keyword: string): PsychologySection | undefined {
  return getPsychologySections().find(s =>
    s.title.toLowerCase().includes(keyword.toLowerCase())
  );
}

/** Get the raw markdown */
export function getRawPsychologyRef(): string {
  return psychologyMd;
}

/** Get language rules (Section 0) */
export function getLanguageRules(): string {
  const section = getSection('Language Rules') || getSection('Section 0');
  return section?.content || '';
}

/** Get objection techniques (Section 4) */
export function getObjectionTechniques(): string {
  const section = getSection('Objection') || getSection('Section 4');
  return section?.content || '';
}
