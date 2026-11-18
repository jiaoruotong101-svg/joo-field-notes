export type SignalForm = 0 | 1 | 2
export const signalForms = ['Living field', 'JOO letterform', 'Signal ring'] as const
/** A braided torus: three data strands sharing one orbital field. */
export function orbitalPoint(angle: number, tube: number, strand: number) {
  const radius = 1.16 + strand * .065 + .055 * Math.sin(angle * 3 + strand)
  const thickness = .15 + .035 * Math.sin(angle * 5)
  const radial = radius + Math.cos(tube) * thickness
  const x = Math.cos(angle) * radial
  const y = Math.sin(angle) * radial
  const z = Math.sin(tube) * thickness + .075 * Math.sin(angle * 3 + strand * 2)
  return [x, y * Math.cos(.55) - z * Math.sin(.55), y * Math.sin(.55) + z * Math.cos(.55)] as const
}
