import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatistiqueAdminComponent } from './statistique-admin.component';

describe('StatistiqueAdminComponent', () => {
  let component: StatistiqueAdminComponent;
  let fixture: ComponentFixture<StatistiqueAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatistiqueAdminComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatistiqueAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
