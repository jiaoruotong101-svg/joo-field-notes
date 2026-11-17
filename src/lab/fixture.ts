export const clip = {
  id: 'SYN-001',
  title: 'Studio run',
  width: 1280,
  height: 720,
  duration: 20,
  fps: 30,
  container: 'MP4',
  codec: 'H.264',
} as const

type FaceBox = { x: number; y: number; width: number; height: number }

export type Sample = {
  percent: number
  description: string
  face: FaceBox | null
}

export const samples: Sample[] = [
  { percent: 10, description: 'Close framing', face: { x: 486, y: 65, width: 303, height: 359 } },
  { percent: 50, description: 'Distant subject', face: { x: 611, y: 41, width: 65, height: 78 } },
  { percent: 90, description: 'Subject behind a panel', face: null },
]

export const faceMinimum = 128
export const source = 'https://github.com/JOO5216/tt-ins-yt-media-cv-qc/blob/main/VIDEO_QC_README.md'
export const specRules = [
  { name: 'Container', value: clip.container, requirement: 'MP4', passes: clip.container === 'MP4' },
  { name: 'Codec', value: clip.codec, requirement: 'H.264 or H.265', passes: ['H.264', 'H.265'].includes(clip.codec) },
  { name: 'Short edge', value: `${Math.min(clip.width, clip.height)} px`, requirement: '≥ 720 px', passes: Math.min(clip.width, clip.height) >= 720 },
  { name: 'Frame rate', value: `${clip.fps} fps`, requirement: '≥ 24 fps', passes: clip.fps >= 24 },
  { name: 'Duration', value: `${clip.duration} s`, requirement: '5–60 s, inclusive', passes: clip.duration >= 5 && clip.duration <= 60 },
]

export type Decision = 'accept' | 'hold' | 'reject'
export type Review = { decision: Decision | null; note: string }
export type Verdict = 'pass' | 'hold' | 'fail'

export const verdictLabels: Record<Verdict, string> = { pass: 'Pass', hold: 'Needs review', fail: 'Fail' }
export const decisionLabels: Record<Decision, string> = { accept: 'Accept', hold: 'Hold', reject: 'Reject' }

export function faceVerdict(sample: Sample): Verdict {
  if (!sample.face) return 'hold'
  return Math.min(sample.face.width, sample.face.height) >= faceMinimum ? 'pass' : 'fail'
}

export function sampleTime(sample: Sample) {
  return (sample.percent / 100 * clip.duration).toFixed(2) + ' s'
}

export function buildReport(reviews: Review[]) {
  const faceResults = samples.map(faceVerdict)
  const faceCheck = faceResults.includes('fail') ? 'fail' : faceResults.includes('hold') ? 'hold' : 'pass'
  const decision = reviews.some((review) => review.decision === 'reject')
    ? 'reject' : reviews.some((review) => review.decision === 'hold') ? 'hold' : 'accept'

  return {
    schemaVersion: 1,
    simulation: true,
    evidence: 'Generated editorial stills and scripted detections',
    ruleSource: source,
    generatedAt: new Date().toISOString(),
    clip,
    automated: {
      specifications: specRules.every((rule) => rule.passes) ? 'pass' : 'fail',
      faceSampling: faceCheck,
      faceMinimumPx: faceMinimum,
      specificationChecks: specRules,
    },
    reviewerDisposition: decision,
    samples: samples.map((sample, index) => {
      const review = reviews[index]
      if (!review?.decision) throw new Error('Every sample must be reviewed before reporting')
      return {
        percentage: sample.percent,
        timestampSeconds: sample.percent / 100 * clip.duration,
        description: sample.description,
        faceBoxPx: sample.face,
        simulatedFaceCheck: faceResults[index],
        humanReview: { decision: review.decision, note: review.note.trim() },
      }
    }),
  } as const
}

export type Report = ReturnType<typeof buildReport>
