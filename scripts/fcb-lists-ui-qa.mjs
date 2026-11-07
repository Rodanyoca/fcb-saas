import { build } from 'esbuild'
import { chromium } from '@playwright/test'
import { readFile, readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'
import assert from 'node:assert/strict'
const output = 'test-results/fcb-lists'
await mkdir(output, { recursive: true })
const result = await build({ entryPoints: ['tests/ui/fcb-lists-entry.tsx'], bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'isolated-navigation', setup(builder) { builder.onResolve({ filter: /^next\/(navigation|link|image)$/ }, args => ({ path: path.resolve(args.path === 'next/image' ? 'tests/ui/image-shim.tsx' : 'tests/ui/navigation-shim.tsx') })) } }] })
async function cssFiles(directory) {
  const css = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) css.push(...await cssFiles(path.join(directory, entry.name)))
    else if (entry.name.endsWith('.css')) css.push(await readFile(path.join(directory, entry.name), 'utf8'))
  }
  return css
}
// Reuse the existing UI stylesheet; this test does not require a full Next build.
const css = (await cssFiles('.next/static')).join('\n')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
  const errors = []
  page.on('pageerror', error => errors.push(error.message))
  await page.route('**/*', route => route.request().isNavigationRequest() ? route.fulfill({ contentType: 'text/html', body: '<html lang="fr"><body><div id="root"></div></body></html>' }) : route.abort())
  await page.goto('http://fcb-qa.test/')
  await page.addStyleTag({ content: css })
  await page.addScriptTag({ content: result.outputFiles[0].text })
  await page.getByRole('heading', { name: 'Ligues', exact: true }).waitFor()
  assert.equal(await page.locator('tbody tr').count(), 10)
  assert.equal(await page.locator('tbody tr:first-child td:first-child').textContent(), '01')
  assert.equal(await page.locator('tbody').getByText('active', { exact: true }).count(), 0)
  assert.equal(await page.getByRole('button', { name: /Ajouter|Modifier/ }).count(), 0)
  const nav = page.getByRole('navigation', { name: 'Navigation principale' })
  assert.deepEqual(await nav.getByRole('link').filter({ hasText: /^(Ligues|Ententes|Clubs)$/ }).allTextContents(), ['Ligues', 'Ententes', 'Clubs'])
  await page.getByRole('button', { name: 'Page suivante', exact: true }).click()
  assert.equal(await page.locator('tbody tr:first-child td:first-child').textContent(), '11')
  await page.getByRole('button', { name: 'Page suivante', exact: true }).click()
  assert.equal(await page.locator('tbody tr').count(), 6)
  await page.getByPlaceholder('Rechercher une ligue...').fill('KINSHASA')
  assert.equal(await page.locator('tbody tr').count(), 1)
  assert.equal(await page.locator('tbody tr:first-child td:first-child').textContent(), '01')
  await page.getByPlaceholder('Rechercher une ligue...').fill('')
  await page.getByRole('combobox', { name: 'Province', exact: true }).click()
  await page.getByRole('option', { name: 'KWANGO', exact: true }).click()
  assert.equal(await page.locator('tbody tr').count(), 1)
  assert.equal(await page.locator('tbody tr:first-child td:first-child').textContent(), '02')
  await page.screenshot({ path: `${output}/ligues.png`, fullPage: true })
  for (const kind of ['ententes', 'clubs']) {
    await page.evaluate(kind => window.fcbRender(kind), kind)
    await page.getByRole('heading', { name: kind === 'clubs' ? 'Clubs' : 'Ententes', exact: true }).waitFor()
    await page.getByText('Aucune donnée trouvée', { exact: true }).filter({ visible: true }).waitFor()
    await page.screenshot({ path: `${output}/${kind}-empty.png`, fullPage: true })
  }
  await page.evaluate(() => window.fcbRender('ligues', 'Erreur de connexion FCB test'))
  await page.getByText('Erreur de connexion FCB test').waitFor()
  assert.equal(await page.getByText('Aucune donnée trouvée', { exact: true }).count(), 0)
  assert.equal(await page.locator('table').count(), 0)
  await page.evaluate(() => window.fcbRender('ligues'))
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('heading', { name: 'Ligues', exact: true }).waitFor()
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
  await page.screenshot({ path: `${output}/ligues-mobile.png`, fullPage: true })
  assert.deepEqual(errors, [])
  console.log('FCB lists: 26 IDs/pagination/search/filter/empty/error/read-only/navigation/mobile passed. No Google requests or writes.')
} finally { await browser.close() }
