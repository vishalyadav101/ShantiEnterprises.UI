import { TestBed } from '@angular/core/testing';

import { ProductImage } from './product-image';

describe('ProductImage', () => {
  let service: ProductImage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductImage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
