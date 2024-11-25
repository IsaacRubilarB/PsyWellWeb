import { Component, AfterViewInit, ChangeDetectorRef, ElementRef, ViewChild, ViewChildren, QueryList, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService } from 'app/services/userService';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { FichaPacienteComponent } from '../ficha-paciente/ficha-paciente.component';
import { RegistroService } from 'app/services/registroService';
import { PatientDataService } from 'app/services/patient-data.service';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'],
  standalone: true,
  imports: [CommonModule, NavbarComponent, FichaPacienteComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class PatientDetailsComponent implements AfterViewInit, OnInit {
  patientId: string | null = null;
  animateFlip: boolean = false;

  patientDetails: any = {};
  bpm: number = 75;
  saturationLevel: number = 95;
  steps: number = 0;
  calories: number = 0;
  isFichaPacienteModalOpen = false;

  medications: any[] = [];
  appointments: any[] = [];

  isRealTime: boolean = true; // Estado para alternar entre data en vivo y semanal

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
    private registroService: RegistroService,
    private patientDataService: PatientDataService
  ) {}

  async ngOnInit(): Promise<void> {
    this.patientId = this.route.snapshot.paramMap.get('id');
    if (this.patientId) {
      this.obtenerDetallesPaciente(this.patientId);
    }
  }

  obtenerDetallesPaciente(id: string) {
    this.usersService.obtenerUsuarioPorId(id).subscribe(
      async (response: any) => {
        const data = response.data;
        if (data) {
          const email = data.correo || data.email || '';
          const photoUrl = email ? this.getFirebaseImageUrl(email, 'profile') : 'assets/patient.png';

          this.patientDetails = {
            name: data.nombre || 'Nombre desconocido',
            age: data.fechaNacimiento ? this.calculateAge(data.fechaNacimiento) : 'Edad desconocida',
            diagnosis: data.diagnosis || 'Sin diagnóstico',
            notes: data.notes || 'Sin notas',
            email: email,
            photo: photoUrl,
          };

          this.medications = data.medications || [];
          this.appointments = data.appointments || [];

          if (email) {
            await this.initializePatientData(email);
          }
        }
      },
      (error: any) => {
        console.error('Error al obtener detalles del paciente:', error);
      }
    );
  }

  private getFirebaseImageUrl(email: string, tipo: 'profile' | 'banner'): string {
    const sanitizedEmail = email.replace(/@/g, '_').replace(/\./g, '_');
    const folder = tipo === 'profile' ? 'fotoPerfil' : 'fotoPortada';
    return `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${folder}%2F${encodeURIComponent(
      sanitizedEmail
    )}?alt=media`;
  }

  calculateAge(fechaNacimiento: string): number {
    const [day, month, year] = fechaNacimiento.split('/');
    const birthDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
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

  generateReport() {
    this.registroService.listarRegistroByUser(this.patientId).subscribe((res) => {
      const data = res.data;
      if (data.length === 0) {
        alert('No se encontraron datos para exportar');
        return;
      }
      const columns = this.getColumns(data);
      const rows = this.getRows(data, columns);
      const doc = new jsPDF();
      autoTable(doc, { head: [columns], body: rows });
      doc.save('data.pdf');
    });
  }

  getColumns(data: any[]): string[] {
    const columns: string[] = [];
    data.forEach((row) => {
      Object.keys(row).forEach((col) => {
        if (!columns.includes(col)) {
          columns.push(col);
        }
      });
    });
    return columns;
  }

  getRows(data: any[], columns: string[]): any[] {
    const rows: any[] = [];
    data.forEach((row) => {
      const values: any[] = [];
      columns.forEach((col) => {
        values.push(row[col] || '');
      });
      rows.push(values);
    });
    return rows;
  }

  openFichaPacienteModal() {
    this.isFichaPacienteModalOpen = true;
  }

  closeFichaPacienteModal() {
    this.isFichaPacienteModalOpen = false;
  }



   // Función para alternar entre datos y activar la animación
   async toggleDataView(): Promise<void> {
    this.isRealTime = !this.isRealTime;
    this.animateFlip = true;

    // Desactiva la animación después de que termine
    setTimeout(() => {
      this.animateFlip = false;
    }, 600); // Tiempo en milisegundos que coincide con la transición en CSS

    if (this.isRealTime) {
      await this.loadRealTimePatientData(this.patientDetails.email);
    } else {
      await this.loadWeeklyPatientData(this.patientDetails.email);
    }
  }
}
