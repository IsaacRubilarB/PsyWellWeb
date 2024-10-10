import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CalendarIntegrationComponent } from './calendar-integration.component';

describe('CalendarIntegrationComponent', () => {
  let component: CalendarIntegrationComponent;
  let fixture: ComponentFixture<CalendarIntegrationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CalendarIntegrationComponent] // Mover el componente a 'declarations'
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalendarIntegrationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
