import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEnquiryDetail } from './bulk-enquiry-detail';

describe('BulkEnquiryDetail', () => {
  let component: BulkEnquiryDetail;
  let fixture: ComponentFixture<BulkEnquiryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkEnquiryDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(BulkEnquiryDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
