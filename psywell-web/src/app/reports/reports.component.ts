import { Component, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import lottie from 'lottie-web';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reports',
  standalone: true,
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  imports: [CommonModule]
})
export class ReportsComponent implements AfterViewInit {

  @ViewChildren('informeAnimation') informeAnimationDivs!: QueryList<ElementRef>;

  ngAfterViewInit(): void {
    this.loadInformeAnimations();
  }

  loadInformeAnimations() {
    this.informeAnimationDivs.forEach((informeDiv) => {
      lottie.loadAnimation({
        container: informeDiv.nativeElement,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        path: 'assets/lottie/informe.json' 
      });
    });
  }
}
