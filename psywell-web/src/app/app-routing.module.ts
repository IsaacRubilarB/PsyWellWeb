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
import { NotasComponent } from './notas/notas.component'; 

export const routes: Routes = [
  { path: 'login', component: LoginRegistroComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'patients', component: PatientsListComponent },
  { path: 'patient/:id', component: PatientDetailsComponent },
  { path: 'recursos-materiales', component: RecursosMaterialesComponent },
  { path: 'citas', component: CitasComponent },
  { path: 'formulario', component: FormularioRecursosComponent },
  { path: 'notas', component: NotasComponent }, 
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
