import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { NavbarComponent } from '../navbar/navbar.component'; // Asegúrate de importar el NavbarComponent aquí

interface Note {
  title: string;
  content: string;
}

interface Idea {
  title: string;
  description: string;
}

interface Reminder {
  text: string;
  date: Date;
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
  imports: [CommonModule, FormsModule, DragDropModule, NavbarComponent], // Asegúrate de agregar NavbarComponent en los imports
  templateUrl: './notas.component.html',
  styleUrls: ['./notas.component.scss'],
})
export class NotasComponent {
  notes: Note[] = [];
  newNoteTitle = '';
  newNoteContent = '';

  ideas: Idea[] = [];
  newIdeaTitle = '';
  newIdeaDescription = '';

  reminders: Reminder[] = [];
  newReminder = '';
  newReminderDate: Date | null = null;

  tasks: Task[] = [];
  newTask = '';

  references: Reference[] = [];
  newReferenceTitle = '';
  newReferenceUrl = '';

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

  addIdea() {
    if (this.newIdeaTitle.trim() && this.newIdeaDescription.trim()) {
      this.ideas.push({ title: this.newIdeaTitle, description: this.newIdeaDescription });
      this.newIdeaTitle = '';
      this.newIdeaDescription = '';
    }
  }

  deleteIdea(index: number) {
    this.ideas.splice(index, 1);
  }

  addReminder() {
    if (this.newReminder.trim() && this.newReminderDate) {
      this.reminders.push({ text: this.newReminder, date: this.newReminderDate });
      this.newReminder = '';
      this.newReminderDate = null;
    }
  }

  deleteReminder(index: number) {
    this.reminders.splice(index, 1);
  }

  addTask() {
    if (this.newTask.trim()) {
      this.tasks.push({ text: this.newTask, completed: false });
      this.newTask = '';
    }
  }

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
  }

  addReference() {
    if (this.newReferenceTitle.trim() && this.newReferenceUrl.trim()) {
      this.references.push({ title: this.newReferenceTitle, url: this.newReferenceUrl });
      this.newReferenceTitle = '';
      this.newReferenceUrl = '';
    }
  }

  deleteReference(index: number) {
    this.references.splice(index, 1);
  }
}
