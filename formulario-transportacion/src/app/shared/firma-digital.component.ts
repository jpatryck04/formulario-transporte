import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirmaDigitalService } from './firma-digital.service';

@Component({
  selector: 'app-firma-digital',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="firma-container">
      <h3>Capturar Firma Digital</h3>
      
      <div class="canvas-wrapper">
        <canvas 
          #canvas 
          class="canvas-firma"
          (mousedown)="iniciarFirma($event)"
          (mousemove)="dibujarFirma($event)"
          (mouseup)="terminarFirma()"
          (mouseleave)="terminarFirma()"
        ></canvas>
      </div>

      <div class="nombre-firma">
        <label for="nombreFirma">Nombre para guardar la firma:</label>
        <input 
          id="nombreFirma"
          type="text" 
          [(ngModel)]="nombreFirma" 
          placeholder="Ej: Mi Firma Oficial"
          class="input-nombre"
        >
      </div>

      <div class="botones-firma">
        <button (click)="limpiarCanvas()" class="btn-limpiar">Limpiar</button>
        <button (click)="guardarFirma()" class="btn-guardar" [disabled]="!firmaCapturada">Guardar Firma</button>
        <button (click)="cerrar()" class="btn-cancelar">Cancelar</button>
      </div>

      <div *ngIf="mensajeExito" class="mensaje-exito">
        {{ mensajeExito }}
      </div>
    </div>
  `,
  styles: [`
    .firma-container {
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 0 auto;
    }

    h3 {
      margin-top: 0;
      color: #333;
      text-align: center;
    }

    .canvas-wrapper {
      border: 2px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 20px;
      background: #fff;
    }

    .canvas-firma {
      display: block;
      width: 100%;
      height: 250px;
      cursor: crosshair;
      background: white;
      touch-action: none;
    }

    .nombre-firma {
      margin-bottom: 20px;
    }

    .nombre-firma label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #333;
    }

    .input-nombre {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      box-sizing: border-box;
    }

    .input-nombre:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 3px rgba(0, 102, 204, 0.3);
    }

    .botones-firma {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-bottom: 15px;
    }

    button {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
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

    .btn-cancelar {
      background: #dc3545;
      color: white;
    }

    .btn-cancelar:hover {
      background: #c82333;
    }

    .mensaje-exito {
      background: #d4edda;
      color: #155724;
      padding: 10px;
      border-radius: 4px;
      text-align: center;
      border: 1px solid #c3e6cb;
    }
  `]
})
export class FirmaDigitalComponent implements OnInit {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private estaDibujando = false;
  firmaCapturada = false;
  nombreFirma = '';
  mensajeExito = '';

  constructor(private firmaService: FirmaDigitalService) {}

  ngOnInit(): void {
    this.inicializarCanvas();
  }

  private inicializarCanvas(): void {
    this.canvas = this.canvasRef.nativeElement;
    const ctx = this.canvas.getContext('2d');
    if (ctx) {
      this.ctx = ctx;
      // Establecer tamaño real del canvas
      const rect = this.canvas.getBoundingClientRect();
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
      
      // Llenar con blanco
      this.ctx.fillStyle = 'white';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  iniciarFirma(event: MouseEvent): void {
    this.estaDibujando = true;
    const { offsetX, offsetY } = event;
    this.ctx.beginPath();
    this.ctx.moveTo(offsetX, offsetY);
  }

  dibujarFirma(event: MouseEvent): void {
    if (!this.estaDibujando) return;

    const { offsetX, offsetY } = event;
    this.ctx.lineTo(offsetX, offsetY);
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.stroke();

    this.firmaCapturada = true;
  }

  terminarFirma(): void {
    this.estaDibujando = false;
  }

  limpiarCanvas(): void {
    this.ctx.fillStyle = 'white';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.firmaCapturada = false;
    this.mensajeExito = '';
  }

  guardarFirma(): void {
    if (!this.nombreFirma.trim()) {
      alert('Por favor ingrese un nombre para la firma');
      return;
    }

    if (!this.firmaCapturada) {
      alert('Por favor capture una firma primero');
      return;
    }

    const datosBase64 = this.canvas.toDataURL('image/png');
    this.firmaService.guardarFirma(this.nombreFirma, datosBase64);
    
    this.mensajeExito = '✓ Firma guardada correctamente';
    this.nombreFirma = '';
    this.limpiarCanvas();

    // Limpiar mensaje después de 2 segundos
    setTimeout(() => {
      this.mensajeExito = '';
    }, 2000);
  }

  cerrar(): void {
    // Emitir evento o cerrar modal
    window.location.reload(); // Recarga para refrescar la lista de firmas
  }
}
