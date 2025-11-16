import React from 'react'
import SalonCard from './SalonCard'
import { useTranslation } from 'react-i18next'

export default function SalonList({ salons, onOpenSalon, onBook, favorites, toggleFavorite, onSearch, searchQuery, quickBook }){
  const {t} = useTranslation()
  // local state for controlled input; search will be auto-applied as user types (debounced)
  const [value, setValue] = React.useState(searchQuery || '')

  React.useEffect(()=>{
    setValue(searchQuery || '')
  },[searchQuery])

  // debounce search: apply onSearch 400ms after user stops typing
  React.useEffect(()=>{
    if(typeof onSearch !== 'function') return
    const id = setTimeout(()=>{
      onSearch(value)
    }, 400)
    return ()=> clearTimeout(id)
  }, [value, onSearch])

  return (
    <main id="salon-list" className="px-4 py-4 pb-0">
      <h2 id="page-title" className="text-lg font-semibold text-gray-800 mb-4">{t('salon.popularNearYou')}</h2>
      <div className="mb-6">
        <div className="relative flex">
          <input value={value} onChange={e=>setValue(e.target.value)} type="text" placeholder={t('salon.searchPlaceholder')} className="flex-1 px-4 py-3 pl-10 pr-4 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" aria-label="Search salons or services" />
          <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
  </div>
      </div>

      {salons.map(salon => (
        <SalonCard key={salon.id}
          salon={salon}
          onOpen={onOpenSalon}
          onBook={onBook}
          quickBook={quickBook}
          isFavorite={favorites.has(salon.id)}
          onToggleFavorite={()=>toggleFavorite(salon)} />
      ))}
    </main>
  )
}
