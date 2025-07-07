import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VendeurLayoutComponent } from './vendeur-layout.component';

describe('VendeurLayoutComponent', () => {
  let component: VendeurLayoutComponent;
  let fixture: ComponentFixture<VendeurLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VendeurLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VendeurLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
