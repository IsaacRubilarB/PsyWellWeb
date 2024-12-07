import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, ViewChildren, QueryList, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'app/services/userService';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FichaPacienteComponent } from '../ficha-paciente/ficha-paciente.component';
import { PatientDataService } from 'app/services/patient-data.service';
import { ReportsComponent } from 'app/reports/reports.component';
import { AngularFireAuth } from '@angular/fire/compat/auth'; // Asegúrate de importar AngularFireAuth

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, FichaPacienteComponent, ReportsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PatientDetailsComponent implements AfterViewInit, OnInit {
  animateFlip: boolean = false;
  selectedPatientId: number | null = null;
  patientId: number = 0; // ID del paciente
  psychologistId: number | null = null; // ID del psicólogo logueado
  patientDetails: any = {};
  bpm: number = 75;
  saturationLevel: number = 95;
  steps: number = 0;
  calories: number = 0;
  isFichaPacienteModalOpen = false;

  medications: any[] = [];
  appointments: any[] = [];
  psychologistName: string = 'Desconocido'; // NUEVA PROPIEDAD

  isRealTime: boolean = true;

  @ViewChild('heartAnimation') heartAnimationDiv!: ElementRef;
  @ViewChild('saturationAnimation') saturationAnimationDiv!: ElementRef;
  @ViewChild('stepsAnimation') stepsAnimationDiv!: ElementRef;
  @ViewChild('caloriesAnimation') caloriesAnimationDiv!: ElementRef;

  @ViewChildren('pillBackground') pillBackgroundDivs!: QueryList<ElementRef>;
  @ViewChildren('calendarBackground') calendarBackgroundDivs!: QueryList<ElementRef>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usersService: UsersService,
    private cdr: ChangeDetectorRef,
    private patientDataService: PatientDataService,
    private afAuth: AngularFireAuth // INYECCIÓN DEL SERVICIO
  ) {}


  
  async ngOnInit(): Promise<void> {
    try {
      // Obtener el ID del psicólogo logueado
      this.psychologistId = await this.obtenerPsychologistId();
      console.log(`[PatientDetailsComponent] Psychologist ID obtenido: ${this.psychologistId}`);
      
      // Obtener el ID del paciente desde la ruta
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      if (idFromRoute) {
        this.patientId = parseInt(idFromRoute, 10); // Convertir a número
        console.log(`[PatientDetailsComponent] Patient ID obtenido desde la ruta: ${this.patientId}`);
      } else {
        console.warn(`[PatientDetailsComponent] No se pudo obtener el ID del paciente desde la ruta.`);
      }
  
      // Confirmar que ambos IDs se van a pasar a ReportsComponent
      console.log(`[PatientDetailsComponent] Enviando IDs al componente Reports:`, {
        patientId: this.patientId,
        psychologistId: this.psychologistId,
      });
  
      // Obtener detalles del paciente
      await this.obtenerDetallesPaciente(this.patientId.toString());
      
      // Forzar actualización de la vista para pasar los IDs al componente hijo
      this.cdr.detectChanges();
    } catch (error) {
      console.error('[PatientDetailsComponent] Error en ngOnInit:', error);
    }
  }
  

  



fetchLoggedPsychologistName(): void {
  this.afAuth.authState.subscribe((user) => {
    if (user?.email) {
      this.usersService.obtenerUsuarioPorCorreo(user.email).subscribe(
        (usuario) => {
          if (usuario) {
            this.psychologistName = usuario.nombre || 'Desconocido';
            console.log('ID del psicólogo logueado:', usuario.idUsuario);
          } else {
            console.warn('No se encontró un psicólogo asociado al correo:', user.email);
          }
        },
        (error) => {
          console.error('Error al obtener el psicólogo logueado:', error);
        }
      );
    } else {
      console.warn('No hay un usuario autenticado.');
    }
  });
}



async obtenerPsychologistId(): Promise<number | null> {
  console.log('[PatientDetailsComponent] Iniciando obtención del Psychologist ID');
  return new Promise<number | null>((resolve, reject) => {
    this.afAuth.authState.subscribe(
      (user) => {
        console.log('[PatientDetailsComponent] Usuario autenticado:', user?.email);
        if (user?.email) {
          this.usersService.obtenerUsuarioPorCorreo(user.email).subscribe(
            (usuario) => {
              if (usuario?.idUsuario) {
                console.log('[PatientDetailsComponent] Psychologist ID encontrado:', usuario.idUsuario);
                resolve(usuario.idUsuario);
              } else {
                console.warn('[PatientDetailsComponent] No se encontró un Psychologist ID para el correo:', user.email);
                resolve(null);
              }
            },
            (error) => {
              console.error('[PatientDetailsComponent] Error al obtener Psychologist ID:', error);
              reject(error);
            }
          );
        } else {
          console.warn('[PatientDetailsComponent] No hay un usuario autenticado.');
          resolve(null);
        }
      },
      (error) => {
        console.error('[PatientDetailsComponent] Error al obtener estado de autenticación:', error);
        reject(error);
      }
    );
  });
}




async obtenerDetallesPaciente(id: string): Promise<void> {
  try {
    const response: any = await this.usersService.obtenerUsuarioPorId(id).toPromise();
    const data = response?.data || {};
    this.patientDetails = {
      id: id,
      name: data.nombre || 'Nombre desconocido',
      age: data.fechaNacimiento ? this.calculateAge(data.fechaNacimiento) : null,
      diagnosis: data.diagnosis || 'Sin diagnóstico',
      notes: data.notes || 'Sin notas',
      email: data.email || '',
      photo: this.getFirebaseImageUrl(data.email || '', 'profile'),
    };

    console.log('Detalles del paciente obtenidos:', this.patientDetails);

    if (this.patientDetails.email) {
      await this.initializePatientData(this.patientDetails.email);
    }
  } catch (error) {
    console.error('Error al obtener detalles del paciente:', error);
  }
}

  
  getPatientDetails(): any {
    return this.patientDetails;
  }
  

  private getFirebaseImageUrl(email: string, tipo: 'profile' | 'banner'): string {
    const sanitizedEmail = email.replace(/@/g, '_').replace(/\./g, '_');
    const folder = tipo === 'profile' ? 'fotoPerfil' : 'fotoPortada';
    return `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${folder}%2F${encodeURIComponent(
      sanitizedEmail
    )}?alt=media`;
  }

  calculateAge(fechaNacimiento: string | null): number | string {
    if (!fechaNacimiento) return 'Edad desconocida';
  
    // Intenta crear la fecha directamente
    const birthDate = new Date(fechaNacimiento);
  
    // Si la fecha no es válida, intenta dividir manualmente
    if (isNaN(birthDate.getTime())) {
      const dateParts = fechaNacimiento.split(/[-/]/); // Acepta "-" o "/"
      if (dateParts.length !== 3) return 'Edad desconocida';
  
      const [day, month, year] = dateParts.map(part => parseInt(part, 10));
      if (isNaN(day) || isNaN(month) || isNaN(year)) return 'Edad desconocida';
  
      // Reconstruye la fecha
      const manualDate = new Date(year, month - 1, day);
      if (isNaN(manualDate.getTime())) return 'Edad desconocida';
      birthDate.setTime(manualDate.getTime());
    }
  
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDifference = today.getMonth() - birthDate.getMonth();
  
    // Ajusta la edad si el cumpleaños no ha ocurrido este año
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
  
    return isNaN(age) || age < 0 ? 'Edad desconocida' : age;
  }
  

  async initializePatientData(email: string) {
    if (this.isRealTime) {
      await this.loadRealTimePatientData(email);
    } else {
      await this.loadWeeklyPatientData(email);
    }
  }

  async loadRealTimePatientData(email: string) {
    try {
      console.log('Email usado para obtener datos en tiempo real:', email);
      const realTimeData = await this.patientDataService.getRealTimeData(email);
      if (realTimeData) {
        this.bpm = Math.round(realTimeData.heartRate || this.bpm);
        this.saturationLevel = Math.round(realTimeData.oxygenSaturation || this.saturationLevel);
        this.steps = Math.round(realTimeData.steps || this.steps);
        this.calories = Math.round(realTimeData.calories || this.calories);

        console.log('Datos en tiempo real cargados:', realTimeData);
        this.cdr.detectChanges();
      } else {
        console.warn('No se encontraron datos en tiempo real.');
      }
    } catch (error) {
      console.error('Error al cargar datos en tiempo real desde Firebase:', error);
    }
  }

  async loadWeeklyPatientData(email: string) {
    try {
      const weeklyData = await this.patientDataService.getWeeklyData(email);
      if (weeklyData && weeklyData.length > 0) {
        const lastWeekData = weeklyData[weeklyData.length - 1];
        this.bpm = Math.round(lastWeekData.heartRate || this.bpm);
        this.saturationLevel = Math.round(lastWeekData.oxygenSaturation || this.saturationLevel);
        this.steps = Math.round(lastWeekData.steps || this.steps);
        this.calories = Math.round(lastWeekData.calories || this.calories);

        console.log('Datos semanales cargados:', lastWeekData);
        this.cdr.detectChanges();
      } else {
        console.warn('No se encontraron datos semanales.');
      }
    } catch (error) {
      console.error('Error al cargar datos semanales desde Firebase:', error);
    }
  }

  ngAfterViewInit(): void {
    this.cdr.detectChanges();
    this.loadAnimations();
    this.loadPillAnimations();
    this.loadCalendarAnimations();
  }

  loadAnimations() {
    lottie.loadAnimation({
      container: this.heartAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/bpm.json',
    });

    lottie.loadAnimation({
      container: this.saturationAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/saturation.json',
    });

    lottie.loadAnimation({
      container: this.stepsAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/steps.json',
    });

    lottie.loadAnimation({
      container: this.caloriesAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/calories.json',
    });
  }

  loadPillAnimations() {
    this.pillBackgroundDivs.forEach((pillBackgroundDiv) => {
      lottie.loadAnimation({
        container: pillBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/pill.json',
      });
    });
  }

  loadCalendarAnimations() {
    this.calendarBackgroundDivs.forEach((calendarBackgroundDiv) => {
      lottie.loadAnimation({
        container: calendarBackgroundDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: '/assets/lottie/calendar.json',
      });
    });
  }

  goBack() {
    this.router.navigate(['/patients']);
  }




  openFichaPacienteModal(patientId?: string | number): void {
    // Verificar y asignar el ID del paciente
    if (patientId) {
      this.patientId = +patientId; // Convertir a número
    }
  
    if (!this.patientId || this.patientId <= 0) {
      console.warn('El ID del paciente es inválido o no está definido.');
      return;
    }
  
    // Verificar si el ID del psicólogo está definido
    if (!this.psychologistId || this.psychologistId <= 0) {
      console.warn('El ID del psicólogo es inválido o no está definido.');
      return;
    }
  
    // Abrir el modal
    this.isFichaPacienteModalOpen = true;
  }
  
  closeFichaPacienteModal(): void {
    this.isFichaPacienteModalOpen = false;
  
    // Actualizar datos del paciente para ReportsComponent
    if (this.patientId) {
      console.log('Actualizando ReportsComponent con ID del paciente:', this.patientId);
      this.patientDetails.id = this.patientId;
      this.patientDetails.name = this.patientDetails.name || 'Nombre desconocido';
    }
  }
  





  async toggleDataView(): Promise<void> {
    this.isRealTime = !this.isRealTime;
    this.animateFlip = true;

    setTimeout(() => {
      this.animateFlip = false;
    }, 600);

    if (this.patientDetails.email) {
      await this.initializePatientData(this.patientDetails.email);
    }
  }
}
