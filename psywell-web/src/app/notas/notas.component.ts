import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { NavbarComponent } from '../navbar/navbar.component';

interface Note {
  title: string;
  content: string;
  favorite: boolean;
  category: string;
}

interface Patient {
  id: number;
  name: string;
}

interface Session {
  date: Date;
  notes: string;
}

interface Reminder {
  text: string;
  date: Date;
}

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent], // Incluye FormsModule y NavbarComponent
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NotasComponent {
  // Variables para Notas
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  searchQuery = '';
  showFavoritesOnly = false;
  newNoteTitle = '';
  newNoteContent = '';
  newNoteCategory = 'observacion';

  // Variables para Recordatorios
  reminders: Reminder[] = [];
  newReminder = '';
  newReminderDate: Date | null = null;

  // Variables para Seguimiento de Pacientes
  patients: Patient[] = [
    { id: 1, name: 'Cristina Zapata' },
    { id: 2, name: 'Juan Pérez' },
    { id: 3, name: 'Cristopher Soto' },
  ];
  selectedPatient: Patient | null = null;
  selectedPatientSessions: Session[] = [];
  newSessionNote = '';

  // Filtra notas según favoritos y búsqueda
  filterNotes() {
    this.filteredNotes = this.notes.filter(note =>
      (this.showFavoritesOnly ? note.favorite : true) &&
      (note.title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(this.searchQuery.toLowerCase()))
    );
  }

  // Añadir una nueva nota
  addNote() {
    if (this.newNoteTitle.trim() && this.newNoteContent.trim()) {
      const newNote: Note = {
        title: this.newNoteTitle,
        content: this.newNoteContent,
        favorite: false,
        category: this.newNoteCategory
      };
      this.notes.push(newNote);
      this.newNoteTitle = '';
      this.newNoteContent = '';
      this.filterNotes();
    }
  }

  // Eliminar una nota
  deleteNote(note: Note) {
    this.notes = this.notes.filter(n => n !== note);
    this.filterNotes();
  }

  // Alternar favoritos
  toggleFavorite(note: Note) {
    note.favorite = !note.favorite;
  }

  // Alternar sección de favoritos
  toggleFavoritesOnly() {
    this.showFavoritesOnly = !this.showFavoritesOnly;
    this.filterNotes();
  }

  // Cargar sesiones de paciente
  loadPatientSessions() {
    if (this.selectedPatient) {
      // Datos de prueba para sesiones
      this.selectedPatientSessions = [
        { date: new Date('2024-01-01'), notes: 'Evaluación inicial del paciente' },
        { date: new Date('2024-01-15'), notes: 'Seguimiento y mejoras observadas' },
      ];
    }
  }

  // Añadir una nota de sesión para el paciente
  addSessionNote() {
    if (this.newSessionNote.trim() && this.selectedPatient) {
      const newSession: Session = {
        date: new Date(),
        notes: this.newSessionNote,
      };
      this.selectedPatientSessions.push(newSession);
      this.newSessionNote = '';
    }
  }

  // Añadir un nuevo recordatorio
  addReminder() {
    if (this.newReminder.trim() && this.newReminderDate) {
      const newReminder: Reminder = {
        text: this.newReminder,
        date: this.newReminderDate
      };
      this.reminders.push(newReminder);
      this.newReminder = '';
      this.newReminderDate = null;
    }
  }

  // Eliminar un recordatorio
  deleteReminder(reminder: Reminder) {
    this.reminders = this.reminders.filter(r => r !== reminder);
  }
}
