export function getProfile() {
    try {
        const raw = localStorage.getItem('trimtime_profile')
        if (raw) {
            return JSON.parse(raw)
        }
    } catch (e) { /* ignore */ }
    return null
}

export function setProfile(profile) {
    try { localStorage.setItem('trimtime_profile', JSON.stringify(profile)) } catch (e) {}
}

export function clearProfile() {
    try { localStorage.removeItem('trimtime_profile') } catch (e) {}
}