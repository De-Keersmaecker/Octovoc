import { useState, useEffect } from 'react'
import { logout } from '../utils/auth'
import api from '../services/api'
import './Teacher.css'

export default function TeacherDashboard({ user }) {
  const [classrooms, setClassrooms] = useState([])
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [modules, setModules] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [cellDetail, setCellDetail] = useState(null)
  const [difficultWords, setDifficultWords] = useState([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('classrooms') // 'classrooms', 'progress', 'analytics'
  const [editingClassroom, setEditingClassroom] = useState(null)
  const [newClassName, setNewClassName] = useState('')

  useEffect(() => {
    loadClassrooms()
  }, [])

  const loadClassrooms = async () => {
    try {
      const res = await api.get('/teacher/classrooms')
      setClassrooms(res.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const renameClassroom = async (classroomId) => {
    if (!newClassName.trim()) {
      alert('Voer een nieuwe klasnaam in')
      return
    }

    try {
      await api.put(`/admin/classroom/${classroomId}/rename`, {
        name: newClassName
      })
      alert('Klasnaam gewijzigd')
      setEditingClassroom(null)
      setNewClassName('')
      loadClassrooms()
    } catch (err) {
      console.error(err)
      alert('Fout bij wijzigen van klasnaam')
    }
  }

  const toggleClassroomLevel = async (classroomId, level, currentLevels) => {
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level].sort()

    if (newLevels.length === 0) {
      alert('Selecteer minimaal 1 niveau')
      return
    }

    try {
      await api.put(`/admin/classroom/${classroomId}/rename`, {
        allowed_levels: newLevels
      })
      loadClassrooms()
    } catch (err) {
      console.error(err)
      alert('Fout bij wijzigen van niveaus')
    }
  }

  const loadClassroomProgress = async (classroomId) => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/classroom/${classroomId}/progress`)
      setProgressData(res.data.students)
      setModules(res.data.modules)
      setSelectedClassroom(classrooms.find(c => c.id === classroomId))
      setView('progress')
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const loadCellDetail = async (studentId, moduleId) => {
    try {
      setLoading(true)
      const res = await api.get(`/teacher/student/${studentId}/module/${moduleId}/detail`)
      setCellDetail(res.data)
      setSelectedCell({ studentId, moduleId })
      setLoading(false)
    } catch (err) {
      console.error(err)
      alert('geen voortgangsgegevens beschikbaar voor deze combinatie')
      setLoading(false)
    }
  }

  const closeCellDetail = () => {
    setSelectedCell(null)
    setCellDetail(null)
  }

  const getColorForPercentage = (percentage) => {
    if (percentage > 80) return '#4caf50' // green
    if (percentage >= 50) return '#ff9800' // orange
    return '#f44336' // red
  }

  const loadDifficultWords = async (classroomId = null) => {
    try {
      setLoading(true)
      const url = classroomId
        ? `/teacher/analytics/difficult-words?classroom_id=${classroomId}`
        : '/teacher/analytics/difficult-words'
      const res = await api.get(url)
      setDifficultWords(res.data)
      setView('analytics')
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const exportClassroomExcel = async (classroomId) => {
    try {
      const res = await api.get(`/teacher/classroom/${classroomId}/export/excel`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `classroom_${classroomId}_progress.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
      alert('Fout bij exporteren naar Excel')
    }
  }

  const backToClassrooms = () => {
    setView('classrooms')
    setSelectedClassroom(null)
    setProgressData([])
    setModules([])
    setSelectedCell(null)
    setCellDetail(null)
  }

  if (loading && view === 'classrooms') {
    return (
      <div className="teacher-stage">
        <div style={{
          textAlign: 'center',
          paddingTop: '100px',
          fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
          fontSize: 'clamp(14px, 1.2vw, 16px)',
          letterSpacing: '0.02em'
        }}>
          laden...
        </div>
      </div>
    )
  }

  return (
    <div className="teacher-stage">
      <header className="teacher-header">
        <div className="teacher-title">Octovoc</div>
        <div className="teacher-user-info">
          {user.email} (leerkracht)
          <br />
          <button onClick={logout} className="teacher-btn teacher-btn-small" style={{marginTop: '8px'}}>
            uitloggen
          </button>
        </div>
      </header>

      <div className="teacher-content">

      {view === 'classrooms' && (
        <>
          <div className="teacher-section-title">mijn klassen</div>

          <div style={{ marginBottom: '30px' }}>
            <button
              onClick={() => loadDifficultWords()}
              className="teacher-btn"
            >
              moeilijkste woorden (alle klassen)
            </button>
          </div>

          {classrooms.length === 0 ? (
            <p style={{
              fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
              fontSize: 'clamp(14px, 1.2vw, 16px)'
            }}>
              je hebt nog geen klassen
            </p>
          ) : (
            <div className="classroom-grid">
              {classrooms.map(classroom => (
                <div key={classroom.id} className="classroom-card">
                  {editingClassroom === classroom.id ? (
                    <div style={{ marginBottom: '15px' }}>
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="nieuwe klasnaam"
                        className="teacher-input"
                        style={{ width: '200px', marginRight: '10px' }}
                      />
                      <button
                        onClick={() => renameClassroom(classroom.id)}
                        className="teacher-btn teacher-btn-small"
                        style={{ marginRight: '5px' }}
                      >
                        opslaan
                      </button>
                      <button
                        onClick={() => {
                          setEditingClassroom(null)
                          setNewClassName('')
                        }}
                        className="teacher-btn teacher-btn-small"
                      >
                        annuleren
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="classroom-card-title">
                        {classroom.name}
                        {classroom.school_name && <span style={{ fontSize: 'clamp(12px, 1vw, 14px)', opacity: 0.7, marginLeft: '10px' }}>({classroom.school_name})</span>}
                        <button
                          onClick={() => {
                            setEditingClassroom(classroom.id)
                            setNewClassName(classroom.name)
                          }}
                          className="teacher-btn teacher-btn-small"
                          style={{ marginLeft: '15px' }}
                        >
                          hernoemen
                        </button>
                      </div>

                      <div className="classroom-levels">
                        <span style={{ fontWeight: '600', marginRight: '5px' }}>
                          niveaus:
                        </span>
                        {[1, 2, 3, 4, 5, 6].map(level => {
                          const isChecked = (classroom.allowed_levels || [1, 2, 3, 4, 5, 6]).includes(level)
                          return (
                            <label key={level} className="classroom-level-label">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleClassroomLevel(
                                  classroom.id,
                                  level,
                                  classroom.allowed_levels || [1, 2, 3, 4, 5, 6]
                                )}
                              />
                              <span>{level}</span>
                            </label>
                          )
                        })}
                      </div>
                    </>
                  )}
                  <div className="classroom-actions">
                    <button
                      onClick={() => loadClassroomProgress(classroom.id)}
                      className="teacher-btn"
                    >
                      bekijk voortgang
                    </button>
                    <button
                      onClick={() => loadDifficultWords(classroom.id)}
                      className="teacher-btn"
                    >
                      moeilijkste woorden
                    </button>
                    <button
                      onClick={() => exportClassroomExcel(classroom.id)}
                      className="teacher-btn"
                    >
                      export naar excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === 'progress' && selectedClassroom && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={backToClassrooms} className="teacher-btn">
              ← terug naar klassen
            </button>
          </div>

          <div className="teacher-section-title">{selectedClassroom.name} - voortgang</div>

          {loading ? (
            <div style={{
              fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
              fontSize: 'clamp(14px, 1.2vw, 16px)',
              letterSpacing: '0.02em'
            }}>
              laden...
            </div>
          ) : progressData.length === 0 ? (
            <p style={{
              fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
              fontSize: 'clamp(14px, 1.2vw, 16px)'
            }}>
              geen leerlingen in deze klas.
            </p>
          ) : (
            <div className="progress-table-container">
              <table className="teacher-progress-table">
                <thead>
                  <tr>
                    <th>leerling</th>
                    {modules.map(module => (
                      <th key={module.id}>
                        {module.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progressData.map(student => (
                    <tr key={student.student_id}>
                      <td>
                        {student.student_email}
                      </td>
                      {modules.map(module => {
                        const moduleData = student.modules[module.id]
                        return (
                          <td
                            key={module.id}
                            className={moduleData ? 'progress-cell' : ''}
                            onClick={() => moduleData && loadCellDetail(student.student_id, module.id)}
                          >
                            {moduleData ? (
                              <div className="progress-indicator">
                                <div
                                  className="progress-dot"
                                  style={{
                                    backgroundColor: getColorForPercentage(moduleData.completion_percentage)
                                  }}
                                />
                                <span>
                                  {moduleData.completion_percentage}%
                                </span>
                              </div>
                            ) : (
                              <span style={{ opacity: 0.3 }}>-</span>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selectedCell && cellDetail && (
            <div className="modal-overlay">
              <div className="modal-content">
                <div className="modal-header">
                  <div className="modal-title">
                    {cellDetail.student.email} - {cellDetail.module.name}
                  </div>
                  <button onClick={closeCellDetail} className="teacher-btn teacher-btn-small">✕</button>
                </div>

                <div className="modal-stats">
                  <div className="modal-stat">
                    <strong>voortgang:</strong> {cellDetail.progress.completion_percentage}%
                    <span style={{ opacity: 0.7, fontSize: 'clamp(12px, 1vw, 14px)', marginLeft: '8px' }}>
                      ({cellDetail.progress.answered_words}/{cellDetail.progress.total_words} woorden)
                    </span>
                  </div>
                  <div className="modal-stat">
                    <strong>score:</strong> {cellDetail.progress.score}% correct
                    <span style={{ opacity: 0.7, fontSize: 'clamp(12px, 1vw, 14px)', marginLeft: '8px' }}>
                      ({cellDetail.progress.correct_questions}/{cellDetail.progress.total_questions} vragen)
                    </span>
                  </div>
                  <div className="modal-stat">
                    <strong>status:</strong> {cellDetail.progress.is_completed ? 'voltooid' : 'in uitvoering'}
                  </div>
                  <div className="modal-stat">
                    <strong>tijd besteed:</strong> {cellDetail.progress.time_spent ? `${Math.round(cellDetail.progress.time_spent / 60)} min` : '-'}
                  </div>
                </div>

                {cellDetail.question_progress.length > 0 && (
                  <>
                    <div style={{
                      fontFamily: 'Perpetua, Georgia, "Times New Roman", Times, serif',
                      fontSize: 'clamp(18px, 2vw, 24px)',
                      marginTop: '20px',
                      marginBottom: '15px'
                    }}>
                      vraaggeschiedenis ({cellDetail.question_progress.length} pogingen)
                    </div>
                    <div className="modal-table-container">
                      <table className="teacher-progress-table">
                        <thead>
                          <tr>
                            <th>datum</th>
                            <th>fase</th>
                            <th>antwoord</th>
                            <th>correct</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cellDetail.question_progress.slice(0, 50).map((q, idx) => (
                            <tr key={idx}>
                              <td>
                                {q.answered_at
                                  ? new Date(q.answered_at).toLocaleString('nl-NL')
                                  : '-'
                                }
                              </td>
                              <td>fase {q.phase}</td>
                              <td>{q.user_answer}</td>
                              <td style={{ textAlign: 'center' }}>
                                {q.is_correct ? (
                                  <span style={{ color: '#4caf50' }}>✓</span>
                                ) : (
                                  <span style={{ color: '#f44336' }}>✗</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {view === 'analytics' && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={backToClassrooms} className="teacher-btn">
              ← terug naar klassen
            </button>
          </div>

          <div className="teacher-section-title">moeilijkste woorden</div>

          {loading ? (
            <div style={{
              fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
              fontSize: 'clamp(14px, 1.2vw, 16px)',
              letterSpacing: '0.02em'
            }}>
              laden...
            </div>
          ) : difficultWords.length === 0 ? (
            <p style={{
              fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
              fontSize: 'clamp(14px, 1.2vw, 16px)'
            }}>
              geen gegevens beschikbaar.
            </p>
          ) : (
            <div className="progress-table-container">
              <table className="teacher-progress-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>woord</th>
                    <th>betekenis</th>
                    <th>aantal keer fout</th>
                  </tr>
                </thead>
                <tbody>
                  {difficultWords.map((word, idx) => (
                    <tr key={word.word_id}>
                      <td>{idx + 1}</td>
                      <td><strong>{word.word}</strong></td>
                      <td>{word.meaning}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          backgroundColor: word.incorrect_count > 10 ? '#f44336' : word.incorrect_count > 5 ? '#ff9800' : '#ffc107',
                          color: '#fff',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontWeight: '700'
                        }}>
                          {word.incorrect_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      </div>
    </div>
  )
}
