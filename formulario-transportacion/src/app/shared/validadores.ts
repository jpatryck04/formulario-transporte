import { AbstractControl, ValidationErrors, ValidatorFn, AsyncValidatorFn } from '@angular/forms';

export class ValidadoresPersonalizados {
  
  // Validador para placa vehicular (formato: XXX-0000 o similar)
  static placaVehiculo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const placa = control.value.toUpperCase();
      // Acepta formatos como ABC-1234 o ABC1234
      const formatoPlaca = /^[A-Z]{2,3}[-]?\d{3,4}$|^[A-Z]\d{3}[A-Z]{3}$/;
      
      return formatoPlaca.test(placa) ? null : { placaInvalida: true };
    };
  }

  // Validador para teléfono dominicano
  static telefonoDominicano(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const telefono = control.value.replace(/\D/g, '');
      // Teléfonos dominicanos: 809, 829, 849
      const formatoTelefono = /^(809|829|849)\d{7}$/;
      
      return formatoTelefono.test(telefono) ? null : { telefonoInvalido: true };
    };
  }

  // Validador para cédula dominicana
  static cedulaDominicana(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const cedula = control.value.replace(/\D/g, '');
      
      if (cedula.length !== 11) {
        return { cedulaInvalida: true };
      }
      
      // Validar dígito verificador (simplificado)
      return /^\d{11}$/.test(cedula) ? null : { cedulaInvalida: true };
    };
  }

  // Validador para fechas futuras
  static fechaNoFutura(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const fecha = new Date(control.value);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      return fecha <= hoy ? null : { fechaFutura: true };
    };
  }

  // Validador para fecha de llegada posterior a salida
  static fechaLlegadaValida(fechaSalidaControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control.parent;
      if (!form) return null;
      
      const fechaSalida = form.get(fechaSalidaControl)?.value;
      const fechaLlegada = control.value;
      
      if (!fechaSalida || !fechaLlegada) return null;
      
      const salida = new Date(fechaSalida);
      const llegada = new Date(fechaLlegada);
      
      return llegada >= salida ? null : { fechaLlegadaInvalida: true };
    };
  }

  // Validador para números positivos
  static numeroPositivo(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const numero = parseFloat(control.value);
      return numero > 0 ? null : { numeroNegativo: true };
    };
  }

  // Validador para caracteres específicos no permitidos
  static sinCaracteresEspeciales(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const caracteresPeligrosos = /[<>'"{}]/;
      return caracteresPeligrosos.test(control.value) ? { caracteresInvalidos: true } : null;
    };
  }

  // Validador para longitud máxima de texto
  static longitudMaxima(max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      return control.value.length <= max ? null : { longitudMaxima: { max } };
    };
  }

  // Validador para coherencia horaria (hora llegada > hora salida si misma fecha)
  static horaLlegadaValida(fechaSalidaControl: string, horaSalidaControl: string, fechaLlegadaControl: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const form = control.parent;
      if (!form) return null;
      
      const fechaSalida = form.get(fechaSalidaControl)?.value;
      const horaSalida = form.get(horaSalidaControl)?.value;
      const fechaLlegada = form.get(fechaLlegadaControl)?.value;
      const horaLlegada = control.value;
      
      if (!fechaSalida || !horaSalida || !fechaLlegada || !horaLlegada) return null;
      
      const salida = new Date(`${fechaSalida}T${horaSalida}`);
      const llegada = new Date(`${fechaLlegada}T${horaLlegada}`);
      
      return llegada > salida ? null : { horaLlegadaInvalida: true };
    };
  }
}
