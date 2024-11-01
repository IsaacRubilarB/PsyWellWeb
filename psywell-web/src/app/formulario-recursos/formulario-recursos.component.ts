import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';




@Component({
  selector: 'app-formulario-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulario-recursos.component.html',
  styleUrls: ['./formulario-recursos.component.scss']
})
export class FormularioRecursosComponent {
  titulo = '';
  descripcion = '';
  tipoRecurso = 'videos';
  autor = '';
  videoUrl = '';
  archivo: File | null = null;
  portadaUrl: string | null = null;

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {}

  convertToEmbedUrl(url: string): string {
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    return url;
  }

  onTipoRecursoChange() {
    if (this.tipoRecurso !== 'videos') {
      this.videoUrl = '';
    }
  }

  onFileSelected(event: any) {
    this.archivo = event.target.files[0];
    if (this.tipoRecurso === 'presentaciones' && this.archivo) {
      this.generatePdfPreview(this.archivo);
    }
  }

  async generatePdfPreview(file: File) {
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const typedArray = new Uint8Array(reader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument(typedArray).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        
        await page.render({ canvasContext: context, viewport }).promise;
        const dataUrl = canvas.toDataURL('image/png');

        // Subir la portada generada a Firebase Storage
        const filePath = `portadas/${file.name}_portada.png`;
        const task = await this.storage.upload(filePath, this.dataUrlToBlob(dataUrl));
        this.portadaUrl = await task.ref.getDownloadURL();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error al generar la portada del PDF:", error);
      alert("Hubo un problema al generar la portada del PDF. Intenta nuevamente.");
    }
  }

  dataUrlToBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const mimeString = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  submitForm() {
    const nuevoRecurso: any = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      tipo: this.tipoRecurso,
      autor: this.autor,
      fecha_subida: new Date(),
      visibilidad: true,
    };

    if (this.tipoRecurso === 'videos' && this.videoUrl) {
      nuevoRecurso.url = this.convertToEmbedUrl(this.videoUrl);
    } else if (this.archivo) {
      nuevoRecurso.url = 'URL del archivo subido'; // Placeholder para el archivo principal
    }

    // Asignar la URL de la portada si está disponible
    if (this.portadaUrl) {
      nuevoRecurso.portada = this.portadaUrl;
    }

    // Guardar el recurso solo si se ha generado la portada correctamente
    if (this.tipoRecurso !== 'presentaciones' || this.portadaUrl) {
      this.firestore.collection('recursos-materiales').add(nuevoRecurso).then(() => {
        alert('Recurso subido exitosamente');
        this.resetForm();
      });
    } else {
      alert("La portada no se generó correctamente. Por favor, intenta nuevamente.");
    }
  }

  resetForm() {
    this.titulo = '';
    this.descripcion = '';
    this.tipoRecurso = 'videos';
    this.autor = '';
    this.videoUrl = '';
    this.archivo = null;
    this.portadaUrl = null;
  }
}
