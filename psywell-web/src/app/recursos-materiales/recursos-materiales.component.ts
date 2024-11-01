// src/app/recursos-materiales/recursos-materiales.component.ts
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SafePipe } from './safe.pipe';
import { FormularioRecursosComponent } from '../formulario-recursos/formulario-recursos.component';
import { RecursosService } from 'app/services/recursos.service';

@Component({
  selector: 'app-recursos-materiales',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SafePipe, FormularioRecursosComponent],
  templateUrl: './recursos-materiales.component.html',
  styleUrls: ['./recursos-materiales.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecursosMaterialesComponent {
  showVideos = false;
  showPresentations = false;
  showAudios = false;
  showForos = false;
  isModalOpen = false;
  resources: { [key: string]: any[] } = {
    videos: [],
    presentaciones: [],
    audios: [],
    foros: []
  };

  items = [
    {
      titulo: 'Videos Terapéuticos',
      imagen: 'assets/cards/videos.png',
      descripcion: 'Explora y sube videos que pueden ayudar a los pacientes en su tratamiento.',
      tipo: 'videos'
    },
    {
      titulo: 'Presentaciones Terapéuticas',
      imagen: 'assets/cards/presentacion.png',
      descripcion: 'Sube y gestiona presentaciones que pueden ser útiles para los pacientes.',
      tipo: 'presentaciones'
    },
    {
      titulo: 'Audios Terapéuticos',
      imagen: 'assets/cards/audios.png',
      descripcion: 'Comparte audios que faciliten la relajación y la concentración de los pacientes.',
      tipo: 'audios'
    },
    {
      titulo: 'Foros y Comunidades de Apoyo',
      imagen: 'assets/cards/foro.png',
      descripcion: 'Accede a foros y comunidades de apoyo donde los pacientes pueden interactuar.',
      tipo: 'foros'
    }
  ];

  hoveredItem: any = this.items[0];

  constructor(private router: Router, private recursosService: RecursosService) {}

  setHoveredItem(item: any) {
    this.hoveredItem = item;
  }

  toggleSection(type: string) {
    this.showVideos = type === 'videos';
    this.showPresentations = type === 'presentaciones';
    this.showAudios = type === 'audios';
    this.showForos = type === 'foros';
    this.fetchResources(type);
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
    });
  }

  deleteResource(id: string, type: string) {
    this.recursosService.deleteRecursoPorId(id).then(() => {
      this.resources[type] = this.resources[type].filter(resource => resource.id !== id);
    });
  }
}
