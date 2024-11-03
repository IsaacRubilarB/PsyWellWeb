import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita, ListaCitasResponse } from 'app/citas/citas.component';

@Injectable({
  providedIn: 'root'
})
export class CitasService {

  private registroCitaUrl = 'http://localhost:8084/registrarCita';
  private listarCitaUrl = 'http://localhost:8084/listarCitas';

  constructor(private http: HttpClient) {}

  registrarCita(citaData: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroCitaUrl, citaData, { headers });
  }

  listarCitas(): Observable<ListaCitasResponse> {
    return this.http.get<ListaCitasResponse>(this.listarCitaUrl);
  }
  
  
}
