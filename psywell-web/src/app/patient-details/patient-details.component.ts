import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, ViewChildren, QueryList, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'app/services/userService';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FichaPacienteComponent } from '../ficha-paciente/ficha-paciente.component';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, FichaPacienteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PatientDetailsComponent implements AfterViewInit, OnInit {
  patientId: string | null = null;
  patientDetails: any = {};
  bpm: number = 75;
  sleepHours: number = 7;
  stressLevel: number = 40;
  isFichaPacienteModalOpen = false;

  medications: any[] = [];  // Array de medicamentos
  appointments: any[] = [];  // Array de citas

  @ViewChild('heartAnimation') heartAnimationDiv!: ElementRef;
  @ViewChild('sleepAnimation') sleepAnimationDiv!: ElementRef;
  @ViewChild('stressAnimation') stressAnimationDiv!: ElementRef;

  @ViewChildren('pillBackground') pillBackgroundDivs!: QueryList<ElementRef>;
  @ViewChildren('calendarBackground') calendarBackgroundDivs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.obtenerDetallesPaciente(this.patientId);
    }
  }

  obtenerDetallesPaciente(id: string) {
    this.usersService.obtenerUsuarioPorId(id).subscribe(
      (response: any) => {
        console.log("Datos recibidos del paciente:", response); // Verificación en consola
        
        const data = response.data; // Accede a 'data' dentro de la respuesta
        if (data) {
          this.patientDetails = {
            name: data.nombre || 'Nombre desconocido',
            age: data.fechaNacimiento ? this.calculateAge(data.fechaNacimiento) : 'Edad desconocida',
            diagnosis: data.diagnosis || 'Sin diagnóstico',
            notes: data.notes || 'Sin notas'
          };
  
          // Aseguramos que `medications` y `appointments` se llenen si existen en la respuesta
          this.medications = data.medications || [];  
          this.appointments = data.appointments || [];  
        } else {
          console.warn("No se recibieron datos del paciente.");
        }
      },
      (error: any) => {
        console.error('Error al obtener detalles del paciente:', error);
      }
    );
  }
  
  
  

  calculateAge(fechaNacimiento: string): number {
    if (!fechaNacimiento) {
      return NaN; // Retorna NaN si fechaNacimiento es undefined o null
    }
  
    const [day, month, year] = fechaNacimiento.split('/');
    if (!day || !month || !year) return NaN; // Retorna NaN si el formato es incorrecto
  
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.loadAnimations();
    this.simulateBpmChange();
    this.simulateSleepHoursChange();
    this.loadStressAnimation();
    this.loadPillAnimations();
    this.loadCalendarAnimations();
  }

  loadAnimations() {
    lottie.loadAnimation({
      container: this.heartAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/bpm.json'
    });

    lottie.loadAnimation({
      container: this.sleepAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/sueno.json'
    });
  }

  simulateBpmChange() {
    setInterval(() => {
      this.bpm = Math.floor(Math.random() * (90 - 60 + 1) + 60);
      this.cdr.detectChanges();
    }, 2000);
  }

  simulateSleepHoursChange() {
    setInterval(() => {
      this.sleepHours = Math.floor(Math.random() * (9 - 5 + 1) + 5);
      this.cdr.detectChanges();
    }, 3000);
  }

  loadStressAnimation() {
    const stressAnimation = lottie.loadAnimation({
      container: this.stressAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: false,
      autoplay: true,
      path: '/assets/lottie/stress.json'
    });

    setInterval(() => {
      this.stressLevel = Math.floor(Math.random() * 100);
      const frame = Math.round((this.stressLevel / 100) * (stressAnimation.totalFrames - 1));
      stressAnimation.goToAndStop(frame, true);
      this.cdr.detectChanges();
    }, 2000);
  }

  // Método para cargar la animación en los elementos de medicamento
  loadPillAnimations() {
    this.pillBackgroundDivs.forEach((pillBackgroundDiv) => {
      lottie.loadAnimation({
        container: pillBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/pill.json'
      });
    });
  }

  // Método para cargar la animación en los elementos de citas
  loadCalendarAnimations() {
    this.calendarBackgroundDivs.forEach((calendarBackgroundDiv) => {
      lottie.loadAnimation({
        container: calendarBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/calendar.json'
      });
    });
  }

  goBack() {
    this.router.navigate(['/patients']);
  }

  generateReport() {
    this.router.navigate(['/reports']);
  }

  openFichaPacienteModal() {
    this.isFichaPacienteModalOpen = true;
  }

  closeFichaPacienteModal() {
    this.isFichaPacienteModalOpen = false;
  }
}
