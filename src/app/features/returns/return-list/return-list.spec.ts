import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReturnList } from './return-list';

describe('ReturnList', () => {
  let component: ReturnList;
  let fixture: ComponentFixture<ReturnList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnList],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
