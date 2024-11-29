import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import Swal from 'sweetalert2';

declare const google: any;

@Component({
  selector: 'app-google-maps',
  standalone: true,
  templateUrl: './google-maps.component.html',
  styleUrls: ['./google-maps.component.scss'],
})
export class GoogleMapsComponent implements OnInit {
  @Output() locationSelected = new EventEmitter<string>();
  map: any;
  searchBox: any;
  selectedAddress: string = 'Ninguna dirección seleccionada';

  latitude = -33.447487; // Coordenadas iniciales (Santiago de Chile)
  longitude = -70.673676;
  zoom = 14;

  ngOnInit(): void {
    this.initMap();
  }

  initMap(): void {
    const mapOptions = {
      center: { lat: this.latitude, lng: this.longitude },
      zoom: this.zoom,
    };

    // Inicializar el mapa
    this.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    // Inicializar la barra de búsqueda
    const input = document.getElementById('searchBox') as HTMLInputElement;
    this.searchBox = new google.maps.places.SearchBox(input);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Evento para seleccionar ubicación desde la barra de búsqueda
    this.searchBox.addListener('places_changed', () => {
      const places = this.searchBox.getPlaces();
      if (places.length === 0) {
        return;
      }

      const place = places[0];
      this.selectedAddress = place.formatted_address;

      // Centrar el mapa
      this.map.setCenter(place.geometry.location);

      // Agregar marcador
      this.setMarker(place.geometry.location);
    });

    // Evento para hacer clic en el mapa
    this.map.addListener('click', (event: any) => {
      if (event.latLng) {
        this.latitude = event.latLng.lat();
        this.longitude = event.latLng.lng();

        // Obtener dirección con Reverse Geocoding
        this.getAddressFromCoordinates(this.latitude, this.longitude);

        // Agregar marcador
        this.setMarker(event.latLng);
      }
    });

    // Prevenir que el formulario de búsqueda envíe o recargue la página al presionar Enter
    input.addEventListener('keydown', (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault();  // Prevenir el comportamiento predeterminado (salir del modal)
        this.searchLocation();    // Realizar la búsqueda manualmente
      }
    });
  }

  setMarker(position: { lat: number; lng: number } | any): void {
    // Eliminar marcador previo
    if (this.map.marker) {
      this.map.marker.setMap(null);
    }

    // Agregar nuevo marcador
    this.map.marker = new google.maps.Marker({
      position,
      map: this.map,
      animation: google.maps.Animation.DROP,
    });

    // Centrar el mapa en el marcador
    this.map.setCenter(position);
  }

  getAddressFromCoordinates(lat: number, lng: number): void {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode(
      { location: { lat, lng } },
      (results: any, status: any) => {
        if (status === 'OK' && results && results.length > 0) {
          this.selectedAddress = results[0].formatted_address;
          console.log('Dirección seleccionada:', this.selectedAddress);
        } else {
          this.selectedAddress = 'No se pudo obtener la dirección.';
          console.error('Geocoder falló:', status);
        }
      }
    );
  }

  searchLocation(): void {
    const query = (document.getElementById('searchBox') as HTMLInputElement).value;
    if (!query) {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Por favor, ingrese una dirección.',
      });
      return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results: any, status: any) => {
      if (status === 'OK' && results.length > 0) {
        const location = results[0].geometry.location;
        this.selectedAddress = results[0].formatted_address;

        // Centrar mapa y agregar marcador
        this.map.setCenter(location);
        this.setMarker(location);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Ubicación no encontrada',
          text: 'No se encontró la ubicación. Verifique la dirección.',
        });
      }
    });
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude = position.coords.latitude;
          this.longitude = position.coords.longitude;
  
          const location = { lat: this.latitude, lng: this.longitude };
  
          // Centrar el mapa en la ubicación del usuario
          this.map.setCenter(location);
  
          // Agregar marcador en la ubicación
          this.setMarker(location);
  
          // Obtener la dirección con Reverse Geocoding
          this.getAddressFromCoordinates(this.latitude, this.longitude);
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo obtener la ubicación actual.',
          });
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Geolocalización no es soportada por el navegador.',
      });
    }
  }
  

  saveLocation(): void {
    if (this.selectedAddress) {
      Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Guardar esta dirección?: \n${this.selectedAddress}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sí, guardar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          console.log('Dirección guardada:', this.selectedAddress);
          this.locationSelected.emit(this.selectedAddress); // Emitir la dirección seleccionada
          Swal.fire({
            icon: 'success',
            title: '¡Guardado!',
            text: 'La dirección ha sido guardada con éxito.',
          });
        }
      });
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Por favor, seleccione una ubicación primero.',
      });
    }
  }
  
}
