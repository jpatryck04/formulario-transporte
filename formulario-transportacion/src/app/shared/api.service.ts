import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = 'api'; // Cambiar por URL de backend real
  private readonly TIMEOUT_MS = 30000;

  constructor(private http: HttpClient) { }

  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.manejarError)
    );
  }

  post<T>(endpoint: string, datos: any): Observable<T> {
    return this.http.post<T>(
      `${this.apiUrl}${endpoint}`,
      datos,
      { headers: this.obtenerHeaders() }
    ).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.manejarError)
    );
  }

  put<T>(endpoint: string, datos: any): Observable<T> {
    return this.http.put<T>(
      `${this.apiUrl}${endpoint}`,
      datos,
      { headers: this.obtenerHeaders() }
    ).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.manejarError)
    );
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`).pipe(
      timeout(this.TIMEOUT_MS),
      catchError(this.manejarError)
    );
  }

  // Métodos específicos para formularios
  guardarRequisicion(datos: any): Observable<any> {
    return this.post('/requisiciones', datos);
  }

  obtenerRequisiciones(): Observable<any[]> {
    return this.get('/requisiciones');
  }

  obtenerRequisicion(id: string): Observable<any> {
    return this.get(`/requisiciones/${id}`);
  }

  actualizarRequisicion(id: string, datos: any): Observable<any> {
    return this.put(`/requisiciones/${id}`, datos);
  }

  eliminarRequisicion(id: string): Observable<any> {
    return this.delete(`/requisiciones/${id}`);
  }

  guardarSolicitud(datos: any): Observable<any> {
    return this.post('/solicitudes', datos);
  }

  obtenerSolicitudes(): Observable<any[]> {
    return this.get('/solicitudes');
  }

  obtenerSolicitud(id: string): Observable<any> {
    return this.get(`/solicitudes/${id}`);
  }

  actualizarSolicitud(id: string, datos: any): Observable<any> {
    return this.put(`/solicitudes/${id}`, datos);
  }

  eliminarSolicitud(id: string): Observable<any> {
    return this.delete(`/solicitudes/${id}`);
  }

  // Firmas digitales
  guardarFirma(datos: any): Observable<any> {
    return this.post('/firmas', datos);
  }

  obtenerFirmas(): Observable<any[]> {
    return this.get('/firmas');
  }

  private obtenerHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
      // Agregar autenticación aquí si es necesario
      // 'Authorization': `Bearer ${token}`
    });
  }

  private manejarError(error: any) {
    let mensaje = 'Error en la solicitud al servidor';

    if (error.error instanceof ErrorEvent) {
      // Error de cliente
      mensaje = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      if (error.status === 404) {
        mensaje = 'Recurso no encontrado';
      } else if (error.status === 400) {
        mensaje = error.error?.mensaje || 'Solicitud inválida';
      } else if (error.status === 401) {
        mensaje = 'No autorizado';
      } else if (error.status === 500) {
        mensaje = 'Error interno del servidor';
      } else if (error.name === 'TimeoutError') {
        mensaje = 'Tiempo de espera agotado. Verifique su conexión';
      }
    }

    return throwError(() => ({
      status: error.status,
      mensaje,
      error: error.error
    }));
  }
}
