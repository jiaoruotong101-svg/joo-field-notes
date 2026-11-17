export const candidate = {
  name: 'Mira Lin',
  email: 'mira.lin@example.com',
  role: 'Data Quality Intern',
  location: 'Hangzhou, China',
  project: 'Built a review tool for synthetic video captions and wrote checks for missing timestamps.',
}

export const mappings = [
  { id: 'name', label: 'Full name', source: 'Name', evidence: candidate.name, suggestion: candidate.name, match: 'Direct', reason: 'The form asks for the name shown at the top of the résumé.' },
  { id: 'email', label: 'Email address', source: 'Contact', evidence: candidate.email, suggestion: candidate.email, match: 'Direct', reason: 'The contact line contains one email address.' },
  { id: 'location', label: 'City', source: 'Location', evidence: candidate.location, suggestion: 'Hangzhou', match: 'Formatted', reason: 'The form asks for a city. The suggestion extracts it from the location line.' },
  { id: 'title', label: 'Current job title', source: 'Experience', evidence: candidate.role, suggestion: candidate.role, match: 'Check recency', reason: 'The résumé lists an internship title. Confirm it still describes the current role before including it.' },
  { id: 'project', label: 'Relevant project', source: 'Project note', evidence: candidate.project, suggestion: candidate.project, match: 'Direct', reason: 'The project note describes relevant work on video caption quality.' },
  { id: 'start', label: 'Available start date', source: null, evidence: null, suggestion: '', match: 'Missing', reason: 'The résumé gives no start date. Enter one manually for this fictional candidate or leave the field empty.' },
] as const

export type Mapping = (typeof mappings)[number]
export type FieldId = Mapping['id']

export type Draft = { value: string; included: boolean }
export type Drafts = Record<FieldId, Draft>

export function initialDrafts(): Drafts {
  return Object.fromEntries(mappings.map((item) => [
    item.id, { value: item.suggestion, included: item.match === 'Direct' || item.match === 'Formatted' },
  ])) as Drafts
}

export function getFillPlan(drafts: Drafts) {
  return mappings.flatMap((item) => {
    const { value, included } = drafts[item.id]
    const cleaned = value.trim()
    return included && cleaned ? [{ id: item.id, label: item.label, value: cleaned }] : []
  })
}
