import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UniversalList } from './universal-list';

describe('UniversalList', () => {
  let component: UniversalList;
  let fixture: ComponentFixture<UniversalList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniversalList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UniversalList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
