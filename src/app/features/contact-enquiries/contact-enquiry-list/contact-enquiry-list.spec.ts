import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactEnquiryList } from './contact-enquiry-list';

describe('ContactEnquiryList', () => {
  let component: ContactEnquiryList;
  let fixture: ComponentFixture<ContactEnquiryList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactEnquiryList],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactEnquiryList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
