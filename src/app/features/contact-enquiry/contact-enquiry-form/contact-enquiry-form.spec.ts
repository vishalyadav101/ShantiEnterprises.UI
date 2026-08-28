import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactEnquiryForm } from './contact-enquiry-form';

describe('ContactEnquiryForm', () => {
  let component: ContactEnquiryForm;
  let fixture: ComponentFixture<ContactEnquiryForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactEnquiryForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactEnquiryForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
