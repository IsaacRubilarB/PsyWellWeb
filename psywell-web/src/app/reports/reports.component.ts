import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReportsService } from '../services/reports.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { UsersService } from '../services/userService';
import { PatientDataService } from '../services/patient-data.service';
import { SafeUrlPipe } from '../pipes/safe-url.pipe'; // Asegúrate de usar la ruta correcta


@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent,SafeUrlPipe],
})
export class ReportsComponent implements OnInit {
  reportForm: FormGroup;
  data: any[] = [];
  pacientes: any[] = [];
  selectedPaciente: any = null;
  citas: any[] = [];
  emociones: any[] = [];
  emocionesFiltradas: any[] = [];
  citasFiltradas: any[] = [];
  realTimeData: any = null;
  googleMapsUrl: string = '';
  loading = false;
  emotionDetailsMap: { [key: string]: any } = {}; // Store preloaded emotion details

  constructor(
    private fb: FormBuilder,
    private reportsService: ReportsService,
    private usersService: UsersService,
    private patientDataService: PatientDataService,
    private http: HttpClient
  ) {
    this.reportForm = this.fb.group({
      paciente: [''],
      emocion: [''],
      rangoFechas: [''],
    });
  }

  ngOnInit(): void {
    this.loadPacientes();
    this.fetchCitas();
    this.fetchEmociones();
    this.preloadEmotionDetails(); // Preload emotion details
  }

  fetchCitas(): void {
    this.reportsService.getAllCitas().subscribe({
      next: (response) => {
        this.citas = response?.data || [];
      },
      error: (err) => {
        console.error('Error al cargar citas:', err);
      },
    });
  }

  fetchEmociones(): void {
    this.reportsService.getAllEmociones().subscribe({
      next: (response) => {
        this.emociones = response?.data || [];
      },
      error: (err) => {
        console.error('Error al cargar emociones:', err);
      },
    });
  }

  loadPacientes(): void {
    this.usersService.listarUsuarios().subscribe({
      next: (response) => {
        this.pacientes = response.data.filter((user: any) => user.perfil !== 'psicologo');
      },
      error: (err) => {
        console.error('Error al cargar pacientes:', err);
      },
    });
  }

  async loadPacienteData(): Promise<void> {
    const pacienteId = this.reportForm.value.paciente;
    const paciente = this.pacientes.find((p) => p.idUsuario === pacienteId);

    if (paciente?.email) {
      try {
        this.realTimeData = await this.patientDataService.getRealTimeData(paciente.email);
        const weeklyData = await this.patientDataService.getWeeklyData(paciente.email);
        this.selectedPaciente = { ...paciente, realTimeData: this.realTimeData, weeklyData };
      } catch (error) {
        console.error('Error al cargar datos del paciente:', error);
      }
    }
  }

  applyFilters(): void {
    const { paciente, emocion, rangoFechas } = this.reportForm.value;

    if (paciente) {
      this.selectedPaciente = this.pacientes.find((p) => p.idUsuario === paciente);

      this.googleMapsUrl = this.generateGoogleMapsUrl(this.selectedPaciente?.ubicacion);

      this.emocionesFiltradas = this.emociones.filter(
        (em) => em.idUsuario === paciente && (!emocion || em.estadoEmocional === emocion)
      );

      this.citasFiltradas = this.citas.filter(
        (cita) =>
          cita.idPaciente === paciente &&
          (!rangoFechas || this.isDateInRange(cita.fecha, rangoFechas))
      );
    }
  }

  preloadEmotionDetails(): void {
    const emotionFiles: { [key: string]: string } = {
      'Muy Feliz!': 'assets/lottie/feliz.json',
      Feliz: 'assets/lottie/feliz.json',
      neutral: 'assets/lottie/neutral.json',
      Molesto: 'assets/lottie/triste.json',
      'Muy enojado': 'assets/lottie/angry.json',
    };
  
    Object.entries(emotionFiles).forEach(([emotion, path]) => {
      this.http.get(path).subscribe({
        next: (data) => {
          this.emotionDetailsMap[emotion] = data;
        },
        error: (err) => {
          console.error(`Error al cargar detalles de emoción "${emotion}":`, err);
        },
      });
    });
  }
  

  getEmotionDetails(emotion: string): any {
    return this.emotionDetailsMap[emotion] || { title: 'Desconocido', description: 'Sin descripción' };
  }

  generateGoogleMapsUrl(ubicacion: string): string {
    const baseUrl = 'https://www.google.com/maps/embed/v1/place';
    const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
    return `${baseUrl}?key=${apiKey}&q=${encodeURIComponent(ubicacion)}`;
  }

  isDateInRange(fecha: string, rango: string): boolean {
    const date = new Date(fecha);
    const now = new Date();

    if (rango === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo && date <= now;
    } else if (rango === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return date >= monthAgo && date <= now;
    } else if (rango === 'quarter') {
      const quarterAgo = new Date(now);
      quarterAgo.setMonth(now.getMonth() - 3);
      return date >= quarterAgo && date <= now;
    } else if (rango === 'semester') {
      const semesterAgo = new Date(now);
      semesterAgo.setMonth(now.getMonth() - 6);
      return date >= semesterAgo && date <= now;
    } else if (rango === 'year') {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(now.getFullYear() - 1);
      return date >= yearAgo && date <= now;
    }
    return true;
  }

  exportToExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.citasFiltradas);
    const workbook = { Sheets: { data: worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'reportes.xlsx');
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    autoTable(doc, { html: '#report-table' });
    doc.save('reportes.pdf');
  }
}
