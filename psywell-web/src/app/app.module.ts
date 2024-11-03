// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';

// Firebase imports
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'environments/environments';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    RouterModule,
    NavbarComponent, // Asegúrate de incluir NavbarComponent aquí
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

     // Asegúrate de incluir FormsModule si usas ngModel


    // Inicializar Firebase con la configuración específica de Firebase
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule, 
  ],
  providers: [],
  bootstrap: [AppModule],
  
})
export class AppModule {}
