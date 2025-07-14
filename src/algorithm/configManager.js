const CONFIG_KEY = 'chronotables-config'

export const readConfig = () => {
  const defaultConfig = {
    bloques_matutino: 8,
    bloques_vespertino: 7,
    bloque_inicio_vespertino: 8,
    bloque_fin_matutino: 8,
    recesos: {
      matutino: { cantidad: 2, posiciones: [2, 5] },
      vespertino: { cantidad: 2, posiciones: [2, 4] },
    },
    horarios: {
      matutino: [],
      vespertino: [],
    },
  }

  try {
    const saved = localStorage.getItem(CONFIG_KEY)
    return saved ? JSON.parse(saved) : defaultConfig
  } catch (error) {
    console.error('Error reading config:', error)
    return defaultConfig
  }
}

export const writeConfig = (config) => {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config))
    return true
  } catch (error) {
    console.error('Error saving config:', error)
    return false
  }
}
