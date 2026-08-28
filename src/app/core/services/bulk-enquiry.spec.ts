import { TestBed } from '@angular/core/testing';

import { BulkEnquiry } from './bulk-enquiry';

describe('BulkEnquiry', () => {
  let service: BulkEnquiry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BulkEnquiry);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
