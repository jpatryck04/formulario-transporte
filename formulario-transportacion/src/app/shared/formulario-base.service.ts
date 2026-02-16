import { Injectable } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
import { ErrorHandlerService } from './error-handler.service';
import { ModalService } from './modal.service';

@Injectable({
  providedIn: 'root'
})
export class FormularioBaseService {
  private cargandoSubject = new BehaviorSubject<boolean>(false);
  public cargando$ = this.cargandoSubject.asObservable();

  private cambiosSubject = new BehaviorSubject<boolean>(false);
  public cambios$ = this.cambiosSubject.asObservable();

  constructor(
    private storage: StorageService,
    private api: ApiService,
    private errorHandler: ErrorHandlerService,
    private modalService: ModalService
  ) { }

  // Guardar formulario en localStorage
  guardarLocal(clave: string, datos: any): void {
    try {
      this.storage.guardar(clave, datos);
      this.modalService.mostrar('Datos guardados localmente', 'success');
    } catch (error) {
      this.errorHandler.manejarError(error, 'Error al guardar datos localmente');
    }
  }

  // Obtener formulario de localStorage
  obtenerLocal<T>(clave: string): T | null {
    try {
      return this.storage.obtener<T>(clave);
    } catch (error) {
      this.errorHandler.manejarError(error);
      return null;
    }
  }

  // Guardar en API (backend)
  guardarEnApi(endpoint: string, datos: any, tipo: string = 'POST'): Observable<any> {
    this.cargandoSubject.next(true);

    const observable = tipo === 'POST'
      ? this.api.post(endpoint, datos)
      : this.api.put(endpoint, datos);

    return new Observable(subscriber => {
      observable.subscribe(
        (respuesta) => {
          this.cargandoSubject.next(false);
          this.modalService.mostrar(`${endpoint.split('/')[1]} guardado exitosamente`, 'success');
          subscriber.next(respuesta);
          subscriber.complete();
        },
        (error) => {
          this.cargandoSubject.next(false);
          this.errorHandler.manejarError(error);
          subscriber.error(error);
        }
      );
    });
  }

  // Marcar como modificado
  marcarComoModificado(): void {
    this.cambiosSubject.next(true);
  }

  // Resetear cambios
  resetearCambios(): void {
    this.cambiosSubject.next(false);
  }

  // Obtener estado de cargando
  obtenerEstadoCargando(): Observable<boolean> {
    return this.cargando$;
  }

  // Obtener estado de cambios
  obtenerEstadoCambios(): Observable<boolean> {
    return this.cambios$;
  }

  // Validar formulario
  validarFormulario(form: FormGroup): boolean {
    if (form.invalid) {
      const primerasErrores = this.obtenerPrimerosErrores(form);
      this.errorHandler.manejarError(
        `Por favor complete los campos requeridos: ${primerasErrores.join(', ')}`,
        'Error de validación'
      );
      return false;
    }
    return true;
  }

  // Obtener primeros errores de validación
  private obtenerPrimerosErrores(form: FormGroup): string[] {
    const errores: string[] = [];

    Object.keys(form.controls).forEach(key => {
      const control = form.get(key);
      if (control && control.errors) {
        errores.push(key);
      }
    });

    return errores.slice(0, 3); // Mostrar máximo 3 errores
  }

  // Limpiar formulario
  limpiarFormulario(form: FormGroup): void {
    form.reset();
    this.resetearCambios();
  }

  // Pre-llenar formulario desde localStorage
  prellenarFormulario(form: FormGroup, clave: string): void {
    const datosGuardados = this.obtenerLocal(clave);
    if (datosGuardados) {
      form.patchValue(datosGuardados);
    }
  }

  // Crear copia de respaldo
  crearRespaldo(clave: string, datos: any): void {
    const respaldo = {
      ...datos,
      _respaldoEn: new Date().toISOString()
    };
    this.storage.guardar(`${clave}_respaldo`, respaldo);
  }

  // Restaurar desde respaldo
  restaurarRespaldo(clave: string): any | null {
    const respaldo = this.obtenerLocal(`${clave}_respaldo`);
    if (respaldo) {
      this.modalService.mostrar('Datos restaurados desde respaldo', 'info');
      return respaldo;
    }
    return null;
  }

  // Exportar datos como JSON
  exportarJSON(datos: any, nombreArchivo: string): void {
    try {
      const json = JSON.stringify(datos, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${nombreArchivo}_${new Date().getTime()}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
      this.modalService.mostrar('Archivo exportado exitosamente', 'success');
    } catch (error) {
      this.errorHandler.manejarError(error, 'Error al exportar archivo');
    }
  }

  // Sincronizar con API
  sincronizarConApi(
    endpointGuardar: string,
    datosFormulario: any,
    datosLocales: any,
    esInsert: boolean = true
  ): Observable<any> {
    return new Observable(subscriber => {
      this.cargandoSubject.next(true);

      // Comparar cambios
      const datosActualizados = this.compararDatos(datosLocales, datosFormulario);

      if (Object.keys(datosActualizados).length === 0) {
        this.cargandoSubject.next(false);
        this.modalService.mostrar('No hay cambios para sincronizar', 'info');
        subscriber.complete();
        return;
      }

      const operacion = esInsert
        ? this.api.post(endpointGuardar, datosActualizados)
        : this.api.put(endpointGuardar, datosActualizados);

      operacion.subscribe(
        (respuesta) => {
          this.cargandoSubject.next(false);
          this.resetearCambios();
          this.storage.guardar('sync_ultima_fecha', new Date().toISOString());
          this.modalService.mostrar('Sincronizado exitosamente', 'success');
          subscriber.next(respuesta);
          subscriber.complete();
        },
        (error) => {
          this.cargandoSubject.next(false);
          this.errorHandler.manejarError(error);
          subscriber.error(error);
        }
      );
    });
  }

  // Comparar objetos para detectar cambios
  private compararDatos(datosOriginales: any, datosActuales: any): any {
    const cambios: any = {};

    Object.keys(datosActuales).forEach(key => {
      if (JSON.stringify(datosOriginales[key]) !== JSON.stringify(datosActuales[key])) {
        cambios[key] = datosActuales[key];
      }
    });

    return cambios;
  }
}
