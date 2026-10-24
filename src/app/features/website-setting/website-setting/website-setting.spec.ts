import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebsiteSettingComponent } from './website-setting';
describe('WebsiteSetting', () => {
  let component: WebsiteSettingComponent;
  let fixture: ComponentFixture<WebsiteSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebsiteSettingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WebsiteSettingComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
