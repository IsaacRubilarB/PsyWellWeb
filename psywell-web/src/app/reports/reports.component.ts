import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UsersService } from '../services/userService';
import { ReportsService } from '../services/reports.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import * as XLSX from 'xlsx'; 
import { CitasService } from '../services/citasService';


@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ReportsComponent implements OnInit {
  @Input() patientId: string | number | null = null;
  @Input() patientDetails: any = {}; 

  timeFrame: 'weekly' | 'monthly' | 'quarterly' | 'yearly' = 'weekly';

  psychologistName = 'Desconocido'; 
  emociones: any[] = [];
  registrosFisiologicos = [
    { parametro: 'Frecuencia Cardíaca', valor: '75 BPM' },
    { parametro: 'Saturación de Oxígeno', valor: '95%' },
    { parametro: 'Pasos', valor: '1000' },
    { parametro: 'Calorías', valor: '200 kcal' },
  ];

  constructor(
    private router: Router,
    private afAuth: AngularFireAuth,
    private usersService: UsersService,
    private reportsService: ReportsService,
    private citasService: CitasService
  ) {}


  
  ngOnInit(): void {
    console.log('ID del paciente recibido en ReportsComponent:', this.patientId);
    
    this.fetchLoggedPsychologist(); // Asegúrate de que se llama aquí
    
    if (this.patientId) {
      this.cargarRegistrosEmocionales();
    } else {
      console.warn('El ID del paciente no fue recibido en ReportsComponent.');
    }
  }
  
cargarRegistrosEmocionales(): void {
  if (!this.patientId) {
    console.warn('No se proporcionó un ID de paciente.');
    return;
  }

  const idAsString = this.patientId.toString(); // Convertir el ID a string

  this.citasService.obtenerRegistrosPorPaciente(+idAsString).subscribe({
    next: (response: any[]) => {
      if (response && response.length > 0) {
        this.emocionesPaciente = response
          .filter((registro) => registro.idUsuario.toString() === idAsString)
          .map((registro) => ({
            emoji: this.mapEmotionToIcon(registro.estadoEmocional),
            estadoEmocional: registro.estadoEmocional,
            notas: registro.comentarios || 'Sin notas',
            fecha: new Date(registro.fecha).toLocaleDateString('es-ES'),
          }));
        console.log('Registros emocionales cargados:', this.emocionesPaciente);
      } else {
        console.warn('No se encontraron registros emocionales.');
        this.emocionesPaciente = [];
      }
    },
    error: (error: any) => {
      console.error('Error al cargar registros emocionales:', error);
      this.emocionesPaciente = [];
    },
  });
}

  

fetchLoggedPsychologist(): void {
  this.afAuth.authState.subscribe((user) => {
    if (user?.email) {
      console.log('Usuario autenticado:', user.email); // Para depuración
      this.usersService.listarUsuarios().subscribe((response: any) => {
        const users = response?.data || [];
        const psicologo = users.find((u: any) => u.email === user.email);
        if (psicologo) {
          this.psychologistName = psicologo.nombre || 'Desconocido';
        } else {
          console.warn('No se encontró un psicólogo con el correo:', user.email);
          this.psychologistName = 'No se ha asignado un psicólogo.';
        }
      });
    } else {
      console.warn('No hay un usuario autenticado.');
      this.psychologistName = 'No se ha asignado un psicólogo.';
    }
  });
}


  
  getFirebaseImageUrl(email: string, tipo: 'profile' | 'banner'): string {
    const sanitizedEmail = email.replace(/@/g, '_').replace(/\./g, '_');
    const folder = tipo === 'profile' ? 'fotoPerfil' : 'fotoPortada';
    return `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${folder}%2F${encodeURIComponent(
      sanitizedEmail
    )}?alt=media`;
  }
  
  fetchPatientDetails(patientId: string | number): void {
    const idAsString = patientId.toString();
  
    this.usersService.obtenerUsuarioPorId(idAsString).subscribe((response: any) => {
      if (response?.data) {
        this.patientDetails = {
          name: response.data.nombre || 'Nombre desconocido',
          age: response.data.fechaNacimiento
            ? this.calculateAge(response.data.fechaNacimiento)
            : 'Edad desconocida',
          diagnosis:
            response.data.diagnostico || 'Aún no se da la primera cita, en la cual se hace un primer diagnóstico por parte del profesional',
        };
        console.log('Detalles del paciente cargados:', this.patientDetails);
      } else {
        console.warn('No se encontraron datos para el paciente con ID:', patientId);
      }
    });
  }
  

  fetchEmotions(): void {
    if (this.patientId) {
      const idAsString = this.patientId.toString();
      this.reportsService.getEmocionesByUsuario(idAsString).subscribe((emociones: any[]) => {
        this.emociones = emociones.map((emotion) => ({
          emotion: emotion.emocion,
          icon: this.mapEmotionToIcon(emotion.emocion),
          notes: emotion.notas || 'Sin notas',
        }));
        console.log('Emociones obtenidas:', this.emociones);
      });
    } else {
      console.warn('No se puede obtener emociones sin un ID de paciente.');
    }
  }
  

  mapEmotionToIcon(emotion: string): string {
    const icons: Record<string, string> = {
        'Muy enojado': '😡',
        'Molesto': '😠',
        'Neutral': '😐',
        'Feliz': '😊',
        'Muy feliz': '😁',
    };
    return icons[emotion] || '🤔';
}

  calculateAge(fechaNacimiento: string): number | string {
    const birthDate = new Date(fechaNacimiento);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age || 'Edad desconocida';
  }


 
  emocionesPaciente: any[] = []; // Almacena los registros emocionales del paciente

  isLoading: boolean = false;

 

  exportPDF(): void {
    if (!this.patientDetails.name) {
      console.error('No se puede generar el reporte. Faltan datos del paciente.');
      return;
    }
  
    const doc = new jsPDF('p', 'mm', 'a4');
    const currentDate = new Date().toLocaleDateString('es-ES');
  
    // Fondo claro
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 297, 'F');
  
    // Logo
    const logoPath = 'assets/logo.png';
    doc.addImage(logoPath, 'PNG', 10, 10, 30, 30);
  
    // Título principal
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(33, 37, 41);
    doc.text('Reporte del Paciente - PsyWell', 50, 25);
  
    // Línea decorativa
    doc.setDrawColor(33, 37, 41);
    doc.setLineWidth(0.5);
    doc.line(10, 40, 200, 40);
  
    // Detalles del psicólogo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Psicólogo:', 10, 55);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${this.psychologistName}`, 10, 65);
    doc.text(`Fecha del Reporte: ${currentDate}`, 10, 75);
  
    // Línea de separación
    doc.setDrawColor(33, 37, 41);
    doc.line(10, 80, 200, 80);
  
    // Detalles del paciente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Paciente:', 10, 90);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${this.patientDetails.name}`, 10, 100);
    doc.text(`Edad: ${this.patientDetails.age} años`, 10, 110);
  
    // Diagnóstico
    doc.setFont('helvetica', 'bold');
    doc.text(`Diagnóstico:`, 10, 120);
    const diagnosisText =
      this.patientDetails.diagnosis === 'Sin diagnóstico'
        ? 'Sin diagnóstico. Aún no se ha llevado a cabo la primera sesión con el profesional a cargo para determinar un diagnóstico inicial.'
        : this.patientDetails.diagnosis;
  
    const diagnosisLines = doc.splitTextToSize(diagnosisText, 190);
    doc.setFont('helvetica', 'normal');
    doc.text(diagnosisLines, 10, 130);
  
    // Línea de separación
    doc.setDrawColor(33, 37, 41);
    doc.line(10, 140, 200, 140);
  
    // Rango de tiempo
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Rango de Tiempo:`, 10, 150);
    doc.setFont('helvetica', 'normal');
    doc.text(this.translateTimeFrame(this.timeFrame), 10, 160);
  
    // Línea de separación
    doc.setDrawColor(33, 37, 41);
    doc.line(10, 165, 200, 165);
  
    // Registros emocionales
    let currentY = 170;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Registros Emocionales:', 10, currentY);
  
    if (this.emocionesPaciente && this.emocionesPaciente.length > 0) {
      autoTable(doc, {
        startY: currentY + 5,
        head: [['Estado Emocional', 'Notas', 'Fecha']],
        body: this.emocionesPaciente.map((emotion) => [
          {
            content: emotion.estadoEmocional,
            styles: {
              halign: 'center',
              fillColor: this.getEmotionColor(emotion.estadoEmocional),
              textColor: [0, 0, 0], // Texto negro para contraste
              fontStyle: 'bold',
            },
          },
          emotion.notas,
          emotion.fecha,
        ]),
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: [76, 175, 80], // Verde estándar para encabezado
          textColor: 255, // Blanco
          fontStyle: 'bold',
        },
      });
  
      // Actualizar la posición Y al final de la tabla
      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(54, 69, 79);
      doc.text('No se registraron emociones para este paciente.', 10, currentY + 15);
      currentY += 20;
    }
  
    // Nueva sección: Registros fisiológicos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Registros Fisiológicos:', 10, currentY);
  
    autoTable(doc, {
      startY: currentY + 5,
      head: [['Parámetro', 'Valor']],
      body: this.registrosFisiologicos.map((registro) => [
        registro.parametro,
        registro.valor,
      ]),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
      },
      headStyles: {
        fillColor: [76, 175, 80], // Verde estándar para encabezado
        textColor: 255, // Blanco
        fontStyle: 'bold',
      },
    });
  
    // Footer
    const footerY = doc.internal.pageSize.height - 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 37, 41);
    doc.text(
      'PsyWell - Monitoreo continuo de la salud mental | Contacto: psywellsolutions@gmail.com',
      10,
      footerY
    );
  
    // Guardar PDF
    doc.save(`Reporte_Paciente_${this.patientDetails.name}.pdf`);
  }
  

  
  

  getEmotionColor(emotion: string): [number, number, number] {
    switch (emotion) {
      case 'Muy enojado':
        return [255, 153, 153]; // Rojo pastel
      case 'Molesto':
        return [255, 204, 153]; // Naranja pastel
      case 'Neutral':
        return [255, 255, 204]; // Amarillo pastel
      case 'Feliz':
        return [204, 255, 204]; // Verde claro pastel
      case 'Muy feliz':
        return [153, 255, 153]; // Verde fuerte pastel
      default:
        return [240, 248, 255]; // Fondo por defecto claro
    }
  }
  
  
  
  
  
  

  
  loadImage(url: string): Promise<string | null> {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Evitar problemas de CORS
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  }
  


 



  exportExcel(): void {
    const workbook = XLSX.utils.book_new();
    const patientSheet = XLSX.utils.json_to_sheet([
      { Campo: 'Nombre', Valor: this.patientDetails.name },
      { Campo: 'Edad', Valor: `${this.patientDetails.age} años` },
      { Campo: 'Diagnóstico', Valor: this.patientDetails.diagnosis },
    ]);

    const physiologicalSheet = XLSX.utils.json_to_sheet(
      this.registrosFisiologicos.map((record) => ({
        Parámetro: record.parametro,
        Valor: record.valor,
      }))
    );

    XLSX.utils.book_append_sheet(workbook, patientSheet, 'Detalles del Paciente');
    XLSX.utils.book_append_sheet(workbook, physiologicalSheet, 'Registros Fisiológicos');

    XLSX.writeFile(workbook, `Reporte_Paciente_${this.patientDetails.name}.xlsx`);
  }

  translateTimeFrame(timeFrame: string): string {
    const translations: Record<string, string> = {
      weekly: 'Semanal',
      monthly: 'Mensual',
      quarterly: 'Trimestral',
      yearly: 'Anual',
    };
    return translations[timeFrame] || timeFrame;
  }

  onTimeFrameChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    this.timeFrame = selectedValue as 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    console.log('Rango de tiempo cambiado a:', this.timeFrame);
  }

  goBack(): void {
    this.router.navigate(['/patient-details']);
  }
}
