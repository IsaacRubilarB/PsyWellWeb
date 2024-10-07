import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmotionalStatusComponent } from './emotional-status/emotional-status.component';
import { PhysiologicalMonitorComponent } from './physiological-monitor/physiological-monitor.component';
import { ReportsComponent } from './reports/reports.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'emotional-status', component: EmotionalStatusComponent },
  { path: 'physiological-monitor', component: PhysiologicalMonitorComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'patients', component: PatientsListComponent },
  { path: 'patient/:id', component: PatientDetailsComponent }, // Ruta para el detalle de paciente
  { path: '**', redirectTo: 'login' } // Ruta por defecto en caso de no coincidir con ninguna
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
