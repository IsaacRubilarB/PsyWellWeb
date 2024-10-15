import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { SafePipe } from './safe.pipe';

@Component({
  selector: 'app-recursos-materiales',
  standalone: true,
  imports: [CommonModule, NavbarComponent, SafePipe],
  templateUrl: './recursos-materiales.component.html',
  styleUrls: ['./recursos-materiales.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RecursosMaterialesComponent {
  showVideos = false;
  showPresentations = false;
  showAudios = false;
  showForos = false; // Variable para controlar la visibilidad de la sección de foros

  items = [
    {
      titulo: 'Videos Terapéuticos',
      imagen: 'assets/cards/videos.png',
      descripcion: 'Explora y sube videos que pueden ayudar a los pacientes en su tratamiento.',
      tipo: 'videos',
      archivos: [
        { nombre: 'Video 1', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
        { nombre: 'Video 2', url: 'https://www.youtube.com/embed/tgbNymZ7vqY' }
      ]
    },
    {
      titulo: 'Presentaciones Terapéuticas',
      imagen: 'assets/cards/presentacion.png',
      descripcion: 'Sube y gestiona presentaciones que pueden ser útiles para los pacientes.',
      tipo: 'presentaciones',
      archivos: [
        { nombre: 'Depresión en niños', url: 'assets/presentaciones/Depresion_niños.pdf', portada: 'assets/presentaciones/Depresion_niños.png' },
        { nombre: 'Trastornos mentales', url: 'assets/presentaciones/Trastornos_mentales.pdf', portada: 'assets/presentaciones/Trastornos_mentales.png' }
      ],
      libros: [
        { nombre: 'Guía autoayuda sobre depresión y ansiedad', url: 'assets/libros/Guia_autoayuda.pdf', portada: 'assets/libros/Guia_autoayuda.png' },
        { nombre: 'Manual para padres sobre la depresión', url: 'assets/libros/Manual_padres.pdf', portada: 'assets/libros/Manual_padres.png' },
        { nombre: 'Depresión en mayores de edad', url: 'assets/libros/Depresion_en_mayores.pdf', portada: 'assets/libros/Depresion_en_mayores.png' }
      ]
    },
    {
      titulo: 'Audios Terapéuticos',
      imagen: 'assets/cards/audios.png',
      descripcion: 'Comparte audios que faciliten la relajación y la concentración de los pacientes.',
      tipo: 'audios',
      archivos: [
        { nombre: 'Audio Relajación', url: 'assets/audios/relajacion.mp3' },
        { nombre: 'Audio Motivación', url: 'assets/audios/motivacion.mp3' }
      ]
    },
    {
      titulo: 'Foros y Comunidades de Apoyo',
      imagen: 'assets/cards/foro.png',
      descripcion: 'Accede a foros y comunidades de apoyo donde los pacientes pueden interactuar.',
      tipo: 'foros',
      archivos: [
        { nombre: 'Foro de Apoyo 1', url: 'https://www.foroapoyo1.com' },
        { nombre: 'Foro de Apoyo 2', url: 'https://www.foroapoyo2.com' }
      ]
    }
  ];

  hoveredItem: any = this.items[0];

  constructor(private router: Router) {}

  setHoveredItem(item: any) {
    this.hoveredItem = item;
    this.showVideos = false;
    this.showPresentations = false;
    this.showAudios = false;
    this.showForos = false;
  }

  toggleVideoSection() {
    if (this.hoveredItem.tipo === 'videos') {
      this.showVideos = !this.showVideos;
      this.showPresentations = false;
      this.showAudios = false;
      this.showForos = false;
    }
  }

  togglePresentationSection() {
    if (this.hoveredItem.tipo === 'presentaciones') {
      this.showPresentations = !this.showPresentations;
      this.showVideos = false;
      this.showAudios = false;
      this.showForos = false;
    }
  }

  toggleAudioSection() {
    if (this.hoveredItem.tipo === 'audios') {
      this.showAudios = !this.showAudios;
      this.showVideos = false;
      this.showPresentations = false;
      this.showForos = false;
    }
  }

  toggleForoSection() {
    if (this.hoveredItem.tipo === 'foros') {
      this.showForos = !this.showForos;
      this.showVideos = false;
      this.showPresentations = false;
      this.showAudios = false;
    }
  }

  goToResources(resourceType: string) {
    this.router.navigate([`/recursos/${resourceType}`]);
  }

  uploadResource() {
    alert('Funcionalidad de subir recursos en desarrollo');
  }
}
