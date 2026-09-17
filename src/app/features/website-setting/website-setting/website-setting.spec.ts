import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteSetting } from './website-setting';

describe('WebsiteSetting', () => {
  let component: WebsiteSetting;
  let fixture: ComponentFixture<WebsiteSetting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteSetting],
    }).compileComponents();

    fixture = TestBed.createComponent(WebsiteSetting);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
