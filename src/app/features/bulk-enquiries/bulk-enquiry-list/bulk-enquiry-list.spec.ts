import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkEnquiryList } from './bulk-enquiry-list';

describe('BulkEnquiryList', () => {
  let component: BulkEnquiryList;
  let fixture: ComponentFixture<BulkEnquiryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BulkEnquiryList],
    }).compileComponents();

    fixture = TestBed.createComponent(BulkEnquiryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
