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
  isModalOpen = false;
  searchQuery = '';
  filteredResources: any[] = [];
  selectedCategory: string = '';
  selectedPacienteId: string = '';
  hoveredItem: any = null;
  resources: { [key: string]: any[] } = {
    videos: [],
    libros: [],
    audios: [],
    foros: []
  };
  pacientes: any[] = [];

  sidebarItems = [
    { titulo: 'Videos terapéuticos', icono: 'video_library', tipo: 'videos' },
    { titulo: 'Libros terapéuticos', icono: 'menu_book', tipo: 'libros' },
    { titulo: 'Audios terapéuticos', icono: 'audiotrack', tipo: 'audios' },
    { titulo: 'Foros y comunidades de apoyo', icono: 'forum', tipo: 'foros' }
  ];

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

  setHoveredItem(item: any) {
    this.hoveredItem = item;
  }

  selectCategory(type: string) {
    this.selectedCategory = type;
    this.fetchResources(type);
  }

  selectPaciente(pacienteId: string) {
    this.selectedPacienteId = pacienteId;
    this.filterResources();
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  fetchResources(type: string) {
    this.recursosService.getRecursosPorTipo(type).subscribe((resources: any[]) => {
      this.resources[type] = resources;
      this.filterResources();
    });
  }

  filterResources() {
    this.filteredResources = this.resources[this.selectedCategory]?.filter(resource => {
      const matchesQuery = resource.titulo ? resource.titulo.toLowerCase().includes(this.searchQuery.toLowerCase()) : false;
      const matchesPaciente = this.selectedPacienteId ? resource.pacientesAsignados.includes(this.selectedPacienteId) : true;
      return matchesQuery && matchesPaciente;
    });
  }

  deleteResource(id: string, type: string) {
    this.recursosService.deleteRecursoPorId(id, type).then(() => {
      this.resources[type] = this.resources[type].filter(resource => resource.id !== id);
      this.filterResources();
    });
  }

  getTitleForCategory(type: string): string {
    return this.sidebarItems.find(item => item.tipo === type)?.titulo || '';
  }

  viewResource(resource: any) {
    if (resource.tipo === 'libros' && resource.url) {
      window.open(resource.url, '_blank'); // Abre el PDF en una nueva pestaña
    } else {
      console.error('No se pudo abrir el recurso. URL no encontrada o no válida.');
    }
  }
}
