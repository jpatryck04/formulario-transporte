import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Injectable as InjectableDecorator } from '@angular/core';
import { Observable } from 'rxjs';

export interface ComponenteConCambios {
  tieneCambios(): boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CambiosNoGuardadosGuard implements CanDeactivate<ComponenteConCambios> {
  
  canDeactivate(
    component: ComponenteConCambios
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    if (component.tieneCambios()) {
      return confirm(
        '¿Tiene cambios no guardados. ¿Desea abandonar la página sin guardar?'
      );
    }
    
    return true;
  }
}
