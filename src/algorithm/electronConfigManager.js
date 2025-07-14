export const readConfig = async () => {
  try {
    return await window.electronAPI.readConfigFile()
  } catch (error) {
    console.error('Electron read error:', error)
    return getDefaultConfig()
  }
}

export const writeConfig = async (config) => {
  // Verificar que electronAPI existe
  if (!window.electronAPI || typeof window.electronAPI.writeConfigFile !== 'function') {
    console.error('Electron API no está disponible')
    return false
  }
  try {
    // Crear un objeto simple sin métodos ni referencias complejas
    const simpleConfig = JSON.parse(JSON.stringify(config))
    await window.electronAPI.writeConfigFile(simpleConfig)
    return true
  } catch (error) {
    console.error('Electron write error:', error)
    return false
  }
}

function getDefaultConfig() {
  return {
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
}
