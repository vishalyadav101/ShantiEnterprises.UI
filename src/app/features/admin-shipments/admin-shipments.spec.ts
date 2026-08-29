import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminShipments } from './admin-shipments';

describe('AdminShipments', () => {
  let component: AdminShipments;
  let fixture: ComponentFixture<AdminShipments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminShipments],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminShipments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
