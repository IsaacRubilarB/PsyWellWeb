import { Routes } from '@angular/router';
import { LoginRegistroComponent } from './login-registro/login-registro.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { ReportsComponent } from './reports/reports.component'; 

export const routes: Routes = [
  { path: 'login', component: LoginRegistroComponent }, // Ruta para login
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige a login al entrar
  { path: 'patients', component: PatientsListComponent }, // Lista de pacientes
  { path: 'patients/:id', component: PatientDetailsComponent }, // Detalles de paciente con parámetro id
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) }, // Lazy load para ReportsComponent
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) }, // Lazy load para DashboardComponent
];
