import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

export default function FAQ(){
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [openIndex, setOpenIndex] = React.useState(null)
  const [query, setQuery] = React.useState('')

  // build items from translation keys (q1..q10)
  const translatedItems = []
  for(let i=1;i<=10;i++){
    const q = t(`faq.q${i}`)
    const a = t(`faq.a${i}`)
    // skip missing translations (i18next will return the key when missing)
    if(!q || q.startsWith('faq.q')) continue
    translatedItems.push({ q,a })
  }

  // Fallback content (English) — ensures FAQ shows even if translations aren't loaded
  const fallbackItems = [
    { q: 'Do I need to pay extra for online booking?', a: 'No, online booking is completely free.' },
    { q: 'How early should I book my appointment?', a: 'We recommend booking at least 1–2 hours in advance to secure your preferred slot.' },
    { q: 'What happens if I’m running late?', a: 'If you are more than 15 minutes late, your slot may be given to another customer.' },
    { q: 'Can I book multiple services together?', a: 'Yes, you can add multiple services in one booking.' },
    { q: 'Are walk-in appointments available?', a: 'Yes, walk-ins are allowed, but availability is not guaranteed.' },
    { q: 'How do I know which service is right for me?', a: 'Each service has a short description and estimated time to help you choose.' },
    { q: 'Do you offer bridal or special event packages?', a: 'Yes, we have bridal, party, and event packages. You can find them in the “Packages” section.' },
    { q: 'Is kids’ grooming available?', a: 'Yes, we provide haircuts and grooming services for kids.' },
    { q: 'Can I change my selected stylist after booking?', a: 'Yes, you can request a change if the stylist is available.' },
    { q: 'What if I need customer support?', a: 'You can reach us through live chat or call our customer care number anytime.' }
  ]

  const sourceItems = translatedItems.length ? translatedItems : fallbackItems
  const filtered = sourceItems.filter(it => (it.q + ' ' + (it.a||'')).toLowerCase().includes(query.toLowerCase()))

  function toggle(i){ setOpenIndex(prev => prev===i ? null : i) }

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">{t('faq.title')}</h1>
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

      <p className="text-sm text-gray-600 mb-4">{t('faq.intro')}</p>

      <div className="mb-4">
        <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('faq.searchPlaceholder','Search FAQs')} className="w-full border rounded px-3 py-2 text-sm" />
      </div>

      <div className="space-y-4">
        {filtered.length === 0 && <p className="text-sm text-gray-600">{t('faq.noResults','No results')}</p>}
        {filtered.map((it,idx)=> (
          <div key={idx} className="bg-white border rounded-lg shadow-md overflow-hidden">
            <button
              onClick={()=>toggle(idx)}
              className="w-full text-left px-4 py-4 flex justify-between items-start space-x-3 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              aria-expanded={openIndex===idx}
            >
              <div className="flex-1">
                <div className="font-medium text-gray-900">{it.q}</div>
                <div className="text-sm text-gray-600 mt-1 hidden sm:block">{it.a && it.a.substring(0,120) + (it.a.length>120? '...' : '')}</div>
              </div>
              <div className={`ml-4 transform transition-transform duration-200 ${openIndex===idx ? 'rotate-180' : 'rotate-0'}`}>
                <svg className="w-5 h-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd"/></svg>
              </div>
            </button>

            {openIndex===idx && (
              <div className="px-4 pb-4 pt-3 text-sm text-gray-700 border-t leading-relaxed">
                {it.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
