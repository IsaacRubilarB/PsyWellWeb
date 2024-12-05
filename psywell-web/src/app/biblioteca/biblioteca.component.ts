import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from 'app/navbar/navbar.component';
import { FormsModule } from '@angular/forms'; // Importa FormsModule para ngModel

@Component({
  selector: 'app-biblioteca',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FormsModule], // Añade FormsModule a los imports
  templateUrl: './biblioteca.component.html',
  styleUrls: ['./biblioteca.component.scss']
})
export class BibliotecaComponent implements OnInit {
  libros: any[] = [];
  materialPsicologos: any[] = [];

  librosPaginados: any[] = [];
  materialPaginados: any[] = [];

  itemsPerPageOptions = [10, 25, 50, 100];
  itemsPerPageLibros = 10;
  itemsPerPageMaterial = 10;

  paginaActualLibros = 1;
  paginaActualMaterial = 1;

  totalPaginasLibros = 1;
  totalPaginasMaterial = 1;

  apiKey = 'AIzaSyAFJUcrBDDLPM2SscMvi1x_jUv6Wlqnukg';
  folderIds = {
    libros: '1-FAVlVTJuBd7D5v0ndac9vfmKqN6mBfC',
    materialPsicologos: '1xGtAKxxzZbGKXDvvUIBHt4mQiT8e68KZ',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.cargarArchivos('libros', this.folderIds.libros);
    this.cargarArchivos('material', this.folderIds.materialPsicologos);
  }

  cargarArchivos(tipo: string, folderId: string) {
    const url = `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents&key=${this.apiKey}&fields=files(id,name,webViewLink,webContentLink)`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.files) {
          if (tipo === 'libros') {
            this.libros = response.files;
            this.actualizarPaginacion('libros');
          } else if (tipo === 'material') {
            this.materialPsicologos = response.files;
            this.actualizarPaginacion('material');
          }
        }
      },
      error: (error) => {
        console.error(`Error al cargar archivos de la carpeta ${tipo}:`, error);
      },
    });
  }

  actualizarPaginacion(tipo: string) {
    if (tipo === 'libros') {
      this.totalPaginasLibros = Math.ceil(this.libros.length / this.itemsPerPageLibros);
      this.paginaActualLibros = Math.min(this.paginaActualLibros, this.totalPaginasLibros);
      const start = (this.paginaActualLibros - 1) * this.itemsPerPageLibros;
      const end = start + this.itemsPerPageLibros;
      this.librosPaginados = this.libros.slice(start, end);
    } else if (tipo === 'material') {
      this.totalPaginasMaterial = Math.ceil(this.materialPsicologos.length / this.itemsPerPageMaterial);
      this.paginaActualMaterial = Math.min(this.paginaActualMaterial, this.totalPaginasMaterial);
      const start = (this.paginaActualMaterial - 1) * this.itemsPerPageMaterial;
      const end = start + this.itemsPerPageMaterial;
      this.materialPaginados = this.materialPsicologos.slice(start, end);
    }
  }

  cambiarPagina(tipo: string, direccion: number) {
    if (tipo === 'libros') {
      this.paginaActualLibros += direccion;
      this.actualizarPaginacion('libros');
    } else if (tipo === 'material') {
      this.paginaActualMaterial += direccion;
      this.actualizarPaginacion('material');
    }
  }

  descargarArchivo(link: string) {
    const a = document.createElement('a');
    a.href = link;
    a.target = '_blank';
    a.download = '';
    a.click();
    a.remove();
  }
}
