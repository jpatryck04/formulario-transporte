import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ModalComponent } from '../shared/modal.component';
import { ModalService, ModalState } from '../shared/modal.service';
import { SelectorFirmaComponent } from '../shared/selector-firma.component';
import { FirmaDigitalService, FirmaDigital } from '../shared/firma-digital.service';

@Component({
  selector: 'app-solicitud-transporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ModalComponent, SelectorFirmaComponent],
  templateUrl: './solicitud-transporte.component.html',
  styleUrls: ['./solicitud-transporte.component.css']
})
export class SolicitudTransporteComponent implements OnInit {
  formulario!: FormGroup;
  modoImpresion = false;
  modalState: ModalState | null = null;
  mostrarSelectorFirma = false;
  
  // Variables para firmas
  firmaResponsable: FirmaDigital | null = null;
  firmaDirector: FirmaDigital | null = null;
  
  // ID de solicitud
  idSolicitud = this.generarIdSolicitud();
  fechaActual = new Date().toLocaleDateString('es-DO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  // Impresión
  fechaImpresion = '';
  horaImpresion = '';
  
  private selectorFirmaActivo: 'responsable' | 'director' | null = null;

  constructor(
    private fb: FormBuilder,
    public modalService: ModalService,
    private firmaService: FirmaDigitalService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.subscripcionModalState();
    this.cargarFirmasGuardadas();
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      fechaSolicitud: [this.fechaActual, Validators.required],
      dependencia: ['', Validators.required],
      tipoServicio: ['', Validators.required],
      cantidadPersonas: ['', [Validators.required, Validators.min(1)]],
      
      fechaSalida: ['', Validators.required],
      horaSalida: ['', Validators.required],
      puntoSalida: ['', Validators.required],
      
      fechaLlegada: ['', Validators.required],
      horaLlegada: ['', Validators.required],
      puntoLlegada: ['', Validators.required],
      
      lugaresVisitar: ['', Validators.required],
      trabajoRealizar: ['', Validators.required],
      observaciones: [''],
      
      // Firmas
      nombreResponsable: ['', Validators.required],
      cargoResponsable: ['', Validators.required],
      autorizadoPor: ['', Validators.required],
      sello1: [''],
      sello2: [''],
      directorAdministrativo: ['', Validators.required]
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
    const camposRequeridos = ['dependencia', 'tipoServicio', 'fechaSalida', 'puntoSalida'];
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
  }

  imprimirFormulario(): void {
    this.prepararImpresion();
  }

  onSubmit(): void {
    if (this.formulario.valid) {
      const datosFormulario = {
        ...this.formulario.value,
        idSolicitud: this.idSolicitud,
        fechaRegistro: new Date().toISOString(),
        estado: 'pendiente'
      };

      this.guardarEnStorage(datosFormulario);
      
      alert('Solicitud guardada correctamente');
      console.log('Datos guardados:', datosFormulario);
    } else {
      this.marcarCamposInvalidos();
      alert('Complete todos los campos requeridos');
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
    if (confirm('¿Está seguro de limpiar todo el formulario?')) {
      this.formulario.reset();
      this.formulario.patchValue({ fechaSolicitud: this.fechaActual });
      this.idSolicitud = this.generarIdSolicitud();
      this.firmaResponsable = null;
      this.firmaDirector = null;
    }
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