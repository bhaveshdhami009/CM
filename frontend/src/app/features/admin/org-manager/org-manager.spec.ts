import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgManager } from './org-manager';

describe('OrgManager', () => {
  let component: OrgManager;
  let fixture: ComponentFixture<OrgManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
