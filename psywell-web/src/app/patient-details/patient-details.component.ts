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
  bpm: number = 0; // Latidos por minuto
saturationLevel: number = 0; // Saturación de oxígeno
steps: number = 0; // Pasos
sleep: number = 0; // Horas de sueño
  isFichaPacienteModalOpen = false;
  bpmWeekly: number = 0; // Latidos semanales
  saturationLevelWeekly: number = 0; // Saturación de oxígeno semanal
  stepsWeekly: number = 0; // Pasos semanales
  sleepWeekly: number = 0; // Horas de sueño semanales
  showWeekly: boolean = false; // Alternar entre vista semanal y en vivo
  
  medications: any[] = [];
  appointments: any[] = [];
  psychologistName: string = 'Desconocido'; // NUEVA PROPIEDAD

  isRealTime: boolean = true;

  @ViewChild('heartAnimation') heartAnimationDiv!: ElementRef;
  @ViewChild('saturationAnimation') saturationAnimationDiv!: ElementRef;
  @ViewChild('stepsAnimation') stepsAnimationDiv!: ElementRef;
  @ViewChild('sleepAnimation') sleepAnimationDiv!: ElementRef;

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
  
      // Obtener detalles del paciente
      await this.obtenerDetallesPaciente(this.patientId.toString());
      
      // Cargar datos fisiológicos del paciente si se tiene el correo
      if (this.patientDetails.email) {
        await this.loadPhysiologicalData(this.patientDetails.email);
      }
  
      // Forzar actualización de la vista
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
      await this.loadPhysiologicalData(this.patientDetails.email); // Llama al nuevo método aquí
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
  

 
  async loadPhysiologicalData(email: string): Promise<void> {
    try {
      console.log('Cargando datos fisiológicos para:', email);
  
      const physiologicalData = await this.patientDataService.getPhysiologicalData(email);
  
      if (physiologicalData) {
        this.bpm = parseInt(physiologicalData.bpm, 10) || this.bpm;
        this.saturationLevel = parseInt(physiologicalData.oxygen, 10) || this.saturationLevel;
        this.steps = parseInt(physiologicalData.steps, 10) || this.steps;
        this.sleep = parseInt(physiologicalData.sleep, 10) || this.sleep;
  
        // Datos semanales
        this.bpmWeekly = parseInt(physiologicalData.bpmSemanal, 10) || this.bpmWeekly;
        this.saturationLevelWeekly = parseInt(physiologicalData.oxygenSemanal, 10) || this.saturationLevelWeekly;
        this.stepsWeekly = parseInt(physiologicalData.stepsSemanal, 10) || this.stepsWeekly;
        this.sleepWeekly = parseInt(physiologicalData.sleepSemanal, 10) || this.sleepWeekly;
  
        console.log('Datos fisiológicos cargados:', physiologicalData);
      } else {
        console.warn('No se encontraron datos fisiológicos para este paciente.');
      }
    } catch (error) {
      console.error('Error al cargar datos fisiológicos:', error);
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
      container: this.sleepAnimationDiv.nativeElement,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/assets/lottie/sleep.json',
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
    this.showWeekly = !this.showWeekly; // Alternar entre semanal y en vivo
    this.animateFlip = true;
  
    setTimeout(() => {
      this.animateFlip = false;
    }, 600);
  
    if (this.patientDetails.email) {
      await this.loadPhysiologicalData(this.patientDetails.email);
    }
  }
  
  
}
