import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-recursos-materiales',
  standalone: true,
  imports: [],
  templateUrl: './recursos-materiales.component.html',
  styleUrls: ['./recursos-materiales.component.scss']
})
export class RecursosMaterialesComponent {
  
  constructor(private sanitizer: DomSanitizer) {}

  // Métodos para ver los recursos
  verRecursos(tipo: string) {
    console.log(`Ver recursos del tipo: ${tipo}`);
    // Aquí se podría redirigir o cargar una lista de recursos para ese tipo
  }

  // Métodos para subir recursos
  subirRecurso(tipo: string) {
    console.log(`Subir recurso del tipo: ${tipo}`);
    // Aquí podrías activar un diálogo o componente para cargar archivos
  }
}
