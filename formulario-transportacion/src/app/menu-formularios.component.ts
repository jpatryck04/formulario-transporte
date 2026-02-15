import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-menu-formularios',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="menu-container">
      <h1>SISTEMA DE FORMULARIOS DE TRANSPORTACIÓN</h1>
      <div class="menu-opciones">
        <a routerLink="/requisicion-transporte" class="menu-item">
          <h3>REQUISICIÓN DE SERVICIOS DE TRANSPORTACIÓN</h3>
          <p>Formulario para requisición de servicios</p>
        </a>
        <a routerLink="/solicitud-transporte" class="menu-item">
          <h3>SOLICITUD DE SERVICIO DE TRANSPORTE</h3>
          <p>Formulario para solicitud de transporte</p>
        </a>
      </div>
    </div>
  `,
  styles: [`
    .menu-container {
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
      text-align: center;
    }
    h1 {
      color: #1F3C73;
      margin-bottom: 40px;
    }
    .menu-opciones {
      display: flex;
      gap: 20px;
      justify-content: center;
    }
    .menu-item {
      flex: 1;
      padding: 30px;
      background: #f8f9fa;
      border: 2px solid #1F3C73;
      border-radius: 8px;
      text-decoration: none;
      color: inherit;
      transition: all 0.3s ease;
    }
    .menu-item:hover {
      background: #1F3C73;
      color: white;
      transform: translateY(-5px);
      box-shadow: 0 5px 20px rgba(31, 60, 115, 0.3);
    }
    h3 {
      margin: 0 0 10px 0;
    }
    p {
      margin: 0;
      font-size: 14px;
    }
    @media (max-width: 600px) {
      .menu-opciones {
        flex-direction: column;
      }
    }
  `]
})
export class MenuFormulariosComponent {}