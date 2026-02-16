import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly PREFIX = 'formulario_';

  guardar(clave: string, datos: any): void {
    try {
      const datosComIndice = {
        ...datos,
        _guardadoEn: new Date().toISOString()
      };
      localStorage.setItem(
        this.PREFIX + clave,
        JSON.stringify(datosComIndice)
      );
    } catch (error) {
      console.error('Error al guardar datos en localStorage:', error);
    }
  }

  obtener<T>(clave: string): T | null {
    try {
      const datos = localStorage.getItem(this.PREFIX + clave);
      return datos ? JSON.parse(datos) : null;
    } catch (error) {
      console.error('Error al obtener datos de localStorage:', error);
      return null;
    }
  }

  eliminar(clave: string): void {
    try {
      localStorage.removeItem(this.PREFIX + clave);
    } catch (error) {
      console.error('Error al eliminar datos de localStorage:', error);
    }
  }

  limpiar(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error al limpiar localStorage:', error);
    }
  }

  obtenerTodos(): Record<string, any> {
    try {
      const resultado: Record<string, any> = {};
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(this.PREFIX)) {
          const clave = key.replace(this.PREFIX, '');
          resultado[clave] = JSON.parse(localStorage.getItem(key) || '{}');
        }
      });
      return resultado;
    } catch (error) {
      console.error('Error al obtener todos los datos de localStorage:', error);
      return {};
    }
  }
}
