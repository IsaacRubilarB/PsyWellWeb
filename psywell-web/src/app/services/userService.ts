import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private registroUSerUrl = 'http://localhost:8081/agregarUsuario';
  private listarUSerUrl = 'http://localhost:8081/ListarUsuarios';

  constructor(private http: HttpClient) {}

  registrarUsuario(userData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroUSerUrl, userData, { headers });
  }

  // GET
  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(this.listarUSerUrl);
  }
}
