import { useState, useEffect } from 'react'
import { logout } from '../utils/auth'
import api from '../services/api'

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
    return <div className="loading">laden...</div>
  }

  return (
    <div className="container">
      <header className="exercise-header">
        <div className="header-title">Octovoc</div>
        <div className="user-info">
          {user.email} (Leerkracht)
          <br />
          <button onClick={logout} className="btn" style={{marginTop: '8px', padding: '4px 12px'}}>
            uitloggen
          </button>
        </div>
      </header>

      {view === 'classrooms' && (
        <>
          <h2>mijn klassen</h2>

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => loadDifficultWords()}
              className="btn"
              style={{ marginRight: '10px' }}
            >
              moeilijkste woorden (alle klassen)
            </button>
          </div>

          {classrooms.length === 0 ? (
            <p>Je hebt nog geen klassen.</p>
          ) : (
            <div className="classroom-list">
              {classrooms.map(classroom => (
                <div key={classroom.id} className="classroom-card">
                  {editingClassroom === classroom.id ? (
                    <div style={{ marginBottom: '15px' }}>
                      <input
                        type="text"
                        value={newClassName}
                        onChange={(e) => setNewClassName(e.target.value)}
                        placeholder="Nieuwe klasnaam"
                        style={{
                          padding: '8px',
                          fontSize: '16px',
                          width: '200px',
                          marginRight: '10px'
                        }}
                      />
                      <button
                        onClick={() => renameClassroom(classroom.id)}
                        className="btn btn-primary"
                        style={{ marginRight: '5px' }}
                      >
                        opslaan
                      </button>
                      <button
                        onClick={() => {
                          setEditingClassroom(null)
                          setNewClassName('')
                        }}
                        className="btn"
                      >
                        annuleren
                      </button>
                    </div>
                  ) : (
                    <h3>
                      {classroom.name}
                      {classroom.school_name && <span style={{ fontSize: '14px', color: '#666', marginLeft: '10px' }}>({classroom.school_name})</span>}
                      <button
                        onClick={() => {
                          setEditingClassroom(classroom.id)
                          setNewClassName(classroom.name)
                        }}
                        className="btn"
                        style={{
                          marginLeft: '15px',
                          padding: '4px 8px',
                          fontSize: '13px'
                        }}
                      >
                        hernoemen
                      </button>
                    </h3>
                  )}
                  <div style={{ marginTop: '10px' }}>
                    <button
                      onClick={() => loadClassroomProgress(classroom.id)}
                      className="btn"
                      style={{ marginRight: '10px' }}
                    >
                      bekijk voortgang
                    </button>
                    <button
                      onClick={() => loadDifficultWords(classroom.id)}
                      className="btn"
                      style={{ marginRight: '10px' }}
                    >
                      moeilijkste woorden
                    </button>
                    <button
                      onClick={() => exportClassroomExcel(classroom.id)}
                      className="btn"
                    >
                      export naar Excel
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
            <button onClick={backToClassrooms} className="btn">
              ← terug naar klassen
            </button>
          </div>

          <h2>{selectedClassroom.name} - voortgang</h2>

          {loading ? (
            <div className="loading">laden...</div>
          ) : progressData.length === 0 ? (
            <p>geen leerlingen in deze klas.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="progress-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 10 }}>leerling</th>
                    {modules.map(module => (
                      <th key={module.id} style={{ minWidth: '120px', textAlign: 'center' }}>
                        {module.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progressData.map(student => (
                    <tr key={student.student_id}>
                      <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', fontWeight: '600' }}>
                        {student.student_email}
                      </td>
                      {modules.map(module => {
                        const moduleData = student.modules[module.id]
                        return (
                          <td
                            key={module.id}
                            style={{
                              textAlign: 'center',
                              cursor: moduleData ? 'pointer' : 'default',
                              backgroundColor: moduleData ? '#f9f9f9' : 'transparent'
                            }}
                            onClick={() => moduleData && loadCellDetail(student.student_id, module.id)}
                          >
                            {moduleData ? (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                <div
                                  style={{
                                    width: '10px',
                                    height: '10px',
                                    borderRadius: '50%',
                                    backgroundColor: getColorForPercentage(moduleData.completion_percentage)
                                  }}
                                />
                                <span style={{ fontWeight: '600' }}>
                                  {moduleData.completion_percentage}%
                                </span>
                              </div>
                            ) : (
                              <span style={{ color: '#ccc' }}>-</span>
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
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}>
              <div style={{
                backgroundColor: 'white',
                padding: '24px',
                borderRadius: '8px',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                minWidth: 'min(600px, 90vw)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0 }}>
                    {cellDetail.student.email} - {cellDetail.module.name}
                  </h3>
                  <button onClick={closeCellDetail} className="btn">✕</button>
                </div>

                <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <strong>voortgang:</strong> {cellDetail.progress.completion_percentage}%
                      <span style={{ color: '#666', fontSize: '14px', marginLeft: '8px' }}>
                        ({cellDetail.progress.answered_words}/{cellDetail.progress.total_words} woorden)
                      </span>
                    </div>
                    <div>
                      <strong>score:</strong> {cellDetail.progress.score}% correct
                      <span style={{ color: '#666', fontSize: '14px', marginLeft: '8px' }}>
                        ({cellDetail.progress.correct_questions}/{cellDetail.progress.total_questions} vragen)
                      </span>
                    </div>
                    <div>
                      <strong>status:</strong> {cellDetail.progress.is_completed ? 'voltooid' : 'in uitvoering'}
                    </div>
                    <div>
                      <strong>tijd besteed:</strong> {cellDetail.progress.time_spent ? `${Math.round(cellDetail.progress.time_spent / 60)} min` : '-'}
                    </div>
                  </div>
                </div>

                {cellDetail.question_progress.length > 0 && (
                  <>
                    <h4>vraaggeschiedenis ({cellDetail.question_progress.length} pogingen)</h4>
                    <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                      <table className="progress-table">
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
                              <td>
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
            <button onClick={backToClassrooms} className="btn">
              ← terug naar klassen
            </button>
          </div>

          <h2>moeilijkste woorden</h2>

          {loading ? (
            <div className="loading">laden...</div>
          ) : difficultWords.length === 0 ? (
            <p>geen gegevens beschikbaar.</p>
          ) : (
            <div className="difficult-words-container">
              <table className="progress-table">
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
                      <td>
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
  )
}
