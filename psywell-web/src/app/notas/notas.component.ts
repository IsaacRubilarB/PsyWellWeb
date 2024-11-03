import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Import FormsModule para usar ngModel
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component'; // Asegúrate de importar el NavbarComponent aquí

interface Note {
  title: string;
  content: string;
}

interface Patient {
  id: number;
  name: string;
}

interface Session {
  date: Date;
  notes: string;
}

interface Task {
  text: string;
  completed: boolean;
}

interface Reference {
  title: string;
  url: string;
}

@Component({
  selector: 'app-notas',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent], // Incluye NavbarComponent y FormsModule
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Agrega CUSTOM_ELEMENTS_SCHEMA para reconocer elementos personalizados
})
export class NotasComponent {
  // Notas Rápidas
  notes: Note[] = [];
  newNoteTitle = '';
  newNoteContent = '';

  // Diario de Pacientes
  patients: Patient[] = [
    { id: 1, name: 'Cristina Zapata' },
    { id: 2, name: 'Juan Pérez' },
    { id: 3, name: 'Cristopher Soto' },
  ];
  selectedPatient: Patient | null = null;
  selectedPatientSessions: Session[] = [];
  newSessionNote = '';

  // Tareas por Paciente
  selectedPatientForTasks: Patient | null = null;
  selectedPatientTasks: Task[] = [];
  newTask = '';

  // Biblioteca de Recursos
  references: Reference[] = [];
  newReferenceTitle = '';
  newReferenceUrl = '';

  // Métodos para Notas Rápidas
  addNote() {
    if (this.newNoteTitle.trim() && this.newNoteContent.trim()) {
      this.notes.push({ title: this.newNoteTitle, content: this.newNoteContent });
      this.newNoteTitle = '';
      this.newNoteContent = '';
    }
  }

  deleteNote(index: number) {
    this.notes.splice(index, 1);
  }

  // Métodos para Diario de Pacientes
  loadPatientSessions() {
    if (this.selectedPatient) {
      // Simulación de carga de sesiones del paciente seleccionado
      this.selectedPatientSessions = [
        { date: new Date('2024-01-01'), notes: 'Primera sesión: Evaluación inicial' },
        { date: new Date('2024-01-15'), notes: 'Segunda sesión: Mejoras en el estado de ánimo' },
      ];
    }
  }

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

  // Métodos para Tareas por Paciente
  loadPatientTasks() {
    if (this.selectedPatientForTasks) {
      // Simulación de carga de tareas del paciente seleccionado
      this.selectedPatientTasks = [
        { text: 'Completar cuestionario de ansiedad', completed: false },
        { text: 'Practicar ejercicios de respiración diariamente', completed: true },
      ];
    }
  }

  addPatientTask() {
    if (this.newTask.trim() && this.selectedPatientForTasks) {
      this.selectedPatientTasks.push({ text: this.newTask, completed: false });
      this.newTask = '';
    }
  }

  deletePatientTask(task: Task) {
    const index = this.selectedPatientTasks.indexOf(task);
    if (index > -1) {
      this.selectedPatientTasks.splice(index, 1);
    }
  }

  // Métodos para Biblioteca de Recursos
  addReference() {
    if (this.newReferenceTitle.trim() && this.newReferenceUrl.trim()) {
      this.references.push({ title: this.newReferenceTitle, url: this.newReferenceUrl });
      this.newReferenceTitle = '';
      this.newReferenceUrl = '';
    }
  }

  deleteReference(reference: Reference) {
    const index = this.references.indexOf(reference);
    if (index > -1) {
      this.references.splice(index, 1);
    }
  }
}
