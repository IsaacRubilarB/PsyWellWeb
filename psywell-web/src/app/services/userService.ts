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

  constructor(private http: HttpClient) {}

  registrarUsuario(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroUserUrl, userData, { headers });
  }

  listarUsuarios(): Observable<any> {
    return this.http.get(this.listarUserUrl);
  }

  obtenerUsuarioPorId(id: string): Observable<any> {
    return this.http.get(`${this.obtenerUsuarioPorIdUrl}/${id}`);
  }
}
