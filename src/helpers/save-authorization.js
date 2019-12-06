export function saveAuthorization(configs, key, value) {
    if (configs.saveAuthorization) {
      localStorage.setItem(key, value)
    }
  }