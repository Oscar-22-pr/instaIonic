import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonInput,
  IonButton,
  IonImg,
  IonButtons,
  IonBackButton,
  IonIcon,
  IonCol,
  IonGrid,
  IonRow,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { Api } from '../../services/api';

import { addIcons } from 'ionicons';
import { camera, fileTray, cloudUpload, close } from 'ionicons/icons';

@Component({
  selector: 'app-new-post',
  templateUrl: './new-post.page.html',
  styleUrls: ['./new-post.page.scss'],
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
    IonImg,
    IonButtons,
    IonBackButton,
    IonIcon,
    IonCol,
    IonGrid,
    IonRow,
  ],
})
export class NewPostPage implements OnInit, OnDestroy {
  @ViewChild('videoRef') videoRef?: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasRef') canvasRef?: ElementRef<HTMLCanvasElement>;

  caption = '';
  file?: File;
  preview?: string;

  cameraOpen = false;
  cameraStream?: MediaStream;
  cameraError = '';

  constructor(private api: Api, private router: Router) {
    addIcons({ camera, fileTray, cloudUpload, close });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.stopCamera();
  }

  onFileChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;

    this.stopCamera();
    this.file = f;
    this.preview = URL.createObjectURL(f);
  }

  async takePhoto() {
    this.cameraError = '';

    try {
      if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
        this.cameraError = 'La cámara requiere HTTPS o localhost.';
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Este navegador no soporta acceso a la cámara.');
      }

      this.cameraOpen = true;

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      this.cameraStream = stream;

      setTimeout(() => {
        const video = this.videoRef?.nativeElement;
        if (!video) {
          this.cameraError = 'No se pudo inicializar la vista previa de la cámara.';
          return;
        }

        video.srcObject = stream;
        video.play().catch(() => {
          this.cameraError = 'No se pudo reproducir la cámara.';
        });
      }, 0);
    } catch (error: any) {
      console.error('No se pudo abrir la cámara:', error);
      this.cameraOpen = false;
      this.stopCamera();

      const name = error?.name || '';
      const message = String(error?.message || error || '').toLowerCase();

      if (
        message.includes('user cancelled') ||
        message.includes('cancelled') ||
        name === 'AbortError'
      ) {
        this.cameraError = '';
        return;
      }

      if (
        name === 'NotAllowedError' ||
        name === 'PermissionDeniedError' ||
        message.includes('permission')
      ) {
        this.cameraError = 'Permiso de cámara denegado. Autoriza la cámara en el navegador.';
      } else if (
        name === 'NotFoundError' ||
        name === 'OverconstrainedError' ||
        message.includes('no camera') ||
        message.includes('camera not found')
      ) {
        this.cameraError = 'No hay cámara disponible en este dispositivo.';
      } else {
        this.cameraError = 'No se pudo abrir la cámara. Verifica permisos o usa Elegir archivo.';
      }
    }
  }

  closeCamera() {
    this.cameraOpen = false;
    this.stopCamera();
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach((track) => track.stop());
      this.cameraStream = undefined;
    }

    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.srcObject = null;
    }
  }

  capturePhoto() {
    const video = this.videoRef?.nativeElement;
    const canvas = this.canvasRef?.nativeElement;

    if (!video || !canvas) return;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;

      this.file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
      this.preview = URL.createObjectURL(blob);

      this.closeCamera();
    }, 'image/jpeg', 0.9);
  }

  upload() {
    if (!this.file) return;

    this.api.createPost(this.file, this.caption).subscribe({
      next: () => this.router.navigateByUrl('/feed'),
      error: (err) => console.error('Error al subir post:', err),
    });
  }
}