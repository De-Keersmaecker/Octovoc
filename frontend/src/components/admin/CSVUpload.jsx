import { useState } from 'react'
import api from '../../services/api'

export default function CSVUpload({ onSuccess, editingModuleId = null }) {
  const [csvData, setCsvData] = useState('')
  const [moduleName, setModuleName] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [level, setLevel] = useState(6)
  const [isFree, setIsFree] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleCsvUpload = async (e) => {
    e.preventDefault()
    if (!csvData || (!editingModuleId && (!moduleName || !difficulty))) {
      setMessage('Vul alle velden in')
      return
    }

    setUploading(true)
    setMessage('')

    try {
      const endpoint = editingModuleId
        ? `/admin/modules/${editingModuleId}/csv-update`
        : '/admin/modules/csv-upload'

      const res = await api.post(endpoint, {
        csv_data: csvData,
        name: moduleName,
        difficulty,
        level,
        is_free: isFree
      })
      setMessage(res.data.message || 'CSV verwerkt')
      setCsvData('')
      setModuleName('')
      setDifficulty('')
      setLevel(6)
      setIsFree(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Fout bij verwerken CSV')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="section">
      <h2>{editingModuleId ? 'Update Module (CSV)' : 'Upload Module (CSV)'}</h2>
      <form onSubmit={handleCsvUpload} className="upload-form">
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Plak CSV data (word,meaning,example_sentence)"
          rows={10}
          required
          className="teacher-input"
          style={{ fontFamily: 'monospace', fontSize: '14px' }}
        />
        {!editingModuleId && (
          <>
            <input
              type="text"
              value={moduleName}
              onChange={(e) => setModuleName(e.target.value)}
              placeholder="Module naam"
              required
              className="teacher-input"
            />
            <input
              type="text"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              placeholder="Moeilijkheid"
              required
              className="teacher-input"
            />
            <select
              value={level}
              onChange={(e) => setLevel(Number(e.target.value))}
              className="teacher-input"
            >
              {[1, 2, 3, 4, 5, 6].map(l => (
                <option key={l} value={l}>Niveau {l}</option>
              ))}
            </select>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              Gratis module
            </label>
          </>
        )}
        <button type="submit" disabled={uploading} className="teacher-btn">
          {uploading ? 'Verwerken...' : editingModuleId ? 'Update CSV' : 'Upload CSV'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  )
}
