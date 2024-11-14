import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import interact from 'interactjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from 'app/services/userService';
import { AngularFireAuth } from '@angular/fire/compat/auth';
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
  genero: string = 'masculino'; 
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
    private afs: AngularFirestore // Inyectar Firestore

  ) {}

  ngOnInit() {
    this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle('url(assets/portada.png)');
    
    // Suscripción al estado de autenticación del usuario
    this.afAuth.authState.subscribe(user => {
      if (user) {
        this.cargarPsicologo(user.email || ''); // Usar el email para identificar al usuario
      }
    });
    setTimeout(() => {
      this.initializeDrag();
    });
  }
  


  cargarPsicologo(uid: string) {
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        console.log('Usuarios cargados:', response); // Verifica los datos que se reciben
  
        // Buscar solo el usuario que corresponde al UID del usuario logueado
        const user = response.data.find((user: any) => user.email === uid);  // Usamos email o uid si es necesario
  
        if (user) {
          this.userId = user.idUsuario; // Asume que 'idUsuario' es el ID que buscas
          this.userName = user.nombre;  // Asegúrate de capturar el nombre si lo necesitas
          console.log('Usuario logueado:', user);
        } else {
          console.error('No se encontró el usuario con ese UID');
        }
      },
      (error) => {
        console.error('Error al listar los usuarios:', error);
      }
    );
  }
  
  
  

  ngOnDestroy() {
    if (this.carouselInterval) {
      clearInterval(this.carouselInterval);
    }
  }

  async loadUserId(uid: string) {
    console.log('UID del usuario:', uid);  // Verificar el UID
    
    // Llamar al servicio para listar todos los usuarios
    this.usersService.listarUsuarios().subscribe(
      (response: any) => {
        // Buscar el usuario correspondiente a ese UID en la respuesta
        const user = response.data.find((user: any) => user.uid === uid);
        
        if (user) {
          this.userId = user.idUsuario;  // Asumir que 'idUsuario' es el ID de usuario de Postgres
          console.log('ID de usuario obtenido desde Postgres:', this.userId);
        } else {
          console.error('No se encontró el usuario con ese UID');
        }
      },
      (error) => {
        console.error('Error al listar los usuarios:', error);
      }
    );
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

  triggerFileInput(): void {
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onBackgroundUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle(`url(${reader.result})`);
      };
      reader.readAsDataURL(input.files[0]);
    }
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
