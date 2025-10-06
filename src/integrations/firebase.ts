import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, isSupported } from 'firebase/messaging'
import { ENV } from '../config/env'

let app: ReturnType<typeof initializeApp> | undefined

export function initFirebase() {
  if (!ENV.firebase.apiKey) return null
  if (!getApps().length) {
    app = initializeApp({
      apiKey: ENV.firebase.apiKey,
      authDomain: ENV.firebase.authDomain,
      projectId: ENV.firebase.projectId,
      storageBucket: ENV.firebase.storageBucket,
      messagingSenderId: ENV.firebase.messagingSenderId,
      appId: ENV.firebase.appId,
      measurementId: ENV.firebase.measurementId,
    })
  }
  return app
}

export async function initMessaging() {
  if (!app) initFirebase()
  try {
    if (await isSupported()) {
      return getMessaging()
    }
  } catch {}
  return null
}
