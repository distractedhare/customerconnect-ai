// Shared Base64URL codec — extracted from teamConfigService so the
// rep-token + arcade-token paths can both lean on the same proven impl.
// UTF-8 safe; no padding.

export function toBase64Url(input: string): string {
  const utf8 = unescape(encodeURIComponent(input));
  const b64 = btoa(utf8);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLen = (4 - (padded.length % 4)) % 4;
  const b64 = padded + '='.repeat(padLen);
  const binary = atob(b64);
  return decodeURIComponent(escape(binary));
}
