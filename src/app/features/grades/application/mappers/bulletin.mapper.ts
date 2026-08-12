/**
 * BulletinMapper
 * Mappe les entities vers les DTOs
 */
import { Injectable } from '@angular/core';
import { Bulletin } from '../../domain/entities';
import { Mention } from '../../domain/value-objects';
import { BulletinDTO, BulletinStatisticsDTO } from '../dtos';
import { GradeRowMapper } from './grade-row.mapper';

interface BulletinStatistics {
  generalAverage: { value: number };
  mention: Mention;
  passingCount: number;
  failingCount: number;
  bestSubjects: Bulletin["gradeRows"];
  worstSubjects: Bulletin["gradeRows"];
  isSuccessful: boolean;
}

@Injectable()
export class BulletinMapper {
  constructor(private gradeRowMapper: GradeRowMapper) {}

  toDTO(bulletin: Bulletin): BulletinDTO {
    const generalAverage = bulletin.getGeneralAverage();
    const mention = bulletin.getGeneralMention();

    return {
      id: bulletin.id,
      studentId: bulletin.studentHeader.studentId,
      studentName: bulletin.studentHeader.displayName,
      studentMatricule: bulletin.studentHeader.matricule,
      className: bulletin.studentHeader.className,
      classId: bulletin.studentHeader.classId,
      academicYear: bulletin.studentHeader.academicYear,
      trimester: bulletin.academicContext.trimesterLabel,
      sequence: bulletin.academicContext.sequenceLabel,
      evaluationMonth: bulletin.academicContext.evaluationMonth,
      gradeRows: bulletin.gradeRows.map((row) => this.gradeRowMapper.toDTO(row)),
      generalAverage: generalAverage.value,
      generalMention: mention.label,
      totalCoefficient: bulletin.getTotalCoefficient(),
      passingCount: bulletin.getPassingSubjectsCount(),
      failingCount: bulletin.getFailingSubjectsCount(),
      isSuccessful: bulletin.isSuccessful(),
      rank: bulletin.studentRank,
      totalStudents: bulletin.totalStudentsInClass,
      createdAt: bulletin.createdAt,
      lastUpdatedAt: bulletin.lastUpdatedAt,
    };
  }

  toDTOWithStatistics(
    bulletin: Bulletin,
    statistics: BulletinStatistics,
  ): BulletinDTO {
    const dto = this.toDTO(bulletin);
    return {
      ...dto,
      generalAverage: statistics.generalAverage.value,
      generalMention: statistics.mention.label,
      passingCount: statistics.passingCount,
      failingCount: statistics.failingCount,
      isSuccessful: statistics.isSuccessful,
    };
  }

  toStatisticsDTO(
    _bulletin: Bulletin,
    statistics: BulletinStatistics,
  ): BulletinStatisticsDTO {
    return {
      generalAverage: statistics.generalAverage.value,
      mention: statistics.mention.label,
      passingCount: statistics.passingCount,
      failingCount: statistics.failingCount,
      isSuccessful: statistics.isSuccessful,
      topSubjects: statistics.bestSubjects.map((row) => this.gradeRowMapper.toDTO(row)),
      bottomSubjects: statistics.worstSubjects.map((row) => this.gradeRowMapper.toDTO(row)),
    };
  }
}
