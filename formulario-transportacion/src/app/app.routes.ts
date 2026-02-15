import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () =>
      import('./menu-formularios.component')
        .then(m => m.MenuFormulariosComponent)
  },
  { 
    path: 'requisicion-transporte', 
    loadComponent: () =>
      import('./requisicion-transporte/requisicion-transporte.component')
        .then(m => m.RequisicionTransporteComponent)
  },
  { 
    path: 'solicitud-transporte', 
    loadComponent: () =>
      import('./solicitud-transporte/solicitud-transporte.component')
        .then(m => m.SolicitudTransporteComponent)
  }
];
