const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'inicio',
        component: () => import('pages/InicioView.vue'),
      },

      {
        path: 'visualizacion',
        name: 'visualizacion',
        component: () => import('pages/VisualizacionView.vue'),
        children: [
          {
            path: 'general',
            name: 'ver-general',
            component: () => import('pages/visualizacion/VerHorarioGeneral.vue'),
          },
          {
            path: 'individual',
            name: 'ver-individual',
            component: () => import('pages/visualizacion/VerHorarioIndividual.vue'),
          },
          { path: '', redirect: 'general' }, //tab predeterminada
        ],
      },

      {
        path: 'config',
        name: 'configuracion',
        component: () => import('pages/ConfiguracionView.vue'),
        children: [
          {
            path: 'materias',
            name: 'config-materias',
            component: () => import('pages/configuracion/MateriasView.vue'),
          },
          {
            path: 'docentes',
            name: 'config-docentes',
            component: () => import('pages/configuracion/DocentesView.vue'),
          },
          {
            path: 'grupos',
            name: 'config-grupos',
            component: () => import('pages/configuracion/GruposView.vue'),
          },
          {
            path: 'aulas',
            name: 'config-aulas',
            component: () => import('pages/configuracion/AulasView.vue'),
          },
          { path: '', redirect: 'materias' }, //tab predeterminada
        ],
      },

      {
        path: 'exportar',
        name: 'exportar',
        component: () => import('pages/ExportarView.vue'),
      },
    ],
  },
]

export default routes
