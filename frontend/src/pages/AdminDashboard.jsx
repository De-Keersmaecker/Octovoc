import { useState, useEffect } from 'react'
import api from '../services/api'
import { logout } from '../utils/auth'
import './Teacher.css'

export default function AdminDashboard({ user }) {
  const [view, setView] = useState('modules') // 'modules', 'codes', 'users', 'quotes', 'analytics', 'schools'

  // Module upload state
  const [file, setFile] = useState(null)
  const [moduleName, setModuleName] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [isFree, setIsFree] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')

  // CSV upload state
  const [csvData, setCsvData] = useState('')
  const [csvModuleName, setCsvModuleName] = useState('')
  const [csvDifficulty, setCsvDifficulty] = useState('')
  const [csvIsFree, setCsvIsFree] = useState(false)
  const [csvUploading, setCsvUploading] = useState(false)
  const [csvMessage, setCsvMessage] = useState('')
  const [editingCsvModuleId, setEditingCsvModuleId] = useState(null) // For editing existing modules

  // Modules state
  const [modules, setModules] = useState([])
  const [editingModule, setEditingModule] = useState(null)
  const [levelSortAscending, setLevelSortAscending] = useState(true)

  // Codes state
  const [classCodes, setClassCodes] = useState([])
  const [teacherCodes, setTeacherCodes] = useState([])
  const [teachers, setTeachers] = useState([])
  const [classrooms, setClassrooms] = useState([])
  const [newClassroomName, setNewClassroomName] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState('')
  const [linkingTeacherCode, setLinkingTeacherCode] = useState(null)
  const [selectedClassroomToLink, setSelectedClassroomToLink] = useState('')

  // Quotes state
  const [quotes, setQuotes] = useState([])
  const [newQuoteText, setNewQuoteText] = useState('')
  const [newQuoteAuthor, setNewQuoteAuthor] = useState('')
  const [newQuoteVideoUrl, setNewQuoteVideoUrl] = useState('')
  const [editingQuote, setEditingQuote] = useState(null)

  // Users state
  const [users, setUsers] = useState([])
  const [userRole, setUserRole] = useState('')

  // Schools state
  const [schools, setSchools] = useState([])
  const [schoolCode, setSchoolCode] = useState('')
  const [schoolName, setSchoolName] = useState('')
  const [numClassrooms, setNumClassrooms] = useState(5)
  const [numTeacherCodes, setNumTeacherCodes] = useState(3)
  const [schoolFilter, setSchoolFilter] = useState('')

  // Bulk actions state
  const [selectedClassCodes, setSelectedClassCodes] = useState([])
  const [selectedTeacherCodes, setSelectedTeacherCodes] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])

  // Analytics state (like teacher dashboard)
  const [selectedClassroom, setSelectedClassroom] = useState(null)
  const [progressData, setProgressData] = useState([])
  const [matrixModules, setMatrixModules] = useState([])
  const [selectedCell, setSelectedCell] = useState(null)
  const [cellDetail, setCellDetail] = useState(null)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentDetail, setStudentDetail] = useState(null)
  const [difficultWords, setDifficultWords] = useState([])
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('')

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadModules()
    loadTeachers()
  }, [])

  useEffect(() => {
    if (view === 'codes') {
      loadCodes()
      loadClassrooms()
      loadSchools()
    } else if (view === 'quotes') {
      loadQuotes()
    } else if (view === 'users') {
      loadUsers()
      loadSchools()
    } else if (view === 'analytics') {
      loadClassrooms()
    } else if (view === 'schools') {
      loadSchools()
    }
  }, [view])

  useEffect(() => {
    if (view === 'codes') {
      loadCodes()
    }
  }, [schoolFilter, view])

  useEffect(() => {
    if (view === 'users') {
      loadUsers()
    }
  }, [userRole, schoolFilter, view])

  const loadModules = async () => {
    try {
      const res = await api.get('/admin/modules')
      setModules(res.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const loadCodes = async () => {
    try {
      const classUrl = schoolFilter ? `/admin/codes/class?school_id=${schoolFilter}` : '/admin/codes/class'
      const teacherUrl = schoolFilter ? `/admin/codes/teacher?school_id=${schoolFilter}` : '/admin/codes/teacher'

      const [classRes, teacherRes] = await Promise.all([
        api.get(classUrl),
        api.get(teacherUrl)
      ])
      setClassCodes(classRes.data)
      setTeacherCodes(teacherRes.data)
      setSelectedClassCodes([])
      setSelectedTeacherCodes([])
    } catch (err) {
      console.error(err)
    }
  }

  const loadClassrooms = async () => {
    try {
      const res = await api.get('/admin/classrooms')
      setClassrooms(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadTeachers = async () => {
    try {
      const res = await api.get('/admin/users?role=teacher')
      setTeachers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadQuotes = async () => {
    try {
      const res = await api.get('/admin/quotes')
      setQuotes(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const loadUsers = async () => {
    try {
      let url = '/admin/users'
      const params = []
      if (userRole) params.push(`role=${userRole}`)
      if (schoolFilter) params.push(`school_id=${schoolFilter}`)
      if (params.length > 0) url += '?' + params.join('&')

      const res = await api.get(url)
      setUsers(res.data)
      setSelectedUsers([])
    } catch (err) {
      console.error(err)
    }
  }

  // School functions
  const loadSchools = async () => {
    try {
      const res = await api.get('/admin/schools')
      setSchools(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const createSchool = async () => {
    if (!schoolCode || !schoolName) {
      alert('Schoolcode en schoolnaam zijn verplicht')
      return
    }

    if (schoolCode.length !== 4 || !/^[A-Za-z]+$/.test(schoolCode)) {
      alert('Schoolcode moet precies 4 letters zijn')
      return
    }

    try {
      const res = await api.post('/admin/school/create', {
        school_code: schoolCode.toUpperCase(),
        school_name: schoolName,
        num_classrooms: numClassrooms,
        num_teacher_codes: numTeacherCodes
      })

      alert(`School aangemaakt!\n${res.data.classrooms.length} klassen en ${res.data.teacher_codes.length} lerarencodes gegenereerd.`)

      setSchoolCode('')
      setSchoolName('')
      setNumClassrooms(5)
      setNumTeacherCodes(3)
      loadSchools()
      loadCodes()
      loadClassrooms()
    } catch (err) {
      alert(err.response?.data?.error || 'Fout bij aanmaken van school')
    }
  }

  // Bulk action functions
  const bulkDeleteCodes = async () => {
    if (selectedClassCodes.length === 0 && selectedTeacherCodes.length === 0) {
      alert('Selecteer eerst codes om te verwijderen')
      return
    }

    const total = selectedClassCodes.length + selectedTeacherCodes.length
    if (!confirm(`Weet je zeker dat je ${total} code(s) definitief wilt verwijderen?`)) return

    try {
      await api.post('/admin/codes/bulk-delete', {
        class_code_ids: selectedClassCodes,
        teacher_code_ids: selectedTeacherCodes
      })
      alert(`${total} code(s) verwijderd`)
      setSelectedClassCodes([])
      setSelectedTeacherCodes([])
      loadCodes()
    } catch (err) {
      alert('Fout bij verwijderen van codes')
    }
  }

  const bulkDeactivateCodes = async () => {
    if (selectedClassCodes.length === 0 && selectedTeacherCodes.length === 0) {
      alert('Selecteer eerst codes om te deactiveren')
      return
    }

    const total = selectedClassCodes.length + selectedTeacherCodes.length
    if (!confirm(`Weet je zeker dat je ${total} code(s) wilt deactiveren?`)) return

    try {
      await api.post('/admin/codes/bulk-deactivate', {
        class_code_ids: selectedClassCodes,
        teacher_code_ids: selectedTeacherCodes
      })
      alert(`${total} code(s) gedeactiveerd`)
      setSelectedClassCodes([])
      setSelectedTeacherCodes([])
      loadCodes()
    } catch (err) {
      alert('Fout bij deactiveren van codes')
    }
  }

  const bulkDeleteUsers = async () => {
    if (selectedUsers.length === 0) {
      alert('Selecteer eerst gebruikers om te verwijderen')
      return
    }

    if (!confirm(`Weet je zeker dat je ${selectedUsers.length} gebruiker(s) definitief wilt verwijderen?`)) return

    try {
      await api.post('/admin/users/bulk-delete', {
        user_ids: selectedUsers
      })
      alert(`${selectedUsers.length} gebruiker(s) verwijderd`)
      setSelectedUsers([])
      loadUsers()
    } catch (err) {
      alert('Fout bij verwijderen van gebruikers')
    }
  }

  // Module functions
  const handleFileChange = (e) => {
    setFile(e.target.files[0])
  }

  const handleDragStart = (e, index) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', index)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault()
    const dragIndex = parseInt(e.dataTransfer.getData('text/html'))

    if (dragIndex === dropIndex) return

    const newModules = [...modules]
    const [draggedModule] = newModules.splice(dragIndex, 1)
    newModules.splice(dropIndex, 0, draggedModule)

    setModules(newModules)

    // Update order on backend
    try {
      await api.put('/admin/modules/reorder', {
        module_order: newModules.map(m => m.id)
      })
    } catch (err) {
      console.error('Failed to update module order:', err)
      alert('Fout bij bijwerken van module volgorde')
      loadModules() // Reload to get correct order
    }
  }

  const sortModulesByLevel = async () => {
    // Toggle sort direction
    const ascending = !levelSortAscending
    setLevelSortAscending(ascending)

    // Sort by difficulty level (1, 2, 3, 4)
    const sorted = [...modules].sort((a, b) => {
      // Extract numbers from difficulty string
      const levelA = parseInt(a.difficulty) || 999
      const levelB = parseInt(b.difficulty) || 999
      return ascending ? (levelA - levelB) : (levelB - levelA)
    })

    setModules(sorted)

    try {
      await api.put('/admin/modules/reorder', {
        module_order: sorted.map(m => m.id)
      })
      alert(`Modules gesorteerd op niveau (${ascending ? 'laag naar hoog' : 'hoog naar laag'})`)
    } catch (err) {
      console.error('Failed to update module order:', err)
      alert('Fout bij sorteren van modules')
      loadModules()
    }
  }

  const sortModulesFreeFirst = async () => {
    // Sort with ALL free modules first, then ALL paid modules
    // Within each group (free/paid), sort by level from low to high
    const sorted = [...modules].sort((a, b) => {
      // First criterion: free modules come before paid modules
      if (a.is_free && !b.is_free) return -1
      if (!a.is_free && b.is_free) return 1

      // If both are free or both are paid, sort by level
      const levelA = parseInt(a.difficulty) || 999
      const levelB = parseInt(b.difficulty) || 999
      return levelA - levelB
    })

    setModules(sorted)

    try {
      await api.put('/admin/modules/reorder', {
        module_order: sorted.map(m => m.id)
      })
      alert('Modules gesorteerd: alle gratis modules bovenaan')
    } catch (err) {
      console.error('Failed to update module order:', err)
      alert('Fout bij sorteren van modules')
      loadModules()
    }
  }

  const sortModulesAlphabetically = async () => {
    // Sort alphabetically by name
    const sorted = [...modules].sort((a, b) => {
      return a.name.localeCompare(b.name, 'nl')
    })

    setModules(sorted)

    try {
      await api.put('/admin/modules/reorder', {
        module_order: sorted.map(m => m.id)
      })
      alert('Modules alfabetisch gesorteerd')
    } catch (err) {
      console.error('Failed to update module order:', err)
      alert('Fout bij sorteren van modules')
      loadModules()
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !moduleName) {
      alert('Selecteer een bestand en voer een modulenaam in')
      return
    }

    setUploading(true)
    setMessage('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', moduleName)
    formData.append('difficulty', difficulty)
    formData.append('is_free', isFree)

    try {
      await api.post('/admin/module/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessage('Module succesvol geüpload!')
      setFile(null)
      setModuleName('')
      setDifficulty('')
      setIsFree(false)
      loadModules()
    } catch (err) {
      setMessage(err.response?.data?.error || 'Upload mislukt')
    } finally {
      setUploading(false)
    }
  }

  const handleUploadCsv = async (e) => {
    e.preventDefault()
    if (!csvData || !csvModuleName) {
      alert('Plak CSV data en voer een modulenaam in')
      return
    }

    setCsvUploading(true)
    setCsvMessage('')

    try {
      if (editingCsvModuleId) {
        // Update existing module
        await api.put(`/admin/module/${editingCsvModuleId}`, {
          csv_data: csvData,
          name: csvModuleName,
          difficulty: csvDifficulty,
          is_free: csvIsFree
        })
        setCsvMessage('Module succesvol bijgewerkt!')
      } else {
        // Create new module
        await api.post('/admin/module/upload-csv', {
          csv_data: csvData,
          name: csvModuleName,
          difficulty: csvDifficulty,
          is_free: csvIsFree
        })
        setCsvMessage('Module succesvol geüpload!')
      }

      setCsvData('')
      setCsvModuleName('')
      setCsvDifficulty('')
      setCsvIsFree(false)
      setEditingCsvModuleId(null)
      loadModules()
    } catch (err) {
      setCsvMessage(err.response?.data?.error || (editingCsvModuleId ? 'Bijwerken mislukt' : 'Upload mislukt'))
    } finally {
      setCsvUploading(false)
    }
  }

  const loadModuleCsvForEdit = async (moduleId) => {
    try {
      const res = await api.get(`/admin/module/${moduleId}/csv`)
      setCsvData(res.data.csv_data)
      setCsvModuleName(res.data.name)
      setCsvDifficulty(res.data.difficulty || '')
      setCsvIsFree(res.data.is_free)
      setEditingCsvModuleId(moduleId)
      setCsvMessage('Bewerk mode: pas de CSV aan en klik opslaan')

      // Scroll to CSV form
      const csvSection = document.querySelector('section:nth-of-type(2)')
      if (csvSection) {
        csvSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    } catch (err) {
      alert('Fout bij laden van module CSV: ' + (err.response?.data?.error || 'Onbekende fout'))
    }
  }

  const cancelCsvEdit = () => {
    setCsvData('')
    setCsvModuleName('')
    setCsvDifficulty('')
    setCsvIsFree(false)
    setEditingCsvModuleId(null)
    setCsvMessage('')
  }

  const updateModule = async (moduleId, updates) => {
    try {
      await api.put(`/admin/module/${moduleId}`, updates)
      loadModules()
      setEditingModule(null)
      alert('Module bijgewerkt')
    } catch (err) {
      alert('Fout bij bijwerken van module')
    }
  }

  const toggleModuleActive = async (moduleId, currentlyActive) => {
    const action = currentlyActive ? 'deactiveren' : 'activeren'
    if (!confirm(`Weet je zeker dat je deze module wilt ${action}?`)) return

    try {
      await api.put(`/admin/module/${moduleId}`, { is_active: !currentlyActive })
      loadModules()
      alert(`Module ${currentlyActive ? 'gedeactiveerd' : 'geactiveerd'}`)
    } catch (err) {
      alert(`Fout bij ${action} van module`)
    }
  }

  const deleteModule = async (moduleId) => {
    if (!confirm('Weet je zeker dat je deze module DEFINITIEF wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return

    try {
      await api.delete(`/admin/module/${moduleId}`)
      loadModules()
      alert('Module verwijderd')
    } catch (err) {
      alert('Fout bij verwijderen van module')
    }
  }

  // Code functions
  const generateClassCode = async () => {
    if (!selectedTeacherId) {
      alert('Selecteer een leerkracht')
      return
    }

    try {
      const res = await api.post('/admin/codes/class/generate', {
        classroom_name: newClassroomName,
        teacher_id: selectedTeacherId
      })
      alert(`Klascode gegenereerd: ${res.data.code.code}`)
      setNewClassroomName('')
      setSelectedTeacherId('')
      loadCodes()
      loadClassrooms()
    } catch (err) {
      alert('Fout bij genereren van klascode')
    }
  }

  const generateTeacherCode = async () => {
    try {
      const res = await api.post('/admin/codes/teacher/generate', {})
      alert(`Leerkrachtcode gegenereerd: ${res.data.code.code}`)
      loadCodes()
    } catch (err) {
      alert('Fout bij genereren van leerkrachtcode')
    }
  }

  const deactivateClassCode = async (codeId) => {
    try {
      await api.put(`/admin/codes/class/${codeId}/deactivate`)
      alert('Code gedeactiveerd')
      loadCodes()
    } catch (err) {
      alert('Fout bij deactiveren van code')
    }
  }

  const activateClassCode = async (codeId) => {
    try {
      await api.put(`/admin/codes/class/${codeId}/activate`)
      alert('Code geactiveerd')
      loadCodes()
    } catch (err) {
      alert('Fout bij activeren van code')
    }
  }

  const deleteClassCode = async (codeId) => {
    if (!confirm('Weet je zeker dat je deze code definitief wilt verwijderen?')) return
    try {
      await api.delete(`/admin/codes/class/${codeId}`)
      alert('Code verwijderd')
      loadCodes()
    } catch (err) {
      alert('Fout bij verwijderen van code')
    }
  }

  const deactivateTeacherCode = async (codeId) => {
    try {
      await api.put(`/admin/codes/teacher/${codeId}/deactivate`)
      alert('Code gedeactiveerd')
      loadCodes()
    } catch (err) {
      alert('Fout bij deactiveren van code')
    }
  }

  const activateTeacherCode = async (codeId) => {
    try {
      await api.put(`/admin/codes/teacher/${codeId}/activate`)
      alert('Code geactiveerd')
      loadCodes()
    } catch (err) {
      alert('Fout bij activeren van code')
    }
  }

  const deleteTeacherCode = async (codeId) => {
    if (!confirm('Weet je zeker dat je deze code definitief wilt verwijderen?')) return
    try {
      await api.delete(`/admin/codes/teacher/${codeId}`)
      alert('Code verwijderd')
      loadCodes()
    } catch (err) {
      alert('Fout bij verwijderen van code')
    }
  }

  const linkClassroomToTeacherCode = async () => {
    if (!selectedClassroomToLink) {
      alert('Selecteer een klas')
      return
    }

    try {
      await api.post(`/admin/codes/teacher/${linkingTeacherCode.id}/link-classroom`, {
        classroom_id: parseInt(selectedClassroomToLink)
      })
      alert('Klas gekoppeld aan leerkrachtcode')
      setLinkingTeacherCode(null)
      setSelectedClassroomToLink('')
      loadCodes()
    } catch (err) {
      alert('Fout bij koppelen van klas')
    }
  }

  const unlinkClassroomFromTeacherCode = async (teacherCodeId, classroomId) => {
    if (!confirm('Weet je zeker dat je deze klas wilt ontkoppelen van de leerkrachtcode?')) return

    try {
      await api.delete(`/admin/codes/teacher/${teacherCodeId}/unlink-classroom/${classroomId}`)
      alert('Klas ontkoppeld van leerkrachtcode')
      loadCodes()
    } catch (err) {
      alert('Fout bij ontkoppelen van klas')
    }
  }

  // Quote functions
  const createQuote = async () => {
    if (!newQuoteText) {
      alert('Voer een quote in')
      return
    }

    try {
      await api.post('/admin/quote', {
        text: newQuoteText,
        author: newQuoteAuthor,
        video_url: newQuoteVideoUrl
      })
      setNewQuoteText('')
      setNewQuoteAuthor('')
      setNewQuoteVideoUrl('')
      loadQuotes()
      alert('Quote aangemaakt')
    } catch (err) {
      alert('Fout bij aanmaken van quote')
    }
  }

  const updateQuote = async (quoteId, updates) => {
    try {
      await api.put(`/admin/quote/${quoteId}`, updates)
      loadQuotes()
      setEditingQuote(null)
      alert('Quote bijgewerkt')
    } catch (err) {
      alert('Fout bij bijwerken van quote')
    }
  }

  const deleteQuote = async (quoteId) => {
    if (!confirm('Weet je zeker dat je deze quote wilt verwijderen?')) return

    try {
      await api.delete(`/admin/quote/${quoteId}`)
      loadQuotes()
      alert('Quote verwijderd')
    } catch (err) {
      alert('Fout bij verwijderen van quote')
    }
  }

  // Analytics functions (admin endpoints)
  const loadClassroomProgress = async (classroomId) => {
    try {
      setLoading(true)
      const res = await api.get(`/admin/classroom/${classroomId}/progress`)
      setProgressData(res.data.students)
      setMatrixModules(res.data.modules)
      setSelectedClassroom(classrooms.find(c => c.id === classroomId))
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const loadCellDetail = async (studentId, moduleId) => {
    try {
      setLoading(true)
      const res = await api.get(`/admin/student/${studentId}/module/${moduleId}/detail`)
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

  const loadStudentDetail = async (studentId) => {
    try {
      setLoading(true)

      // Get student info
      const student = users.find(u => u.id === studentId)
      if (!student) {
        alert('Student niet gevonden')
        setLoading(false)
        return
      }

      // Get all active modules
      const modulesRes = await api.get('/admin/modules')
      const allModules = modulesRes.data.filter(m => m.is_active)

      // Get student progress for all modules
      const progressRes = await api.get(`/admin/student/${studentId}/detail`)
      const studentProgressData = progressRes.data

      // Build matrix data structure (1 student, all modules)
      const student_row = {
        student_id: student.id,
        student_email: student.email,
        modules: {}
      }

      // Create a lookup for student's progress by module
      const progressByModule = {}
      for (const moduleData of studentProgressData.modules) {
        const moduleId = moduleData.module.id
        const progress = moduleData.progress

        // Count unique words answered from question_progress
        const answered_word_ids = new Set()
        for (const q of moduleData.question_progress) {
          if (q.word_id) {
            answered_word_ids.add(q.word_id)
          }
        }

        const answered_words = answered_word_ids.size
        const total_words = moduleData.module.word_count || 0
        const completion_percentage = total_words > 0 ? (answered_words / total_words * 100) : 0

        student_row.modules[moduleId] = {
          completion_percentage: Math.round(completion_percentage * 10) / 10,
          answered_words,
          total_words
        }
      }

      setProgressData([student_row])
      setMatrixModules(allModules.map(m => ({ id: m.id, name: m.name })))
      setSelectedStudent(studentId)
      setStudentDetail({ student: student })
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  const loadDifficultWordsAnalytics = async (classroomId = null, moduleId = null) => {
    try {
      setLoading(true)
      let url = '/admin/analytics/difficult-words'
      const params = []

      if (classroomId) {
        params.push(`classroom_id=${classroomId}`)
      }
      if (moduleId) {
        params.push(`module_id=${moduleId}`)
      }

      if (params.length > 0) {
        url += '?' + params.join('&')
      }

      const res = await api.get(url)
      setDifficultWords(res.data)
      setLoading(false)
    } catch (err) {
      console.error(err)
      alert('Fout bij laden van moeilijkste woorden')
      setLoading(false)
    }
  }

  const exportClassroomExcel = async (classroomId) => {
    try {
      const res = await api.get(`/admin/classroom/${classroomId}/export/excel`, {
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

  const exportStudentPDF = async (studentId) => {
    try {
      const res = await api.get(`/admin/student/${studentId}/export/pdf`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `student_${studentId}_report.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
      alert('Fout bij exporteren naar PDF')
    }
  }

  const exportStudentExcel = async (studentId) => {
    try {
      const res = await api.get(`/admin/student/${studentId}/export/excel`, {
        responseType: 'blob'
      })

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `student_${studentId}_progress.xlsx`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error(err)
      alert('Fout bij exporteren naar Excel')
    }
  }

  const backToClassroomList = () => {
    setSelectedClassroom(null)
    setProgressData([])
    setMatrixModules([])
    setSelectedCell(null)
    setCellDetail(null)
    setSelectedStudent(null)
    setStudentDetail(null)
    setDifficultWords([])
    setSelectedModuleFilter('')
  }

  const backToProgress = () => {
    setSelectedStudent(null)
    setStudentDetail(null)
  }

  if (loading && view === 'modules') {
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
          {user.email} (admin)
          <br />
          <button onClick={logout} className="teacher-btn teacher-btn-small" style={{marginTop: '8px'}}>
            uitloggen
          </button>
        </div>
      </header>

      <div className="teacher-content">
        <div className="teacher-section-title">administrator dashboard</div>

      {/* Navigation */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setView('schools')}
          className="teacher-btn"
          style={view === 'schools' ? { backgroundColor: '#fff', color: '#000' } : {}}
        >
          scholen
        </button>
        <button
          onClick={() => setView('modules')}
          className="teacher-btn"
          style={view === 'modules' ? { backgroundColor: '#fff', color: '#000' } : {}}
        >
          modules
        </button>
        <button
          onClick={() => setView('codes')}
          className="teacher-btn"
          style={view === 'codes' ? { backgroundColor: '#fff', color: '#000' } : {}}
        >
          codes
        </button>
        <button
          onClick={() => setView('quotes')}
          className="teacher-btn"
          style={view === 'quotes' ? { backgroundColor: '#fff', color: '#000' } : {}}
        >
          quotes
        </button>
        <button
          onClick={() => setView('users')}
          className="teacher-btn"
          style={view === 'users' ? { backgroundColor: '#fff', color: '#000' } : {}}
        >
          gebruikers
        </button>
        <button
          onClick={() => setView('analytics')}
          className="teacher-btn"
          style={view === 'analytics' ? { backgroundColor: '#fff', color: '#000' } : {}}
        >
          prestaties
        </button>
      </div>

      {/* Schools View */}
      {view === 'schools' && (
        <>
          <section style={{marginBottom: '30px', padding: '16px', border: '1px solid #fff'}}>
            <h3>nieuwe school aanmaken</h3>
            <div className="form-group">
              <label>schoolcode (precies 4 letters)</label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                placeholder="ABCD"
                maxLength={4}
                style={{textTransform: 'uppercase'}}
              />
            </div>
            <div className="form-group">
              <label>schoolnaam</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="einstein atheneum"
              />
            </div>
            <div className="form-group">
              <label>aantal klassen</label>
              <input
                type="number"
                value={numClassrooms}
                onChange={(e) => setNumClassrooms(parseInt(e.target.value) || 0)}
                min={1}
                max={50}
              />
            </div>
            <div className="form-group">
              <label>aantal lerarencodes</label>
              <input
                type="number"
                value={numTeacherCodes}
                onChange={(e) => setNumTeacherCodes(parseInt(e.target.value) || 0)}
                min={1}
                max={50}
              />
            </div>
            <button onClick={createSchool} className="teacher-btn" style={{ backgroundColor: '#fff', color: '#000' }}>
              school aanmaken
            </button>
          </section>

          <section style={{ overflowX: 'auto' }}>
            <table className="teacher-progress-table" style={{ tableLayout: 'auto', minWidth: '100%' }}>
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>schoolcode</th>
                  <th>schoolnaam</th>
                  <th style={{ width: '80px', textAlign: 'center' }}>klassen</th>
                  <th style={{ width: '90px', textAlign: 'center' }}>klascodes</th>
                  <th style={{ width: '110px', textAlign: 'center' }}>lerarencodes</th>
                  <th style={{ width: '120px' }}>aangemaakt</th>
                </tr>
              </thead>
              <tbody>
                {schools.map(school => (
                  <tr key={school.id}>
                    <td><strong>{school.school_code}</strong></td>
                    <td style={{ wordBreak: 'break-word' }}>{school.school_name}</td>
                    <td style={{ textAlign: 'center' }}>{school.classroom_count || 0}</td>
                    <td style={{ textAlign: 'center' }}>{school.class_code_count || 0}</td>
                    <td style={{ textAlign: 'center' }}>{school.teacher_code_count || 0}</td>
                    <td>{new Date(school.created_at).toLocaleDateString('nl-NL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* Modules View */}
      {view === 'modules' && (
        <>
          <section style={{marginBottom: '30px', padding: '16px', border: '1px solid #fff'}}>
            <h3>module uploaden</h3>
            {message && <div className={message.includes('succesvol') ? 'success' : 'error'}>{message}</div>}

            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label>excelbestand (.xlsx)</label>
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>modulenaam</label>
                <input
                  type="text"
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>moeilijkheidsgraad</label>
                <input
                  type="text"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  placeholder="bijv. beginner, gevorderd"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={isFree}
                    onChange={(e) => setIsFree(e.target.checked)}
                  />
                  {' '}gratis module (toegankelijk zonder klascode)
                </label>
              </div>

              <button type="submit" className="teacher-btn" style={{ backgroundColor: '#fff', color: '#000' }} disabled={uploading}>
                {uploading ? 'uploaden...' : 'upload module'}
              </button>
            </form>
          </section>

          <section style={{marginBottom: '30px', padding: '16px', border: editingCsvModuleId ? '2px solid #2196f3' : '1px solid #fff', backgroundColor: editingCsvModuleId ? 'rgba(33, 150, 243, 0.1)' : 'transparent'}}>
            <h3>{editingCsvModuleId ? 'module bewerken via CSV' : 'module uploaden via CSV'}</h3>
            {editingCsvModuleId && (
              <div style={{padding: '10px', backgroundColor: '#2196f3', color: 'white', marginBottom: '10px', borderRadius: '4px'}}>
                <strong>Bewerk mode:</strong> Je bewerkt nu een bestaande module. De voortgang van studenten blijft behouden.
              </div>
            )}
            <p style={{fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '10px'}}>
              Plak CSV data in het formaat: word;meaning;example_sentence
            </p>
            {csvMessage && <div className={csvMessage.includes('succesvol') || csvMessage.includes('Bewerk mode') ? 'success' : 'error'}>{csvMessage}</div>}

            <form onSubmit={handleUploadCsv}>
              <div className="form-group">
                <label>csv data</label>
                <textarea
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={10}
                  placeholder="word,meaning,example_sentence&#10;ambivalent,dubbelzinnig,Ik ben *ambivalent* over deze beslissing.&#10;..."
                  required
                  style={{fontFamily: 'monospace', fontSize: '13px'}}
                />
              </div>

              <div className="form-group">
                <label>modulenaam</label>
                <input
                  type="text"
                  value={csvModuleName}
                  onChange={(e) => setCsvModuleName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>moeilijkheidsgraad</label>
                <input
                  type="text"
                  value={csvDifficulty}
                  onChange={(e) => setCsvDifficulty(e.target.value)}
                  placeholder="bijv. beginner, gevorderd"
                />
              </div>

              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={csvIsFree}
                    onChange={(e) => setCsvIsFree(e.target.checked)}
                  />
                  {' '}gratis module (toegankelijk zonder klascode)
                </label>
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <button type="submit" className="teacher-btn" style={{ backgroundColor: '#fff', color: '#000' }} disabled={csvUploading}>
                  {csvUploading ? (editingCsvModuleId ? 'bijwerken...' : 'uploaden...') : (editingCsvModuleId ? 'module bijwerken' : 'upload module (CSV)')}
                </button>
                {editingCsvModuleId && (
                  <button type="button" onClick={cancelCsvEdit} className="teacher-btn" disabled={csvUploading}>
                    annuleer
                  </button>
                )}
              </div>
            </form>
          </section>

          <section>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h3 style={{margin: 0}}>bestaande modules</h3>
              <div style={{display: 'flex', gap: '10px'}}>
                <button
                  onClick={sortModulesByLevel}
                  className="teacher-btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: '#2196f3',
                    borderColor: '#2196f3',
                    color: '#ffffff'
                  }}
                  disabled={editingModule !== null}
                  title={`Sorteer modules op niveau (${levelSortAscending ? 'klik voor hoog naar laag' : 'klik voor laag naar hoog'})`}
                >
                  sorteer op niveau {levelSortAscending ? '↑' : '↓'}
                </button>
                <button
                  onClick={sortModulesFreeFirst}
                  className="teacher-btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: '#4caf50',
                    borderColor: '#4caf50',
                    color: '#ffffff'
                  }}
                  disabled={editingModule !== null}
                  title="Alle gratis modules bovenaan, daarna betaalde modules (beide gesorteerd op niveau)"
                >
                  gratis bovenaan
                </button>
                <button
                  onClick={sortModulesAlphabetically}
                  className="teacher-btn"
                  style={{
                    padding: '6px 12px',
                    fontSize: '14px',
                    backgroundColor: '#ff9800',
                    borderColor: '#ff9800',
                    color: '#ffffff'
                  }}
                  disabled={editingModule !== null}
                  title="Sorteer modules alfabetisch"
                >
                  alfabetisch
                </button>
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: '60%' }}>module info</th>
                    <th style={{ width: '40%' }}>acties</th>
                  </tr>
                </thead>
              <tbody>
                {modules.map((module, idx) => (
                  <tr
                    key={module.id}
                    draggable={!editingModule}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    style={{
                      cursor: editingModule ? 'default' : 'move',
                      backgroundColor: editingModule === module.id ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
                    }}
                  >
                    <td>
                      {editingModule === module.id ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div>
                            <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Naam:</label>
                            <input
                              type="text"
                              defaultValue={module.name}
                              id={`name-${module.id}`}
                              style={{ width: '300px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Niveau:</label>
                            <input
                              type="text"
                              defaultValue={module.difficulty}
                              id={`difficulty-${module.id}`}
                              style={{ width: '100px' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Gratis:</label>
                            <input
                              type="checkbox"
                              defaultChecked={module.is_free}
                              id={`is_free-${module.id}`}
                              style={{ verticalAlign: 'middle' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'inline-block', width: '100px', fontWeight: 'bold' }}>Actief:</label>
                            <input
                              type="checkbox"
                              defaultChecked={module.is_active}
                              id={`is_active-${module.id}`}
                              style={{ verticalAlign: 'middle' }}
                            />
                          </div>
                          <div>
                            <label style={{ display: 'inline-block', width: '150px', fontWeight: 'bold' }}>Hoofdlettergevoelig:</label>
                            <input
                              type="checkbox"
                              defaultChecked={module.case_sensitive}
                              id={`case_sensitive-${module.id}`}
                              style={{ verticalAlign: 'middle' }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '14px' }}>
                          <strong>{module.name}</strong>
                          {' | '}
                          niveau {module.difficulty || '-'}
                          {' | '}
                          {module.word_count} woorden
                          {!module.is_free && ' | klascode vereist'}
                          {!module.is_active && ' | inactief'}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingModule === module.id ? (
                        <>
                          <button
                            onClick={() => {
                              const updates = {
                                name: document.getElementById(`name-${module.id}`).value,
                                difficulty: document.getElementById(`difficulty-${module.id}`).value,
                                is_free: document.getElementById(`is_free-${module.id}`).checked,
                                is_active: document.getElementById(`is_active-${module.id}`).checked,
                                case_sensitive: document.getElementById(`case_sensitive-${module.id}`).checked
                              }
                              updateModule(module.id, updates)
                            }}
                            className="teacher-btn"
                            style={{ padding: '4px 8px', fontSize: '13px', marginRight: '4px' }}
                          >
                            opslaan
                          </button>
                          <button
                            onClick={() => setEditingModule(null)}
                            className="teacher-btn"
                            style={{ padding: '4px 8px', fontSize: '13px' }}
                          >
                            annuleren
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingModule(module.id)
                              loadModuleCsvForEdit(module.id)
                            }}
                            className="teacher-btn"
                            style={{ padding: '4px 6px', fontSize: '13px', marginRight: '4px' }}
                          >
                            bewerk
                          </button>
                          <button
                            onClick={() => toggleModuleActive(module.id, module.is_active)}
                            className="teacher-btn"
                            style={{
                              padding: '4px 6px',
                              fontSize: '13px',
                              marginRight: '4px',
                              backgroundColor: module.is_active ? '#f44336' : '#4caf50',
                              borderColor: module.is_active ? '#f44336' : '#4caf50',
                              color: '#ffffff'
                            }}
                          >
                            {module.is_active ? 'deactiveer' : 'activeer'}
                          </button>
                          <button
                            onClick={() => deleteModule(module.id)}
                            className="teacher-btn"
                            style={{
                              padding: '4px 6px',
                              fontSize: '13px',
                              backgroundColor: '#9e9e9e',
                              borderColor: '#9e9e9e',
                              color: '#ffffff'
                            }}
                          >
                            verwijder
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Codes View */}
      {view === 'codes' && (
        <>
          <section style={{marginBottom: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'}}>
              <div>
                <label style={{marginRight: '10px'}}>Filter op school:</label>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  style={{ padding: '6px 10px' }}
                >
                  <option value="">alle scholen</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.school_code} - {school.school_name}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button
                  onClick={bulkDeactivateCodes}
                  className="teacher-btn"
                  style={{
                    backgroundColor: '#f44336',
                    borderColor: '#f44336',
                    color: '#ffffff'
                  }}
                  disabled={selectedClassCodes.length === 0 && selectedTeacherCodes.length === 0}
                >
                  deactiveer geselecteerd ({selectedClassCodes.length + selectedTeacherCodes.length})
                </button>
                <button
                  onClick={bulkDeleteCodes}
                  className="teacher-btn"
                  style={{
                    backgroundColor: '#9e9e9e',
                    borderColor: '#9e9e9e',
                    color: '#ffffff'
                  }}
                  disabled={selectedClassCodes.length === 0 && selectedTeacherCodes.length === 0}
                >
                  verwijder geselecteerd ({selectedClassCodes.length + selectedTeacherCodes.length})
                </button>
              </div>
            </div>
          </section>

          <section style={{marginBottom: '30px', padding: '16px', border: '1px solid #fff'}}>
            <h3>klascode genereren</h3>
            <div className="form-group">
              <label>klasnaam</label>
              <input
                type="text"
                value={newClassroomName}
                onChange={(e) => setNewClassroomName(e.target.value)}
                placeholder="bijv. klas 4B"
              />
            </div>
            <div className="form-group">
              <label>leerkracht</label>
              <select
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
              >
                <option value="">selecteer leerkracht</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.email}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={generateClassCode} className="teacher-btn" style={{ backgroundColor: '#fff', color: '#000' }}>
              genereer klascode
            </button>
          </section>

          <section style={{marginBottom: '30px', padding: '16px', border: '1px solid #fff'}}>
            <h3>leerkrachtcode genereren</h3>
            <button onClick={generateTeacherCode} className="teacher-btn" style={{ backgroundColor: '#fff', color: '#000' }}>
              genereer leerkrachtcode
            </button>
          </section>

          <section style={{marginBottom: '30px'}}>
            <h3>klascodes</h3>
            <table className="teacher-progress-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{width: '40px'}}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClassCodes(classCodes.map(c => c.id))
                        } else {
                          setSelectedClassCodes([])
                        }
                      }}
                      checked={selectedClassCodes.length === classCodes.length && classCodes.length > 0}
                    />
                  </th>
                  <th style={{width: '130px'}}>code</th>
                  <th style={{width: '80px'}}>klas</th>
                  <th>school</th>
                  <th style={{width: '70px', textAlign: 'center'}}>actief</th>
                  <th style={{width: '120px'}}>aangemaakt</th>
                  <th style={{width: '220px'}}>acties</th>
                </tr>
              </thead>
              <tbody>
                {classCodes.map(code => {
                  const classroom = classrooms.find(c => c.id === code.classroom_id)
                  return (
                    <tr key={code.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedClassCodes.includes(code.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedClassCodes([...selectedClassCodes, code.id])
                            } else {
                              setSelectedClassCodes(selectedClassCodes.filter(id => id !== code.id))
                            }
                          }}
                        />
                      </td>
                      <td><strong>{code.code}</strong></td>
                      <td>{classroom?.name || 'Onbekend'}</td>
                      <td style={{ wordBreak: 'break-word' }}>{classroom?.school_name || '-'}</td>
                      <td style={{ textAlign: 'center' }}>{code.is_active ? 'Ja' : 'Nee'}</td>
                      <td>{new Date(code.created_at).toLocaleDateString('nl-NL')}</td>
                      <td>
                        {code.is_active ? (
                          <button
                            onClick={() => deactivateClassCode(code.id)}
                            className="teacher-btn"
                            style={{
                              padding: '4px 8px',
                              fontSize: '14px',
                              backgroundColor: '#f44336',
                              borderColor: '#f44336',
                              color: '#ffffff',
                              marginRight: '5px'
                            }}
                          >
                            deactiveren
                          </button>
                        ) : (
                          <button
                            onClick={() => activateClassCode(code.id)}
                            className="teacher-btn"
                            style={{
                              padding: '4px 8px',
                              fontSize: '14px',
                              backgroundColor: '#4caf50',
                              borderColor: '#4caf50',
                              color: '#ffffff',
                              marginRight: '5px'
                            }}
                          >
                            activeren
                          </button>
                        )}
                        <button
                          onClick={() => deleteClassCode(code.id)}
                          className="teacher-btn"
                          style={{
                            padding: '4px 8px',
                            fontSize: '14px',
                            backgroundColor: '#9e9e9e',
                            borderColor: '#9e9e9e',
                            color: '#ffffff'
                          }}
                        >
                          verwijderen
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          <section>
            <h3>leerkrachtcodes</h3>
            <table className="teacher-progress-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{width: '40px'}}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTeacherCodes(teacherCodes.map(c => c.id))
                        } else {
                          setSelectedTeacherCodes([])
                        }
                      }}
                      checked={selectedTeacherCodes.length === teacherCodes.length && teacherCodes.length > 0}
                    />
                  </th>
                  <th style={{width: '130px'}}>code</th>
                  <th style={{width: '140px'}}>school</th>
                  <th>verbonden klassen</th>
                  <th style={{width: '70px', textAlign: 'center'}}>actief</th>
                  <th style={{width: '120px'}}>aangemaakt</th>
                  <th style={{width: '220px'}}>acties</th>
                </tr>
              </thead>
              <tbody>
                {teacherCodes.map(code => {
                  const school = schools.find(s => s.id === code.school_id)
                  return (
                    <tr key={code.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedTeacherCodes.includes(code.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTeacherCodes([...selectedTeacherCodes, code.id])
                            } else {
                              setSelectedTeacherCodes(selectedTeacherCodes.filter(id => id !== code.id))
                            }
                          }}
                        />
                      </td>
                      <td><strong>{code.code}</strong></td>
                      <td style={{ wordBreak: 'break-word' }}>{school?.school_name || '-'}</td>
                    <td>
                      {code.classrooms && code.classrooms.length > 0 ? (
                        <div style={{ fontSize: '14px' }}>
                          {code.classrooms.map((classroom, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ marginRight: '8px' }}>{classroom.name}</span>
                              <button
                                onClick={() => unlinkClassroomFromTeacherCode(code.id, classroom.id)}
                                className="teacher-btn"
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '12px',
                                  backgroundColor: '#ff9800',
                                  borderColor: '#ff9800',
                                  color: '#ffffff'
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '14px' }}>Geen klassen</span>
                      )}
                      <button
                        onClick={() => setLinkingTeacherCode(code)}
                        className="teacher-btn"
                        style={{
                          padding: '4px 8px',
                          fontSize: '13px',
                          marginTop: '8px',
                          backgroundColor: '#2196f3',
                          borderColor: '#2196f3',
                          color: '#ffffff'
                        }}
                      >
                        + klas koppelen
                      </button>
                    </td>
                    <td style={{ textAlign: 'center' }}>{code.is_active ? 'Ja' : 'Nee'}</td>
                    <td>{new Date(code.created_at).toLocaleDateString('nl-NL')}</td>
                    <td>
                      {code.is_active ? (
                        <button
                          onClick={() => deactivateTeacherCode(code.id)}
                          className="teacher-btn"
                          style={{
                            padding: '4px 8px',
                            fontSize: '14px',
                            backgroundColor: '#f44336',
                            borderColor: '#f44336',
                            color: '#ffffff',
                            marginRight: '5px'
                          }}
                        >
                          deactiveren
                        </button>
                      ) : (
                        <button
                          onClick={() => activateTeacherCode(code.id)}
                          className="teacher-btn"
                          style={{
                            padding: '4px 8px',
                            fontSize: '14px',
                            backgroundColor: '#4caf50',
                            borderColor: '#4caf50',
                            color: '#ffffff',
                            marginRight: '5px'
                          }}
                        >
                          activeren
                        </button>
                      )}
                      <button
                        onClick={() => deleteTeacherCode(code.id)}
                        className="teacher-btn"
                        style={{
                          padding: '4px 8px',
                          fontSize: '14px',
                          backgroundColor: '#9e9e9e',
                          borderColor: '#9e9e9e',
                          color: '#ffffff'
                        }}
                      >
                        verwijderen
                      </button>
                    </td>
                  </tr>
                  )
                })}
              </tbody>
            </table>
          </section>

          {/* Modal voor klas koppelen aan leerkrachtcode */}
          {linkingTeacherCode && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ maxWidth: '500px' }}>
                <div className="modal-header">
                  <div className="modal-title">klas koppelen aan leerkrachtcode</div>
                </div>

                <p style={{
                  fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
                  fontSize: 'clamp(13px, 1.1vw, 15px)',
                  marginBottom: '20px'
                }}>
                  <strong>leerkrachtcode:</strong> {linkingTeacherCode.code}
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    fontFamily: '"Gill Sans", "Gill Sans MT", Calibri, "Trebuchet MS", sans-serif',
                    fontSize: 'clamp(13px, 1.1vw, 15px)',
                    display: 'block',
                    marginBottom: '8px'
                  }}>
                    selecteer een klas:
                  </label>
                  <select
                    value={selectedClassroomToLink}
                    onChange={(e) => setSelectedClassroomToLink(e.target.value)}
                    className="teacher-input"
                    style={{ width: '100%' }}
                  >
                    <option value="">-- selecteer een klas --</option>
                    {classrooms
                      .filter(c => !linkingTeacherCode.classrooms?.some(linked => linked.id === c.id))
                      .map(classroom => (
                        <option key={classroom.id} value={classroom.id}>
                          {classroom.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => {
                      setLinkingTeacherCode(null)
                      setSelectedClassroomToLink('')
                    }}
                    className="teacher-btn"
                  >
                    annuleren
                  </button>
                  <button
                    onClick={linkClassroomToTeacherCode}
                    className="teacher-btn"
                    style={{ backgroundColor: '#fff', color: '#000' }}
                  >
                    koppelen
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Quotes View */}
      {view === 'quotes' && (
        <>
          <section style={{marginBottom: '30px', padding: '16px', border: '1px solid #fff'}}>
            <h3>nieuwe quote toevoegen</h3>
            <div className="form-group">
              <label>quote tekst</label>
              <textarea
                value={newQuoteText}
                onChange={(e) => setNewQuoteText(e.target.value)}
                rows={3}
                placeholder="de tekst van de quote"
              />
            </div>
            <div className="form-group">
              <label>auteur</label>
              <input
                type="text"
                value={newQuoteAuthor}
                onChange={(e) => setNewQuoteAuthor(e.target.value)}
                placeholder="naam van de auteur"
              />
            </div>
            <div className="form-group">
              <label>video URL (optioneel)</label>
              <input
                type="text"
                value={newQuoteVideoUrl}
                onChange={(e) => setNewQuoteVideoUrl(e.target.value)}
                placeholder="https://youtube.com/..."
              />
            </div>
            <button onClick={createQuote} className="teacher-btn" style={{ backgroundColor: '#fff', color: '#000' }}>
              quote toevoegen
            </button>
          </section>

          <section>
            <h3>bestaande quotes</h3>
            <div style={{ overflowX: 'auto' }}>
              <table className="teacher-progress-table" style={{ tableLayout: 'fixed', width: '100%' }}>
                <thead>
                  <tr>
                    <th>tekst</th>
                    <th style={{width: '120px'}}>auteur</th>
                    <th style={{width: '100px'}}>video URL</th>
                    <th style={{width: '70px', textAlign: 'center'}}>actief</th>
                    <th style={{width: '180px'}}>acties</th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map(quote => (
                  <tr key={quote.id}>
                    <td style={{ wordBreak: 'break-word' }}>
                      {editingQuote === quote.id ? (
                        <textarea
                          defaultValue={quote.text}
                          id={`text-${quote.id}`}
                          rows={2}
                          style={{ width: '100%' }}
                        />
                      ) : (
                        quote.text
                      )}
                    </td>
                    <td style={{ wordBreak: 'break-word' }}>
                      {editingQuote === quote.id ? (
                        <input
                          type="text"
                          defaultValue={quote.author}
                          id={`author-${quote.id}`}
                          style={{ width: '100%' }}
                        />
                      ) : (
                        quote.author || '-'
                      )}
                    </td>
                    <td>
                      {editingQuote === quote.id ? (
                        <input
                          type="text"
                          defaultValue={quote.video_url}
                          id={`video_url-${quote.id}`}
                          placeholder="https://..."
                        />
                      ) : (
                        quote.video_url ? (
                          <a href={quote.video_url} target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', textDecoration: 'underline' }}>
                            link
                          </a>
                        ) : '-'
                      )}
                    </td>
                    <td>
                      {editingQuote === quote.id ? (
                        <input
                          type="checkbox"
                          defaultChecked={quote.is_active}
                          id={`is_active-${quote.id}`}
                        />
                      ) : (
                        quote.is_active ? 'Ja' : 'Nee'
                      )}
                    </td>
                    <td>
                      {editingQuote === quote.id ? (
                        <>
                          <button
                            onClick={() => {
                              const updates = {
                                text: document.getElementById(`text-${quote.id}`).value,
                                author: document.getElementById(`author-${quote.id}`).value,
                                video_url: document.getElementById(`video_url-${quote.id}`).value,
                                is_active: document.getElementById(`is_active-${quote.id}`).checked
                              }
                              updateQuote(quote.id, updates)
                            }}
                            className="teacher-btn"
                            style={{ padding: '4px 8px', fontSize: '14px', marginRight: '5px' }}
                          >
                            opslaan
                          </button>
                          <button
                            onClick={() => setEditingQuote(null)}
                            className="teacher-btn"
                            style={{ padding: '4px 8px', fontSize: '14px' }}
                          >
                            annuleren
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingQuote(quote.id)}
                            className="teacher-btn"
                            style={{ padding: '4px 8px', fontSize: '14px', marginRight: '5px' }}
                          >
                            bewerken
                          </button>
                          <button
                            onClick={() => deleteQuote(quote.id)}
                            className="teacher-btn"
                            style={{
                              padding: '4px 8px',
                              fontSize: '14px',
                              backgroundColor: '#f44336',
                              borderColor: '#f44336',
                              color: '#ffffff'
                            }}
                          >
                            verwijderen
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </section>
        </>
      )}

      {/* Users View */}
      {view === 'users' && !selectedStudent && (
        <>
          <section style={{marginBottom: '20px'}}>
            <div style={{display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap'}}>
              <div>
                <label style={{marginRight: '10px'}}>Filter op rol:</label>
                <select
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  style={{ padding: '6px 10px' }}
                >
                  <option value="">alle</option>
                  <option value="student">leerling</option>
                  <option value="teacher">leerkracht</option>
                  <option value="admin">admin</option>
                </select>
              </div>
              <div>
                <label style={{marginRight: '10px'}}>Filter op school:</label>
                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  style={{ padding: '6px 10px' }}
                >
                  <option value="">alle scholen</option>
                  {schools.map(school => (
                    <option key={school.id} value={school.id}>
                      {school.school_code} - {school.school_name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={bulkDeleteUsers}
                className="teacher-btn"
                style={{
                  backgroundColor: '#9e9e9e',
                  borderColor: '#9e9e9e',
                  color: '#ffffff'
                }}
                disabled={selectedUsers.length === 0}
              >
                verwijder geselecteerd ({selectedUsers.length})
              </button>
            </div>
          </section>

          <section>
            <h3>gebruikers</h3>
            <table className="teacher-progress-table" style={{ tableLayout: 'fixed', width: '100%' }}>
              <thead>
                <tr>
                  <th style={{width: '40px'}}>
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.filter(u => u.role !== 'admin').map(u => u.id))
                        } else {
                          setSelectedUsers([])
                        }
                      }}
                      checked={selectedUsers.length > 0 && selectedUsers.length === users.filter(u => u.role !== 'admin').length}
                    />
                  </th>
                  <th>email</th>
                  <th style={{width: '80px'}}>rol</th>
                  <th style={{width: '140px'}}>school</th>
                  <th style={{width: '100px'}}>klas</th>
                  <th style={{width: '110px'}}>aangemaakt</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr
                    key={u.id}
                    onClick={() => u.role === 'student' && loadStudentDetail(u.id)}
                    style={{ cursor: u.role === 'student' ? 'pointer' : 'default' }}
                  >
                    <td onClick={(e) => e.stopPropagation()}>
                      {u.role !== 'admin' && (
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(u.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, u.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== u.id))
                            }
                          }}
                        />
                      )}
                    </td>
                    <td style={{ wordBreak: 'break-word' }}>{u.email}</td>
                    <td>{u.role}</td>
                    <td style={{ wordBreak: 'break-word' }}>{u.school_name || '-'}</td>
                    <td style={{ wordBreak: 'break-word' }}>{u.classroom_name || '-'}</td>
                    <td>{new Date(u.created_at).toLocaleDateString('nl-NL')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </>
      )}

      {/* Student Detail View from Users - Matrix View */}
      {view === 'users' && selectedStudent && studentDetail && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => {
                setSelectedStudent(null)
                setStudentDetail(null)
                setProgressData([])
                setMatrixModules([])
              }}
              className="teacher-btn"
              style={{ marginRight: '10px' }}
            >
              ← terug naar gebruikers
            </button>
            <button
              onClick={() => exportStudentPDF(selectedStudent)}
              className="teacher-btn"
              style={{ marginRight: '10px' }}
            >
              export naar PDF
            </button>
            <button
              onClick={() => exportStudentExcel(selectedStudent)}
              className="teacher-btn"
            >
              export naar Excel
            </button>
          </div>

          <h3>{studentDetail.student.email} - voortgang</h3>

          {loading ? (
            <div className="loading">laden...</div>
          ) : progressData.length === 0 ? (
            <p>geen voortgangsgegevens beschikbaar.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="teacher-progress-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 10 }}>leerling</th>
                    {matrixModules.map(module => (
                      <th key={module.id} style={{ minWidth: '120px', textAlign: 'center' }}>
                        {module.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progressData.map(student => (
                    <tr key={student.student_id}>
                      <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', color: '#000', fontWeight: '600' }}>
                        {student.student_email}
                      </td>
                      {matrixModules.map(module => {
                        const moduleData = student.modules[module.id]
                        return (
                          <td
                            key={module.id}
                            style={{
                              textAlign: 'center',
                              cursor: moduleData ? 'pointer' : 'default',
                              backgroundColor: moduleData ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
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
                              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>-</span>
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

      {/* Analytics View - same as teacher dashboard */}
      {view === 'analytics' && !selectedClassroom && !selectedStudent && difficultWords.length === 0 && (
        <>
          <section style={{marginBottom: '20px'}}>
            <button
              onClick={() => loadDifficultWordsAnalytics()}
              className="teacher-btn"
              style={{ marginRight: '10px' }}
            >
              moeilijkste woorden (alle klassen)
            </button>
          </section>

          <section>
            <h3>klassen</h3>
            <div className="classroom-list">
              {classrooms.map(classroom => (
                <div key={classroom.id} className="classroom-card">
                  <h4>{classroom.name}</h4>
                  <p style={{ marginBottom: '10px', color: 'rgba(255, 255, 255, 0.7)' }}>
                    {classroom.student_count || 0} {classroom.student_count === 1 ? 'leerling' : 'leerlingen'}
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => loadClassroomProgress(classroom.id)}
                      className="teacher-btn"
                    >
                      bekijk voortgang
                    </button>
                    <button
                      onClick={() => loadDifficultWordsAnalytics(classroom.id)}
                      className="teacher-btn"
                    >
                      moeilijkste woorden
                    </button>
                    <button
                      onClick={() => exportClassroomExcel(classroom.id)}
                      className="teacher-btn"
                    >
                      export naar Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {view === 'analytics' && selectedClassroom && !selectedStudent && difficultWords.length === 0 && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={backToClassroomList} className="teacher-btn">
              ← terug naar klassen
            </button>
          </div>

          <h3>{selectedClassroom.name} - voortgang</h3>

          {loading ? (
            <div className="loading">laden...</div>
          ) : progressData.length === 0 ? (
            <p>geen leerlingen in deze klas.</p>
          ) : (
            <div style={{ overflowX: 'auto', marginTop: '20px' }}>
              <table className="teacher-progress-table" style={{ minWidth: '600px' }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', left: 0, backgroundColor: '#fff', zIndex: 10 }}>leerling</th>
                    {matrixModules.map(module => (
                      <th key={module.id} style={{ minWidth: '120px', textAlign: 'center' }}>
                        {module.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {progressData.map(student => (
                    <tr key={student.student_id}>
                      <td style={{ position: 'sticky', left: 0, backgroundColor: '#fff', color: '#000', fontWeight: '600' }}>
                        {student.student_email}
                      </td>
                      {matrixModules.map(module => {
                        const moduleData = student.modules[module.id]
                        return (
                          <td
                            key={module.id}
                            style={{
                              textAlign: 'center',
                              cursor: moduleData ? 'pointer' : 'default',
                              backgroundColor: moduleData ? 'rgba(255, 255, 255, 0.05)' : 'transparent'
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
                              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>-</span>
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

      {view === 'analytics' && selectedStudent && studentDetail && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={backToProgress} className="teacher-btn" style={{ marginRight: '10px' }}>
              ← terug naar voortgang
            </button>
            <button
              onClick={() => exportStudentPDF(selectedStudent)}
              className="teacher-btn"
            >
              export naar PDF
            </button>
          </div>

          <h3>leerling details: {studentDetail.student.email}</h3>

          {loading ? (
            <div className="loading">laden...</div>
          ) : (
            <div className="student-detail">
              {studentDetail.modules.map((moduleData, idx) => (
                <div key={idx} className="module-detail-card">
                  <h4>{moduleData.module.name}</h4>

                  <div className="detail-stats">
                    <div className="stat-item">
                      <strong>status:</strong> {moduleData.progress.is_completed ? 'voltooid' : 'in uitvoering'}
                    </div>
                    <div className="stat-item">
                      <strong>voltooiingsdatum:</strong>{' '}
                      {moduleData.progress.completion_date
                        ? new Date(moduleData.progress.completion_date).toLocaleDateString('nl-NL')
                        : '-'
                      }
                    </div>
                    <div className="stat-item">
                      <strong>totale tijd:</strong>{' '}
                      {moduleData.progress.total_time_spent
                        ? `${Math.round(moduleData.progress.total_time_spent / 60)} minuten`
                        : '-'
                      }
                    </div>
                  </div>

                  {moduleData.question_progress.length > 0 && (
                    <>
                      <h5 style={{ marginTop: '20px', marginBottom: '10px' }}>vraaggeschiedenis</h5>
                      <div className="question-history">
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
                            {moduleData.question_progress.slice(0, 50).map((q, qIdx) => (
                              <tr key={qIdx}>
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
              ))}
            </div>
          )}
        </>
      )}

      {view === 'analytics' && difficultWords.length > 0 && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={backToClassroomList} className="teacher-btn">
              ← terug naar klassen
            </button>
          </div>

          <h3>moeilijkste woorden</h3>

          <div style={{ marginBottom: '20px' }}>
            <label>filter op module: </label>
            <select
              value={selectedModuleFilter}
              onChange={(e) => {
                setSelectedModuleFilter(e.target.value)
                loadDifficultWordsAnalytics(selectedClassroom?.id || null, e.target.value || null)
              }}
              style={{ marginLeft: '10px', padding: '6px 10px' }}
            >
              <option value="">alle modules</option>
              {modules.map(module => (
                <option key={module.id} value={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="loading">laden...</div>
          ) : (
            <div className="difficult-words-container">
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
    </div>
  )
}
