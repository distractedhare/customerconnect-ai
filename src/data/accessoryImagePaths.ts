export function slugifyAccessoryName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/&/g, ' and ')
    .replace(/[/"']/g, '')
    .replace(/[()]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getAccessoryImageUrl(name: string): string {
  return `/images/accessories/${slugifyAccessoryName(name)}.png`;
}
