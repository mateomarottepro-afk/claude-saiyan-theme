import { expect, test } from 'claude-code/testing'

const BACKDROP = {
  plugin: 'saiyan-transformation',
  component: 'Backdrop',
  requestId: 'backdrop',
  props: { scene: 'aura', plugin: 'saiyan-transformation', glass: { blur: 10, tint: '#080d1a', opacity: 0.6 } },
} as const

test('le fond tient dans la limite du Svg', async ($, on) => {
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('theme.set', () => ({ value: { isDrawn: true, requestId: 'backdrop' } }))
  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  const ui = await $.ui.mount({ ...BACKDROP, surface: 'desktop' } as never)
  const svg = (await ui.find({ type: 'Svg' } as never)) as unknown as { props?: { source?: string } } | undefined
  const len = svg?.props?.source?.length ?? -1

  console.log("SVG length", len)
  expect(len > 0).toBe(true)
  expect(len <= 131072).toBe(true)
  await ui.unmount()
})
