import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class PatientDataService {
  constructor(private firestore: AngularFirestore) {}

  private encodeEmail(email: string): string {
    return btoa(email);
  }
  
  async getRealTimeData(email: string): Promise<any> {
    try {
      const encodedEmail = this.encodeEmail(email); // Convierte el correo a Base64
      const docRef = this.firestore.collection('real_time_data').doc(encodedEmail);
      const doc = await docRef.get().toPromise();
      return doc?.data() || null;
    } catch (error) {
      console.error('Error al obtener datos en tiempo real:', error);
      throw error;
    }
  }
  
  // Obtener datos semanales del paciente
  async getWeeklyData(email: string): Promise<any[]> {
    try {
      const collectionRef = this.firestore.collection('weekly_data', (ref) =>
        ref.where('email', '==', email)
      );
      const snapshot = await collectionRef.get().toPromise();
      return snapshot?.docs.map((doc) => doc.data()) || [];
    } catch (error) {
      console.error('Error al obtener datos semanales:', error);
      throw error;
    }
  }
}
