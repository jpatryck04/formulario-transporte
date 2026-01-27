import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequisicionTransporteComponent } from './requisicion-transporte/requisicion-transporte.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RequisicionTransporteComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Sistema de Requisiciones de Transporte</h1>
        <p>Gobierno de la República Dominicana - Salud Pública</p>
      </header>
      <main>
        <app-requisicion-transporte></app-requisicion-transporte>
      </main>
      <footer class="app-footer">
        <p>DIRECCIÓN ADMINISTRATIVA Y FINANCIERA - Departamento Administrativo</p>
        <p>© 2024 - Todos los derechos reservados</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
      color: white;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .app-header h1 {
      margin: 0;
      font-size: 1.5rem;
    }
    
    .app-header p {
      margin: 0.5rem 0 0 0;
      opacity: 0.9;
    }
    
    main {
      flex: 1;
      padding: 1rem;
      background-color: #f5f5f5;
    }
    
    .app-footer {
      background-color: #2c3e50;
      color: white;
      text-align: center;
      padding: 1rem;
      font-size: 0.9rem;
    }
    
    .app-footer p {
      margin: 0.2rem 0;
    }
    
    @media (max-width: 768px) {
      .app-header h1 {
        font-size: 1.2rem;
      }
      
      main {
        padding: 0.5rem;
      }
    }
  `]
})
export class AppComponent {
  title = 'formulario-transportacion';
}