import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-formulario-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añadimos CommonModule y FormsModule aquí
  templateUrl: './formulario-recursos.component.html',
  styleUrls: ['./formulario-recursos.component.scss']
})
export class FormularioRecursosComponent {
  titulo = '';
  descripcion = '';
  tipoRecurso = 'videos'; // Valor predeterminado
  autor = '';
  videoUrl = ''; // Para almacenar el enlace de YouTube
  archivo: File | null = null;

  constructor(private firestore: AngularFirestore) {}

  // Función para convertir el enlace de YouTube a formato embed
  convertToEmbedUrl(url: string): string {
    if (url.includes("watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    return url;
  }

  onTipoRecursoChange() {
    if (this.tipoRecurso !== 'videos') {
      this.videoUrl = ''; // Limpiar el enlace si se cambia a otro tipo
    }
  }

  onFileSelected(event: any) {
    this.archivo = event.target.files[0];
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
      // Convertir el enlace al formato embed antes de guardarlo
      nuevoRecurso.url = this.convertToEmbedUrl(this.videoUrl);
    } else if (this.archivo) {
      // Aquí iría la lógica para subir el archivo a un almacenamiento y obtener su URL
      nuevoRecurso.url = 'URL del archivo subido'; // Placeholder
    }

    this.firestore.collection('recursos-materiales').add(nuevoRecurso).then(() => {
      alert('Recurso subido exitosamente');
      this.resetForm();
    });
  }

  resetForm() {
    this.titulo = '';
    this.descripcion = '';
    this.tipoRecurso = 'videos';
    this.autor = '';
    this.videoUrl = '';
    this.archivo = null;
  }
}
