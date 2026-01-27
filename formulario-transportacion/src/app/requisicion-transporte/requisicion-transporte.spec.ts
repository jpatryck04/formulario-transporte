import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequisicionTransporte } from './requisicion-transporte';

describe('RequisicionTransporte', () => {
  let component: RequisicionTransporte;
  let fixture: ComponentFixture<RequisicionTransporte>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequisicionTransporte]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequisicionTransporte);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
