import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import interact from 'interactjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from '../services/userService';
import { CitasService } from '../services/citasService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  psicologoName: string = ''; 
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10;
  fondoPerfil: SafeStyle = '';
  fotoPerfil: string = '';
  genero: string = 'masculino';
  correoUsuario: string = '';
  userId: number | null = null;

  // Recordatorios (Citas del psicólogo)
  recordatorios: any[] = [];
  emocionesPaciente: any[] = []; // Almacena las emociones del paciente seleccionado

  
  stickyNotes: { title: string; content: string, position?: { x: number, y: number } }[] = [
    { title: 'Nota Rápida 1', content: 'Recordar preguntar sobre sueño a Manuel Fernández.', position: { x: 0, y: 0 } },
    { title: 'Nota Rápida 2', content: 'Preparar informe de progreso para Sofía Martínez.', position: { x: 0, y: 0 } },
  ];
  filteredNotes = [...this.stickyNotes];
  newNoteTitle: string = '';
  newNoteContent: string = '';
  searchQuery: string = '';
  currentNoteIndex: number = 0;
  isCarouselActive: boolean = false;
  carouselInterval: any;

  constructor(
    private sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private el: ElementRef,
    private usersService: UsersService,
    private citasService: CitasService, // Inyección corregida
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private afs: AngularFirestore
  ) {}

  ngOnInit(): void {
    console.log('Iniciando ngOnInit...');
  
    this.afAuth.authState.subscribe({
      next: (user) => {
        if (!user?.email) {
          console.error('No se detectó un usuario autenticado. Verifica el estado de autenticación.');
          return;
        }
  
        console.log('Usuario autenticado:', user.email);
  
        this.usersService.listarUsuarios().subscribe({
          next: (response: any) => {
            if (!response?.data || !Array.isArray(response.data)) {
              console.error('La respuesta de listarUsuarios no contiene datos válidos.');
              return;
            }
  
            const psicologo = response.data.find((u: any) => u.email === user.email);
  
            if (!psicologo) {
              console.warn('No se encontró ningún psicólogo con el correo:', user.email);
              return;
            }
  
            console.log('Psicólogo encontrado:', psicologo);
  
            // Asignar datos del psicólogo
            this.psicologoName = psicologo.nombre;
            this.genero = psicologo.genero || 'indefinido';
            this.userId = psicologo.idUsuario; // <-- Cambiado de "id" a "idUsuario"
            this.correoUsuario = psicologo.email;
  
            // Cargar imágenes y citas
            this.cargarImagenes(psicologo.email);
            this.cargarCitas(psicologo.idUsuario); // <-- Cambiado de "id" a "idUsuario"
          },
          error: (error) => {
            console.error('Error al listar usuarios:', error);
          },
        });
      },
      error: (error) => {
        console.error('Error al verificar el estado de autenticación:', error);
      },
    });
  }
  
  seleccionarCita(cita: any): void {
    console.log('Cita seleccionada:', cita);
  
    // Obtener registros del paciente seleccionado
    this.citasService.obtenerRegistrosPorPaciente(cita.idPaciente).subscribe({
      next: (registros: any[]) => {
        console.log('Registros del paciente:', registros);
        this.emocionesPaciente = registros.map((registro: any) => ({
          ...registro,
          emoji: this.estadoEmocionalEmojis[registro.estadoEmocional] || "🤔", // Mapear estado emocional a emoji
        }));
  
        // Reinicia el carrusel después de cargar emociones
        this.currentSlide = 0;
        this.startCarousel();
      },
      error: (error) => {
        console.error('Error al cargar registros del paciente:', error);
        this.emocionesPaciente = [];
      },
    });
  }
  
  
  
  
  

  estadoEmocionalEmojis: { [key: string]: string } = {
    "Muy enojado": "😡",
    "Molesto": "😠",
    "Neutral": "😐",
    "Feliz": "😊",
    "Muy feliz": "😁",
  };
  
  

  cargarCitas(idPsicologo: number): void {
    console.log('Cargando citas para el psicólogo con ID:', idPsicologo);
  
    this.citasService.listarCitas().subscribe({
      next: async (response: any) => {
        console.log('Respuesta del backend al listarCitas:', response);
  
        if (!response?.data || !Array.isArray(response.data)) {
          console.warn('La respuesta no contiene datos válidos.');
          this.recordatorios = [];
          return;
        }
  
        // Filtrar citas asociadas al psicólogo autenticado
        const citasPsicologo = response.data.filter((cita: any) => cita.idPsicologo === idPsicologo);
  
        // Obtener pacientes para las citas
        const pacientes = await this.obtenerTodosLosUsuarios();
  
        // Obtener la fecha actual y el rango de los próximos 7 días
        const hoy = new Date();
        const fechaLimite = new Date();
        fechaLimite.setDate(hoy.getDate() + 7);
  
        // Mapear y filtrar citas dentro del rango de 7 días
        this.recordatorios = citasPsicologo
          .filter((cita: any) => {
            const fechaCita = new Date(cita.fecha); // Asegúrate de que cita.fecha sea una fecha válida
            return fechaCita >= hoy && fechaCita <= fechaLimite;
          })
          .map((cita: any) => {
            const paciente = pacientes.find((p: any) => p.idUsuario === cita.idPaciente);
            return {
              ...cita,
              pacienteNombre: paciente?.nombre || 'Paciente Desconocido',
              horaInicio: this.formatearHora(cita.horaInicio),
            };
          });
  
        console.log('Citas cargadas y filtradas para los próximos 7 días:', this.recordatorios);
      },
      error: (error) => {
        console.error('Error al cargar citas:', error);
        this.recordatorios = [];
      },
    });
  }
  
  



async obtenerPacientePorId(idPaciente: number): Promise<any> {
  console.log(`Buscando información del paciente con ID: ${idPaciente}`);

  try {
    const response = await this.usersService.listarUsuarios().toPromise();
    if (response?.data && Array.isArray(response.data)) {
      const paciente = response.data.find((user: any) => user.id === idPaciente);
      console.log(`Paciente encontrado: ${paciente?.nombre || 'No encontrado'}`);
      return paciente || null;
    } else {
      console.warn('La respuesta de listarUsuarios no contiene datos válidos.');
      return null;
    }
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return null;
  }
}




currentSlide: number = 0; // Índice del slide actual


startCarousel(): void {
  this.carouselInterval = setInterval(() => {
    this.nextSlide();
  }, 2500); // Cambiar de slide cada 2.5 segundos
}

nextSlide(): void {
  if (this.emocionesPaciente.length > 0) {
    this.currentSlide = (this.currentSlide + 1) % this.emocionesPaciente.length; // Ir al siguiente slide
  }
}

prevSlide(): void {
  if (this.emocionesPaciente.length > 0) {
    this.currentSlide =
      (this.currentSlide - 1 + this.emocionesPaciente.length) % this.emocionesPaciente.length; // Ir al slide anterior
  }
}

ngOnDestroy(): void {
  if (this.carouselInterval) {
    clearInterval(this.carouselInterval); // Detener el intervalo al destruir el componente
  }
}











async obtenerTodosLosUsuarios(): Promise<any[]> {
  try {
    const response = await this.usersService.listarUsuarios().toPromise();
    if (response?.data && Array.isArray(response.data)) {
      console.log('Usuarios obtenidos:', response.data);
      return response.data;
    } else {
      console.warn('La respuesta de listarUsuarios no contiene datos válidos.');
      return [];
    }
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return [];
  }
}



// Método para formatear la hora
formatearHora(hora: string): string {
    if (!hora) return 'Hora no disponible';
    return hora.substring(0, 5); // Extraer solo los primeros 5 caracteres (HH:mm)
}







cargarImagenes(email: string): void {
  console.log('Cargando imágenes para el correo:', email);

  if (!email) {
      console.warn('El correo está vacío o no es válido.');
      return;
  }

  const perfilPath = `fotoPerfil/${email}`;
  const portadaPath = `fotoPortada/${email}`;

  const perfilUrl = `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${encodeURIComponent(perfilPath)}?alt=media`;
  const portadaUrl = `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${encodeURIComponent(portadaPath)}?alt=media`;

  console.log('URL esperada para foto de perfil:', perfilUrl);
  console.log('URL esperada para foto de portada:', portadaUrl);

  this.fotoPerfil = perfilUrl;
  this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${portadaUrl})`);
}






  triggerFileInput(tipo: 'perfil' | 'portada'): void {
    console.log(`Disparando input para ${tipo}`);
    const inputElement = document.getElementById(tipo) as HTMLInputElement;
    if (inputElement) {
      console.log(`Input encontrado para ${tipo}. Forzando clic.`);
      inputElement.click();
    } else {
      console.error(`No se encontró el input para ${tipo}`);
    }
  }
  
  




  onUpload(event: Event, tipo: 'perfil' | 'portada'): void {
    console.log(`Método onUpload disparado para tipo: ${tipo}`);
  
    const input = event.target as HTMLInputElement;
  
    if (!input) {
      console.error('El evento no contiene un input válido.');
      return;
    }
  
    if (input.files && input.files[0]) {
      const file = input.files[0];
      console.log(`Archivo detectado: ${file.name}, tamaño: ${file.size} bytes`);
  
      if (!this.correoUsuario || this.correoUsuario.trim() === '') {
        console.error('El correo del usuario no está definido. Subida cancelada.');
        return;
      }
  
      const filePath = tipo === 'perfil' 
        ? `fotoPerfil/${this.correoUsuario}` 
        : `fotoPortada/${this.correoUsuario}`;
      const fileRef = this.storage.ref(filePath);
  
      console.log(`Iniciando subida para ${tipo}. Ruta definida: ${filePath}`);
  
      const uploadTask = this.storage.upload(filePath, file);
  
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          console.log('Subida completada. Intentando obtener la URL...');
          fileRef.getDownloadURL().subscribe(
            (url) => {
              if (tipo === 'perfil') {
                this.fotoPerfil = url;
                console.log('Foto de perfil subida correctamente. URL:', url);
              } else {
                this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${url})`);
                console.log('Foto de portada subida correctamente. URL:', url);
              }
            },
            (error) => {
              console.error('Error al obtener la URL de descarga:', error);
            }
          );
        })
      ).subscribe({
        next: (snapshot) => {
          if (snapshot?.bytesTransferred !== undefined && snapshot?.totalBytes !== undefined) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progreso de subida: ${progress.toFixed(2)}%`);
          }
        },
        error: (error) => {
          console.error('Error durante la subida del archivo:', error);
        },
      });
    } else {
      console.warn('No se seleccionó ningún archivo.');
    }
  }
}