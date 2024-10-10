import { Component } from '@angular/core';

@Component({
  selector: 'app-recursos-carousel',
  templateUrl: './recursos-materiales.component.html',
  styleUrls: ['./recursos-materiales.component.scss'],
})
export class RecursosMaterialesComponent {
  currentSlide = 0; 
  items = [
    {
      titulo: 'Recursos Terapéuticos',
      imagen: 'assets/cards/terapia.png',
      descripcion: 'Sube y gestiona ejercicios terapéuticos y guías de autoayuda para tus pacientes.',
      btnVerTexto: 'Ver Recursos',
      btnSubirTexto: 'Subir Recursos',
    },
    {
      titulo: 'Música Terapéutica',
      imagen: 'assets/cards/musica.png',
      descripcion: 'Sube y gestiona listas de música relajante o motivacional para apoyar a los pacientes.',
      btnVerTexto: 'Ver Música',
      btnSubirTexto: 'Subir Música',
    },
    {
      titulo: 'Foros y Comunidades de Apoyo',
      imagen: 'assets/cards/comunidad.png',
      descripcion: 'Sube y gestiona acceso a foros y comunidades de apoyo para tus pacientes.',
      btnVerTexto: 'Ver Foros',
      btnSubirTexto: 'Subir Foro',
    },
  ];

  prevSlide() {
    this.currentSlide = (this.currentSlide === 0) ? this.items.length - 1 : this.currentSlide - 1;
    this.updateCarousel();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide === this.items.length - 1) ? 0 : this.currentSlide + 1;
    this.updateCarousel();
  }

  updateCarousel() {
    const carousel = document.querySelector('.carousel') as HTMLElement;
    const width = carousel.clientWidth;
    carousel.style.transform = `translateX(-${this.currentSlide * width}px)`;
  }
}
