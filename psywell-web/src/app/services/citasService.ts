import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cita, ListaCitasResponse } from '../models/cita.model';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class CitasService {
  private registroCitaUrl = 'http://localhost:8084/registrarCita';
  private listarCitaUrl = 'http://localhost:8084/listarCitas';
  private actualizarCitaUrl = 'http://localhost:8084/actualizarCita';
  private eliminarCitaUrl = 'http://localhost:8084/eliminarCita';
  private baseUrl = 'http://localhost:8082/listarRegistro'; 

  constructor(private http: HttpClient) {}

  registrarCita(citaData: Cita): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(this.registroCitaUrl, citaData, { headers });
  }

  listarCitas(): Observable<ListaCitasResponse> {
    return this.http.get<ListaCitasResponse>(this.listarCitaUrl);
  }

  // Nuevo método para listar citas por psicólogo
  listarCitasPorPsicologo(idPsicologo: number): Observable<ListaCitasResponse> {
    const url = `${this.listarCitaUrl}?idPsicologo=${idPsicologo}`;
    return this.http.get<ListaCitasResponse>(url);
  }

  actualizarCita(citaData: Cita): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.put<any>(`${this.actualizarCitaUrl}/${citaData.idCita}`, citaData, { headers });
  }

  eliminarCita(idCita: number): Observable<any> {
    return this.http.delete<any>(`${this.eliminarCitaUrl}/${idCita}`);
  }

  obtenerRegistrosPorPaciente(idUsuario: number): Observable<any> {
    const url = `http://localhost:8082/listarRegistro?idUsuario=${idUsuario}`;
    return this.http.get<any>(url).pipe(
      map((response: any) => {
        if (response?.data) {
          return response.data; // Retorna los registros directamente
        }
        return [];
      })
    );
  }
  
  
  
}
