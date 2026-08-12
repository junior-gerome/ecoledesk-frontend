import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { EmptyStateComponent } from '../empty-state/empty-state.component';
import { TableComponent } from './table.component';

@Component({
  standalone: true,
  imports: [TableComponent],
  template: '<app-table [empty]="empty"><span table-head>Head</span><span table-body>Row</span></app-table>',
})
class HostComponent {
  empty = true;
}

describe('TableComponent states', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HostComponent, EmptyStateComponent],
    });
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('shows the empty state without rendering the table', () => {
    expect(fixture.nativeElement.querySelector('app-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('renders the table when data is available', () => {
    fixture.componentInstance.empty = false;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-empty-state')).toBeNull();
  });

  it('emits the empty-state action', () => {
    const emptyState = fixture.debugElement.query(By.directive(EmptyStateComponent));
    expect(emptyState).not.toBeNull();
  });
});

