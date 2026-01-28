import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-requisicion-transporte',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './requisicion-transporte.component.html',
  styleUrls: ['./requisicion-transporte.component.css']
})
export class RequisicionTransporteComponent implements OnInit {
  @ViewChild('firmaResponsable') firmaResponsableCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('firmaDirector') firmaDirectorCanvas!: ElementRef<HTMLCanvasElement>;
  
  formulario!: FormGroup;
  mostrarVistaPrevia = false;
  estadoFormulario = 'Pendiente';
  modoImpresion = false;
  lineasPasajeros = '';
  
  numeroEntrada = this.generarNumeroEntrada();
  fechaActual = new Date().toLocaleDateString();
  horaActual = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  fechaImpresion = '';
  horaImpresion = '';
  
  private ctxResponsable: CanvasRenderingContext2D | null = null;
  private ctxDirector: CanvasRenderingContext2D | null = null;
  private isDrawing = false;
  private currentCtx: CanvasRenderingContext2D | null = null;
  
  // Escuchar Ctrl+P
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      this.imprimirFormulario();
    }
  }
  
  constructor(private fb: FormBuilder) { }
  
  ngOnInit(): void {
    this.inicializarFormulario();
    
    // Escuchar cambios en la cantidad de pasajeros para actualizar las líneas
    this.formulario.get('cantidadPasajeros')?.valueChanges.subscribe((valor) => {
      this.actualizarLineasPasajeros(valor);
    });
  }
  
  ngAfterViewInit(): void {
    this.inicializarCanvas();
  }
  
  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      // Datos básicos
      fecha: ['', Validators.required],
      hora: ['', Validators.required],
      dependencia: ['', Validators.required],
      registradoPor: ['', Validators.required],
      
      // Datos del vehículo
      ficha: [''],
      placa: ['', Validators.required],
      marca: [''],
      modelo: [''],
      anio: [''],
      chassis: [''],
      conductor: ['', Validators.required],
      
      // Combustible
      gasolina: [false],
      gasOil: [false],
      valorSolicitado: [''],
      galones: [''],
      dop: [''],
      incluidoEn: [''],
      
      // Mantenimiento
      mantenimientoRutinario: [''],
      sustitucion: [''],
      reparacion: [''],
      
      // Tipo vehículo
      carga: [false],
      ambulancia: [false],
      fechaRecepcion: [''],
      recepcionPor: [''],
      fechaDevolucion: [''],
      devolucionPor: [''],
      
      // Pasajeros
      cantidadPasajeros: [''],
      
      // Viaje
      lugaresVisitar: [''],
      actividadRealizar: [''],
      fechaViaje: [''],
      
      // Observaciones
      observaciones: [''],
      
      // Responsables
      responsableDependencia: ['', Validators.required],
      nombreResponsable: ['', Validators.required],
      directorAdministrativo: ['', Validators.required],
      cargo: ['']
    });
  }
  
  // Método para actualizar líneas según cantidad de pasajeros (para vista normal)
  actualizarLineasPasajeros(cantidad: number): void {
    if (!cantidad || cantidad <= 0) {
      this.lineasPasajeros = '______';
      return;
    }
    
    // Crear una línea por cada pasajero
    let lineas = '';
    for (let i = 0; i < cantidad; i++) {
      lineas += '______';
      if (i < cantidad - 1) lineas += ' ';
    }
    this.lineasPasajeros = lineas;
  }
  
  // Método para generar líneas según cantidad de pasajeros (para vista impresión)
  generarLineasPasajeros(): string {
    const cantidad = this.formulario.value.cantidadPasajeros;
    if (!cantidad || cantidad <= 0) return '______';
    
    // Crear una línea por cada pasajero
    let lineas = '';
    for (let i = 0; i < cantidad; i++) {
      lineas += '______';
      if (i < cantidad - 1) lineas += ' ';
    }
    return lineas;
  }
  
  // Este método también puede ser usado como alias (corrige el error)
  generarLineasPasajerosImpresion(): string {
    return this.generarLineasPasajeros();
  }
  
  // Método mejorado para imprimir
  imprimirFormulario(): void {
    if (!this.formulario.valid) {
      alert('Complete todos los campos requeridos antes de imprimir');
      return;
    }
    
    // Actualizar fecha y hora de impresión
    const ahora = new Date();
    this.fechaImpresion = ahora.toLocaleDateString();
    this.horaImpresion = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Activar modo impresión
    this.modoImpresion = true;
    
    // Esperar un momento para que se renderice la vista de impresión
    setTimeout(() => {
      // Abrir el diálogo de impresión
      window.print();
      
      // Volver al modo normal después de imprimir
      setTimeout(() => {
        this.modoImpresion = false;
      }, 100);
    }, 100);
  }
  
  // También se puede llamar desde el botón
  onImprimirClick(): void {
    this.imprimirFormulario();
  }
  
  inicializarCanvas(): void {
    // Canvas para firma del responsable
    const canvasResponsable = this.firmaResponsableCanvas.nativeElement;
    this.ctxResponsable = canvasResponsable.getContext('2d');
    if (this.ctxResponsable) {
      this.configurarCanvas(canvasResponsable, this.ctxResponsable);
    }
    
    // Canvas para firma del director
    const canvasDirector = this.firmaDirectorCanvas.nativeElement;
    this.ctxDirector = canvasDirector.getContext('2d');
    if (this.ctxDirector) {
      this.configurarCanvas(canvasDirector, this.ctxDirector);
    }
  }
  
  configurarCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const startDrawing = (e: MouseEvent) => this.startDrawing(e, ctx);
    const draw = (e: MouseEvent) => this.draw(e, canvas, ctx);
    const stopDrawing = () => this.stopDrawing();
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Para dispositivos táctiles
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      canvas.dispatchEvent(mouseEvent);
    });
    
    canvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      const mouseEvent = new MouseEvent('mouseup');
      canvas.dispatchEvent(mouseEvent);
    });
  }
  
  startDrawing(e: MouseEvent, ctx: CanvasRenderingContext2D): void {
    this.isDrawing = true;
    this.currentCtx = ctx;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  }
  
  draw(e: MouseEvent, canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    if (!this.isDrawing || this.currentCtx !== ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  }
  
  stopDrawing(): void {
    this.isDrawing = false;
    if (this.currentCtx) {
      this.currentCtx.closePath();
    }
  }
  
  limpiarFirma(tipo: string): void {
    if (tipo === 'responsable' && this.ctxResponsable) {
      this.ctxResponsable.clearRect(0, 0, 
        this.firmaResponsableCanvas.nativeElement.width, 
        this.firmaResponsableCanvas.nativeElement.height);
      this.ctxResponsable.fillStyle = '#ffffff';
      this.ctxResponsable.fillRect(0, 0, 
        this.firmaResponsableCanvas.nativeElement.width, 
        this.firmaResponsableCanvas.nativeElement.height);
    } else if (tipo === 'director' && this.ctxDirector) {
      this.ctxDirector.clearRect(0, 0, 
        this.firmaDirectorCanvas.nativeElement.width, 
        this.firmaDirectorCanvas.nativeElement.height);
      this.ctxDirector.fillStyle = '#ffffff';
      this.ctxDirector.fillRect(0, 0, 
        this.firmaDirectorCanvas.nativeElement.width, 
        this.firmaDirectorCanvas.nativeElement.height);
    }
  }
  
  obtenerFirmaComoBase64(canvas: HTMLCanvasElement): string {
    return canvas.toDataURL('image/png');
  }
  
  onSubmit(): void {
    if (this.formulario.valid) {
      // Obtener firmas como imágenes
      const firmaResponsableBase64 = this.obtenerFirmaComoBase64(this.firmaResponsableCanvas.nativeElement);
      const firmaDirectorBase64 = this.obtenerFirmaComoBase64(this.firmaDirectorCanvas.nativeElement);
      
      const datosCompletos = {
        ...this.formulario.value,
        firmaResponsable: firmaResponsableBase64,
        firmaDirector: firmaDirectorBase64,
        fechaCreacion: new Date().toISOString(),
        estado: 'completado'
      };
      
      console.log('Formulario enviado:', datosCompletos);
      
      // Guardar en localStorage
      this.guardarEnHistorial(datosCompletos);
      
      alert('Requisición guardada exitosamente');
      
      this.estadoFormulario = 'Completado';
      this.mostrarVistaPrevia = true;
    } else {
      alert('Por favor, complete los campos requeridos');
      this.marcarCamposInvalidos();
    }
  }
  
  guardarEnHistorial(datos: any): void {
    let historial: any[] = [];
    const historialStr = localStorage.getItem('historialRequisiciones');
    
    if (historialStr) {
      historial = JSON.parse(historialStr);
    }
    
    historial.push(datos);
    localStorage.setItem('historialRequisiciones', JSON.stringify(historial));
    localStorage.setItem('ultimaRequisicion', JSON.stringify(datos));
  }
  
  marcarCamposInvalidos(): void {
    Object.keys(this.formulario.controls).forEach(key => {
      const control = this.formulario.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }
  
  generarPDF(): void {
    // Implementación básica - puedes expandir con jsPDF más tarde
    const contenido = `
      REQUISICIÓN DE SERVICIOS DE TRANSPORTACIÓN
      ==========================================
      Fecha: ${this.formulario.value.fecha}
      Dependencia: ${this.formulario.value.dependencia}
      Vehículo: ${this.formulario.value.marca} ${this.formulario.value.modelo}
      Placa: ${this.formulario.value.placa}
      Conductor: ${this.formulario.value.conductor}
    `;
    
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `requisicion-${this.formulario.value.placa}-${this.formulario.value.fecha}.txt`;
    a.click();
    
    alert('Se ha generado un archivo de texto. Implementa jsPDF para PDF completo.');
  }
  
  limpiarFormulario(): void {
    if (confirm('¿Está seguro de limpiar todo el formulario?')) {
      this.formulario.reset();
      this.limpiarFirma('responsable');
      this.limpiarFirma('director');
      this.mostrarVistaPrevia = false;
      this.estadoFormulario = 'Pendiente';
      this.lineasPasajeros = '';
    }
  }
  
  // Método para autocompletar con datos de ejemplo
  autocompletarEjemplo(): void {
    this.formulario.patchValue({
      fecha: new Date().toISOString().split('T')[0],
      hora: '14:30',
      dependencia: 'Departamento de Salud Pública',
      registradoPor: 'Juan Pérez',
      placa: 'ABC-1234',
      marca: 'Toyota',
      modelo: 'Hilux',
      anio: '2022',
      conductor: 'Juan Pérez',
      gasolina: true,
      valorSolicitado: 2500,
      galones: 50,
      responsableDependencia: 'María García',
      nombreResponsable: 'María García',
      directorAdministrativo: 'Carlos Rodríguez',
      cargo: 'Jefe de Departamento',
      cantidadPasajeros: 3
    });
    
    // Actualizar líneas de pasajeros
    this.actualizarLineasPasajeros(3);
  }
  
  generarNumeroEntrada(): string {
    const ultimoNumero = localStorage.getItem('ultimoNumeroEntrada') || '0';
    const nuevoNumero = parseInt(ultimoNumero) + 1;
    localStorage.setItem('ultimoNumeroEntrada', nuevoNumero.toString());
    return `ENTR-${nuevoNumero.toString().padStart(4, '0')}`;
  }
}