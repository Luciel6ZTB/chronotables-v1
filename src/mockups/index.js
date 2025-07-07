export * from './materias'
export * from './aulas'
export * from './grupos'
export * from './docentes'

import { horariosSemestre2 } from './horarios/semestre2'
import { horarioDocente1 } from './horarios/docentes/TorresNorma'

export const todosHorarios = [...horariosSemestre2]
export const horariosIndividuales = [...horarioDocente1]
