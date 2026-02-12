import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementManager } from './announcement-manager';

describe('AnnouncementManager', () => {
  let component: AnnouncementManager;
  let fixture: ComponentFixture<AnnouncementManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnnouncementManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
