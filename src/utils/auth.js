import CryptoJS from 'crypto-js'

const TOKEN_KEY = import.meta.env.VITE_APP_TOKEN_PREFIX || 'yxshop_admin_token'
const ENCRYPT_KEY = import.meta.env.VITE_APP_ENCRYPT_KEY

if (!ENCRYPT_KEY) {
  console.warn('[auth] VITE_APP_ENCRYPT_KEY is not set. Token storage will not be encrypted.')
}

function encrypt(data) {
  if (!ENCRYPT_KEY) return JSON.stringify(data)
  return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPT_KEY).toString()
}

function decrypt(ciphertext) {
  if (!ENCRYPT_KEY) {
    try { return JSON.parse(ciphertext) } catch { return null }
  }
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPT_KEY)
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
  } catch {
    return null
  }
}

export function getToken() {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  const decrypted = decrypt(raw)
  return decrypted || raw
}

export function setToken(token) {
  return localStorage.setItem(TOKEN_KEY, encrypt(token))
}

export function removeToken() {
  return localStorage.removeItem(TOKEN_KEY)
}

export function getTokenPayload(token) {
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))
    return payload
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = getTokenPayload(token)
  if (!payload || !payload.exp) return true
  return payload.exp * 1000 < Date.now()
}

export function getTokenRemainingTime(token) {
  const payload = getTokenPayload(token)
  if (!payload || !payload.exp) return 0
  return payload.exp * 1000 - Date.now()
}
