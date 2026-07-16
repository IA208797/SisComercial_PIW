import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmar = control.get('confirmarPassword')?.value;
  if (password !== confirmar) {
    return { passwordsMismatch: true };
  }
  return null;
}

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  registroForm;
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registroForm = this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3)
        ]
      ],
      correo: [
        '',
        [
          Validators.required,
          Validators.email
        ]
      ],
      telefono: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            // Esta regex permite letras, números y CUALQUIER símbolo especial
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/
          )
        ]
      ],
      confirmarPassword: [
        '',
        [
          Validators.required
        ]
      ],
      terminos: [
        false,
        [
          Validators.requiredTrue
        ]
      ]
    },
      {
        validators: passwordsMatch
      });
  }

  registrar() {

    if (this.registroForm.invalid) {
      alert("Completa correctamente todos los campos");
      return;
    }

    const datos = {
      nombre: this.registroForm.value.nombre,
      correo: this.registroForm.value.correo,
      telefono: this.registroForm.value.telefono,
      password: this.registroForm.value.password
    };

    this.authService.registrar(datos).subscribe({
      next: () => {
        this.router.navigate(['/menu']);
      },
      error: (error) => {
        console.error(error);
        if (error.status === 400) {
          alert("Ese correo ya está registrado.");
        } else {
          alert("Ocurrió un error al registrar el usuario.");
        }
      }
    });
  }
  loginGoogle() {
    alert("Inicio de sesión con Google disponible en una futura versión.");
  }

  loginFacebook() {
    alert("Inicio de sesión con Facebook disponible en una futura versión.");
  }
}