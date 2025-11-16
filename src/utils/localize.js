// Utility helpers for dynamic data localization (salon names, addresses, service names)
import { useTranslation } from 'react-i18next'

function slug(str){
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
}

export function useDynamicLocalization(){
  const { t } = useTranslation()
  function salonName(id, fallback){
    if(!id) return fallback
    return t(`data.salons.${id}.name`, fallback)
  }
  function salonAddress(id, fallback){
    if(!id) return fallback
    return t(`data.salons.${id}.address`, fallback)
  }
  function serviceName(name){
    const key = slug(name)
    return t(`data.services.${key}`, name)
  }
  return { salonName, salonAddress, serviceName, slug }
}

export { slug }
