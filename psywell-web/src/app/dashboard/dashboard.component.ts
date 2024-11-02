import { Component, OnInit, OnDestroy, ElementRef, Renderer2 } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import interact from 'interactjs'; // Importa interact.js
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  psicologoName: string = 'Cristina Zapata';
  especialidad: string = 'Psicóloga Especialista en Salud Mental';
  aniosExperiencia: number = 10;
  fondoPerfil: SafeStyle = '';
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

  constructor(private sanitizer: DomSanitizer, private renderer: Renderer2, private el: ElementRef) {}

  ngOnInit() {
    this.fondoPerfil = this.sanitizer.bypassSecurityTrustStyle('url(assets/portada.png)');
    this.filteredNotes = [...this.stickyNotes];
    this.checkCarousel();

    // Inicializar interact.js para cada nota
    setTimeout(() => {
      this.initializeDrag();
    });
  }

  ngOnDestroy() {
    this.clearCarouselInterval();
  }

  initializeDrag() {
    interact('.sticky-note-item')
      .draggable({
        listeners: {
          move: (event) => {
            const target = event.target;
            const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
            const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

            // Aplicar la posición
            target.style.transform = `translate(${x}px, ${y}px)`;

            // Actualizar los atributos de datos
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
