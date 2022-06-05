import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TokenResolveComponent } from './token-resolve.component';

describe('TokenResolveComponent', () => {
  let component: TokenResolveComponent;
  let fixture: ComponentFixture<TokenResolveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TokenResolveComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TokenResolveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
