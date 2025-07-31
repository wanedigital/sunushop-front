import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercheCommandeComponent } from './recherche-commande.component';

describe('RechercheCommandeComponent', () => {
  let component: RechercheCommandeComponent;
  let fixture: ComponentFixture<RechercheCommandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechercheCommandeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechercheCommandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
