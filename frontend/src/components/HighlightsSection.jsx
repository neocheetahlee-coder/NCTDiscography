import { useEffect, useState } from 'react';
import DraggableGallery from './DraggableGallery.jsx';

const MUSIC_VIDEO_SEARCH_URL =
  'https://itunes.apple.com/search?term=nct&entity=musicVideo&limit=8';

export default function HighlightsSection({ visible }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    async function fetchHighlightVideos() {
      setLoading(true);
      setError('');

      try {
        const response = await fetch(MUSIC_VIDEO_SEARCH_URL, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Could not load highlight videos (HTTP ${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data.results)) {
          throw new Error('The music video response has an invalid format');
        }

        const results = data.results
          .filter((item) => item.previewUrl)
          .map((item, index) => ({
            trackId: item.trackId ?? `${item.previewUrl}-${index}`,
            previewUrl: item.previewUrl,
            posterUrl: item.artworkUrl100?.replace('100x100bb', '600x600bb') || undefined,
          }));

        setVideos(results);
      } catch (fetchError) {
        if (fetchError.name !== 'AbortError') {
          setError(fetchError.message || 'Could not load highlight videos');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchHighlightVideos();
    return () => controller.abort();
  }, []);

  return (
    <section
      id="highlightsSection"
      className={`highlights-section${visible ? '' : ' hidden'}`}
      aria-labelledby="highlightsTitle"
    >
      <h2 className="section-title" id="highlightsTitle">NCT Highlights</h2>
      {loading ? (
        <p className="highlights-message" role="status">Loading highlights...</p>
      ) : error ? (
        <p className="highlights-message highlights-error" role="alert">{error}</p>
      ) : videos.length > 0 ? (
        <DraggableGallery videos={videos} />
      ) : (
        <p className="highlights-message">No highlight videos found.</p>
      )}
    </section>
  );
}
