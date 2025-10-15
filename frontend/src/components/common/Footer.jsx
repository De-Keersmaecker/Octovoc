import { useState, useEffect } from 'react'
import { getUser } from '../../utils/auth'
import api from '../../services/api'

const Footer = () => {
  const [footerContent, setFooterContent] = useState('')
  const user = getUser()

  useEffect(() => {
    const loadFooterContent = async () => {
      // Not logged in - show promotional footer
      if (!user) {
        setFooterContent('© KATERN | Jelle De Keersmaecker - bestel toegang tot alle modules voor 1 euro per leerling/student via www.katern.be')
        return
      }

      // Logged in but no class code or teacher code - show promotional footer
      if (!user.class_code && !user.teacher_code && !user.classroom_id) {
        setFooterContent('© KATERN | Jelle De Keersmaecker - bestel toegang tot alle modules voor 1 euro per leerling/student via www.katern.be')
        return
      }

      // User has class or teacher code - show school footer
      try {
        // Get school name from classroom or school info
        let schoolName = 'School'

        // If user has classroom_id, fetch classroom info
        if (user.classroom_id) {
          const response = await api.get(`/teacher/classroom/${user.classroom_id}`)
          schoolName = response.data.school_name || response.data.name || 'School'
        }

        // Calculate current school year (Sept - Aug)
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1 // 1-12
        const schoolYear = currentMonth >= 9
          ? `${currentYear}-${currentYear + 1}`
          : `${currentYear - 1}-${currentYear}`

        setFooterContent(`© KATERN | ${schoolName} | ${schoolYear}`)
      } catch (error) {
        // Fallback if API call fails
        const now = new Date()
        const currentYear = now.getFullYear()
        const currentMonth = now.getMonth() + 1
        const schoolYear = currentMonth >= 9
          ? `${currentYear}-${currentYear + 1}`
          : `${currentYear - 1}-${currentYear}`

        setFooterContent(`© KATERN | School | ${schoolYear}`)
      }
    }

    loadFooterContent()
  }, [user])

  return (
    <footer style={{
      width: '100%',
      textAlign: 'center',
      padding: '20px 10px',
      fontSize: '11px',
      color: '#fff',
      backgroundColor: '#000',
      marginTop: '0'
    }}>
      {footerContent}
    </footer>
  )
}

export default Footer
