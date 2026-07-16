import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  loginForm;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {

    this.loginForm = this.fb.group({

      correo: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],

      password: [
        '',
        [
          Validators.required
        ]
      ]

    });

  }

  iniciarSesion() {

    if (this.loginForm.invalid) {
      alert("Completa los campos");
      return;
    }

    this.authService.login(
      this.loginForm.value
    )
      .subscribe({

        next: (respuesta: any) => {

          console.log(respuesta);

          localStorage.setItem(
            "token",
            respuesta.token
          );

          localStorage.setItem(
            "usuario",
            JSON.stringify(respuesta.usuario)
          );
          /////////////////////////////////
          if(this.authService.obtenerUsuario().rol == 'admin'){
            this.router.navigate(['/admin/dashboard']);
          }
          else{
            this.router.navigate(['/menu']);
          }
          ////////////////////////////////
          //this.router.navigate(['/perfil']);

        },

        error: (error) => {

          console.error(error);

          alert(
            error.error.mensaje ||
            "Error al iniciar sesión"
          );

        }

      });

  }

}