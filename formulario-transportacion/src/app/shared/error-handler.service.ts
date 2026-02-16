import { Injectable } from '@angular/core';
import { ModalService } from './modal.service';

export interface AppError {
  codigo?: string;
  mensaje: string;
  tipo: 'error' | 'warning' | 'info';
  detalles?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  constructor(private modalService: ModalService) { }

  manejarError(error: any, predeterminado: string = 'Ocurrió un error inesperado'): void {
    const appError = this.procesarError(error, predeterminado);
    this.mostrarError(appError);
    this.registrarError(appError);
  }

  private procesarError(error: any, predeterminado: string): AppError {
    if (typeof error === 'string') {
      return {
        mensaje: error,
        tipo: 'error'
      };
    }

    if (error instanceof Error) {
      return {
        mensaje: error.message || predeterminado,
        tipo: 'error',
        detalles: error.stack
      };
    }

    if (error.error && typeof error.error === 'object') {
      // Error HTTP
      return {
        codigo: error.status,
        mensaje: error.error.mensaje || error.error.message || predeterminado,
        tipo: 'error',
        detalles: error.error
      };
    }

    if (error.mensaje) {
      return {
        ...error,
        tipo: error.tipo || 'error'
      };
    }

    return {
      mensaje: predeterminado,
      tipo: 'error',
      detalles: error
    };
  }

  private mostrarError(error: AppError): void {
    const mensajeCompleto = error.codigo 
      ? `[${error.codigo}] ${error.mensaje}`
      : error.mensaje;

    this.modalService.mostrar(mensajeCompleto, error.tipo);
  }

  private registrarError(error: AppError): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      ...error
    };

    console.error('[APP ERROR]', logEntry);

    // Aquí se podría enviar a un servicio de logging remoto
    // this.httpClient.post('/api/logs/errors', logEntry).subscribe();
  }

  manejarErrorValidacion(erroresControl: any): string[] {
    if (!erroresControl) return [];

    const mensajes: string[] = [];

    if (erroresControl['required']) {
      mensajes.push('Este campo es requerido');
    }
    if (erroresControl['min']) {
      mensajes.push(`El valor mínimo es ${erroresControl['min'].min}`);
    }
    if (erroresControl['max']) {
      mensajes.push(`El valor máximo es ${erroresControl['max'].max}`);
    }
    if (erroresControl['minlength']) {
      mensajes.push(`Mínimo ${erroresControl['minlength'].requiredLength} caracteres`);
    }
    if (erroresControl['maxlength']) {
      mensajes.push(`Máximo ${erroresControl['maxlength'].requiredLength} caracteres`);
    }
    if (erroresControl['pattern']) {
      mensajes.push('Formato inválido');
    }
    if (erroresControl['placaInvalida']) {
      mensajes.push('Formato de placa inválido (ej: ABC-1234)');
    }
    if (erroresControl['telefonoInvalido']) {
      mensajes.push('Teléfono dominicano inválido');
    }
    if (erroresControl['cedulaInvalida']) {
      mensajes.push('Cédula dominicana inválida');
    }
    if (erroresControl['fechaFutura']) {
      mensajes.push('La fecha no puede ser futura');
    }
    if (erroresControl['fechaLlegadaInvalida']) {
      mensajes.push('La fecha de llegada debe ser posterior a la de salida');
    }
    if (erroresControl['horaLlegadaInvalida']) {
      mensajes.push('La hora de llegada debe ser posterior a la de salida');
    }
    if (erroresControl['numeroNegativo']) {
      mensajes.push('El número debe ser positivo');
    }
    if (erroresControl['caracteresInvalidos']) {
      mensajes.push('Contiene caracteres no permitidos');
    }

    return mensajes;
  }
}
