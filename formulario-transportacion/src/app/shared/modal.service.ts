import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ModalState {
  visible: boolean;
  mensaje: string;
  tipo: 'error' | 'success' | 'warning' | 'info' | 'confirmacion';
  esConfirmacion?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  private modalSubject = new BehaviorSubject<ModalState>({
    visible: false,
    mensaje: '',
    tipo: 'info'
  });

  public modal$ = this.modalSubject.asObservable();
  private resolucionConfirmacion!: (value: boolean) => void;

  mostrar(mensaje: string, tipo: 'error' | 'success' | 'warning' | 'info' = 'info'): Promise<void> {
    return new Promise((resolve) => {
      this.modalSubject.next({
        visible: true,
        mensaje,
        tipo,
        esConfirmacion: false
      });
      this.resolucionConfirmacion = () => resolve();
    });
  }

  confirmar(mensaje: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.modalSubject.next({
        visible: true,
        mensaje,
        tipo: 'confirmacion',
        esConfirmacion: true
      });
      this.resolucionConfirmacion = (resultado: boolean) => {
        this.cerrar();
        resolve(resultado);
      };
    });
  }

  error(mensaje: string): Promise<void> {
    return this.mostrar(mensaje, 'error');
  }

  exito(mensaje: string): Promise<void> {
    return this.mostrar(mensaje, 'success');
  }

  advertencia(mensaje: string): Promise<void> {
    return this.mostrar(mensaje, 'warning');
  }

  info(mensaje: string): Promise<void> {
    return this.mostrar(mensaje, 'info');
  }

  cerrar(): void {
    this.modalSubject.next({
      visible: false,
      mensaje: '',
      tipo: 'info'
    });
  }

  responderConfirmacion(respuesta: boolean): void {
    if (this.resolucionConfirmacion) {
      this.resolucionConfirmacion(respuesta);
    }
  }
}
