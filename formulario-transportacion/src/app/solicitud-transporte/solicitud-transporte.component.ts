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
  selector: 'app-solicitud-transporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent, SelectorFirmaComponent],
  templateUrl: './solicitud-transporte.component.html',
  styleUrls: ['./solicitud-transporte.component.css']
})
export class SolicitudTransporteComponent implements OnInit, OnDestroy, ComponenteConCambios {
  formulario!: FormGroup;
  modoImpresion = false;
  modalState: ModalState | null = null;
  mostrarSelectorFirma = false;
  cargando$!: Observable<boolean>;
  cambios$!: Observable<boolean>;
  
  firmaResponsable: FirmaDigital | null = null;
  firmaDirector: FirmaDigital | null = null;
  
  idSolicitud = this.generarIdSolicitud();
  fechaActual = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  fechaImpresion = '';
  horaImpresion = '';
  
  private selectorFirmaActivo: 'responsable' | 'director' | null = null;
  private destroy$ = new Subject<void>();
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
      this.subscripcionModalState();
      this.cargarFirmasGuardadas();
      this.monitorearCambios();
      this.restaurarFormularioGuardado();
    } catch (error) {
      this.errorHandler.manejarError(error, 'Error al inicializar el formulario');
    }
  }

  ngOnDestroy(): void {
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

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      fechaSolicitud: [this.fechaActual, Validators.required],
      dependencia: ['', Validators.required],
      tipoServicio: ['', Validators.required],
      cantidadPersonas: ['', [Validators.required, Validators.min(1), ValidadoresPersonalizados.numeroPositivo()]],
      
      fechaSalida: ['', [Validators.required, ValidadoresPersonalizados.fechaNoFutura()]],
      horaSalida: ['', Validators.required],
      puntoSalida: ['', Validators.required],
      
      fechaLlegada: ['', [Validators.required, ValidadoresPersonalizados.fechaLlegadaValida('fechaSalida')]],
      horaLlegada: ['', [Validators.required, ValidadoresPersonalizados.horaLlegadaValida('fechaSalida', 'horaSalida', 'fechaLlegada')]],
      puntoLlegada: ['', Validators.required],
      
      lugaresVisitar: ['', Validators.required],
      trabajoRealizar: ['', Validators.required],
      observaciones: ['', ValidadoresPersonalizados.longitudMaxima(500)],
      
      nombreResponsable: ['', Validators.required],
      cargoResponsable: ['', Validators.required],
      autorizadoPor: ['', Validators.required],
      sello1: [''],
      sello2: [''],
      directorAdministrativo: ['', Validators.required]
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
    const borrador = this.storage.obtener<any>('borrador_solicitud');
    if (borrador) {
      // Verificar si realmente hay datos significativos (no solo campos vacíos o por defecto)
      const camposImportantes = ['dependencia', 'tipoServicio', 'puntoSalida', 'lugaresVisitar', 'trabajoRealizar'];
      const tieneValoresSignificativos = camposImportantes.some(campo => 
        borrador[campo] && borrador[campo].toString().trim() !== ''
      );
      
      if (tieneValoresSignificativos) {
        this.formulario.patchValue(borrador);
        this.modalService.mostrar('Se han restaurado los datos guardados anteriormente', 'info');
      }
    }
  }

  private guardarBorrador(): void {
    const debounceTime = 2000;
    setTimeout(() => {
      const datosFormulario = this.formulario.value;
      // Solo guardar borrador si hay datos significativos
      const camposImportantes = ['dependencia', 'tipoServicio', 'puntoSalida', 'lugaresVisitar', 'trabajoRealizar'];
      const tieneValoresSignificativos = camposImportantes.some(campo => 
        datosFormulario[campo] && datosFormulario[campo].toString().trim() !== ''
      );
      
      if (tieneValoresSignificativos) {
        this.storage.guardar('borrador_solicitud', datosFormulario);
      }
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
      const camposRequeridos = ['dependencia', 'tipoServicio', 'fechaSalida', 'puntoSalida'];
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
      this.horaImpresion = ahora.toLocaleTimeString('es-DO', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
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
        idSolicitud: this.idSolicitud,
        fechaRegistro: new Date().toISOString(),
        estado: 'pendiente'
      };

      this.guardarEnStorage(datosFormulario);
      this.formularioBase.guardarLocal('solicitud_' + this.idSolicitud, datosFormulario);
      
      this.formularioBase.crearRespaldo('solicitud', datosFormulario);

      this.modalService.exito('Solicitud guardada correctamente');
      this.formularioBase.resetearCambios();
      this.formulario.markAsPristine();
      
      console.log('Datos guardados:', datosFormulario);
    } catch (error) {
      this.errorHandler.manejarError(error, 'Error al guardar la solicitud');
    }
  }

  private guardarEnStorage(datos: any): void {
    let historial = [];
    const historialStorage = localStorage.getItem('historialSolicitudesTransporte');
    
    if (historialStorage) {
      historial = JSON.parse(historialStorage);
    }
    
    historial.unshift(datos);
    
    if (historial.length > 100) {
      historial = historial.slice(0, 100);
    }
    
    localStorage.setItem('historialSolicitudesTransporte', JSON.stringify(historial));
    localStorage.setItem('ultimaSolicitud', JSON.stringify(datos));
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
        this.formulario.patchValue({ fechaSolicitud: this.fechaActual });
        this.idSolicitud = this.generarIdSolicitud();
        this.firmaResponsable = null;
        this.firmaDirector = null;
        this.storage.eliminar('borrador_solicitud');
        this.modalService.mostrar('Formulario limpiado', 'success');
      }
    });
  }

  generarIdSolicitud(): string {
    const ahora = new Date();
    const año = ahora.getFullYear().toString().slice(-2);
    const mes = (ahora.getMonth() + 1).toString().padStart(2, '0');
    const dia = ahora.getDate().toString().padStart(2, '0');
    
    const clave = `contador-solicitud-${año}${mes}${dia}`;
    let contador = parseInt(localStorage.getItem(clave) || '0') + 1;
    localStorage.setItem(clave, contador.toString());
    
    return `SOL-${año}${mes}${dia}-${contador.toString().padStart(4, '0')}`;
  }

  // MÉTODOS PARA FIRMAS
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
        } else if (this.selectorFirmaActivo === 'director') {
          this.firmaDirector = firma;
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
    } else if (this.selectorFirmaActivo === 'director') {
      this.firmaDirector = firma;
    }
    this.mostrarSelectorFirma = false;
    this.selectorFirmaActivo = null;
  }

  cerrarSelectorFirma(): void {
    this.mostrarSelectorFirma = false;
    this.selectorFirmaActivo = null;
  }
}