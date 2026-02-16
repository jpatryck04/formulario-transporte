import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalComponent } from '../shared/modal.component';
import { ModalService, ModalState } from '../shared/modal.service';
import { SelectorFirmaComponent } from '../shared/selector-firma.component';
import { FirmaDigitalService, FirmaDigital } from '../shared/firma-digital.service';
import { FormularioBaseService } from '../shared/formulario-base.service';
import { ErrorHandlerService } from '../shared/error-handler.service';
import { StorageService } from '../shared/storage.service';
import { ValidadoresPersonalizados } from '../shared/validadores';
import { ComponenteConCambios } from '../shared/cambios-no-guardados.guard';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-requisicion-transporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent, SelectorFirmaComponent],
  templateUrl: './requisicion-transporte.component.html',
  styleUrls: ['./requisicion-transporte.component.css']
})
export class RequisicionTransporteComponent implements OnInit, OnDestroy, ComponenteConCambios {
  formulario!: FormGroup;
  modoImpresion = false;
  modalState: ModalState | null = null;
  mostrarSelectorFirma = false;
  cargando$!: Observable<boolean>;
  cambios$!: Observable<boolean>;
  
  firmaResponsableId: string | null = null;
  firmaDirectorId: string | null = null;
  firmaResponsable: FirmaDigital | null = null;
  firmaDirector: FirmaDigital | null = null;
  registradoPor = '';
  
  numeroEntrada = this.generarNumeroEntrada();
  fechaActual = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  horaActual = this.obtenerHoraActual();
  
  fechaImpresion = '';
  horaImpresion = '';
  
  private intervaloHora: any;
  private destroy$ = new Subject<void>();
  selectorFirmaActivo: 'responsable' | 'director' | null = null;
  datosOriginales: any = {};

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService,
    private firmaService: FirmaDigitalService,
    private formularioBase: FormularioBaseService,
    private errorHandler: ErrorHandlerService,
    private storage: StorageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    try {
      this.cargando$ = this.formularioBase.obtenerEstadoCargando();
      this.cambios$ = this.formularioBase.obtenerEstadoCambios();
      this.inicializarFormulario();
      this.iniciarActualizacionHora();
      this.subscripcionModalState();
      this.cargarFirmasGuardadas();
      this.monitorearCambios();
      this.restaurarFormularioGuardado();
    } catch (error) {
      this.errorHandler.manejarError(error, 'Error al inicializar el formulario');
    }
  }

  ngOnDestroy(): void {
    if (this.intervaloHora) {
      clearInterval(this.intervaloHora);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Implementar interfaz ComponenteConCambios
  tieneCambios(): boolean {
    return this.formulario.dirty;
  }

  volverAlMenu(): void {
    if (this.tieneCambios()) {
      this.modalService.confirmar('¿Desea volver al menú? Sus cambios no guardados serán perdidos.').then((confirmado) => {
        if (confirmado) {
          this.router.navigate(['/']);
        }
      });
    } else {
      this.router.navigate(['/']);
    }
  }

  obtenerHoraActual(): string {
    const ahora = new Date();
    return ahora.toLocaleTimeString('es-DO', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  }

  iniciarActualizacionHora(): void {
    // Actualizar cada segundo para mejor precisión
    this.intervaloHora = setInterval(() => {
      this.horaActual = this.obtenerHoraActual();
    }, 1000);
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      fecha: ['', [Validators.required, ValidadoresPersonalizados.fechaNoFutura()]],
      hora: ['', Validators.required],
      dependencia: ['', Validators.required],
      registradoPor: ['', Validators.required],
      
      ficha: [''],
      placa: ['', [Validators.required, ValidadoresPersonalizados.placaVehiculo()]],
      marca: [''],
      modelo: [''],
      anio: [''],
      chassis: [''],
      conductor: ['', Validators.required],
      
      gasolina: [false],
      gasOil: [false],
      valorSolicitado: ['', ValidadoresPersonalizados.numeroPositivo()],
      galones: ['', ValidadoresPersonalizados.numeroPositivo()],
      dop: [''],
      incluidoEn: [''],
      
      mantenimientoRutinario: [''],
      sustitucion: [''],
      reparacion: [''],
      
      carga: [false],
      ambulancia: [false],
      fechaRecepcion: [''],
      recepcionPor: [''],
      fechaDevolucion: [''],
      devolucionPor: [''],
      
      cantidadPasajeros: [''],
      
      lugaresVisitar: [''],
      actividadRealizar: [''],
      fechaViaje: [''],
      
      observaciones: ['', ValidadoresPersonalizados.longitudMaxima(500)],
      
      responsableDependencia: ['', Validators.required],
      nombreResponsable: ['', Validators.required],
      directorAdministrativo: ['', Validators.required],
      directorCargo: [''],
      cargo: ['']
    });

    this.datosOriginales = this.formulario.value;
  }

  private monitorearCambios(): void {
    this.formulario.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.formularioBase.marcarComoModificado();
        this.guardarBorrador();
      });
  }

  private restaurarFormularioGuardado(): void {
    const borrador = this.storage.obtener<any>('borrador_requisicion');
    if (borrador) {
      this.formulario.patchValue(borrador);
      this.modalService.mostrar('Se han restaurado los datos guardados anteriormente', 'info');
    }
  }

  private guardarBorrador(): void {
    const debounceTime = 2000; // Guardar cada 2 segundos
    setTimeout(() => {
      this.storage.guardar('borrador_requisicion', this.formulario.value);
    }, debounceTime);
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      this.prepararImpresion();
    }
  }

  prepararImpresion(): void {
    try {
      const camposRequeridos = ['fecha', 'dependencia', 'placa', 'conductor'];
      const faltantes = camposRequeridos.filter(campo => !this.formulario.get(campo)?.value);

      if (faltantes.length > 0) {
        this.errorHandler.manejarError(
          `Complete los campos requeridos: ${faltantes.join(', ')}`,
          'Validación de impresión'
        );
        return;
      }

      const ahora = new Date();
      this.fechaImpresion = ahora.toLocaleDateString('es-DO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      this.horaImpresion = this.obtenerHoraActual();
      
      this.modoImpresion = true;
      
      setTimeout(() => {
        window.print();
        setTimeout(() => {
          this.modoImpresion = false;
        }, 100);
      }, 100);
    } catch (error) {
      this.errorHandler.manejarError(error, 'Error al preparar la impresión');
    }
  }

  imprimirFormulario(): void {
    this.prepararImpresion();
  }

  onSubmit(): void {
    try {
      if (!this.formularioBase.validarFormulario(this.formulario)) {
        this.marcarCamposInvalidos();
        return;
      }

      const datosFormulario = {
        ...this.formulario.value,
        numeroEntrada: this.numeroEntrada,
        fechaRegistro: new Date().toISOString(),
        estado: 'pendiente'
      };

      // Guardar localmente primero
      this.guardarEnStorage(datosFormulario);
      this.formularioBase.guardarLocal('requisicion_' + this.numeroEntrada, datosFormulario);
      
      // Crear respaldo
      this.formularioBase.crearRespaldo('requisicion', datosFormulario);

      // Intentar guardar en API si está disponible
      // this.guardarEnApi(datosFormulario);

      this.modalService.exito('Requisición guardada correctamente');
      this.formularioBase.resetearCambios();
      this.formulario.markAsPristine();
      
      console.log('Datos guardados:', datosFormulario);
    } catch (error) {
      this.errorHandler.manejarError(error, 'Error al guardar la requisición');
    }
  }

  private guardarEnApi(datosFormulario: any): void {
    // Descomenta cuando tengas backend
    // this.api.guardarRequisicion(datosFormulario)
    //   .subscribe(
    //     respuesta => {
    //       this.modalService.exito('Requisición guardada en servidor');
    //       this.limpiarFormulario();
    //     },
    //     error => this.errorHandler.manejarError(error)
    //   );
  }

  private guardarEnStorage(datos: any): void {
    let historial = [];
    const historialStorage = localStorage.getItem('historialRequisicionesTransporte');
    
    if (historialStorage) {
      historial = JSON.parse(historialStorage);
    }
    
    historial.unshift(datos);
    
    // Mantener solo los últimos 100 registros
    if (historial.length > 100) {
      historial = historial.slice(0, 100);
    }
    
    localStorage.setItem('historialRequisicionesTransporte', JSON.stringify(historial));
    localStorage.setItem('ultimaRequisicion', JSON.stringify(datos));
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  limpiarFormulario(): void {
    this.modalService.confirmar('¿Está seguro de limpiar todo el formulario?').then((confirmado) => {
      if (confirmado) {
        this.formularioBase.limpiarFormulario(this.formulario);
        this.numeroEntrada = this.generarNumeroEntrada();
        this.storage.eliminar('borrador_requisicion');
        this.modalService.mostrar('Formulario limpiado', 'success');
      }
    });
  }

  generarNumeroEntrada(): string {
    const ahora = new Date();
    const año = ahora.getFullYear().toString().slice(-2);
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const dia = ahora.getDate().toString().padStart(2, '0');
    
    // Contador por día
    const clave = `contador-entrada-${año}${mes}${dia}`;
    let contador = parseInt(localStorage.getItem(clave) || '0') + 1;
    localStorage.setItem(clave, contador.toString());
    
    return `ENTR-${año}${mes}${dia}-${contador.toString().padStart(4, '0')}`;
  }

  // Método para cargar datos de ejemplo (opcional)
  cargarEjemplo(): void {
    const hoy = new Date().toISOString().split('T')[0];
    
    this.formulario.patchValue({
      fecha: hoy,
      hora: '08:00',
      dependencia: 'DEPARTAMENTO DE SALUD PÚBLICA',
      registradoPor: 'JUAN PÉREZ',
      ficha: 'FIC-2023-001',
      placa: 'ABC-1234',
      marca: 'TOYOTA',
      modelo: 'HILUX',
      anio: '2022',
      chassis: 'CHS-123456789',
      conductor: 'CARLOS RODRÍGUEZ',
      gasolina: true,
      valorSolicitado: '2500.00',
      galones: '50.00',
      dop: '50.00',
      incluidoEn: 'asignacion',
      mantenimientoRutinario: 'CAMBIO DE ACEITE Y FILTROS',
      sustitucion: '2 GOMAS TRASERAS',
      reparacion: 'SISTEMA DE FRENOS',
      carga: false,
      ambulancia: false,
      fechaRecepcion: hoy,
      recepcionPor: 'MARÍA GARCÍA',
      fechaDevolucion: hoy,
      devolucionPor: 'PEDRO MARTÍNEZ',
      cantidadPasajeros: 3,
      lugaresVisitar: 'HOSPITAL REGIONAL, CENTRO DE SALUD URBANO',
      actividadRealizar: 'TRANSPORTE DE PERSONAL Y MATERIALES',
      fechaViaje: hoy,
      observaciones: 'URGENTE - NECESARIO PARA EMERGENCIA',
      responsableDependencia: 'DEPARTAMENTO DE LOGÍSTICA',
      nombreResponsable: 'ANA LÓPEZ',
      directorAdministrativo: 'ROBERTO SÁNCHEZ',
      cargo: 'DIRECTOR ADMINISTRATIVO'
    });
  }

  subscripcionModalState(): void {
    this.modalService.modal$.subscribe((estado: ModalState) => {
      this.modalState = estado;
    });
  }

  cargarFirmasGuardadas(): void {
    this.firmaService.obtenerFirmaActual().subscribe(firma => {
      if (firma) {
        if (this.selectorFirmaActivo === 'responsable') {
          this.firmaResponsable = firma;
          this.firmaResponsableId = firma.id;
        } else if (this.selectorFirmaActivo === 'director') {
          this.firmaDirector = firma;
          this.firmaDirectorId = firma.id;
        }
      }
    });
  }

  abrirSelectorFirmaResponsable(): void {
    this.selectorFirmaActivo = 'responsable';
    this.mostrarSelectorFirma = true;
  }

  abrirSelectorFirmaDirector(): void {
    this.selectorFirmaActivo = 'director';
    this.mostrarSelectorFirma = true;
  }

  onFirmaSeleccionada(firma: FirmaDigital): void {
    if (this.selectorFirmaActivo === 'responsable') {
      this.firmaResponsable = firma;
      this.firmaResponsableId = firma.id;
    } else if (this.selectorFirmaActivo === 'director') {
      this.firmaDirector = firma;
      this.firmaDirectorId = firma.id;
    }
    this.mostrarSelectorFirma = false;
    this.selectorFirmaActivo = null;
  }

  cerrarSelectorFirma(): void {
    this.mostrarSelectorFirma = false;
    this.selectorFirmaActivo = null;
  }
}
