import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FichaInput {
    idFichaPaciente?: number;
    idPaciente?: number;
    idPsicologo?: number;
    nombres: string;
    fechaNacimiento: string | null;
    genero: string;
    correo: string;
    telefono: string;
    telefonoEmercia: string;
    direccion: string;
    estadoCivil?: string; // Nuevo campo
    notasSesionAnterior: string;
    medicamentos: string;
    diagnostico: string;
  }
  

@Injectable({
  providedIn: 'root',
})
export class FichaService {
  private apiUrl = 'http://localhost:8083'; // URL del backend

  constructor(private http: HttpClient) {}

  // Método para registrar una ficha
  registrarFicha(ficha: FichaInput): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/registrarFicha`, ficha, { headers });
  }

  // Método para obtener todas las fichas
  listarFichas(): Observable<any> {
    return this.http.get(`${this.apiUrl}/listarFichas`);
  }

  // Método para obtener datos del paciente por su ID
  obtenerDatosPaciente(idPaciente: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/ListarUsuariosById/${idPaciente}`);
  }
}
