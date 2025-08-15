import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommandeclientsComponent } from './commandeclients.component';

describe('CommandeclientsComponent', () => {
  let component: CommandeclientsComponent;
  let fixture: ComponentFixture<CommandeclientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommandeclientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommandeclientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
