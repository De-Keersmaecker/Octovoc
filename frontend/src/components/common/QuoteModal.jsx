export default function QuoteModal({ quote, onClose }) {
  if (!quote) return null

  // Extract YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) return null

    // Handle various YouTube URL formats
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/shorts\/([^&\n?#]+)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }
    return null
  }

  const videoId = getYouTubeVideoId(quote.video_url)

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          padding: '40px',
          maxWidth: '800px',
          width: '100%',
          textAlign: 'center',
          border: '2px solid #000000',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '5px 10px',
            lineHeight: '1'
          }}
          aria-label="Sluit"
        >
          ×
        </button>

        <div style={{
          fontSize: '24px',
          fontStyle: 'italic',
          marginBottom: '20px',
          lineHeight: '1.6'
        }}>
          "{quote.text}"
        </div>

        {quote.author && (
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: videoId ? '20px' : '0'
          }}>
            — {quote.author}
          </div>
        )}

        {videoId && (
          <div style={{ marginTop: '20px' }}>
            <iframe
              width="100%"
              height="315"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                maxWidth: '560px',
                border: '1px solid #000000'
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
