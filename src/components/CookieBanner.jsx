import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'

/**
 * Cookie consent banner with internationalized messaging.
 */
export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const { t } = useLanguage()

  useEffect(() => {
    // Verificamos si el usuario ya aceptó las cookies previamente
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) {
      setIsVisible(true)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'true')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50 transition-transform transform translate-y-0 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="text-sm">
        <p>
          {t('cookie.message')}{' '}
          <Link to="/politica-datos" className="text-blue-400 hover:text-blue-300 underline underline-offset-2">
            {t('cookie.policyLink')}
          </Link>{' '}
          {t('cookie.messageEnd')}
        </p>
      </div>
      <button 
        onClick={handleAccept}
        className="whitespace-nowrap px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-md font-medium transition-colors"
      >
        {t('cookie.accept')}
      </button>
    </div>
  )
}
