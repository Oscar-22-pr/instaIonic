import { Component, OnDestroy, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { Api } from '../../services/api';
import { Router } from '@angular/router';

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

  constructor(private api: Api, private router: Router) {
    addIcons({ camera, fileTray, cloudUpload, close });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.stopCamera();
  }

  onFileChange(ev: any) {
    const f = ev.target.files?.[0];
    if (!f) return;

    this.file = f;
    this.preview = URL.createObjectURL(f);
  }

  upload() {
    if (!this.file) return;

    this.api.createPost(this.file, this.caption).subscribe(() => {
      this.router.navigateByUrl('/feed');
    });
  }

  async takePhoto() {
    try {
      this.cameraOpen = true;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      this.cameraStream = stream;

      setTimeout(() => {
        if (this.videoRef?.nativeElement) {
          this.videoRef.nativeElement.srcObject = stream;
          this.videoRef.nativeElement.play();
        }
      });
    } catch (error) {
      console.error('No se pudo abrir la cámara:', error);
      this.cameraOpen = false;
      alert('No se pudo abrir la cámara. Verifica permisos o usa Elegir archivo.');
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

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

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
}