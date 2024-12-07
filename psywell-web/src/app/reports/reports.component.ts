import { Component, OnInit, OnChanges, SimpleChanges, Input } from '@angular/core';
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
import { PatientDataService } from 'app/services/patient-data.service';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { AngularFirestore } from '@angular/fire/compat/firestore';

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
  @Input() psychologistId: string | number | null = null; // Añadido para recibir psychologistId

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
    private citasService: CitasService,
    private patientDataService: PatientDataService,
    private firestore: AngularFirestore // Inyecta AngularFirestore

  ) {}


  

  ngOnInit(): void {
    console.log('[ReportsComponent] ngOnInit ejecutado');
    this.verificarYProcesarDatos();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('[ReportsComponent] ngOnChanges detectado:', changes);
    if (changes['patientId'] || changes['psychologistId']) {
      this.verificarYProcesarDatos();
    }
  }
  
  verificarYProcesarDatos(): void {
    if (this.patientId && this.psychologistId) {
      this.fetchPatientDetails(this.patientId);
      this.fetchPsychologistName(this.psychologistId);
      this.cargarRegistrosEmocionales();
      setTimeout(() => {
        if (this.patientDetails.email) {
          this.fetchPhysiologicalData(this.patientDetails.email);
        }
      }, 1000);
    }
  }
  

  fetchPhysiologicalData(email: string): void {
    if (!email) {
      console.warn('No se puede obtener datos fisiológicos sin un correo.');
      return;
    }
  
    this.patientDataService.getPhysiologicalData(email).then((data: any) => {
      if (data) {
        console.log('Datos fisiológicos obtenidos:', data);
        this.registrosFisiologicos = [
          { parametro: 'Frecuencia Cardíaca', valor: `${data.bpm || 'N/A'} BPM` },
          { parametro: 'Saturación de Oxígeno', valor: `${data.oxygen || 'N/A'}%` },
          { parametro: 'Pasos', valor: `${data.steps || 'N/A'}` },
          { parametro: 'Horas de Sueño', valor: `${data.sleep || 'N/A'} hrs` },
        ];
      } else {
        console.warn('No se encontraron datos fisiológicos.');
      }
    }).catch((error: unknown) => { // Cambia 'unknown' si prefieres otro tipo
      console.error('Error al obtener datos fisiológicos:', error);
    });
  }
  
  

  fetchPsychologistName(psychologistId: string | number): void {
    this.usersService.obtenerUsuarioPorId(psychologistId.toString()).subscribe((response: any) => {
      this.psychologistName = response?.data?.nombre || 'Desconocido';
    });
  }

  logPsychologistDetails(): void {
    console.log('Detalles del psicólogo en ReportsComponent:', {
      psychologistId: this.psychologistId,
      psychologistName: this.psychologistName,
    });
  }
  

  
  cargarRegistrosEmocionales(): void {
    this.citasService.obtenerRegistrosPorPaciente(+this.patientId!).subscribe({
      next: (response: any[]) => {
        this.emocionesPaciente = response.map((registro) => ({
          estadoEmocional: registro.estadoEmocional,
          notas: registro.comentarios || 'Sin notas',
          fecha: new Date(registro.fecha).toLocaleDateString('es-ES'),
        }));
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

fetchPatientFicha(patientId: string | number): void {
  console.log('[ReportsComponent] Iniciando fetchPatientFicha con ID:', patientId);
  const idAsString = patientId.toString();

  this.usersService.obtenerFichaPorIdPaciente(idAsString).subscribe(
    (response: any) => {
      console.log('[ReportsComponent] Ficha del paciente recibida:', response);
      if (response?.data) {
        // Actualizamos el diagnóstico en los detalles del paciente
        this.patientDetails.diagnosis = response.data.diagnostico || 'Sin diagnóstico';
        console.log('[ReportsComponent] Diagnóstico actualizado:', this.patientDetails.diagnosis);
      } else {
        console.warn('[ReportsComponent] No se encontró ficha para el paciente con ID:', patientId);
      }
    },
    (error) => {
      console.error('[ReportsComponent] Error al obtener la ficha del paciente:', error);
    }
  );
}

  
  getFirebaseImageUrl(email: string, tipo: 'profile' | 'banner'): string {
    const sanitizedEmail = email.replace(/@/g, '_').replace(/\./g, '_');
    const folder = tipo === 'profile' ? 'fotoPerfil' : 'fotoPortada';
    return `https://firebasestorage.googleapis.com/v0/b/psywell-ab0ee.firebasestorage.app/o/${folder}%2F${encodeURIComponent(
      sanitizedEmail
    )}?alt=media`;
  }
  
  fetchPatientDetails(patientId: string | number): void {
    this.usersService.obtenerUsuarioPorId(patientId.toString()).subscribe((response: any) => {
      this.patientDetails = {
        name: response?.data?.nombre || 'Desconocido',
        age: response?.data?.fechaNacimiento
          ? this.calculateAge(response.data.fechaNacimiento)
          : 'Desconocida',
        email: response?.data?.email || '',
        diagnosis: response?.data?.diagnostico || 'Sin diagnóstico',
      };
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
  return age;
}

 
  emocionesPaciente: any[] = []; // Almacena los registros emocionales del paciente

  isLoading: boolean = false;

 
  exportPDF(): void {
    const doc = new jsPDF('p', 'mm', 'a4');
    const currentDate = new Date().toLocaleDateString('es-ES');

    // Márgenes
    const marginX = 15; // Márgenes laterales
    const marginY = 15; // Márgenes superior e inferior

    // Fondo claro
    doc.setFillColor(240, 248, 255);
    doc.rect(0, 0, 210, 297, 'F');

    // Logo
    const logoPath = 'assets/logo.png'; // Ruta del logo de PsyWell
    doc.addImage(logoPath, 'PNG', marginX, marginY, 30, 30);

    // Título principal
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(33, 37, 41);
    doc.text('Reporte del Paciente - PsyWell', marginX + 40, marginY + 15);

    // Línea decorativa
    doc.setDrawColor(33, 37, 41);
    doc.setLineWidth(0.5);
    doc.line(marginX, marginY + 25, 210 - marginX, marginY + 25);

    // Detalles del psicólogo
    let currentY = marginY + 35;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Psicólogo:', marginX, currentY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${this.psychologistName}`, marginX, currentY + 10);
    doc.text(`Fecha del Reporte: ${currentDate}`, marginX, currentY + 20);

    // Línea separadora
    currentY += 25;
    doc.setDrawColor(33, 37, 41);
    doc.line(marginX, currentY, 210 - marginX, currentY);

    // Detalles del paciente
    currentY += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Paciente:', marginX, currentY);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Nombre: ${this.patientDetails.name}`, marginX, currentY + 10);
    doc.text(`Edad: ${this.patientDetails.age} años`, marginX, currentY + 20);
    doc.text(`Diagnóstico: ${this.patientDetails.diagnosis}`, marginX, currentY + 30);

    // Línea separadora
    currentY += 35;
    doc.setDrawColor(33, 37, 41);
    doc.line(marginX, currentY, 210 - marginX, currentY);

    // Registros emocionales
    currentY += 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Registros Emocionales:', marginX, currentY);

    if (this.emocionesPaciente.length > 0) {
      autoTable(doc, {
        startY: currentY + 10,
        head: [['Estado Emocional', 'Notas', 'Fecha']],
        body: this.emocionesPaciente.map((emotion) => [
          emotion.estadoEmocional,
          emotion.notas,
          emotion.fecha,
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: 255,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: marginX, right: marginX }, // Añadimos márgenes laterales a las tablas
      });
      currentY = (doc as any).lastAutoTable.finalY + 10;
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('No se registraron emociones.', marginX, currentY + 10);
      currentY += 20;
    }

    // Línea separadora
    doc.setDrawColor(33, 37, 41);
    doc.line(marginX, currentY, 210 - marginX, currentY);
    currentY += 5;

    // Registros fisiológicos
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Registros Fisiológicos:', marginX, currentY);

    if (this.registrosFisiologicos.length > 0) {
      autoTable(doc, {
        startY: currentY + 10,
        head: [['Parámetro', 'Valor']],
        body: this.registrosFisiologicos.map((registro) => [
          registro.parametro,
          registro.valor,
        ]),
        theme: 'striped',
        headStyles: {
          fillColor: [76, 175, 80],
          textColor: 255,
          fontStyle: 'bold',
        },
        styles: {
          fontSize: 10,
          cellPadding: 5,
        },
        margin: { left: marginX, right: marginX }, // Márgenes laterales en la tabla
      });
    } else {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('No se registraron datos fisiológicos.', marginX, currentY + 10);
    }

    // Footer decorativo
    const footerY = doc.internal.pageSize.height - marginY + 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(33, 37, 41);
    doc.text(
      'PsyWell - Monitoreo continuo de la salud mental | Contacto: psywellsolutions@gmail.com',
      marginX,
      footerY - 10
    );
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Todos los derechos reservados © PsyWell 2024', marginX, footerY);

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
    // Crear el workbook y agregar las hojas
    const workbook = XLSX.utils.book_new();

    // Hoja 1: Detalles del Paciente
    const patientSheet = XLSX.utils.json_to_sheet([
        { Campo: 'Nombre', Valor: this.patientDetails.name },
        { Campo: 'Edad', Valor: `${this.patientDetails.age} años` },
        { Campo: 'Diagnóstico', Valor: this.patientDetails.diagnosis },
        { Campo: 'Rango de Tiempo', Valor: this.translateTimeFrame(this.timeFrame) },
    ]);
    XLSX.utils.book_append_sheet(workbook, patientSheet, 'Detalles del Paciente');

    // Hoja 2: Registros Emocionales
    const emotionsSheet = XLSX.utils.json_to_sheet(
        this.emocionesPaciente.map((emotion) => ({
            'Estado Emocional': emotion.estadoEmocional,
            Notas: emotion.notas,
        }))
    );
    XLSX.utils.book_append_sheet(workbook, emotionsSheet, 'Registros Emocionales');

    // Hoja 3: Registros Fisiológicos
    const physiologicalSheet = XLSX.utils.json_to_sheet(
        this.registrosFisiologicos.map((record) => ({
            Parámetro: record.parametro,
            Valor: record.valor,
            Estado: 'Normal',
        }))
    );
    XLSX.utils.book_append_sheet(workbook, physiologicalSheet, 'Registros Fisiológicos');

    // Estilizar encabezados de las tablas
    const styleHeader = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "4CAF50" } },
        alignment: { horizontal: "center", vertical: "center" },
    };

    // Ajustar ancho de columnas
    const sheets = [patientSheet, emotionsSheet, physiologicalSheet];
    const columnWidths = [
        [{ wpx: 150 }, { wpx: 300 }], // Para Hoja 1
        [{ wpx: 200 }, { wpx: 500 }], // Para Hoja 2
        [{ wpx: 200 }, { wpx: 150 }, { wpx: 150 }], // Para Hoja 3
    ];

    sheets.forEach((sheet, index) => {
        sheet['!cols'] = columnWidths[index];
        const range = XLSX.utils.decode_range(sheet['!ref']!);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const address = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            if (!sheet[address]) continue;
            sheet[address].s = styleHeader; // Aplica el estilo solo al encabezado
        }
    });

    // Guardar el archivo Excel
    XLSX.writeFile(workbook, `Reporte_Paciente_${this.patientDetails.name}.xlsx`);
}
  



getPhysiologicalData(email: string): Promise<any> {
  return this.firestore
    .collection('datos_fisiologicos')
    .doc(email)
    .ref.get()
    .then((doc) => (doc.exists ? doc.data() : null))
    .catch((error) => {
      console.error('Error al obtener datos fisiológicos:', error);
      throw error;
    });
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
