import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonText,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonIcon,
} from '@ionic/angular/standalone';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonInput,
    IonButton,
    IonText,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonIcon,
  ],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';
  name = '';
  username = '';
  isRegister = false;
  error = '';

  constructor(private auth: Auth, private router: Router) {}

  ngOnInit(): void {}

  isFormValid(): boolean {
    if (this.isRegister) {
      return !!this.name && !!this.username && !!this.email && !!this.password;
    }
    return !!this.email && !!this.password;
  }

  private blurActiveElement() {
    const active = document.activeElement as HTMLElement | null;
    active?.blur();
  }

  submit() {
    this.blurActiveElement();
    this.error = '';

    if (!this.isFormValid()) {
      this.error = 'Completa todos los campos';
      return;
    }

    if (this.isRegister) {
      this.auth
        .register({
          name: this.name,
          username: this.username,
          email: this.email,
          password: this.password,
        })
        .subscribe({
          next: (res) => {
            this.auth.setToken(res.token);
            this.router.navigateByUrl('/feed');
          },
          error: () => {
            this.error = 'No se pudo registrar';
          },
        });
    } else {
      this.auth.login(this.email, this.password).subscribe({
        next: (res) => {
          this.auth.setToken(res.token);
          this.router.navigateByUrl('/feed');
        },
        error: () => {
          this.error = 'Credenciales inválidas';
        },
      });
    }
  }

  toggleMode() {
    this.blurActiveElement();
    this.isRegister = !this.isRegister;
    this.error = '';
  }
}