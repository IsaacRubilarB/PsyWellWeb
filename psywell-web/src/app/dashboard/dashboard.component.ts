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
  
        // Mapear las citas con los nombres de los pacientes
        this.recordatorios = citasPsicologo.map((cita: any) => {
          const paciente = pacientes.find((p: any) => p.idUsuario === cita.idPaciente);
          return {
            ...cita,
            pacienteNombre: paciente?.nombre || 'Paciente Desconocido',
            horaInicio: this.formatearHora(cita.horaInicio),
          };
        });
  
        console.log('Citas cargadas y procesadas:', this.recordatorios);
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
  
  


  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  initializeDrag() {
    interact('.sticky-note-item')
      .draggable({
        listeners: {
          move: (event) => {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            target.style.transform = `translate(${x}px, ${y}px)`;
            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
          }
        }
      });
  }

  addStickyNote() {
    if (this.newNoteTitle && this.newNoteContent) {
      const newNote = { title: this.newNoteTitle, content: this.newNoteContent, position: { x: 0, y: 0 } };
      this.stickyNotes.push(newNote);
      this.filteredNotes = [...this.stickyNotes];
      this.newNoteTitle = '';
      this.newNoteContent = '';
      this.checkCarousel();
      setTimeout(() => this.initializeDrag());
    }
  }

  removeStickyNote(index: number) {
    this.stickyNotes.splice(index, 1);
    this.filterNotes();
    this.checkCarousel();
  }

  filterNotes() {
    const query = this.searchQuery.toLowerCase();
    this.filteredNotes = this.stickyNotes.filter(note =>
      note.title.toLowerCase().includes(query)
    );
  }

  sortNotes() {
    this.filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
  }

  checkCarousel() {
    this.isCarouselActive = this.filteredNotes.length > 3;
    if (this.isCarouselActive) {
      this.startCarousel();
    } else {
      this.clearCarouselInterval();
    }
  }

  startCarousel() {
    this.clearCarouselInterval();
    this.carouselInterval = setInterval(() => {
      this.nextNote();
    }, 1500);
  }

  clearCarouselInterval() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  nextNote() {
    this.currentNoteIndex = (this.currentNoteIndex + 1) % this.filteredNotes.length;
  }

  prevNote() {
    this.currentNoteIndex = (this.currentNoteIndex - 1 + this.filteredNotes.length) % this.filteredNotes.length;
  }

  getCurrentNoteClass(index: number) {
    if (index === this.currentNoteIndex) {
      return 'active';
    } else if (index === (this.currentNoteIndex + 1) % this.filteredNotes.length) {
      return 'next';
    } else if (index === (this.currentNoteIndex - 1 + this.filteredNotes.length) % this.filteredNotes.length) {
      return 'prev';
    }
    return '';
  }
}
