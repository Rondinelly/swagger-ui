const STORAGE_KEY = "swagger-authorization-content"

let localStorage = window.localStorage

export function saveAuthorizationToStorage(configs, key, value) {
  if (configs.saveAuthorization) {
    let content = {
      name: key,
      value: value
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(content))
  }
}