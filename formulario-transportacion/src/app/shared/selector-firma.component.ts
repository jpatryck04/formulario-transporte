import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirmaDigitalService, FirmaDigital } from './firma-digital.service';

@Component({
  selector: 'app-selector-firma',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="selector-firma-container" *ngIf="mostrarSelector">
      <div class="overlay" (click)="cerrar()"></div>
      
      <div class="modal-selector">
        <div class="modal-header">
          <h2>Seleccionar Firma Digital</h2>
          <button class="btn-cerrar" (click)="cerrar()">×</button>
        </div>

        <div class="modal-body">
          <div *ngIf="firmas.length === 0" class="sin-firmas">
            <p>No tienes firmas digitales guardadas.</p>
            <button (click)="abrirCapturador()" class="btn-nueva-firma">
              Crear Nueva Firma Digital
            </button>
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

            <button (click)="abrirCapturador()" class="btn-nueva-firma-secundario">
              + Agregar Nueva Firma Digital
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button (click)="cerrar()" class="btn-cancelar">Cancelar</button>
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
      max-width: 600px;
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
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-cerrar:hover {
      color: #333;
    }

    .modal-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .sin-firmas {
      text-align: center;
      padding: 40px 20px;
    }

    .sin-firmas p {
      color: #666;
      margin-bottom: 20px;
      font-size: 16px;
    }

    .lista-firmas {
      width: 100%;
    }

    .firmas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .firma-item {
      border: 2px solid #ddd;
      border-radius: 6px;
      padding: 12px;
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
      height: 120px;
      border: 1px solid #eee;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 10px;
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
      margin-bottom: 10px;
    }

    .nombre-firma {
      margin: 0 0 5px 0;
      font-weight: 600;
      color: #333;
      font-size: 14px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .fecha-firma {
      margin: 0;
      color: #999;
      font-size: 12px;
    }

    .btn-eliminar {
      position: absolute;
      top: 8px;
      right: 8px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 4px 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s ease;
    }

    .btn-eliminar:hover {
      background: #ff4444;
      color: white;
      border-color: #ff4444;
    }

    .btn-nueva-firma {
      background: #0066cc;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-nueva-firma:hover {
      background: #0052a3;
    }

    .btn-nueva-firma-secundario {
      width: 100%;
      background: #f0f0f0;
      color: #333;
      padding: 10px;
      border: 1px dashed #0066cc;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-nueva-firma-secundario:hover {
      background: #e8f0ff;
      border-style: solid;
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
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .btn-cancelar:hover {
      background: #c82333;
    }
  `]
})
export class SelectorFirmaComponent implements OnInit {
  @Input() mostrarSelector = false;
  @Output() firmaSeleccionada = new EventEmitter<FirmaDigital>();
  @Output() cerrarSelector = new EventEmitter<void>();

  firmas: FirmaDigital[] = [];
  mostrarCapturador = false;

  constructor(private firmaService: FirmaDigitalService) {}

  ngOnInit(): void {
    this.cargarFirmas();
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

  abrirCapturador(): void {
    // Abrir en nueva ventana o modal
    const ventana = window.open('', '_blank', 'width=700,height=600');
    if (ventana) {
      ventana.document.write(`
        <html>
          <head>
            <title>Capturador de Firma Digital</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
              canvas { border: 2px solid #ddd; display: block; margin: 20px auto; width: 100%; max-width: 600px; height: 300px; background: white; cursor: crosshair; }
            </style>
          </head>
          <body>
            <h2 style="text-align: center;">Capturar Firma Digital</h2>
            <canvas id="canvas"></canvas>
            <div style="text-align: center; margin-bottom: 20px;">
              <label>Nombre: <input type="text" id="nombre" placeholder="Mi Firma" style="padding: 5px; margin-left: 10px;"></label>
            </div>
            <div style="text-align: center; display: flex; gap: 10px; justify-content: center;">
              <button onclick="limpiar()" style="padding: 10px 20px; cursor: pointer;">Limpiar</button>
              <button onclick="guardar()" style="padding: 10px 20px; background: green; color: white; cursor: pointer;">Guardar</button>
              <button onclick="window.close()" style="padding: 10px 20px; background: red; color: white; cursor: pointer;">Cerrar</button>
            </div>
            <script>
              const canvas = document.getElementById('canvas');
              const ctx = canvas.getContext('2d');
              let drawing = false;

              canvas.addEventListener('mousedown', () => drawing = true);
              canvas.addEventListener('mousemove', (e) => {
                if (!drawing) return;
                const rect = canvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                ctx.lineTo(x, y);
                ctx.stroke();
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
              });
              canvas.addEventListener('mouseup', () => drawing = false);
              canvas.addEventListener('mouseleave', () => drawing = false);

              canvas.width = canvas.offsetWidth;
              canvas.height = canvas.offsetHeight;
              ctx.fillStyle = 'white';
              ctx.fillRect(0, 0, canvas.width, canvas.height);

              function limpiar() {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
              }

              function guardar() {
                const nombre = document.getElementById('nombre').value;
                if (!nombre) { alert('Ingrese un nombre'); return; }
                const datos = canvas.toDataURL();
                window.opener.postMessage({ tipo: 'firmaGuardada', nombre, datos }, '*');
                window.close();
              }
            </script>
          </body>
        </html>
      `);
    }

    // Escuchar el mensaje de la ventana
    window.addEventListener('message', (event) => {
      if (event.data.tipo === 'firmaGuardada') {
        this.firmaService.guardarFirma(event.data.nombre, event.data.datos);
        this.cargarFirmas();
      }
    });
  }

  cerrar(): void {
    this.cerrarSelector.emit();
  }
}
