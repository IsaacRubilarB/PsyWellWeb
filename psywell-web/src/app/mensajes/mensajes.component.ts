import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Mensaje {
  userId: string;
  mensaje: string;
  timestamp: any;
}

@Component({
  selector: 'app-mensajes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mensajes.component.html',
  styleUrls: ['./mensajes.component.scss']
})
export class MensajesComponent implements OnInit {
  @Input() patient: any; // Paciente seleccionado
  @Output() closeModal = new EventEmitter<void>();
  mensaje: string = '';
  showAlert: boolean = false; // Controla la visibilidad de la alerta
  mensajes$: any;

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.mensajes$ = this.firestore.collection<Mensaje>('mensajes', ref => ref.where('pacienteId', '==', this.patient.id)).valueChanges();
  }

  // Enviar mensaje
  enviarMensaje() {
    if (this.mensaje.trim()) {
      const userId = 'psicologo'; // Aquí se establece que el usuario que envía el mensaje es el psicólogo

      // Agregar el mensaje a la colección de Firebase
      this.firestore.collection('mensajes').add({
        mensaje: this.mensaje,
        pacienteId: this.patient.id, 
        userId: userId, 
        timestamp: new Date(),
      }).then(() => {
        this.mensaje = ''; // Limpiar el mensaje
        this.showAlertMessage(); // Mostrar la alerta
      });
    }
  }

  // Mostrar la alerta de éxito
  showAlertMessage() {
    this.showAlert = true; // Cambiar el estado de la alerta
    setTimeout(() => {
      this.showAlert = false; // Ocultar la alerta después de 3 segundos
    }, 3000);
  }

  // Cerrar el modal
  closeModalHandler() {
    this.closeModal.emit();
  }
}
