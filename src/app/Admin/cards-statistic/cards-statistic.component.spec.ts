import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsStatisticComponent } from './cards-statistic.component';

describe('CardsStatisticComponent', () => {
  let component: CardsStatisticComponent;
  let fixture: ComponentFixture<CardsStatisticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardsStatisticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardsStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
