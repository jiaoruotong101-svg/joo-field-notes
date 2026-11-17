export const conditions = {
  before: { label: 'Before review', revealAt: 0 },
  during: { label: 'During review', revealAt: 1 },
  after: { label: 'After decision', revealAt: 3 },
} as const

export type Condition = keyof typeof conditions
export type Stage = 0 | 1 | 2 | 3

export const stages = ['Request', 'Review', 'Decision', 'Feedback'] as const
export const scenario = {
  title: 'Campus media lab booking',
  request: 'You request the last sound booth on Thursday at 16:00. Your project is due on Monday.',
  review: 'The booking system compares requests for the same slot.',
  outcome: 'Your request was placed on the waitlist.',
  next: 'If the slot opens, the lab will contact you.',
  explanation: 'The booking system gives priority to the earliest project deadline. For tied deadlines, it favors the person with fewer bookings this month. For this slot, another requester has a Friday deadline and yours is on Monday.',
} as const

export const questions = {
  procedure: { label: 'Procedural fairness', prompt: 'The process used to make the decision was fair.' },
  interaction: { label: 'Interactional fairness', prompt: 'I felt the booking system treated me with respect.' },
  outcome: { label: 'Outcome fairness', prompt: 'The booking outcome was fair to me.' },
} as const

export type Dimension = keyof typeof questions
export const dimensions = Object.keys(questions) as Dimension[]
export const choices = [
  { value: 1, label: 'Strongly disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neither agree nor disagree' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly agree' },
] as const
export type Rating = (typeof choices)[number]['value']
export type Run = { stage: Stage; ratings: Partial<Record<Dimension, Rating>>; saved: boolean }
export const newRun = (): Run => ({ stage: 0, ratings: {}, saved: false })

export function nextStage(stage: Stage): Stage {
  return stage === 0 ? 1 : stage === 1 ? 2 : 3
}

export function explanationVisible(condition: Condition, stage: Stage) {
  return stage >= conditions[condition].revealAt
}

export function canSaveFeedback(run: Run) {
  return run.stage === 3 && dimensions.every((dimension) => run.ratings[dimension] !== undefined)
}
