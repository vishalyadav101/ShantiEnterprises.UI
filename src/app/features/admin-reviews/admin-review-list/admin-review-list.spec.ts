import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminReviewList } from './admin-review-list';

describe('AdminReviewList', () => {
  let component: AdminReviewList;
  let fixture: ComponentFixture<AdminReviewList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminReviewList],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminReviewList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
