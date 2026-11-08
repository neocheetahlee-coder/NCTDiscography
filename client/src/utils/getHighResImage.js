export default function getHighResImage(url = '') {
  return (url || '').replace('100x100bb', '400x400bb');
}
