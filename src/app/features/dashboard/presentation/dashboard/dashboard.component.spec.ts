import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardUseCase } from '@features/dashboard/application/use-cases/dashboard.use-case';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const useCaseSpy = jasmine.createSpyObj('DashboardUseCase', ['initialize']);

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    })
      .overrideComponent(DashboardComponent, {
        set: {
          template: '',
          providers: [{ provide: DashboardUseCase, useValue: useCaseSpy }],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
