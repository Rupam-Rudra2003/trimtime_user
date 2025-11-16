import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function Terms(){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [open, setOpen] = React.useState({})

  // fallback English sections (used as defaults when translations are missing)
  const fallbackSections = [
    { title: 'Bookings', text: 'All appointments depend on service and stylist availability. You will receive a confirmation after booking.' },
    { title: 'Cancellations', text: 'Cancel or reschedule at least 2 hours before your appointment. Late cancellations may be charged.' },
    { title: 'Payments', text: 'We accept online payments and cash (if available). Some services may require advance payment.' },
    { title: 'Late Arrival', text: 'Arriving more than 15 minutes late may lead to automatic cancellation.' },
    { title: 'Services', text: 'Service prices and durations may vary. Inform the staff immediately if you face any issue with the service.' },
    { title: 'Home Services', text: 'Available only in selected areas. Customers must provide a safe and clean environment.' },
    { title: 'Hygiene & Safety', text: 'We maintain high hygiene standards. Please inform us if you have allergies or sensitive skin.' },
    { title: 'Refunds', text: 'Refunds are only provided for failed bookings or double payments, not after service completion.' },
    { title: 'Privacy', text: 'Your personal information is kept secure and used only for service-related purposes.' },
    { title: 'Updates', text: 'We may modify these terms anytime without prior notice.' }
  ]

  // Build sourceSections by merging translations (per-section) with the English fallback.
  // This ensures switching language shows translations when present and falls back otherwise.
  const sourceSections = []
  for (let i = 1; i <= fallbackSections.length; i++) {
    const titleKey = `terms.section${i}_title`
    const textKey = `terms.section${i}_text`
    const titleTranslated = t(titleKey)
    const textTranslated = t(textKey)

    const missingTitle = !titleTranslated || titleTranslated.startsWith(titleKey)
    const missingText = !textTranslated || textTranslated.startsWith(textKey)

    const title = missingTitle ? fallbackSections[i-1].title : titleTranslated
    const text = missingText ? fallbackSections[i-1].text : textTranslated

    sourceSections.push({ title, text })
  }

  function toggle(i){ setOpen(prev => ({ ...prev, [i]: !prev[i] })) }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">{t('terms.title')}</h1>
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-blue-500 hover:text-blue-700 flex items-center space-x-2"
          aria-label={t('nav.home')}
          title={t('nav.home')}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
          <span className="hidden sm:inline">{t('nav.home')}</span>
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">{t('terms.intro')}</p>

      <div className="space-y-3">
        {sourceSections.map((s, i) => (
          <div key={i} className="border rounded">
            <button onClick={()=>toggle(i)} className="w-full text-left px-4 py-3 flex justify-between items-center">
              <span className="font-medium">{s.title}</span>
              <span className="text-gray-500">{open[i] ? '-' : '+'}</span>
            </button>
            {open[i] && <div className="px-4 pb-3 text-sm text-gray-700">{s.text}</div>}
          </div>
        ))}
      </div>

    </div>
  )
}
