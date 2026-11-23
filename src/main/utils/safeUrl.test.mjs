// Run: npm test   (uses Node's built-in test runner; no extra packages)
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { isSafeExternalUrl } from './safeUrl.ts'

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
