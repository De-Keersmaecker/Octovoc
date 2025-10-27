export default function YouTubeRewardModal({ videoUrl, moduleName, onClose }) {
  if (!videoUrl) return null

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

  const videoId = getYouTubeVideoId(videoUrl)

  if (!videoId) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
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
          width: '100%',
          maxWidth: '1200px',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '-50px',
            right: '0',
            background: '#ffffff',
            border: '2px solid #ffffff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px 16px',
            lineHeight: '1',
            color: '#000000',
            fontWeight: 'bold',
            zIndex: 1001
          }}
          aria-label="Sluit"
        >
          ✕ sluiten
        </button>

        {/* Congratulations text */}
        <div style={{
          textAlign: 'center',
          color: '#ffffff',
          marginBottom: '30px',
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif'
        }}>
          <h2 style={{
            fontSize: 'clamp(24px, 3vw, 32px)',
            marginBottom: '10px',
            fontWeight: '600',
            letterSpacing: '0.02em'
          }}>
            Proficiat!
          </h2>
          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)',
            marginBottom: '8px',
            letterSpacing: '0.02em'
          }}>
            Je hebt de module <strong>{moduleName}</strong> helemaal afgerond!
          </p>
          <p style={{
            fontSize: 'clamp(14px, 1.5vw, 18px)',
            letterSpacing: '0.02em',
            opacity: 0.9
          }}>
            Als beloning een filmpje met schattige katjes:
          </p>
        </div>

        <div style={{
          position: 'relative',
          paddingBottom: '56.25%', // 16:9 aspect ratio
          height: 0,
          overflow: 'hidden'
        }}>
          <iframe
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '4px solid #ffffff'
            }}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
