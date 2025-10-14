import { useEffect } from 'react'

export default function QuoteModal({ quote, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [onClose])

  if (!quote) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        maxWidth: '600px',
        textAlign: 'center',
        border: '2px solid #000000'
      }}>
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
            fontWeight: '700'
          }}>
            — {quote.author}
          </div>
        )}
      </div>
    </div>
  )
}
