import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DbViewer } from './db-viewer';

describe('DbViewer', () => {
  let component: DbViewer;
  let fixture: ComponentFixture<DbViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DbViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DbViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
