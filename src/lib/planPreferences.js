const STORAGE_KEY = 'da_duong_plan_preferences'

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
}

export function loadPlanPreferences(userId) {
  const store = readStore()
  return store[userId] ?? null
}

export function savePlanPreferences(userId, data) {
  const store = readStore()
  store[userId] = data
  writeStore(store)
}
