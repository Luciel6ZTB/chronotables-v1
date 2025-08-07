import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import { exec } from 'node:child_process'
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
import {
  obtenerAulas,
  crearAula,
  actualizarAula,
  eliminarAula,
} from './mongo/controllers/aulasController'
// needed in case process is undefined under Linux
const platform = process.platform || os.platform()
const currentDir = fileURLToPath(new URL('.', import.meta.url))
const isDev = process.env.DEV

// Obtener rutas
const getResourcesPath = () => {
  // En desarrollo usamos currentDir
  if (isDev) return currentDir

  // En producción: resources/algorithm (relativo al ejecutable)
  return path.join(process.resourcesPath, 'algorithm')
}

const getConfigPath = () => {
  if (isDev) {
    return path.resolve(currentDir, './algorithm/config.json')
  } else {
    // Cambiado de userData a resources/algorithm
    return path.join(getResourcesPath(), 'config.json')
  }
}

const getHorarioGrupalPath = () => {
  if (isDev) {
    return path.resolve(currentDir, './algorithm/horarios_grupales.json')
  } else {
    return path.join(getResourcesPath(), 'horarios_grupales.json')
  }
}

const getHorarioDocentePath = () => {
  if (isDev) {
    return path.resolve(currentDir, './algorithm/horarios_profesores.json')
  } else {
    return path.join(getResourcesPath(), 'horarios_profesores.json')
  }
}

const getGeneradorPath = () => {
  if (isDev) {
    return path.resolve(currentDir, './algorithm/index.js')
  } else {
    return path.join(getResourcesPath(), 'index.js')
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
      horarios: {
        matutino: [],
        vespertino: [],
      },
    }
    fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2))
    console.log('Archivo de configuración creado en:', configPath)
  }
}

//leer archivos de horario
const readHorariosGrupales = async () => {
  console.log(currentDir)

  const filePath = getHorarioGrupalPath()
  if (!fs.existsSync(filePath)) return []
  const data = await fs.promises.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}

const readHorariosDocentes = async () => {
  console.log(currentDir)

  const filePath = getHorarioDocentePath()
  const contenido = await fs.promises.readFile(filePath, 'utf-8')
  return JSON.parse(contenido)
}

//escribir archivo de horario
const writeHorariosGrupales = async (data) => {
  const filePath = getHorarioGrupalPath()
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true })
  await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

const getListaGrupos = async () => {
  const data = await readHorariosGrupales()
  return Object.keys(data)
}

const getHorarioPorGrupo = async (grupoId) => {
  const data = await readHorariosGrupales()
  return data[grupoId] || null
}

const getListaDocentes = async () => {
  const data = await readHorariosDocentes()
  return Object.keys(data) // nombres como "Acosta García Javier Alfonso"
}

const getHorarioPorDocente = async (nombreDocente) => {
  const data = await readHorariosDocentes()
  return data[nombreDocente] || null
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

  /*
  if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
    mainWindow.webContents.openDevTools()
  } else {
    // we're on production; no access to devtools pls
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools()
    })
  }
*/

  mainWindow.webContents.openDevTools({ mode: 'detach' }) // o 'undocked', si prefieres

  mainWindow.webContents.on('devtools-opened', () => {
    mainWindow.focus()
  })

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
      horarios: {
        matutino: [],
        vespertino: [],
      },
    }
  }
})
//horario grupal solo editar un grupo
ipcMain.handle('editar-aula-horario', async (event, { grupo, materia, docente, aula }) => {
  const filePath = getHorarioGrupalPath()

  try {
    const data = JSON.parse(await fs.promises.readFile(filePath, 'utf-8'))

    if (!data[grupo]) throw new Error(`Grupo ${grupo} no encontrado`)

    const horarioGrupo = data[grupo].horario

    for (const dia of Object.keys(horarioGrupo)) {
      for (const bloque of Object.keys(horarioGrupo[dia])) {
        const celda = horarioGrupo[dia][bloque]
        if (celda.materia === materia && celda.docente === docente) {
          celda.aula = aula
        }
      }
    }

    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return { ok: true }
  } catch (err) {
    console.error('Error actualizando aula:', err)
    return { ok: false, error: err.message }
  }
})

ipcMain.handle('verificar-config-existe', async () => {
  const configPath = getConfigPath()
  return fs.existsSync(configPath)
})

ipcMain.handle('generar-horarios', async () => {
  const rutaArchivo = getGeneradorPath()

  return new Promise((resolve) => {
    exec(`node ${rutaArchivo}`, (error, stdout, stderr) => {
      if (error) {
        console.error('Error al generar horarios:', stderr)
        resolve(false) // o reject(error) si quieres lanzar el error
      } else {
        console.log('Generación de horarios completada')
        console.log(stdout)
        resolve(true) // El algoritmo ya imprimió lo que necesitaba
      }
    })
  })
})

ipcMain.handle('leer-horarios-grupales', async () => {
  return await readHorariosGrupales()
})

ipcMain.handle('leer-horarios-docentes', async () => {
  return await readHorariosDocentes()
})

// Guardar horarios grupales
ipcMain.handle('guardar-horarios-grupales', async (event, data) => {
  return await writeHorariosGrupales(data)
})

ipcMain.handle('obtener-grupos-horarios', async () => {
  return await getListaGrupos()
})
ipcMain.handle('obtener-horario-de-grupo', async (event, grupoId) => {
  return await getHorarioPorGrupo(grupoId)
})

ipcMain.handle('obtener-docentes-horarios', async () => {
  return await getListaDocentes()
})

ipcMain.handle('obtener-horario-de-docente', async (event, nombreDocente) => {
  return await getHorarioPorDocente(nombreDocente)
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

ipcMain.handle('get-aula', async () => {
  return await obtenerAulas()
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
ipcMain.handle('create-aula', async (_event, aulaData) => {
  return await crearAula(aulaData)
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
ipcMain.handle('update-aula', async (_event, id, datosActualizados) => {
  return await actualizarAula(id, datosActualizados)
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
ipcMain.handle('delete-aula', async (_event, id) => {
  return await eliminarAula(id)
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
