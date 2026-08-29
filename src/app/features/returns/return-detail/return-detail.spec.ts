import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnDetail } from './return-detail';

describe('ReturnDetail', () => {
  let component: ReturnDetail;
  let fixture: ComponentFixture<ReturnDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
