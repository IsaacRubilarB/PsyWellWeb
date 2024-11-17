import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import interact from 'interactjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from 'app/services/userService';
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
  userId: string | null = null;

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
    private afAuth: AngularFireAuth,
    private storage: AngularFireStorage,
    private afs: AngularFirestore
  ) {}

  ngOnInit() {
    this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle('url(assets/portada.png)');
    this.afAuth.authState.subscribe(user => {
      if (user && user.email) {
        this.correoUsuario = user.email;
        this.cargarPsicologo(user.email);
      }
    });

    setTimeout(() => {
      this.initializeDrag();
    });
  }

  cargarPsicologo(email: string) {
    if (!email) {
      console.warn('El email proporcionado es nulo o indefinido.');
      return;
    }

    console.log('Intentando cargar los datos del psicólogo para el correo:', email);

    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        if (response && response.data) {
          const usuario = response.data.find((user: any) => user.email === email);
          if (usuario) {
            this.psicologoName = usuario.nombre || 'Desconocido';
            this.genero = usuario.genero || 'indefinido';
            this.userId = usuario.id ? usuario.id.toString() : null;
            this.correoUsuario = usuario.email || ''; // Asigna el correo correctamente

            console.log('Datos del psicólogo cargados correctamente:', usuario);

            // Cargar imágenes después de asignar el correo
            this.cargarImagenes();
          } else {
            console.error('No se encontró un usuario con el email proporcionado:', email);
          }
        } else {
          console.error('La respuesta de listarUsuarios no es válida o no contiene datos:', response);
        }
      },
      (error) => {
        console.error('Error al intentar cargar los datos del psicólogo:', error);
      }
    );
  }

  cargarImagenes(): void {
    if (!this.correoUsuario) {
      console.warn('Correo del usuario no disponible, no se pueden cargar las imágenes.');
      return;
    }
  
    console.log('Intentando cargar imágenes para el usuario con correo:', this.correoUsuario);
  
    // Construir rutas de imágenes
    const perfilPath = `fotoPerfil/${this.correoUsuario}`;
    const portadaPath = `fotoPortada/${this.correoUsuario}`;
  
    // Construir URL correcta para Firebase Storage
    const perfilUrl = `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${encodeURIComponent(perfilPath)}?alt=media`;
    const portadaUrl = `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${encodeURIComponent(portadaPath)}?alt=media`;
  
    console.log('URL esperada para la foto de perfil:', perfilUrl);
    console.log('URL esperada para la foto de portada:', portadaUrl);
  
    // Asignar las URLs generadas a las variables
    this.fotoPerfil = perfilUrl;
    this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${portadaUrl})`);
  }
  

  triggerFileInput(type: 'perfil' | 'portada'): void {
    const fileInput = document.getElementById(type) as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onUpload(event: Event, tipo: 'perfil' | 'portada'): void {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const filePath = tipo === 'perfil' ? `fotoPerfil/${this.correoUsuario}` : `fotoPortada/${this.correoUsuario}`;
      const fileRef = this.storage.ref(filePath);
  
      console.log(`Iniciando subida del archivo: ${filePath}`);
  
      // Subir archivo al bucket
      const uploadTask = this.storage.upload(filePath, file);
  
      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            if (tipo === 'perfil') {
              this.fotoPerfil = url; // Asigna la URL a la variable
            } else {
              this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${url})`);
            }
            console.log(`${tipo === 'perfil' ? 'Foto de perfil' : 'Foto de portada'} subida correctamente:`, url);
          });
        })
      ).subscribe({
        next: (snapshot) => {
          if (snapshot?.bytesTransferred !== undefined && snapshot?.totalBytes !== undefined) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Progreso de subida: ${progress.toFixed(2)}%`);
          }
        },
        error: (err) => {
          console.error('Error al subir la imagen:', err);
        }
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
