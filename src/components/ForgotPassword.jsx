import React from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function getUsers(){
  try{ const raw = localStorage.getItem('trimtime_users'); return raw ? JSON.parse(raw) : [] }catch(e){ return [] }
}
function saveUsers(users){
  try{ localStorage.setItem('trimtime_users', JSON.stringify(users)) }catch(e){}
}

export default function ForgotPassword(){
  const {t} = useTranslation()
  const navigate = useNavigate()
  const [phone, setPhone] = React.useState('')
  const [error, setError] = React.useState('')
  const [success, setSuccess] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [step, setStep] = React.useState(1) // 1=send,2=verify,3=setpass
  const [otpBoxes, setOtpBoxes] = React.useState(['','','',''])
  const [newPassword, setNewPassword] = React.useState('')
  const [confirmPassword, setConfirmPassword] = React.useState('')

  function validatePhone(p){ return String(p).replace(/\D/g,'').length >= 10 }

  function sendOtp(e){
    e && e.preventDefault()
    setError('')
    if(!validatePhone(phone)) return setError(t('auth.enterValidPhone', 'Enter a valid phone number'))
    const users = getUsers()
    const u = users.find(x=>x.phone === phone)
    if(!u) return setError(t('auth.accountNotFound', 'Account not found for this phone'))
    setLoading(true)
    setTimeout(()=>{
      setLoading(false)
      setStep(2)
      setOtpBoxes(['','','',''])
      setSuccess(t('auth.otpSent', 'OTP sent (demo). Use 1234'))
      setTimeout(()=>setSuccess(''),3000)
    }, 700)
  }

  function onOtpChange(idx, v){
    const val = v.replace(/[^0-9]/g,'').slice(0,1)
    const next = [...otpBoxes]
    next[idx] = val
    setOtpBoxes(next)
    if(val && idx < 3){
      const el = document.getElementById('fp-otp-' + (idx+2))
      el && el.focus()
    }
  }

  function verifyOtp(){
    const full = otpBoxes.join('')
    if(full.length !== 4) return setError(t('auth.enterOtp', 'Enter the 4-digit OTP'))
    if(full !== '1234') return setError(t('auth.invalidOtp', 'Invalid OTP (demo expects 1234)'))
    setError('')
    setSuccess(t('auth.otpVerifiedSetPassword', 'OTP verified — set your new password'))
    setTimeout(()=>setSuccess(''),2000)
    setStep(3)
  }

  function applyPassword(){
    setError('')
    if(!newPassword || newPassword.length < 6) return setError(t('auth.passwordLength', 'Password must be at least 6 characters'))
    if(newPassword !== confirmPassword) return setError(t('auth.passwordsDoNotMatch', 'Passwords do not match'))
    setLoading(true)
    setTimeout(()=>{
      const users = getUsers()
      const idx = users.findIndex(x=>x.phone === phone)
      if(idx === -1){ setLoading(false); setError(t('auth.accountNotFound', 'Account not found')); return }
      users[idx].password = newPassword
      saveUsers(users)
      setLoading(false)
      setSuccess(t('auth.passwordUpdated', 'Password updated. You can now sign in'))
      setTimeout(()=> navigate('/signin'), 900)
    }, 800)
  }

  return (
    <div className="auth-container min-h-screen flex items-center justify-center p-4 sm:p-6">
      <div className="auth-card w-full max-w-xs sm:max-w-sm rounded-xl p-4 sm:p-6 shadow-lg">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="brand-logo text-2xl sm:text-3xl font-bold mb-1">{t('auth.forgotPassword')}</h1>
          <p className="text-gray-600 text-xs sm:text-sm">{t('auth.resetPasswordDescription')}</p>
        </div>

        {error && <div className="mb-3"><div className="error-message text-white px-4 py-2 rounded-lg text-sm font-medium">{error}</div></div>}
        {success && <div className="mb-3"><div className="success-message text-white px-4 py-2 rounded-lg text-sm font-medium">{success}</div></div>}

        {step === 1 && (
          <form onSubmit={sendOtp} className="space-y-3">
            <div className="relative">
              <input type="tel" placeholder=" " value={phone} onChange={e=>setPhone(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" />
              <label className="floating-label">{t('auth.phoneNumber')}</label>
            </div>
            <div className="mt-3">
              <button className="auth-btn w-full py-2 rounded text-white" disabled={loading}>{loading ? t('common.sending', 'Sending...') : t('auth.sendOtp')}</button>
            </div>
            <div className="text-center mt-3 text-xs text-gray-600">{t('auth.rememberedPassword')} <Link to="/signin" className="text-blue-600 underline">{t('auth.signIn')}</Link></div>
          </form>
        )}

        {step === 2 && (
          <div>
            <p className="text-sm text-gray-700 mb-3">{t('auth.enterCodeSentTo', 'Enter the 4-digit code sent to')} {phone}</p>
            <div className="flex space-x-2 mb-3">
              {[0,1,2,3].map(i=> (
                <input key={i} id={`fp-otp-${i+1}`} value={otpBoxes[i]} onChange={e=>onOtpChange(i,e.target.value)} maxLength={1} className="otp-box w-12 h-12 text-center text-lg font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none" />
              ))}
            </div>
            <div className="flex space-x-2">
              <button onClick={verifyOtp} className="auth-btn flex-1 py-2 rounded text-white">{t('common.verify')}</button>
              <button onClick={()=>setStep(1)} className="secondary-btn flex-1 py-2 rounded">{t('common.back')}</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="relative"><input type="password" placeholder=" " value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" /> <label className="floating-label">{t('auth.newPassword')}</label></div>
            <div className="relative mt-3"><input type="password" placeholder=" " value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} className="input-field w-full px-3 py-2 sm:py-2.5 rounded-lg focus:outline-none text-sm sm:text-base" /> <label className="floating-label">{t('auth.confirmPassword')}</label></div>
            <div className="mt-3">
              <button onClick={applyPassword} className="auth-btn w-full py-2 rounded text-white" disabled={loading}>{loading ? t('common.saving', 'Saving...') : t('auth.setNewPassword')}</button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

