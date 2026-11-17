const github = 'https://github.com/JOO5216/'
export const profile = github.slice(0, -1)

export const projects = [
  {
    slug: 'visual-data-qc', number: '01', name: 'Visual Data QC', label: 'Computer vision',
    summary: 'A triage pipeline for finding usable visual data.',
    repository: github + 'tt-ins-yt-media-cv-qc',
    context: 'Collecting covers and inspecting video clips creates two different quality problems. Covers need visual triage. Clips need consistent checks for properties like resolution, frame rate and face size.',
    implementation: 'The repository documents TikTok creator discovery and cover collection, InsightFace and OCR cover checks, and a SmolVLM review step for suspected overlays. Local video checks use FFprobe for media specs and YuNet at 10%, 50% and 90% of a clip.',
    limits: 'The tools produce review grades and reports. A clean grade means the programmed rules did not fire, and three sampled frames cannot establish quality across a whole clip. The public repository documents a TikTok collection path.',
    stages: ['Discover', 'Collect', 'Screen', 'Review', 'Report'],
  },
  {
    slug: 'resume-copilot', number: '02', name: 'Resume Copilot', label: 'Human × AI',
    summary: 'A browser side panel for reviewing AI-assisted form fills.',
    repository: github + 'resume',
    context: 'The same résumé details have to be mapped to different labels and widgets across application pages. A suggestion needs to remain inspectable before it changes a form.',
    implementation: 'A Chrome and Edge extension extracts text from PDF, DOCX or TXT, maps suggestions to a local résumé schema, and previews proposed matches before writing selected fields. The documented local model path uses Qwen2.5-1.5B-Instruct with llama.cpp.',
    limits: 'Text extraction supports text-based PDFs. The local model must be deployed separately, and a human reviews the proposed mapping and submits the application.',
    stages: ['Extract', 'Map', 'Review', 'Fill selected fields'],
  },
  {
    slug: 'url-crawler', number: '03', name: 'URL Crawler', label: 'Data collection',
    summary: 'Collect and resume TikTok discovery across tags and sounds.',
    repository: github + 'tt-ins-url-crawler',
    context: 'Finding videos and creators from tags or sounds means dealing with repeated pages, interrupted runs and duplicates.',
    implementation: 'Five Python scripts cover TikTok tag, sound and creator discovery. They use the third-party TikWM API, Playwright fallbacks on supported paths and exports to CSV, XLSX or SQLite, depending on the script.',
    limits: 'Some paths keep checkpoints and support resuming. Rate limits, repeated pages and changes to the upstream interface affect coverage.',
    stages: ['Seed', 'Paginate', 'Deduplicate', 'Checkpoint', 'Export'],
  },
  {
    slug: 'huahua', number: '04', name: 'Huahua', label: 'Playground',
    summary: 'A Codex desktop companion with nine states and a curious gaze.',
    repository: github + 'huahua-codex-pet',
    context: 'What if the state of a task could be expressed through a small character’s posture, movement and gaze?',
    implementation: 'Huahua uses the Codex v2 sprite format. The public package includes an eight-column WebP atlas, state previews, sixteen look directions and a validation report.',
    limits: 'The repository documents Windows Codex installation. The character artwork has separate usage terms from the installer and configuration.',
    stages: ['Sprite atlas', 'State animation', 'Directional gaze'],
  },
  {
    slug: 'jdds-skills', number: '05', name: 'JDDs Skills', label: 'Agent workflows',
    summary: 'Reusable instructions for recurring agent workflows.',
    repository: github + 'JDDs-skills',
    context: 'Repeatable work benefits from recording both the procedure and the checks that show whether it ran correctly.',
    implementation: 'The repository publishes five skills. They cover read-only media listing and screening, Feishu video previews, matching inventory records, and a coding workflow that prioritizes existing platform capabilities.',
    limits: 'Workflows that interact with external tables or storage need the appropriate access and inputs for each run.',
    stages: ['Inputs', 'Procedure', 'Verification'],
  },
]
