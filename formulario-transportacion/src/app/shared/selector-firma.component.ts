import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaDigitalService, FirmaDigital } from './firma-digital.service';

@Component({
  selector: 'app-selector-firma',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="selector-firma-container" *ngIf="mostrarSelector">
      <div class="overlay" (click)="cerrar()"></div>
      
      <div class="modal-selector">
        <div class="modal-header">
          <h2>Seleccionar Firma Digital</h2>
          <button class="btn-cerrar" (click)="cerrar()">×</button>
        </div>

        <div class="modal-body">
          <!-- Pestañas -->
          <div class="pestanas">
            <button 
              class="pestaña" 
              [class.activa]="pestanaActiva === 'firmas'"
              (click)="pestanaActiva = 'firmas'">
              Mis Firmas
            </button>
            <button 
              class="pestaña" 
              [class.activa]="pestanaActiva === 'dibujar'"
              (click)="pestanaActiva = 'dibujar'">
              Dibujar Firma
            </button>
            <button 
              class="pestaña" 
              [class.activa]="pestanaActiva === 'importar'"
              (click)="pestanaActiva = 'importar'">
              Importar Imagen
            </button>
          </div>

          <!-- TAB 1: Mis Firmas -->
          <div class="contenido-pestaña" *ngIf="pestanaActiva === 'firmas'">
            <div *ngIf="firmas.length === 0" class="sin-firmas">
              <p>No tienes firmas digitales guardadas.</p>
            </div>

            <div *ngIf="firmas.length > 0" class="lista-firmas">
              <div class="firmas-grid">
                <div 
                  *ngFor="let firma of firmas" 
                  class="firma-item"
                  (click)="seleccionarFirma(firma.id)"
                >
                  <div class="preview-firma">
                    <img [src]="firma.datos" [alt]="firma.nombre">
                  </div>
                  <div class="info-firma">
                    <p class="nombre-firma">{{ firma.nombre }}</p>
                    <p class="fecha-firma">{{ firma.fecha | date:'dd/MM/yyyy' }}</p>
                  </div>
                  <button 
                    class="btn-eliminar" 
                    (click)="eliminarFirma($event, firma.id)"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: Dibujar Firma -->
          <div class="contenido-pestaña" *ngIf="pestanaActiva === 'dibujar'">
            <div class="canvas-wrapper">
              <canvas 
                #canvasRef
                class="canvas-firma"
                (mousedown)="iniciarFirmaCanvas($event)"
                (mousemove)="dibujarFirmaCanvas($event)"
                (mouseup)="terminarFirmaCanvas()"
                (mouseleave)="terminarFirmaCanvas()"
              ></canvas>
            </div>
            <div class="nombre-firma">
              <label for="nombreFirmaCanvas">Nombre para la firma:</label>
              <input 
                id="nombreFirmaCanvas"
                type="text" 
                [(ngModel)]="nombreFirmaCanvas" 
                placeholder="Ej: Mi Firma"
                class="input-nombre"
              >
            </div>
            <div class="botones-firma">
              <button (click)="limpiarCanvasLocal()" class="btn-limpiar">Limpiar</button>
              <button (click)="guardarFirmaCanvas()" class="btn-guardar" [disabled]="!firmaCapturadaCanvas">
                Guardar Firma
              </button>
            </div>
            <div *ngIf="mensajeExitoCanvas" class="mensaje-exito">
              {{ mensajeExitoCanvas }}
            </div>
          </div>

          <!-- TAB 3: Importar Imagen -->
          <div class="contenido-pestaña" *ngIf="pestanaActiva === 'importar'">
            <div class="zona-carga">
              <div class="zona-carga-contenido">
                <p class="icono-carga">📁</p>
                <p class="titulo-carga">Arrastra una imagen aquí o haz clic</p>
                <p class="subtitulo-carga">Formatos soportados: PNG, JPG, GIF</p>
              </div>
              <input 
                #inputArchivo
                type="file" 
                accept="image/png,image/jpeg,image/gif"
                (change)="cargarImagen($event)"
                class="input-archivo"
              >
            </div>

            <div class="preview-importada" *ngIf="imagenCargada">
              <div class="preview-titulo">Vista Previa:</div>
              <img [src]="imagenCargada" alt="Firma importada" class="imagen-preview">
              <div class="nombre-importada">
                <label for="nombreFirmaImportada">Nombre para la firma:</label>
                <input 
                  id="nombreFirmaImportada"
                  type="text" 
                  [(ngModel)]="nombreFirmaImportada" 
                  placeholder="Ej: Firma Oficial"
                  class="input-nombre"
                >
              </div>
              <div class="botones-importar">
                <button (click)="limpiarImagen()" class="btn-limpiar">Seleccionar Otra</button>
                <button (click)="guardarFirmaImportada()" class="btn-guardar">Guardar Firma</button>
              </div>
              <div *ngIf="mensajeExitoImportar" class="mensaje-exito">
                {{ mensajeExitoImportar }}
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="cerrar()" class="btn-cancelar">Cerrar</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .selector-firma-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .modal-selector {
      position: relative;
      background: white;
      border-radius: 8px;
      box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
      max-width: 700px;
      width: 90%;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eee;
    }

    .modal-header h2 {
      margin: 0;
      color: #333;
      font-size: 20px;
    }

    .btn-cerrar {
      background: none;
      border: none;
      font-size: 28px;
      cursor: pointer;
      color: #999;
      padding: 0;
      width: 30px;
      height: 30px;
    }

    .btn-cerrar:hover {
      color: #333;
    }

    /* PESTAÑAS */
    .pestanas {
      display: flex;
      border-bottom: 2px solid #eee;
      background: #f9f9f9;
      padding: 0 20px;
    }

    .pestaña {
      flex: 1;
      padding: 12px 16px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s ease;
    }

    .pestaña:hover {
      color: #0066cc;
    }

    .pestaña.activa {
      color: #0066cc;
      border-bottom-color: #0066cc;
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .contenido-pestaña {
      animation: fadeIn 0.2s ease-in;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .sin-firmas {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .lista-firmas {
      width: 100%;
    }

    .firmas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 12px;
      margin-bottom: 15px;
    }

    .firma-item {
      border: 2px solid #ddd;
      border-radius: 6px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;
    }

    .firma-item:hover {
      border-color: #0066cc;
      box-shadow: 0 2px 8px rgba(0, 102, 204, 0.2);
    }

    .preview-firma {
      width: 100%;
      height: 100px;
      border: 1px solid #eee;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
      background: #f9f9f9;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preview-firma img {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }

    .info-firma {
      margin-bottom: 8px;
    }

    .nombre-firma {
      margin: 0 0 3px 0;
      font-weight: 600;
      color: #333;
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fecha-firma {
      margin: 0;
      color: #999;
      font-size: 11px;
    }

    .btn-eliminar {
      position: absolute;
      top: 5px;
      right: 5px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 3px 6px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.3s ease;
    }

    .btn-eliminar:hover {
      background: #ff4444;
      color: white;
      border-color: #ff4444;
    }

    /* CANVAS Y ENTRADA */
    .canvas-wrapper {
      border: 2px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 15px;
      background: white;
    }

    .canvas-firma {
      display: block;
      width: 100%;
      height: 250px;
      cursor: crosshair;
      background: white;
      touch-action: none;
    }

    .nombre-firma, .nombre-importada {
      margin-bottom: 12px;
    }

    .nombre-firma label, .nombre-importada label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #333;
      font-size: 13px;
    }

    .input-nombre {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 13px;
      box-sizing: border-box;
    }

    .input-nombre:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 3px rgba(0, 102, 204, 0.3);
    }

    .botones-firma, .botones-importar {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-bottom: 10px;
    }

    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-limpiar {
      background: #f0f0f0;
      color: #333;
    }

    .btn-limpiar:hover {
      background: #e0e0e0;
    }

    .btn-guardar {
      background: #28a745;
      color: white;
    }

    .btn-guardar:hover:not(:disabled) {
      background: #218838;
    }

    .btn-guardar:disabled {
      background: #cccccc;
      cursor: not-allowed;
      opacity: 0.6;
    }

    /* ZONA DE CARGA */
    .zona-carga {
      position: relative;
      border: 3px dashed #0066cc;
      border-radius: 8px;
      padding: 40px 20px;
      text-align: center;
      cursor: pointer;
      background: #f0f7ff;
      transition: all 0.3s ease;
      margin-bottom: 20px;
    }

    .zona-carga:hover {
      background: #e8f3ff;
      border-color: #0052a3;
    }

    .zona-carga-contenido {
      pointer-events: none;
    }

    .icono-carga {
      font-size: 40px;
      margin: 0 0 10px 0;
    }

    .titulo-carga {
      margin: 0 0 5px 0;
      color: #333;
      font-weight: 600;
      font-size: 15px;
    }

    .subtitulo-carga {
      margin: 0;
      color: #999;
      font-size: 12px;
    }

    .input-archivo {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0;
      cursor: pointer;
    }

    .preview-importada {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .preview-titulo {
      font-weight: 600;
      color: #333;
      margin-bottom: 12px;
      font-size: 14px;
    }

    .imagen-preview {
      max-width: 100%;
      max-height: 200px;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin-bottom: 15px;
      display: block;
      margin-left: auto;
      margin-right: auto;
    }

    .mensaje-exito {
      background: #d4edda;
      color: #155724;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      border: 1px solid #c3e6cb;
      font-size: 13px;
      margin-top: 10px;
    }

    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #eee;
      display: flex;
      justify-content: flex-end;
    }

    .btn-cancelar {
      background: #dc3545;
      color: white;
      padding: 10px 20px;
    }

    .btn-cancelar:hover {
      background: #c82333;
    }
  `]
})
export class SelectorFirmaComponent implements OnInit, AfterViewInit {
  @Input() mostrarSelector = false;
  @Output() firmaSeleccionada = new EventEmitter<FirmaDigital>();
  @Output() cerrarSelector = new EventEmitter<void>();
  @ViewChild('canvasRef') canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('inputArchivo') inputArchivo!: ElementRef<HTMLInputElement>;

  firmas: FirmaDigital[] = [];
  pestanaActiva: 'firmas' | 'dibujar' | 'importar' = 'firmas';
  
  // Canvas properties
  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private estaDibujando = false;
  firmaCapturadaCanvas = false;
  nombreFirmaCanvas = '';
  mensajeExitoCanvas = '';

  // Importar properties
  imagenCargada: string | null = null;
  nombreFirmaImportada = '';
  mensajeExitoImportar = '';

  constructor(private firmaService: FirmaDigitalService) {}

  ngOnInit(): void {
    this.cargarFirmas();
  }

  ngAfterViewInit(): void {
    this.inicializarCanvas();
  }

  cargarFirmas(): void {
    this.firmaService.obtenerFirmas().subscribe(firmas => {
      this.firmas = firmas;
    });
  }

  seleccionarFirma(id: string): void {
    const firma = this.firmas.find(f => f.id === id);
    if (firma) {
      this.firmaService.seleccionarFirma(id);
      this.firmaSeleccionada.emit(firma);
      this.cerrar();
    }
  }

  eliminarFirma(event: Event, id: string): void {
    event.stopPropagation();
    if (confirm('¿Estás seguro de que deseas eliminar esta firma?')) {
      this.firmaService.eliminarFirma(id);
      this.cargarFirmas();
    }
  }

  /* CANVAS METHODS */
  private inicializarCanvas(): void {
    if (this.canvasRef) {
      this.canvas = this.canvasRef.nativeElement;
      const ctx = this.canvas.getContext('2d');
      if (ctx) {
        this.ctx = ctx;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      }
    }
  }

  iniciarFirmaCanvas(event: MouseEvent): void {
    this.estaDibujando = true;
    const { offsetX, offsetY } = event;
    this.ctx.beginPath();
    this.ctx.moveTo(offsetX, offsetY);
  }

  dibujarFirmaCanvas(event: MouseEvent): void {
    if (!this.estaDibujando) return;
    const { offsetX, offsetY } = event;
    this.ctx.lineTo(offsetX, offsetY);
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();
    this.firmaCapturadaCanvas = true;
  }

  terminarFirmaCanvas(): void {
    this.estaDibujando = false;
  }

  limpiarCanvasLocal(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.firmaCapturadaCanvas = false;
    this.mensajeExitoCanvas = '';
  }

  guardarFirmaCanvas(): void {
    if (!this.nombreFirmaCanvas.trim()) {
      alert('Por favor ingrese un nombre para la firma');
      return;
    }
    const datosBase64 = this.canvas.toDataURL('image/png');
    this.firmaService.guardarFirma(this.nombreFirmaCanvas, datosBase64);
    this.mensajeExitoCanvas = '✓ Firma guardada correctamente';
    this.nombreFirmaCanvas = '';
    this.limpiarCanvasLocal();
    this.cargarFirmas();
    setTimeout(() => { this.mensajeExitoCanvas = ''; }, 2000);
  }

  /* IMPORTAR MÉTODOS */
  cargarImagen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0];
    
    if (!archivo) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.imagenCargada = e.target?.result as string;
    };
    reader.readAsDataURL(archivo);
  }

  limpiarImagen(): void {
    this.imagenCargada = null;
    this.nombreFirmaImportada = '';
    this.mensajeExitoImportar = '';
    if (this.inputArchivo) {
      this.inputArchivo.nativeElement.value = '';
    }
  }

  guardarFirmaImportada(): void {
    if (!this.nombreFirmaImportada.trim()) {
      alert('Por favor ingrese un nombre para la firma');
      return;
    }
    if (!this.imagenCargada) {
      alert('Por favor cargue una imagen');
      return;
    }
    this.firmaService.guardarFirma(this.nombreFirmaImportada, this.imagenCargada);
    this.mensajeExitoImportar = '✓ Firma importada correctamente';
    this.cargarFirmas();
    setTimeout(() => {
      this.limpiarImagen();
      this.mensajeExitoImportar = '';
    }, 2000);
  }

  cerrar(): void {
    this.cerrarSelector.emit();
  }
}

