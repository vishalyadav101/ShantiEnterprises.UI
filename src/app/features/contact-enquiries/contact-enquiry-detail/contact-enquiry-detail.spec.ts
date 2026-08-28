import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactEnquiryDetail } from './contact-enquiry-detail';

describe('ContactEnquiryDetail', () => {
  let component: ContactEnquiryDetail;
  let fixture: ComponentFixture<ContactEnquiryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactEnquiryDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactEnquiryDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
