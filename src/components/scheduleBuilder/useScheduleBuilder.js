import { ref, computed, onMounted } from 'vue'

let state

export function useScheduleBuilder(emit) {
  if (state) return state

  const isElectron = () => {
    try {
      return (
        typeof window !== 'undefined' &&
        window.electronAPI &&
        (typeof window.electronAPI.readConfigFile === 'function' ||
          typeof window.electronAPI.writeConfigFile === 'function')
      )
    } catch {
      return false
    }
  }

  const getDefaultConfig = () => ({
    bloques_matutino: 8,
    bloques_vespertino: 7,
    bloque_inicio_vespertino: 8,
    bloque_fin_matutino: 8,
    recesos: {
      matutino: [2, 5],
      vespertino: [2, 4],
    },
    horarios: {
      matutino: [],
      vespertino: [],
    },
  })

  const readConfig = async () => {
    try {
      if (isElectron()) {
        const result = await window.electronAPI.readConfigFile?.()
        return result || getDefaultConfig()
      }
      const local = localStorage.getItem('scheduleConfig')
      return local ? JSON.parse(local) : getDefaultConfig()
    } catch (err) {
      console.error('Error reading config:', err)
      return getDefaultConfig()
    }
  }

  const writeConfig = async (config) => {
    try {
      const configToSave = {
        bloques_matutino: Number(config.bloques_matutino),
        bloques_vespertino: Number(config.bloques_vespertino),
        bloque_inicio_vespertino: Number(config.bloque_inicio_vespertino),
        bloque_fin_matutino: Number(config.bloque_fin_matutino),
        recesos: {
          matutino: [...(config.recesos?.matutino || [])],
          vespertino: [...(config.recesos?.vespertino || [])],
        },
        horarios: {
          matutino: [...(config.horarios?.matutino || [])],
          vespertino: [...(config.horarios?.vespertino || [])],
        },
      }

      if (isElectron()) {
        return await window.electronAPI.writeConfigFile?.(configToSave)
      } else {
        localStorage.setItem('scheduleConfig', JSON.stringify(configToSave))
        return true
      }
    } catch (err) {
      console.error('Error writing config:', err)
      return false
    }
  }

  const initializeState = (data) => {
    return {
      bloques_matutino: Number(data.bloques_matutino),
      bloques_vespertino: Number(data.bloques_vespertino),
      bloque_inicio_vespertino: Number(data.bloque_inicio_vespertino),
      bloque_fin_matutino: Number(data.bloque_fin_matutino),
      matutino: {
        bloques: Number(data.bloques_matutino),
        recesos: {
          cantidad: data.recesos.matutino?.length || 0,
          posiciones: [...(data.recesos.matutino || [])],
        },
        horarios: [...(data.horarios.matutino || [])],
      },
      vespertino: {
        bloques: Number(data.bloques_vespertino),
        recesos: {
          cantidad: data.recesos.vespertino?.length || 0,
          posiciones: [...(data.recesos.vespertino || [])],
        },
        horarios: [...(data.horarios.vespertino || [])],
      },
    }
  }

  const currentTurn = ref('matutino')
  const config = ref(initializeState(getDefaultConfig()))
  const schedulePreview = ref([])
  const turnChanged = ref(false)

  const turnOptions = [
    { label: 'Turno Matutino', value: 'matutino', icon: 'wb_sunny' },
    { label: 'Turno Vespertino', value: 'vespertino', icon: 'nights_stay' },
  ]

  const scheduleColumns = [
    { name: 'numero', label: 'Bloque', align: 'center', field: 'numero' },
    { name: 'horario', label: 'Horario', align: 'center', field: 'horario' },
    { name: 'espacio', label: 'Espacio de Clase', align: 'center', field: 'espacio' },
  ]

  const recesoOptions = computed(() => {
    const turn = currentTurn.value
    const bloques = config.value[turn]?.bloques || 1

    let inicio = 1
    if (turn === 'vespertino') {
      inicio = Number(config.value.bloque_inicio_vespertino) || 1
    } else if (turn === 'matutino') {
      inicio = Number(config.value.bloque_inicio_matutino) || 1
    }

    return Array.from({ length: bloques - 1 }, (_, i) => {
      const bloqueNum = inicio + i
      return {
        label: `Bloque ${bloqueNum}`,
        value: bloqueNum,
      }
    })
  })

  const horarios = computed(() => ({
    matutino: config.value.matutino.horarios,
    vespertino: config.value.vespertino.horarios,
  }))

  const switchTurn = (newTurn) => {
    currentTurn.value = newTurn
    turnChanged.value = !turnChanged.value
    updateScheduleDisplay()
  }

  const updateBlocks = () => {
    const bloqueData = config.value[currentTurn.value]
    const maxRecesos = Math.max(0, bloqueData.bloques - 1)

    bloqueData.recesos.cantidad = Math.min(bloqueData.recesos.cantidad, maxRecesos)
    bloqueData.recesos.posiciones = bloqueData.recesos.posiciones
      .filter((p) => p < bloqueData.bloques)
      .slice(0, bloqueData.recesos.cantidad)

    if (currentTurn.value === 'matutino') {
      config.value.bloque_inicio_vespertino = bloqueData.bloques
    }
    updateScheduleDisplay()
  }

  const updateRecesos = () => {
    const bloqueData = config.value[currentTurn.value]
    const { cantidad, posiciones } = bloqueData.recesos
    if (!Array.isArray(posiciones)) bloqueData.recesos.posiciones = []
    if (cantidad > posiciones.length) {
      const nuevos = Array(cantidad - posiciones.length).fill(Math.floor(bloqueData.bloques / 2))
      bloqueData.recesos.posiciones = [...posiciones, ...nuevos]
    } else {
      bloqueData.recesos.posiciones = posiciones.slice(0, cantidad)
    }
    updateScheduleDisplay()
  }

  const updateScheduleDisplay = () => {
    const bloqueData = config.value[currentTurn.value]
    const recesos = [...bloqueData.recesos.posiciones].sort((a, b) => a - b)
    const bloques = []

    let i = 1
    if (currentTurn.value === 'vespertino') {
      i = Number(config.value.bloque_inicio_vespertino) || 1
      console.log(config.value.bloque_inicio_vespertino)
    }

    const totalBloques = bloqueData.bloques

    let count = 0
    while (count < totalBloques) {
      bloques.push({
        id: `${currentTurn.value}-${i}-clase`,
        numero: i,
        horario: getHorarioForBlock(i, 'clase'),
        tipo: 'clase',
      })

      if (recesos.includes(i)) {
        bloques.push({
          id: `${currentTurn.value}-${i}-receso`,
          numero: 'R',
          horario: getHorarioForBlock(i, 'receso'),
          tipo: 'receso',
          nombre: 'Receso',
        })
      }

      i++
      count++
    }

    schedulePreview.value = bloques
  }

  function getHorarioForBlock(bloque, tipo) {
    const bloqueKey = tipo === 'receso' ? 'R' : bloque
    return (
      horarios.value[currentTurn.value]?.find((h) => h.bloque === bloqueKey && h.tipo === tipo)
        ?.horario || ''
    )
  }

  const updateScheduleData = () => {
    config.value[currentTurn.value].horarios = schedulePreview.value
      .filter((r) => r.horario)
      .map((r) => ({
        bloque: r.numero,
        tipo: r.tipo,
        horario: r.horario,
      }))
  }

  const saveConfiguration = async () => {
    updateScheduleData()

    const full = JSON.parse(
      JSON.stringify({
        bloques_matutino: config.value.matutino.bloques,
        bloques_vespertino: config.value.vespertino.bloques,
        bloque_inicio_vespertino: config.value.bloque_inicio_vespertino,
        bloque_fin_matutino: config.value.matutino.bloques,
        recesos: {
          matutino: [...config.value.matutino.recesos.posiciones],
          vespertino: [...config.value.vespertino.recesos.posiciones],
        },
        horarios: {
          matutino: [...config.value.matutino.horarios],
          vespertino: [...config.value.vespertino.horarios],
        },
      }),
    )

    const success = await writeConfig(full)
    if (success && emit) emit('configuration-saved', full)

    return success
  }

  onMounted(async () => {
    const loaded = await readConfig()
    config.value = initializeState(loaded)
    updateScheduleDisplay()
  })

  state = {
    currentTurn,
    config,
    turnOptions,
    recesoOptions,
    schedulePreview,
    scheduleColumns,
    updateBlocks,
    updateRecesos,
    updateScheduleDisplay,
    updateScheduleData,
    saveConfiguration,
    switchTurn,
    getCurrentTurn: () => currentTurn.value,
    getSchedulePreview: () => schedulePreview.value,
    forceUpdate: () => updateScheduleDisplay(),
  }

  return state
}
