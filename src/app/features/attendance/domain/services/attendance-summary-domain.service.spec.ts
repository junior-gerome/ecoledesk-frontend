import { TestBed } from '@angular/core/testing';
import { AttendanceSummaryDomainService } from './attendance-summary-domain.service';
import { AttendanceSummaryRow } from '../models';

describe('AttendanceSummaryDomainService', () => {
  let service: AttendanceSummaryDomainService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttendanceSummaryDomainService]
    });
    service = TestBed.inject(AttendanceSummaryDomainService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('computeSummaryMetrics', () => {
    it('should compute metrics for empty array', () => {
      const metrics = service.computeSummaryMetrics([]);
      expect(metrics).toEqual({
        totalStudents: 0,
        totalAbsences: 0,
        totalLates: 0,
        totalUnjustified: 0
      });
    });

    it('should compute metrics correctly', () => {
      const rows: AttendanceSummaryRow[] = [
        {
          studentId: 1,
          studentName: 'Jean Dupont',
          className: 'CP-A',
          totalAbsences: 3,
          totalLates: 2,
          unjustifiedCount: 1,
          lastDate: '2024-01-15'
        },
        {
          studentId: 2,
          studentName: 'Marie Martin',
          className: 'CP-A',
          totalAbsences: 1,
          totalLates: 0,
          unjustifiedCount: 0,
          lastDate: '2024-01-14'
        }
      ];

      const metrics = service.computeSummaryMetrics(rows);
      expect(metrics).toEqual({
        totalStudents: 2,
        totalAbsences: 4,
        totalLates: 2,
        totalUnjustified: 1
      });
    });
  });

  describe('filterAndSortSummaryRows', () => {
    const mockRows: AttendanceSummaryRow[] = [
      {
        studentId: 1,
        studentName: 'Jean Dupont',
        className: 'CP-A',
        totalAbsences: 3,
        totalLates: 2,
        unjustifiedCount: 1,
        lastDate: '2024-01-15'
      },
      {
        studentId: 2,
        studentName: 'Marie Martin',
        className: 'CP-B',
        totalAbsences: 1,
        totalLates: 0,
        unjustifiedCount: 0,
        lastDate: '2024-01-14'
      },
      {
        studentId: 3,
        studentName: 'Pierre Durand',
        className: 'CP-A',
        totalAbsences: 5,
        totalLates: 1,
        unjustifiedCount: 2,
        lastDate: '2024-01-13'
      }
    ];

    it('should return all rows when search is empty', () => {
      const result = service.filterAndSortSummaryRows(mockRows, '');
      expect(result.length).toBe(3);
    });

    it('should filter by student name', () => {
      const result = service.filterAndSortSummaryRows(mockRows, 'jean');
      expect(result.length).toBe(1);
      expect(result[0].studentName).toBe('Jean Dupont');
    });

    it('should filter by class name', () => {
      const result = service.filterAndSortSummaryRows(mockRows, 'CP-A');
      expect(result.length).toBe(2);
    });

    it('should filter by student id', () => {
      const result = service.filterAndSortSummaryRows(mockRows, '2');
      expect(result.length).toBe(1);
      expect(result[0].studentId).toBe(2);
    });

    it('should sort by unjustified count first', () => {
      const result = service.filterAndSortSummaryRows(mockRows, '');
      expect(result[0].studentId).toBe(3); // Pierre with 2 unjustified
      expect(result[1].studentId).toBe(1); // Jean with 1 unjustified
      expect(result[2].studentId).toBe(2); // Marie with 0 unjustified
    });

    it('should handle case insensitive search', () => {
      const result = service.filterAndSortSummaryRows(mockRows, 'JEAN');
      expect(result.length).toBe(1);
    });

    it('should trim search string', () => {
      const result = service.filterAndSortSummaryRows(mockRows, '  jean  ');
      expect(result.length).toBe(1);
    });
  });

  describe('summaryBadgeVariant', () => {
    it('should return danger for unjustified absences', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 3,
        totalLates: 0,
        unjustifiedCount: 1,
        lastDate: '2024-01-15'
      };
      expect(service.summaryBadgeVariant(row)).toBe('danger');
    });

    it('should return warning for absences without unjustified', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 3,
        totalLates: 0,
        unjustifiedCount: 0,
        lastDate: '2024-01-15'
      };
      expect(service.summaryBadgeVariant(row)).toBe('warning');
    });

    it('should return info for lates only', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 0,
        totalLates: 2,
        unjustifiedCount: 0,
        lastDate: '2024-01-15'
      };
      expect(service.summaryBadgeVariant(row)).toBe('info');
    });

    it('should return success for no issues', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 0,
        totalLates: 0,
        unjustifiedCount: 0,
        lastDate: '2024-01-15'
      };
      expect(service.summaryBadgeVariant(row)).toBe('success');
    });
  });

  describe('summaryLabel', () => {
    it('should return "A traiter" for unjustified', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 3,
        totalLates: 0,
        unjustifiedCount: 1,
        lastDate: '2024-01-15'
      };
      expect(service.summaryLabel(row)).toBe('A traiter');
    });

    it('should return "Surveille" for absences', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 3,
        totalLates: 0,
        unjustifiedCount: 0,
        lastDate: '2024-01-15'
      };
      expect(service.summaryLabel(row)).toBe('Surveille');
    });

    it('should return "Retards" for lates', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 0,
        totalLates: 2,
        unjustifiedCount: 0,
        lastDate: '2024-01-15'
      };
      expect(service.summaryLabel(row)).toBe('Retards');
    });

    it('should return "Stable" for no issues', () => {
      const row: AttendanceSummaryRow = {
        studentId: 1,
        studentName: 'Test',
        className: 'CP-A',
        totalAbsences: 0,
        totalLates: 0,
        unjustifiedCount: 0,
        lastDate: '2024-01-15'
      };
      expect(service.summaryLabel(row)).toBe('Stable');
    });
  });
});
