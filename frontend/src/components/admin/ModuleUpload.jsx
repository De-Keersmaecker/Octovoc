import { useState } from 'react'
import api from '../../services/api'

export default function ModuleUpload({ onSuccess }) {
  const [file, setFile] = useState(null)
  const [moduleName, setModuleName] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [level, setLevel] = useState(6)
  const [isFree, setIsFree] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!file || !moduleName || !difficulty) {
      setMessage('Vul alle velden in')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', moduleName)
    formData.append('difficulty', difficulty)
    formData.append('level', level)
    formData.append('is_free', isFree)

    setUploading(true)
    setMessage('')

    try {
      const res = await api.post('/admin/modules/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage(res.data.message || 'Module geüpload')
      setFile(null)
      setModuleName('')
      setDifficulty('')
      setLevel(6)
      setIsFree(false)
      if (onSuccess) onSuccess()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Fout bij uploaden')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="section">
      <h2>Upload Module (Excel)</h2>
      <form onSubmit={handleFileUpload} className="upload-form">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files[0])}
          required
          className="teacher-input"
        />
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
        <button type="submit" disabled={uploading} className="teacher-btn">
          {uploading ? 'Uploaden...' : 'Upload Excel'}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  )
}
