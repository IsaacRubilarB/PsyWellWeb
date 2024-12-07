import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import { getFirestore, query, where, collection, getDocs, Firestore } from 'firebase/firestore';
import { environment } from '../../environments/environments';

@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  private db: Firestore;

  constructor() {
    // Inicializa Firebase utilizando el entorno de configuración
    const app = initializeApp(environment.firebaseConfig);
    this.db = getFirestore(app);
  }

  /**
   * Obtiene los datos fisiológicos de un paciente por su correo electrónico.
   * @param email Correo electrónico del paciente
   * @returns Promesa con los datos fisiológicos o `null` si no se encuentran.
   */
  async getPhysiologicalData(email: string): Promise<any> {
    try {
      const encodedEmail = this.encodeEmail(email);
      const q = query(
        collection(this.db, 'datos_fisiologicos'),
        where('mail', '==', encodedEmail)
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data();
      } else {
        console.warn('No se encontraron datos fisiológicos para el correo:', email);
        return null;
      }
    } catch (error) {
      console.error('Error al obtener datos fisiológicos:', error);
      throw error;
    }
  }

  /**
   * Codifica el correo electrónico para evitar problemas de formato.
   * @param email Correo electrónico a codificar
   * @returns Correo codificado
   */
  private encodeEmail(email: string): string {
    return email; // Si quieres codificar el correo, utiliza Base64 u otro método aquí
  }
}
