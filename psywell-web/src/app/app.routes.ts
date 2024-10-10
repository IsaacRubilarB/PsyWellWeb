import { Routes } from '@angular/router';
import { LoginRegistroComponent } from './login-registro/login-registro.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { ReportsComponent } from './reports/reports.component';
import { CalendarIntegrationComponent } from './calendar-integration/calendar-integration.component';

export const routes: Routes = [
  { path: 'login', component: LoginRegistroComponent },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'patients', component: PatientsListComponent },
  { path: 'patients/:id', component: PatientDetailsComponent },
  { path: 'reports', loadComponent: () => import('./reports/reports.component').then(m => m.ReportsComponent) },
  { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'citas', loadComponent: () => import('./citas/citas.component').then(m => m.CitasComponent) },
  { path: 'recursos-materiales', loadComponent: () => import('./recursos-materiales/recursos-materiales.component').then(m => m.RecursosMaterialesComponent) },
  { path: 'citas', loadComponent: () => import('./citas/citas.component').then(m => m.CitasComponent) }
];
