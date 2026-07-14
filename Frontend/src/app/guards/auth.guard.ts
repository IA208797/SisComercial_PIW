import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = () => {


    const authService = inject(AuthService);

    const router = inject(Router);


    console.log(
        "TOKEN:",
        authService.obtenerToken()
    );


    console.log(
        "ESTA LOGUEADO:",
        authService.estaLogueado()
    );


    if (authService.estaLogueado()) {

        return true;

    }


    alert("Debes iniciar sesión para acceder");


    router.navigate(['/login']);


    return false;

};