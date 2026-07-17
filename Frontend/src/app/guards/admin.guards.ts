import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Obtenemos los datos guardados de la sesión tal como lo hacemos en el componente
  const datosGuardados = localStorage.getItem("usuario");

  if (datosGuardados) {
    try {
      const usuario = JSON.parse(datosGuardados);
      
      if (usuario && usuario.rol === 'admin') {
        return true; // Acceso permitido
      }
    } catch (error) {
      console.error('Error leyendo sesión para el guard', error);
    }
  }

  // Si no es admin o no hay sesión, lo defenestramos al inicio
  router.navigate(['/']);
  return false; 
};