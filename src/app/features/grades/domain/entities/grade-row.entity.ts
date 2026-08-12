/**
 * GradeRow Entity
 * Représente une ligne de notes pour une matière dans un bulletin
 */
import { Average } from "../value-objects/average.value-object";
import { Coefficient } from "../value-objects/coefficient.value-object";
import { Score } from "../value-objects/score.value-object";

export class GradeRow {
  readonly id: number;
  readonly subjectId: number;
  readonly subjectName: string;
  readonly subjectCode?: string;
  readonly scores: Map<string, Score>; // sequence -> score
  readonly coefficient: Coefficient;
  readonly average: Average;
  readonly comments?: string;

  constructor(
    id: number,
    subjectId: number,
    subjectName: string,
    coefficient: Coefficient,
    scores: Map<string, Score>,
    average: Average,
    subjectCode?: string,
    comments?: string,
  ) {
    this.id = id;
    this.subjectId = subjectId;
    this.subjectName = subjectName;
    this.subjectCode = subjectCode;
    this.scores = scores;
    this.coefficient = coefficient;
    this.average = average;
    this.comments = comments;
  }

  static create(
    id: number,
    subjectId: number,
    subjectName: string,
    coefficient: number,
    scoresData: number[],
    subjectCode?: string,
    comments?: string,
  ): GradeRow {
    const coeff = Coefficient.create(coefficient);
    const scoresList = scoresData.map((s) => Score.create(s));
    const average = Average.calculate(scoresData);
    const scoresMap = new Map<string, Score>();

    scoresList.forEach((score, index) => {
      scoresMap.set(`seq${index + 1}`, score);
    });

    return new GradeRow(
      id,
      subjectId,
      subjectName,
      coeff,
      scoresMap,
      average,
      subjectCode,
      comments,
    );
  }

  getScoreForSequence(sequenceName: string): Score | undefined {
    return this.scores.get(sequenceName);
  }

  getAllScores(): Score[] {
    return Array.from(this.scores.values());
  }

  getSequenceNames(): string[] {
    return Array.from(this.scores.keys());
  }

  getTotalScore(): number {
    return Array.from(this.scores.values()).reduce(
      (sum, score) => sum + score.value,
      0,
    );
  }
}
