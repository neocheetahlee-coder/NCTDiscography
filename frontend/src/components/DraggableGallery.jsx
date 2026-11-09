import useDraggable from '../hooks/useDraggable.js';

export default function DraggableGallery({ videos }) {
  const { containerRef, trackRef, startDrag, updateBounds } = useDraggable();

  function handleVideoLoaded() {
    updateBounds();
  }

  return (
    <div
      className="draggable-gallery-container"
      ref={containerRef}
      onMouseDown={startDrag}
      onTouchStart={startDrag}
    >
      <div className="draggable-track" id="draggableTrack" ref={trackRef}>
        {videos.map((video) => (
          <div className="clip-item" key={video.trackId}>
            <video
              src={video.previewUrl}
              poster={video.posterUrl}
              autoPlay
              loop
              muted
              playsInline
              onLoadedMetadata={handleVideoLoaded}
              onLoadedData={handleVideoLoaded}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
