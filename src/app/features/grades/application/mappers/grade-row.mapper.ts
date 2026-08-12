/**
 * GradeRowMapper
 * Mappe GradeRow vers DTO
 */
import { Injectable } from "@angular/core";
import { GradeRow } from "../../domain/entities";
import { Mention } from "../../domain/value-objects";
import { GradeListDTO, GradeRowDTO } from "../dtos";

@Injectable()
export class GradeRowMapper {
  toDTO(row: GradeRow): GradeRowDTO {
    const mention = Mention.fromAverage(row.average.value);

    const scores: { [key: string]: number } = {};
    row.getSequenceNames().forEach((seqName) => {
      const score = row.getScoreForSequence(seqName);
      if (score) {
        scores[seqName] = score.value;
      }
    });

    return {
      id: row.id,
      subjectId: row.subjectId,
      subjectName: row.subjectName,
      subjectCode: row.subjectCode,
      scores,
      coefficient: row.coefficient.value,
      average: row.average.value,
      mention: mention.label,
      mentionColor: mention.color,
      mentionEmoji: mention.emoji,
      comments: row.comments,
    };
  }

  toListDTO(row: GradeRow): GradeListDTO {
    const mention = Mention.fromAverage(row.average.value);
    const firstScore = row.getAllScores()[0];

    return {
      id: row.id,
      studentId: 0, // À remplir depuis le contexte
      studentName: "", // À remplir depuis le contexte
      subjectId: row.subjectId,
      subjectName: row.subjectName,
      score: firstScore?.value || 0,
      coefficient: row.coefficient.value,
      period: row.getSequenceNames().join(", "),
      assessmentDate: new Date().toISOString().split("T")[0],
      mention: mention.label,
    };
  }

  fromDTO(dto: GradeRowDTO): GradeRow {
    const scoresArray = Object.values(dto.scores);
    const coeffArray = new Array(scoresArray.length).fill(dto.coefficient);

    return GradeRow.create(
      dto.id,
      dto.subjectId,
      dto.subjectName,
      dto.coefficient,
      scoresArray,
      dto.subjectCode,
      dto.comments,
    );
  }
}
