import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface FirmaDigital {
  id: string;
  nombre: string;
  datos: string; // Base64 de la imagen
  fecha: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FirmaDigitalService {
  private firmas$ = new BehaviorSubject<FirmaDigital[]>([]);
  private firmaActual$ = new BehaviorSubject<FirmaDigital | null>(null);

  constructor() {
    this.cargarFirmas();
  }

  // Obtener observables
  obtenerFirmas() {
    return this.firmas$.asObservable();
  }

  obtenerFirmaActual() {
    return this.firmaActual$.asObservable();
  }

  // Guardar nueva firma
  guardarFirma(nombre: string, datosBase64: string): FirmaDigital {
    const firmaDigital: FirmaDigital = {
      id: Date.now().toString(),
      nombre,
      datos: datosBase64,
      fecha: new Date()
    };

    const firmasActuales = this.firmas$.value;
    firmasActuales.push(firmaDigital);
    this.firmas$.next(firmasActuales);
    
    // Guardar en localStorage
    localStorage.setItem('firmas_digitales', JSON.stringify(firmasActuales));
    
    return firmaDigital;
  }

  // Seleccionar firma actual
  seleccionarFirma(id: string): void {
    const firma = this.firmas$.value.find(f => f.id === id);
    if (firma) {
      this.firmaActual$.next(firma);
    }
  }

  // Eliminar firma
  eliminarFirma(id: string): void {
    const firmasActuales = this.firmas$.value.filter(f => f.id !== id);
    this.firmas$.next(firmasActuales);
    localStorage.setItem('firmas_digitales', JSON.stringify(firmasActuales));

    // Si era la firma actual, limpiar
    if (this.firmaActual$.value?.id === id) {
      this.firmaActual$.next(null);
    }
  }

  // Obtener firma por ID
  obtenerFirmaPorId(id: string): FirmaDigital | undefined {
    return this.firmas$.value.find(f => f.id === id);
  }

  // Cargar firmas del localStorage
  private cargarFirmas(): void {
    const datosGuardados = localStorage.getItem('firmas_digitales');
    if (datosGuardados) {
      try {
        const firmas = JSON.parse(datosGuardados);
        this.firmas$.next(firmas);
      } catch (e) {
        console.error('Error al cargar firmas:', e);
      }
    }
  }

  // Limpiar firma actual
  limpiarFirmaActual(): void {
    this.firmaActual$.next(null);
  }
}
