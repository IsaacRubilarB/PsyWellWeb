import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FichaPacienteComponent } from './ficha-paciente.component';

describe('FichaPacienteComponent', () => {
  let component: FichaPacienteComponent;
  let fixture: ComponentFixture<FichaPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichaPacienteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FichaPacienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
