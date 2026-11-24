// Run: npm test   (uses Node's built-in test runner; no extra packages)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSafeExternalUrl, refusedLinkLabel, isAppNavigation } from './safeUrl.ts'

test('web pages and email links are allowed', () => {
  for (const url of [
    'https://example.com',
    'https://example.com/path?x=1#top',
    'https://drive.google.com/file/d/abc/view',
    'HTTPS://EXAMPLE.COM/',
    'mailto:support@bynorthlight.ca',
    'mailto:someone@example.com?subject=Hello'
  ]) {
    assert.equal(isSafeExternalUrl(url), true, url)
  }
})

test('anything that could run a program or open a local file is refused', () => {
  for (const url of [
    'file:///C:/Windows/System32/calc.exe',
    'file://server/share/x.exe',
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'ms-msdt:/id PCWDiagnostic',
    'search-ms:query=x',
    'smb://server/share',
    'vbscript:msgbox(1)',
    'steam://run/1',
    'tel:+15555550100',
    'ftp://example.com/x'
  ]) {
    assert.equal(isSafeExternalUrl(url), false, url)
  }
})

test('plain http is refused (links must be https)', () => {
  assert.equal(isSafeExternalUrl('http://example.com'), false)
})

test('things that are not clean links are refused', () => {
  for (const url of ['', ' ', '   https://example.com', 'https://example.com ', '//example.com', 'example.com', 'C:\\Windows\\notepad.exe', '/etc/passwd', 'https://']) {
    assert.equal(isSafeExternalUrl(url), false, JSON.stringify(url))
  }
})

test('non-text values are refused', () => {
  for (const v of [undefined, null, 0, 5, {}, [], ['https://example.com'], true]) {
    assert.equal(isSafeExternalUrl(v), false, String(v))
  }
})

test('a refused link is labelled by its scheme only, never by the rest of the address', () => {
  assert.equal(refusedLinkLabel('file:///C:/Users/Elizabeth/Secret%20Plans.docx'), 'file')
  assert.equal(refusedLinkLabel('javascript:alert(document.cookie)'), 'javascript')
  assert.equal(refusedLinkLabel('MS-MSDT:/id PCWDiagnostic'), 'ms-msdt')
  assert.equal(refusedLinkLabel('http://example.com/private?token=abc123'), 'http')
  assert.equal(refusedLinkLabel('smb://server/finance/payroll.xlsx'), 'smb')
})

test('labels for things that are not links at all are fixed words', () => {
  assert.equal(refusedLinkLabel(''), 'not-a-url')
  assert.equal(refusedLinkLabel('/etc/passwd'), 'not-a-url')
  assert.equal(refusedLinkLabel('example.com/page'), 'not-a-url')
  assert.equal(refusedLinkLabel(undefined), 'not-text')
  assert.equal(refusedLinkLabel({ href: 'file:///x' }), 'not-text')
})

test('the label never contains anything from the address beyond a short scheme name', () => {
  const secret = 'SuperSecretClientName'
  for (const url of [`file:///C:/${secret}.docx`, `custom-${secret.toLowerCase()}://x`, `${secret}://host/path`, `http://${secret}.example.com/${secret}`]) {
    const label = refusedLinkLabel(url)
    assert.ok(label.length <= 20, label)
    assert.ok(!label.toLowerCase().includes(secret.toLowerCase()), label)
    assert.ok(!label.includes('/') && !label.includes('.docx') && !label.includes('example'), label)
  }
})

test('only the app\'s own page counts as app navigation', () => {
  const packaged = 'file:///C:/Users/me/AppData/Local/Programs/Northlight%20Vault/resources/app.asar/out/renderer/index.html'
  assert.equal(isAppNavigation(packaged, packaged), true)
  assert.equal(isAppNavigation(`${packaged}#/settings`, packaged), true)
  assert.equal(isAppNavigation(`${packaged}?x=1`, packaged), true)
  assert.equal(isAppNavigation('file:///C:/Windows/System32/calc.exe', packaged), false)
  assert.equal(isAppNavigation('file:///C:/Users/me/AppData/Local/Programs/Northlight%20Vault/resources/app.asar/out/renderer/other.html', packaged), false)
  assert.equal(isAppNavigation('https://example.com/', packaged), false)
  assert.equal(isAppNavigation('javascript:alert(1)', packaged), false)
  const dev = 'http://localhost:5173/'
  assert.equal(isAppNavigation('http://localhost:5173/', dev), true)
  assert.equal(isAppNavigation('http://localhost:5173/#/x', dev), true)
  assert.equal(isAppNavigation('http://localhost:5174/', dev), false)
  assert.equal(isAppNavigation('http://evil.example/', dev), false)
  assert.equal(isAppNavigation('https://localhost:5173/', dev), false)
})

test('app navigation check refuses anything it cannot read', () => {
  const app = 'http://localhost:5173/'
  for (const bad of [undefined, null, 5, '', 'not a url', {}]) {
    assert.equal(isAppNavigation(bad, app), false)
    assert.equal(isAppNavigation(app, bad), false)
  }
})
