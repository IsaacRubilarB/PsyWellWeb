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
    private citasService: CitasService
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
    console.log('[ReportsComponent] Verificando datos de entrada...');
    if (this.patientId && this.psychologistId) {
      console.log('[ReportsComponent] IDs válidos recibidos:', {
        patientId: this.patientId,
        psychologistId: this.psychologistId,
      });
      this.cargarRegistrosEmocionales();
      this.fetchPatientDetails(this.patientId);
      this.fetchPsychologistName(this.psychologistId);
      this.fetchPatientFicha(this.patientId); // Llamar al método para obtener la ficha
    } else {
      console.warn('[ReportsComponent] Faltan IDs de entrada:', {
        patientId: this.patientId,
        psychologistId: this.psychologistId,
      });
    }
}

  fetchPsychologistName(psychologistId: string | number): void {
    console.log('[ReportsComponent] Iniciando fetchPsychologistName con ID:', psychologistId);
    this.usersService.obtenerUsuarioPorId(psychologistId.toString()).subscribe(
      (response: any) => {
        console.log('[ReportsComponent] Detalles del psicólogo recibidos:', response);
        if (response?.data?.nombre) {
          this.psychologistName = response.data.nombre;
          console.log('[ReportsComponent] Nombre del psicólogo asignado:', this.psychologistName);
        } else {
          console.warn('[ReportsComponent] No se encontró un psicólogo con el ID:', psychologistId);
        }
      },
      (error) => {
        console.error('[ReportsComponent] Error al obtener el nombre del psicólogo:', error);
      }
    );
  }

  logPsychologistDetails(): void {
    console.log('Detalles del psicólogo en ReportsComponent:', {
      psychologistId: this.psychologistId,
      psychologistName: this.psychologistName,
    });
  }
  

  
  cargarRegistrosEmocionales(): void {
    console.log('[ReportsComponent] Cargando registros emocionales...');
    if (!this.patientId) {
      console.warn('[ReportsComponent] No se proporcionó un ID de paciente.');
      return;
    }
  
    const idAsString = this.patientId.toString();
    console.log('[ReportsComponent] ID del paciente utilizado:', idAsString);
  
    this.citasService.obtenerRegistrosPorPaciente(+idAsString).subscribe({
      next: (response: any[]) => {
        console.log('[ReportsComponent] Registros emocionales recibidos:', response);
        if (response && response.length > 0) {
          this.emocionesPaciente = response.map((registro) => ({
            emoji: this.mapEmotionToIcon(registro.estadoEmocional),
            estadoEmocional: registro.estadoEmocional,
            notas: registro.comentarios || 'Sin notas',
            fecha: new Date(registro.fecha).toLocaleDateString('es-ES'),
          }));
        } else {
          console.warn('[ReportsComponent] No se encontraron registros emocionales.');
        }
      },
      error: (error: any) => {
        console.error('[ReportsComponent] Error al cargar registros emocionales:', error);
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
  console.log('[ReportsComponent] Iniciando fetchPatientDetails con ID:', patientId);
  const idAsString = patientId.toString();

  this.usersService.obtenerUsuarioPorId(idAsString).subscribe(
    (response: any) => {
      console.log('[ReportsComponent] Detalles del paciente recibidos:', response);
      if (response?.data) {
        this.patientDetails = {
          name: response.data.nombre || 'Nombre desconocido',
          age: response.data.fechaNacimiento
            ? this.calculateAge(response.data.fechaNacimiento)
            : 'Edad desconocida',
          diagnosis: response.data.diagnostico || 'Sin diagnóstico', // Incluimos el diagnóstico
        };
        console.log('[ReportsComponent] Diagnóstico cargado:', this.patientDetails.diagnosis);
      } else {
        console.warn('[ReportsComponent] No se encontraron detalles para el paciente.');
      }
    },
    (error) => {
      console.error('[ReportsComponent] Error al obtener detalles del paciente:', error);
    }
  );
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
        this.patientDetails.diagnosis || 
        'Sin diagnóstico. Aún no se ha llevado a cabo la primera sesión con el profesional a cargo para determinar un diagnóstico inicial.';
    
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
  



  getPhysiologicalStatus(param: string, value: string): string {
    const numericValue = parseFloat(value.replace(/[^\d.-]/g, '')); // Extraer números
    if (param === 'Frecuencia Cardíaca') {
      if (numericValue < 60) return 'Bajo';
      if (numericValue <= 100) return 'Normal';
      return 'Alto';
    }
    // Agregar más lógica para otros parámetros
    return 'Normal';
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
