import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsBoutiquesComponent } from './cards-boutiques.component';

describe('CardsBoutiquesComponent', () => {
  let component: CardsBoutiquesComponent;
  let fixture: ComponentFixture<CardsBoutiquesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsBoutiquesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsBoutiquesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
