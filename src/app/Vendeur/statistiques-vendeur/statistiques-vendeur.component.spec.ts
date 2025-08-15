import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiquesVendeurComponent } from './statistiques-vendeur.component';

describe('StatistiquesVendeurComponent', () => {
  let component: StatistiquesVendeurComponent;
  let fixture: ComponentFixture<StatistiquesVendeurComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatistiquesVendeurComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatistiquesVendeurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
