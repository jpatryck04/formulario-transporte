import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal.component';
import { ModalService, ModalState } from '../shared/modal.service';
import { SelectorFirmaComponent } from '../shared/selector-firma.component';
import { FirmaDigitalService, FirmaDigital } from '../shared/firma-digital.service';

@Component({
  selector: 'app-requisicion-transporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent, SelectorFirmaComponent],
  templateUrl: './requisicion-transporte.component.html',
  styleUrls: ['./requisicion-transporte.component.css']
})
export class RequisicionTransporteComponent implements OnInit {
  formulario!: FormGroup;
  modoImpresion = false;
  modalState: ModalState | null = null;
  mostrarSelectorFirma = false;
  firmaResponsableId: string | null = null;
  firmaDirectorId: string | null = null;
  firmaResponsable: FirmaDigital | null = null;
  firmaDirector: FirmaDigital | null = null;
  registradoPor = '';
  
  // Módulo de entrada
  numeroEntrada = this.generarNumeroEntrada();
  fechaActual = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  horaActual = this.obtenerHoraActual();
  
  // Impresión
  fechaImpresion = '';
  horaImpresion = '';
  
  private intervaloHora: any;
  selectorFirmaActivo: 'responsable' | 'director' | null = null;

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService,
    private firmaService: FirmaDigitalService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.iniciarActualizacionHora();
    this.subscripcionModalState();
    this.cargarFirmasGuardadas();
  }

  ngOnDestroy(): void {
    if (this.intervaloHora) {
      clearInterval(this.intervaloHora);
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
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      dependencia: ['', Validators.required],
      registradoPor: ['', Validators.required],
      
      ficha: [''],
      placa: ['', Validators.required],
      marca: [''],
      modelo: [''],
      anio: [''],
      chassis: [''],
      conductor: ['', Validators.required],
      
      gasolina: [false],
      gasOil: [false],
      valorSolicitado: [''],
      galones: [''],
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
      
      observaciones: [''],
      
      responsableDependencia: ['', Validators.required],
      nombreResponsable: ['', Validators.required],
      directorAdministrativo: ['', Validators.required],
      directorCargo: [''],
      cargo: ['']
    });
  }

  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      this.prepararImpresion();
    }
  }

  prepararImpresion(): void {
    const camposRequeridos = ['fecha', 'dependencia', 'placa', 'conductor'];
    const faltantes = camposRequeridos.filter(campo => !this.formulario.get(campo)?.value);

    if (faltantes.length > 0) {
      alert(`Complete los campos requeridos: ${faltantes.join(', ')}`);
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
  }

  imprimirFormulario(): void {
    this.prepararImpresion();
  }

  onSubmit(): void {
    if (this.formulario.valid) {
      const datosFormulario = {
        ...this.formulario.value,
        numeroEntrada: this.numeroEntrada,
        fechaRegistro: new Date().toISOString(),
        estado: 'pendiente'
      };

      this.guardarEnStorage(datosFormulario);
      
      alert('Requisición guardada correctamente');
      console.log('Datos guardados:', datosFormulario);
    } else {
      this.marcarCamposInvalidos();
      alert('Complete todos los campos requeridos');
    }
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
    if (confirm('¿Está seguro de limpiar todo el formulario?')) {
      this.formulario.reset();
      this.numeroEntrada = this.generarNumeroEntrada();
    }
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
