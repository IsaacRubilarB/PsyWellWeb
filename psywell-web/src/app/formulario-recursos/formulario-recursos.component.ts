import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/assets/pdfjs/pdf.worker.min.mjs';

interface Paciente {
  id: string;
  nombre: string;
  imagen: string;
}

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
  tipoRecurso = '';
  autor = '';
  videoUrl = '';
  recursoUrl = '';
  archivo: File | null = null;
  portadaUrl: string | null = null;
  pacienteSeleccionado: Paciente | null = null;
  categoria = '';

  pacientes: Paciente[] = [
    { id: '1', nombre: 'Juan Pérez', imagen: 'assets/profiles/juan.png' },
    { id: '2', nombre: 'Ana López', imagen: 'assets/profiles/ana.png' },
    { id: '3', nombre: 'Carlos García', imagen: 'assets/profiles/carlos.png' },
    { id: '4', nombre: 'María Fernández', imagen: 'assets/profiles/maria.png' }
  ];

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) {}

  onTipoRecursoChange() {
    if (this.tipoRecurso !== 'videos') {
      this.videoUrl = '';
    }
    if (this.tipoRecurso !== 'libros') {
      this.autor = '';
      this.categoria = '';
    }
  }

  onFileSelected(event: any) {
    this.archivo = event.target.files[0];
    if (this.tipoRecurso === 'libros' && this.archivo) {
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

        const filePath = `portadas/${file.name}_portada.png`;
        const task = await this.storage.upload(filePath, this.dataUrlToBlob(dataUrl));
        this.portadaUrl = await task.ref.getDownloadURL();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error al generar la vista previa del PDF:", error);
      this.mostrarAlerta('Error', 'No se pudo generar la vista previa del libro.', 'error');
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
    if (this.tipoRecurso === 'libros' && this.archivo) {
      this.generatePdfPreview(this.archivo).then(() => {
        this.guardarRecurso();
      });
    } else {
      this.guardarRecurso();
    }
  }

  guardarRecurso() {
    const nuevoRecurso: any = {
      titulo: this.titulo,
      descripcion: this.descripcion,
      tipo: this.tipoRecurso,
      autor: this.autor,
      categoria: this.categoria,
      fecha_subida: new Date(),
      visibilidad: true,
      pacienteAsignado: this.pacienteSeleccionado ? this.pacienteSeleccionado.id : null,
      url: this.tipoRecurso === 'videos' ? this.videoUrl : this.portadaUrl
    };

    if (this.portadaUrl) {
      nuevoRecurso.portada = this.portadaUrl;
    }

    const collectionName = this.tipoRecurso === 'libros' ? 'libros' : 'recursos-materiales';
    this.firestore.collection(collectionName).add(nuevoRecurso).then(() => {
      this.mostrarAlerta('Éxito', 'Recurso subido exitosamente', 'success');
      this.resetForm();
    });
  }

  resetForm() {
    this.titulo = '';
    this.descripcion = '';
    this.tipoRecurso = '';
    this.autor = '';
    this.categoria = '';
    this.videoUrl = '';
    this.recursoUrl = '';
    this.archivo = null;
    this.portadaUrl = null;
    this.pacienteSeleccionado = null;
  }

  mostrarAlerta(titulo: string, texto: string, icono: 'success' | 'error') {
    Swal.fire({
      title: titulo,
      text: texto,
      icon: icono,
      confirmButtonText: 'OK',
      customClass: {
        popup: 'swal2-border-radius',
        confirmButton: 'swal2-confirm-button'
      }
    });
  }
}
