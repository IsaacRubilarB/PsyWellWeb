import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { getAuth } from 'firebase/auth';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, CommonModule],
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss'],
})
export class NotasComponent implements OnInit {
  notas: any[] = [];
  nuevaNota = {
    titulo: '',
    contenido: '',
    esImportante: false,
    fechaCreacion: new Date(),
  };
  psicologoId: string | null = null; // ID del psicólogo logueado
  correoLogueado: string | null = null; // Correo del usuario logueado

  constructor(private firestore: AngularFirestore) {}

  async ngOnInit(): Promise<void> {
    // Asegúrate de obtener el psicólogo antes de cargar las notas
    await this.obtenerPsicologoId();
    if (this.psicologoId) {
      this.obtenerNotas(); // Solo llama si tenemos el ID del psicólogo
    } else {
      console.error('No se pudo cargar el ID del psicólogo.');
    }
  }

  async obtenerPsicologoId(): Promise<void> {
    try {
      const auth = getAuth(); // Obtenemos la instancia de Firebase Auth
      const user = auth.currentUser; // Usuario autenticado actualmente
      if (user?.email) {
        this.correoLogueado = user.email; // Guardamos el correo del usuario logueado
        console.log('Correo logueado:', this.correoLogueado);

        // Buscamos el psicólogo correspondiente en la colección 'usuarios'
        const usuariosSnapshot = await this.firestore.collection('usuarios').get().toPromise();
        const usuarios = usuariosSnapshot?.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, ...(data as object) }; // Tratamos data como un objeto
        });

        const psicologo = usuarios?.find((usuario: any) => usuario.correo === this.correoLogueado);

        if (psicologo) {
          this.psicologoId = psicologo.id; // Guardamos el ID del psicólogo
          console.log('Psicólogo logueado:', psicologo);
        } else {
          console.warn('No se encontró un psicólogo con este correo.');
        }
      } else {
        console.error('No hay un usuario autenticado.');
      }
    } catch (error) {
      console.error('Error al obtener el psicólogo logueado:', error);
    }
  }

  obtenerNotas(): void {
    if (!this.psicologoId) {
      console.error('El ID del psicólogo no está disponible.');
      return;
    }

    this.firestore
      .collection('notas', (ref) => ref.where('psicologoId', '==', this.psicologoId))
      .valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.notas = data.map((nota) => {
          return {
            ...nota,
            fechaCreacion: nota.fechaCreacion?.toDate
              ? nota.fechaCreacion.toDate()
              : new Date(),
          };
        });
        console.log('Notas cargadas:', this.notas);
      });
  }

  agregarNota(): void {
    if (!this.nuevaNota.titulo.trim() || !this.nuevaNota.contenido.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El título y el contenido no pueden estar vacíos.',
      });
      return;
    }

    if (!this.psicologoId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se puede agregar la nota porque el ID del psicólogo no está disponible.',
      });
      return;
    }

    this.firestore
      .collection('notas')
      .add({
        ...this.nuevaNota,
        fechaCreacion: new Date(),
        psicologoId: this.psicologoId,
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Nota agregada',
          text: 'La nota ha sido guardada exitosamente.',
        });
        this.nuevaNota = {
          titulo: '',
          contenido: '',
          esImportante: false,
          fechaCreacion: new Date(),
        };
        this.obtenerNotas(); // Actualizar la lista de notas
      })
      .catch((error) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al agregar',
          text: 'Hubo un problema al guardar la nota.',
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
            this.obtenerNotas(); // Actualizar la lista de notas
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
