import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Asegúrate de importar esto
import { CommonModule } from '@angular/common'; // Asegúrate de importar esto
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, CommonModule],
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss'],
})
export class NotasComponent {
  notas: any[] = [];
  nuevaNota = {
    titulo: '',
    contenido: '',
    esImportante: false,
    fechaCreacion: new Date(),
    bloqueada: false,
    posicion: { top: '0px', left: '0px' },
  };

  constructor(private firestore: AngularFirestore) {
    this.obtenerNotas();
  }

  obtenerNotas(): void {
    this.firestore
      .collection('notas')
      .valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.notas = data.map((nota) => ({
          ...nota,
          fechaCreacion: nota.fechaCreacion?.toDate
            ? nota.fechaCreacion.toDate()
            : new Date(),
        }));
      });
  }

  agregarNota(): void {
    if (!this.nuevaNota.titulo.trim() || !this.nuevaNota.contenido.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El título y el contenido no pueden estar vacíos.',
        confirmButtonColor: '#d33',
      });
      return;
    }

    this.firestore
      .collection('notas')
      .add({
        ...this.nuevaNota,
        fechaCreacion: new Date(),
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Nota agregada',
          text: 'La nota se ha agregado exitosamente.',
          confirmButtonColor: '#3085d6',
        });
        this.nuevaNota = {
          titulo: '',
          contenido: '',
          esImportante: false,
          fechaCreacion: new Date(),
          bloqueada: false,
          posicion: { top: '0px', left: '0px' },
        };
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un problema al agregar la nota.',
          confirmButtonColor: '#d33',
        });
        console.error('Error al agregar nota:', error);
      });
  }

  eliminarNota(nota: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.firestore
          .collection('notas')
          .doc(nota.id)
          .delete()
          .then(() => {
            Swal.fire({
              icon: 'success',
              title: 'Nota eliminada',
              text: 'La nota se ha eliminado correctamente.',
              confirmButtonColor: '#3085d6',
            });
          })
          .catch((error) => {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Ocurrió un problema al eliminar la nota.',
              confirmButtonColor: '#d33',
            });
            console.error('Error al eliminar la nota:', error);
          });
      }
    });
  }
}
