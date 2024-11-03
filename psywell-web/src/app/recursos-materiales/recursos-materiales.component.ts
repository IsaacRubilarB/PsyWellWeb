import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SafePipe } from './safe.pipe';
import { FormularioRecursosComponent } from '../formulario-recursos/formulario-recursos.component';
import { RecursosService } from 'app/services/recursos.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-recursos-materiales',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, SafePipe, FormularioRecursosComponent],
  templateUrl: './recursos-materiales.component.html',
  styleUrls: ['./recursos-materiales.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecursosMaterialesComponent {
  isModalOpen = false; // Controla si el modal está abierto
  searchQuery = ''; // Texto de búsqueda
  filteredResources: any[] = []; // Recursos filtrados
  selectedCategory: string = ''; // Categoría seleccionada
  selectedPacienteId: string = ''; // Paciente seleccionado para ver recursos asignados
  resources: { [key: string]: any[] } = {
    videos: [],
    presentaciones: [],
    audios: [],
    foros: []
  }; // Estructura para almacenar los recursos por tipo
  pacientes: any[] = []; // Lista de pacientes para selección
  sidebarItems = [
    { titulo: 'Videos Terapéuticos', icono: 'video_library', tipo: 'videos' },
    { titulo: 'Presentaciones Terapéuticas', icono: 'slideshow', tipo: 'presentaciones' },
    { titulo: 'Audios Terapéuticos', icono: 'audiotrack', tipo: 'audios' },
    { titulo: 'Foros y Comunidades de Apoyo', icono: 'forum', tipo: 'foros' }
  ]; // Elementos de la barra lateral

  hoveredItem: any; // Elemento sobre el que se hace hover

  constructor(
    private router: Router,
    private recursosService: RecursosService,
    private firestore: AngularFirestore
  ) {
    // Obtener la lista de pacientes
    this.firestore.collection('pacientes').valueChanges({ idField: 'id' }).subscribe((pacientes: any[]) => {
      this.pacientes = pacientes;
    });
  }

  // Función para manejar el hover en la barra lateral
  setHoveredItem(item: any) {
    this.hoveredItem = item;
  }

  // Selecciona la categoría y obtiene los recursos correspondientes
  selectCategory(type: string) {
    this.selectedCategory = type;
    console.log("Categoría seleccionada:", type);
    this.fetchResources(type);
  }

  // Selecciona un paciente para ver los recursos asignados
  selectPaciente(pacienteId: string) {
    this.selectedPacienteId = pacienteId;
    this.filterResources();
  }

  // Abre el modal para añadir nuevo recurso
  openModal() {
    this.isModalOpen = true;
  }

  // Cierra el modal
  closeModal() {
    this.isModalOpen = false;
  }

  // Obtiene los recursos desde Firebase filtrados por tipo
  fetchResources(type: string) {
    this.recursosService.getRecursosPorTipo(type).subscribe((resources: any[]) => {
      console.log("Recursos obtenidos desde Firebase:", resources);
      this.resources[type] = resources;
      this.filterResources();
    });
  }

  // Filtra los recursos en base a la búsqueda, categoría seleccionada y paciente asignado
  filterResources() {
    this.filteredResources = this.resources[this.selectedCategory]?.filter(resource => {
      const matchesQuery = resource.titulo ? resource.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) : false;
      const matchesPaciente = this.selectedPacienteId ? resource.pacientesAsignados.includes(this.selectedPacienteId) : true;
      return matchesQuery && matchesPaciente;
    });
    console.log("Recursos filtrados:", this.filteredResources);
  }

  // Elimina un recurso específico por ID
  deleteResource(id: string, type: string) {
    this.recursosService.deleteRecursoPorId(id).then(() => {
      this.resources[type] = this.resources[type].filter(resource => resource.id !== id);
      this.filterResources();
    });
  }

  // Obtiene el título para la categoría seleccionada
  getTitleForCategory(type: string): string {
    return this.sidebarItems.find(item => item.tipo === type)?.titulo || '';
  }

  // Visualiza un recurso específico (implementación adicional)
  viewResource(resource: any) {
    console.log('Viendo recurso:', resource);
  }
}
