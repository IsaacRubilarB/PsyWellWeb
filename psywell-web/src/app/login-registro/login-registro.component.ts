import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

@Component({
  selector: 'app-login-registro',
  standalone: true,  
  imports: [CommonModule, FormsModule], 
  templateUrl: './login-registro.component.html',
  styleUrls: ['./login-registro.component.scss']
})
export class LoginRegistroComponent {
  isLogin = true;  // Variable para alternar entre login y registro

  flip() {
    this.isLogin = !this.isLogin; // Cambia entre login y registro
  }
}
