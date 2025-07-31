import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import {
  obtenerGrupos,
  crearGrupo,
  editarGrupo,
  eliminarGrupo,
} from './mongo/controllers/gruposController'
import {
  obtenerMaterias,
  crearMateria,
  editarMateria,
  eliminarMateria,
} from './mongo/controllers/materiasController'
import {
  obtenerDocentes,
  crearDocente,
  editarDocente,
  eliminarDocente,
} from './mongo/controllers/docentesController'
// needed in case process is undefined under Linux
const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))
const isDev = process.env.DEV

// Configuración de rutas mejorada
const getConfigPath = () => {
  if (isDev) {
    // En desarrollo: src/algorithm/general.json
    return path.resolve(currentDir, '../../src/algorithm/general.json')
  } else {
    // En producción: userData/algorithm/general.json
    return path.join(app.getPath('userData'), 'algorithm', 'general.json')
  }
}

// Función para inicializar el archivo de configuración
const initConfigFile = () => {
  const configPath = getConfigPath()
  const configDir = path.dirname(configPath)

  // Crear directorio si no existe
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true })
  }

  // Crear archivo con configuración por defecto si no existe
  if (!fs.existsSync(configPath)) {
    const defaultConfig = {
      bloques_matutino: 8,
      bloques_vespertino: 7,
      bloque_inicio_vespertino: 8,
      bloque_fin_matutino: 8,
      recesos: {
        matutino: [],
        vespertino: [],
      },
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    console.log('Archivo de configuración creado en:', configPath)
  }
}

let mainWindow

async function createWindow() {
  // Inicializar archivo de configuración
  initConfigFile()

  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    icon: path.resolve(currentDir, 'icons/bear_icon.png'), // tray icon
    width: 1280,
    height: 720,
    title: 'ChronoTables - ITACE',
    useContentSize: true,
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      preload: path.resolve(
        currentDir,
        path.join(
          process.env.QUASAR_ELECTRON_PRELOAD_FOLDER,
          'electron-preload' + process.env.QUASAR_ELECTRON_PRELOAD_EXTENSION,
        ),
      ),
    },
  })

  if (process.env.DEV) {
    await mainWindow.loadURL(process.env.APP_URL)
  } else {
    await mainWindow.loadFile('index.html')
  }

  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }

  mainWindow.setMenu(null)

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// API mejorada para manejar la configuración
ipcMain.handle('read-config-file', () => {
  try {
    const configPath = getConfigPath()
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'))
  } catch (error) {
    console.error('Error reading config file:', error)
    // Devuelve configuración por defecto si hay error
    return {
      bloques_matutino: 8,
      bloques_vespertino: 7,
      bloque_inicio_vespertino: 8,
      bloque_fin_matutino: 8,
      recesos: {
        matutino: [],
        vespertino: [],
      },
    }
  }
})

ipcMain.handle('write-config-file', (_, config) => {
  try {
    const configPath = getConfigPath()
    const configDir = path.dirname(configPath)

    // Asegurar que el directorio existe
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    // Convertir a objeto simple si es necesario
    const simpleConfig = JSON.parse(JSON.stringify(config))
    fs.writeFileSync(configPath, JSON.stringify(simpleConfig, null, 2))
    return true
  } catch (error) {
    console.error('Error writing config file:', error)
    return false
  }
})

// cargar colecciones
ipcMain.handle('get-grupos', async () => {
  return await obtenerGrupos()
})

ipcMain.handle('get-materias', async () => {
  return await obtenerMaterias()
})

ipcMain.handle('get-docentes', async () => {
  return await obtenerDocentes()
})

//crear
ipcMain.handle('create-grupo', async (_event, grupoData) => {
  return await crearGrupo(grupoData)
})
ipcMain.handle('create-materia', async (_event, data) => {
  return await crearMateria(data)
})
ipcMain.handle('create-docente', async (_event, docenteData) => {
  return await crearDocente(docenteData)
})

//editar
ipcMain.handle('update-grupo', async (_event, id, datosActualizados) => {
  return await editarGrupo(id, datosActualizados)
})
ipcMain.handle('update-materia', async (_event, id, data) => {
  return await editarMateria(id, data)
})
ipcMain.handle('update-docente', async (_event, { id, datosActualizados }) => {
  return await editarDocente(id, datosActualizados)
})

//eliminar
ipcMain.handle('delete-grupo', async (_event, id) => {
  return await eliminarGrupo(id)
})
ipcMain.handle('delete-materia', async (_event, id) => {
  return await eliminarMateria(id)
})
ipcMain.handle('delete-docente', async (_event, id) => {
  return await eliminarDocente(id)
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
