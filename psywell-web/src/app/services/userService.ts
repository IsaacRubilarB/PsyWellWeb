import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private registroUserUrl = '/api/agregarUsuario';
  private listarUserUrl = '/api/ListarUsuarios';
  private obtenerUsuarioPorIdUrl = '/api/ListarUsuariosById';
  private verificarUsuarioUrl = '/api/verificarOGuardarUsuario'; 

  constructor(private http: HttpClient) {}

  // Método para registrar un nuevo usuario
  registrarUsuario(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroUserUrl, userData, { headers });
  }

  // Método para listar todos los usuarios
  listarUsuarios(): Observable<any> {
    return this.http.get(this.listarUserUrl);
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get<any>(`${this.obtenerUsuarioPorIdUrl}/${id}`);
  }
  
  

  // Método para verificar si el usuario ya existe
  verificarUsuario(email: string): Observable<any> {
    return this.http.post<any>(this.verificarUsuarioUrl, { email });
  }

  
}
