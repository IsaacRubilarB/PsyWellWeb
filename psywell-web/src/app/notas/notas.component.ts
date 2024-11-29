import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { UsersService } from '../services/userService'; // Servicio para obtener datos del usuario
import { getAuth } from 'firebase/auth'; // Importar getAuth para obtener el usuario autenticado

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
  psicologoId: string | null = null;

  constructor(
    private firestore: AngularFirestore,
    private usersService: UsersService // Servicio para obtener usuarios
  ) {}

  async ngOnInit(): Promise<void> {
    try {
      // Obtiene el ID del psicólogo autenticado
      await this.obtenerPsicologoId();
      if (this.psicologoId) {
        this.obtenerNotas(); // Carga las notas asociadas al ID del psicólogo
      } else {
        console.error('No se pudo obtener el ID del psicólogo logueado.');
      }
    } catch (error) {
      console.error('Error al inicializar el componente de notas:', error);
    }
  }

  async obtenerPsicologoId(): Promise<void> {
    try {
      const auth = getAuth(); // Obtenemos la instancia de Firebase Auth
      const user = auth.currentUser; // Usuario autenticado actualmente

      if (user?.email) {
        // Busca el psicólogo correspondiente en la base de datos por correo
        const response = await this.usersService.verificarUsuario(user.email).toPromise();

        if (response?.data?.idUsuario) {
          this.psicologoId = response.data.idUsuario; // Asigna el ID del psicólogo autenticado
          console.log('Psicólogo autenticado encontrado:', this.psicologoId);
        } else {
          console.warn('No se encontró un psicólogo con el correo:', user.email);
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
      console.error('No se puede cargar las notas porque el ID del psicólogo no está disponible.');
      return;
    }

    // Consulta Firestore para obtener las notas asociadas al psicólogo logueado
    this.firestore
      .collection('notas', (ref) => ref.where('psicologoId', '==', this.psicologoId))
      .valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        this.notas = data.map((nota) => ({
          ...nota,
          fechaCreacion: nota.fechaCreacion?.toDate
            ? nota.fechaCreacion.toDate()
            : new Date(),
        }));
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
        this.obtenerNotas(); // Actualiza la lista de notas
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
            this.obtenerNotas(); // Actualiza la lista de notas
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