import { Component, AfterViewInit, ElementRef, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables, ChartConfiguration, ChartDataset } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { RegistroService } from './../services/registroService';
import {jsPDF} from 'jspdf';

import autoTable from 'jspdf-autotable'




Chart.register(...registerables, ChartDataLabels);

interface MoodDays {
  mood: string;
  days: number;
  emoji: string;
}

interface Patient {
  x: number; // Cantidad de sesiones
  name: string;
  moodHistory: { session: number, mood: string, moodLevel: number, emoji: string }[]; // Histórico de ánimo por sesión con emoji
  imgUrl: string;
  color: string;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [CommonModule, FormsModule, NavbarComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ReportsComponent implements AfterViewInit {

  
  constructor(private registroService: RegistroService ) {}


  donwload() {
    this.registroService.listarRegistro().subscribe(res =>  {
      let data = res.data
      console.log(data);

    //const data = JSON.parse(json);
    const columns = this.getColumns(data);
    const rows = this.getRows(data, columns);
    const doc = new jsPDF();

    autoTable(doc, {
      head: [columns],
      body: rows,
     // did: (data) => { },
  });
  doc.save('data.pdf');


  });
  }

  getColumns(data: any[]): string[] {
    const columns: string[] = [];
    data.forEach(row => {
      Object.keys(row).forEach(col => {
        if (!columns.includes(col)) {
          columns.push(col);
        }
      });
    });
    return columns;
  }

  getRows(data: any[], columns: string[]): any[] {
    const rows: any[] = [];
    data.forEach(row => {
      const values: any[] = [];
      columns.forEach(col => {
        values.push(row[col] || '');
      });
      rows.push(values);
    });
    return rows;
  }

 
  downloadFile(data: string, filename: string, type: string) {
    const blob = new Blob([data], { type: type });
  
      const link = document.createElement('a');
      link.setAttribute('href', URL.createObjectURL(blob));
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   
  }

  @ViewChild('chartCanvas', { static: false }) chartCanvas!: ElementRef<HTMLCanvasElement>;
  chart!: Chart;
  timeRange = '7';
  
  patients: Patient[] = [
    {
      x: 4,
      name: 'Juan',
      moodHistory: [
        { session: 1, mood: 'Triste', moodLevel: 1, emoji: '😢' },
        { session: 2, mood: 'Feliz', moodLevel: 3, emoji: '😊' },
        { session: 3, mood: 'Normal', moodLevel: 2, emoji: '🙂' },
        { session: 4, mood: 'Maravilloso', moodLevel: 4, emoji: '😁' },
      ],
      imgUrl: 'assets/profiles/juan.png',
      color: '#FF6384'
    },
    {
      x: 3,
      name: 'Maria',
      moodHistory: [
        { session: 1, mood: 'Normal', moodLevel: 2, emoji: '🙂' },
        { session: 2, mood: 'Triste', moodLevel: 1, emoji: '😢' },
        { session: 3, mood: 'Feliz', moodLevel: 3, emoji: '😊' }
      ],
      imgUrl: 'assets/profiles/maria.png',
      color: '#36A2EB'
    },
    {
      x: 3,
      name: 'Carlos',
      moodHistory: [
        { session: 1, mood: 'Enojado', moodLevel: 0, emoji: '😠' },
        { session: 2, mood: 'Normal', moodLevel: 2, emoji: '🙂' },
        { session: 3, mood: 'Triste', moodLevel: 1, emoji: '😢' }
      ],
      imgUrl: 'assets/profiles/carlos.png',
      color: '#FFCE56'
    },
    {
      x: 4,
      name: 'Ana',
      moodHistory: [
        { session: 1, mood: 'Feliz', moodLevel: 3, emoji: '😊' },
        { session: 2, mood: 'Feliz', moodLevel: 3, emoji: '😊' },
        { session: 3, mood: 'Maravilloso', moodLevel: 4, emoji: '😁' },
        { session: 4, mood: 'Normal', moodLevel: 2, emoji: '🙂' }
      ],
      imgUrl: 'assets/profiles/ana.png',
      color: '#4BC0C0'
    }
  ];
  
  selectedPatient: Patient | null = null;

  ngAfterViewInit(): void {
    if (this.chartCanvas) {
      this.createChart();
    }
  }

  createChart() {
    const scatterDataset: ChartDataset<'scatter'> = {
      type: 'scatter',
      label: 'Estado de Ánimo',
      data: this.patients.map((p) => ({ x: p.x, y: p.moodHistory[p.moodHistory.length - 1].moodLevel })),
      backgroundColor: this.patients.map((p) => p.color),
      pointRadius: 50,
      pointHoverRadius: 60
    };

    const lineDatasets: ChartDataset<'line'>[] = this.patients.map((patient) => {
      const progressData = patient.moodHistory.map(moodEntry => ({
        x: moodEntry.session,
        y: moodEntry.moodLevel
      }));

      return {
        type: 'line',
        label: `${patient.name} - Progreso`,
        data: progressData,
        borderColor: patient.color,
        backgroundColor: 'transparent',
        borderWidth: 2,
        fill: false,
        tension: 0.4, // Curvatura de la línea
        datalabels: { display: false } // Ocultar etiquetas de datos en la línea
      };
    });

    const config: ChartConfiguration<'scatter' | 'line'> = {
      type: 'scatter',
      data: {
        datasets: [scatterDataset, ...lineDatasets]
      },
      options: {
        plugins: {
          datalabels: {
            align: 'top',
            font: {
              size: 14,
              weight: 'bold'
            },
            color: '#FFD966',
            formatter: (value, context) => this.patients[context.dataIndex]?.name
          }
        },
        onClick: (e, elements) => {
          if (elements.length > 0) {
            const index = elements[0].index;
            this.selectedPatient = this.patients[index];
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Número de Sesiones'
            },
            min: 1, // Comienza en la sesión 1
            max: 5, // Ajusta según el número de sesiones máximo
            grid: {
              color: '#FFD966'  // Amarillo para las líneas de la cuadrícula
            }
          },
          y: {
            title: {
              display: true,
              text: 'Estado de Ánimo'
            },
            min: 0,
            max: 4, // Ajusta para 5 niveles de ánimo
            ticks: {
              callback: (value) => {
                const moods = ['Enojado', 'Triste', 'Normal', 'Feliz', 'Maravilloso'];
                return moods[Number(value)] || '';
              }
            },
            grid: {
              color: '#FFD966'
            }
          }
        },
        responsive: true
      },
      plugins: [{
        id: 'customImagePlugin',
        afterDatasetDraw: (chart) => {
          const { ctx } = chart;
          const datasetMeta = chart.getDatasetMeta(0);

          datasetMeta.data.forEach((point, index) => {
            const data = this.patients[index];
            if (data.imgUrl && ctx) {
              const img = new Image();
              img.src = data.imgUrl;
              img.onload = () => {
                const size = 100;
                ctx.drawImage(
                  img,
                  point.x - size / 2,
                  point.y - size / 2,
                  size,
                  size
                );
                // Muestra el emoji en lugar de texto de estado
                ctx.font = '24px Arial';
                ctx.fillText(data.moodHistory[data.moodHistory.length - 1].emoji, point.x + size / 3, point.y - size / 3);
              };
            }
          });
        }
      }]
    };

    this.chart = new Chart(this.chartCanvas.nativeElement, config);
  }

  closeDetails() {
    this.selectedPatient = null;
  }

  updateTimeRange() {
    // Logic to update the chart data based on the selected time range
  }
}
