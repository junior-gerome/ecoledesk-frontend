import { Injectable } from '@angular/core';
import { AttendanceSummaryRow } from '../models';
import { BadgeVariant } from '@app/shared/ui/badge/badge.component';

export interface AttendanceSummaryMetrics {
  totalStudents: number;
  totalAbsences: number;
  totalLates: number;
  totalUnjustified: number;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceSummaryDomainService {
  computeSummaryMetrics(rows: AttendanceSummaryRow[]): AttendanceSummaryMetrics {
    return {
      totalStudents: rows.length,
      totalAbsences: rows.reduce((total, row) => total + row.totalAbsences, 0),
      totalLates: rows.reduce((total, row) => total + row.totalLates, 0),
      totalUnjustified: rows.reduce(
        (total, row) => total + row.unjustifiedCount,
        0,
      ),
    };
  }

  filterAndSortSummaryRows(
    rows: AttendanceSummaryRow[],
    search: string,
  ): AttendanceSummaryRow[] {
    const normalizedSearch = search.trim().toLowerCase();

    return rows
      .filter((row) => {
        if (!normalizedSearch) {
          return true;
        }

        return (
          row.studentName.toLowerCase().includes(normalizedSearch) ||
          row.className.toLowerCase().includes(normalizedSearch) ||
          String(row.studentId).includes(normalizedSearch)
        );
      })
      .sort((left, right) => {
        if (right.unjustifiedCount !== left.unjustifiedCount) {
          return right.unjustifiedCount - left.unjustifiedCount;
        }

        if (right.totalAbsences !== left.totalAbsences) {
          return right.totalAbsences - left.totalAbsences;
        }

        if (right.totalLates !== left.totalLates) {
          return right.totalLates - left.totalLates;
        }

        return left.studentName.localeCompare(right.studentName);
      });
  }

  summaryBadgeVariant(row: AttendanceSummaryRow): BadgeVariant {
    if (row.unjustifiedCount > 0) {
      return 'danger';
    }

    if (row.totalAbsences > 0) {
      return 'warning';
    }

    if (row.totalLates > 0) {
      return 'info';
    }

    return 'success';
  }

  summaryLabel(row: AttendanceSummaryRow): string {
    if (row.unjustifiedCount > 0) {
      return 'A traiter';
    }

    if (row.totalAbsences > 0) {
      return 'Surveille';
    }

    if (row.totalLates > 0) {
      return 'Retards';
    }

    return 'Stable';
  }
}
