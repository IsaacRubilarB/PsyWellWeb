// src/app/app-routing.module.ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ReportsComponent } from './reports/reports.component';
import { PatientsListComponent } from './patients-list/patients-list.component';
import { PatientDetailsComponent } from './patient-details/patient-details.component';
import { LoginRegistroComponent } from './login-registro/login-registro.component';
import { RecursosMaterialesComponent } from './recursos-materiales/recursos-materiales.component';
import { CitasComponent } from './citas/citas.component';
import { FormularioRecursosComponent } from './formulario-recursos/formulario-recursos.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginRegistroComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'reports', component: ReportsComponent, canActivate: [AuthGuard] },
  { path: 'patients', component: PatientsListComponent, canActivate: [AuthGuard] },
  { path: 'patient/:id', component: PatientDetailsComponent, canActivate: [AuthGuard] },
  { path: 'recursos-materiales', component: RecursosMaterialesComponent, canActivate: [AuthGuard] },
  { path: 'citas', component: CitasComponent, canActivate: [AuthGuard] },
  { path: 'formulario', component: FormularioRecursosComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
