import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component'; // Importa app-navbar

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent], // Asegúrate de importar NavbarComponent aquí
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  psicologoName: string = 'Cristina Zapata';
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10;
  fondoPerfil: SafeStyle = '';

  // Notas
  stickyNotes: { title: string; content: string; showAnimation?: boolean }[] = [
    { title: 'Nota Rápida 1', content: 'Recordar preguntar sobre sueño a Manuel Fernández.' },
    { title: 'Nota Rápida 2', content: 'Preparar informe de progreso para Sofía Martínez.' }
  ];
  filteredNotes: { title: string; content: string; showAnimation?: boolean }[] = [...this.stickyNotes];
  newNoteTitle: string = '';
  newNoteContent: string = '';
  searchQuery: string = '';

  // Carrusel de notas
  currentNoteIndex: number = 0;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle('url(assets/portada.png)');
    this.filteredNotes = [...this.stickyNotes];
  }

  // Cambiar el fondo del perfil
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

  // Añadir nueva nota con animación
  addStickyNote() {
    if (this.newNoteTitle && this.newNoteContent) {
      const newNote = {
        title: this.newNoteTitle,
        content: this.newNoteContent,
        showAnimation: true
      };
      this.stickyNotes.push(newNote);
      this.filteredNotes = [...this.stickyNotes];
      this.newNoteTitle = '';
      this.newNoteContent = '';
      
      // Remover la animación después de 2 segundos
      setTimeout(() => {
        newNote.showAnimation = false;
      }, 2000);
    }
  }

  // Remover una nota
  removeStickyNote(index: number) {
    this.stickyNotes.splice(index, 1);
    this.filterNotes(); // Refrescar la lista filtrada
  }

  // Filtrar notas por búsqueda
  filterNotes() {
    const query = this.searchQuery.toLowerCase();
    this.filteredNotes = this.stickyNotes.filter(note =>
      note.title.toLowerCase().includes(query)
    );
    this.resetCarousel();
  }

  // Ordenar notas alfabéticamente
  sortNotes() {
    this.filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
    this.resetCarousel();
  }

  // Carrusel - mostrar la nota anterior
  prevNote() {
    if (this.currentNoteIndex > 0) {
      this.currentNoteIndex--;
    } else {
      this.currentNoteIndex = this.filteredNotes.length - 1;
    }
  }

  // Carrusel - mostrar la siguiente nota
  nextNote() {
    if (this.currentNoteIndex < this.filteredNotes.length - 1) {
      this.currentNoteIndex++;
    } else {
      this.currentNoteIndex = 0;
    }
  }

  // Restablecer el índice del carrusel al agregar/ordenar
  resetCarousel() {
    this.currentNoteIndex = 0;
  }

  // Obtener la nota actual del carrusel
  get currentNote() {
    return this.filteredNotes[this.currentNoteIndex];
  }

  // Activar el input de archivo para cambiar el fondo
  triggerFileInput(): void {
    const fileInput = document.querySelector('.file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
