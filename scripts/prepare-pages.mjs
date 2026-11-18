import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { projects } from '../src/content/projects.ts'

const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8')
for (const { slug } of projects) {
  const directory = new URL('../dist/projects/' + slug + '/', import.meta.url)
  await mkdir(directory, { recursive: true })
  await writeFile(new URL('index.html', directory), html)
}
await writeFile(new URL('../dist/404.html', import.meta.url), html)
await writeFile(new URL('../dist/.nojekyll', import.meta.url), '')
console.log('Prepared static directory entries for ' + projects.length + ' projects.')
