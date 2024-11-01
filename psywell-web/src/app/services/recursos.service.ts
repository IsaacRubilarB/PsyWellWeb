// src/app/services/recursos.service.ts
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

interface Recurso {
  id?: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  url?: string;
  portada?: string;
  autor: string;
}

@Injectable({
  providedIn: 'root',
})
export class RecursosService {
  private recursosCollection: AngularFirestoreCollection<Recurso>;

  constructor(private firestore: AngularFirestore) {
    this.recursosCollection = firestore.collection<Recurso>('recursos-materiales');
  }

  getRecursosPorTipo(tipo: string): Observable<Recurso[]> {
    return this.firestore.collection<Recurso>('recursos-materiales', ref => ref.where('tipo', '==', tipo)).valueChanges({ idField: 'id' });
  }

  deleteRecursoPorId(id: string): Promise<void> {
    return this.firestore.collection('recursos-materiales').doc(id).delete();
  }

  agregarRecurso(recurso: Recurso): Promise<void> {
    const id = this.firestore.createId();
    return this.recursosCollection.doc(id).set({ ...recurso, id });
  }
}
