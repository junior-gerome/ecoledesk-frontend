import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';

describe('ModalComponent accessibility', () => {
  let fixture: ComponentFixture<ModalComponent>;
  let component: ModalComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ModalComponent] });
    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
  });

  it('renders a labelled modal and closes on escape', () => {
    component.open = true;
    component.title = 'Confirmation';
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog.getAttribute('aria-labelledby')).toBe('modal-title');
    let closed = false;
    component.closed.subscribe(() => closed = true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(closed).toBeTrue();
  });
});
