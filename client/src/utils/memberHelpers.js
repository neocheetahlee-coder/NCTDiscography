export function getMemberImageSources(image) {
  if (!image) return [];

  const imagePath = `/${image.replace(/^\/+/, '')}`;
  const sources = [imagePath];
  if (/\.jpg$/.test(imagePath)) {
    sources.push(imagePath.replace(/\.jpg$/, '.JPG'));
  }
  return sources;
}

export function getMemberFlag(member) {
  if (!/^[A-Z]{2}$/.test(member.countryCode || '')) return '';

  return [...member.countryCode]
    .map((character) => String.fromCodePoint(127397 + character.charCodeAt(0)))
    .join('');
}

export function formatDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
