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
  userName: any;

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
        this.cargarImagenes();
      }
    });

    setTimeout(() => {
      this.initializeDrag();
    });
  }

  onSearch(event: any): void {
    const searchValue = event.target.value.toLowerCase();
    this.filteredNotes = this.stickyNotes.filter(note =>
      note.title.toLowerCase().includes(searchValue)
    );
  }
  
  cargarPsicologo(email: string) {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        const usuario = response.data.find((user: any) => user.email === email);
        if (usuario) {
          this.psicologoName = usuario.nombre;
          this.genero = usuario.genero; // Asegúrate de que 'genero' sea 'femenino' o 'masculino'
          console.log('Género asignado:', this.genero); // Depuración
        }
      },
      (error: any) => {
        console.error('Error al cargar los datos del psicólogo:', error);
      }
    );
  }
  


  cargarImagenes(): void {
    const perfilPath = `fotoPerfil/${this.correoUsuario}`;
    this.storage.ref(perfilPath).getDownloadURL().subscribe(
      (url) => {
        this.fotoPerfil = url;
      },
      (err) => {
        console.warn('No se encontró foto de perfil:', err);
      }
    );

    const portadaPath = `fotoPortada/${this.correoUsuario}`;
    this.storage.ref(portadaPath).getDownloadURL().subscribe(
      (url) => {
        this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${url})`);
      },
      (err) => {
        console.warn('No se encontró foto de portada:', err);
      }
    );
  }

  triggerFileInput(type: 'perfil' | 'portada'): void {
    const fileInput = document.getElementById(type) as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  onProfilePictureUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const filePath = `fotoPerfil/${this.correoUsuario}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, file);

      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.fotoPerfil = url;
          });
        })
      ).subscribe();
    }
  }

  onBackgroundUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const filePath = `fotoPortada/${this.correoUsuario}`;
      const fileRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, file);

      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe((url) => {
            this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${url})`);
          });
        })
      ).subscribe();
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

