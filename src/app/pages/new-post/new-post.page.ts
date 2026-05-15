import { Component, OnInit } from '@angular/core';
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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

import { addIcons } from 'ionicons';
import { camera, fileTray, cloudUpload } from 'ionicons/icons';

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
export class NewPostPage implements OnInit {
  caption = '';
  file?: File;
  preview?: string;

  constructor(private api: Api, private router: Router) {
    addIcons({ camera, fileTray, cloudUpload });
  }

  ngOnInit() {}

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
      // En web, mejor usar selector de archivo para evitar "No camera found"
      if (Capacitor.getPlatform() === 'web') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';

        input.onchange = () => {
          const file = input.files?.[0];
          if (!file) return;

          this.file = file;
          this.preview = URL.createObjectURL(file);
        };

        input.click();
        return;
      }

      const photo = await Camera.getPhoto({
        quality: 80,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
      });

      if (!photo.dataUrl) return;

      this.preview = photo.dataUrl;
      this.file = this.dataUrlToFile(photo.dataUrl, 'photo.jpg');
    } catch (error) {
      console.error('Error al abrir la cámara:', error);
      alert('No se pudo abrir la cámara. Usa Elegir archivo.');
    }
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }
}
