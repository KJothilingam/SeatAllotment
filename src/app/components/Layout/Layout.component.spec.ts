import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LayoutComponent } from './Layout.component';
// import { LayoutComponent } from './layout.component'; // Fix import casing

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LayoutComponent] // Use 'declarations' instead of 'imports'
    }).compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
