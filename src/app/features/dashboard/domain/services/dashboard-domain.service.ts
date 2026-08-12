import { Injectable } from "@angular/core";
import { StudentByClasseDTO } from "@app/features/students/domain/models";
import { StudentBySectionCountDto } from "@app/features/students/domain/models";
import { ChartConfiguration, ChartType } from "chart.js";

type ChartData<T extends ChartType> = ChartConfiguration<T>["data"];

@Injectable({
  providedIn: "root",
})
export class DashboardDomainService {
  classBarChartData(items: StudentByClasseDTO[]): ChartData<"bar"> {
    return {
      labels: (items ?? []).map((item) => item.nameClasseRoom),
      datasets: [
        {
          data: (items ?? []).map((item) => this.toNumber(item.studentCount)),
          label: "Nombre d'eleves par classe",
          backgroundColor: ["#3B82F6", "#10B981", "#FBBF24", "#F59E0B", "#8B5CF6"],
          borderRadius: 7,
        },
      ],
    };
  }

  classDoughnutData(items: StudentByClasseDTO[]): ChartData<"doughnut"> {
    return {
      labels: (items ?? []).map((item) => item.nameClasseRoom),
      datasets: [
        {
          data: (items ?? []).map((item) => this.toNumber(item.studentCount)),
          backgroundColor: ["#3B82F6", "#10B981", "#FBBF24"],
        },
      ],
    };
  }

  sectionDoughnutData(items: StudentBySectionCountDto[]): ChartData<"doughnut"> {
    return {
      labels: (items ?? []).map((item) => item.sectionName),
      datasets: [
        {
          data: (items ?? []).map((item) => this.toNumber(item.studentCount)),
          backgroundColor: ["#3B82F6", "#10B981"],
          label: "Repartition des eleves par section",
        },
      ],
    };
  }

  newStudentsPieData(francophone: number, anglophone: number): ChartData<"pie"> {
    return {
      labels: ["Nouveaux Francophones", "Nouveaux Anglophones"],
      datasets: [
        {
          data: [this.toNumber(francophone), this.toNumber(anglophone)],
          backgroundColor: ["#6366F1", "#F59E0B"],
          label: "Nouveaux eleves par section",
        },
      ],
    };
  }

  newStudentsByClassData(items: StudentByClasseDTO[]): ChartData<"bar"> {
    return {
      labels: (items ?? []).map((item) => item.nameClasseRoom),
      datasets: [
        {
          label: "Nouveaux eleves par classe",
          data: (items ?? []).map((item) => this.toNumber(item.newStudentCount)),
          backgroundColor: ["#6366F1", "#F59E0B", "#FBBF24", "#EF4444", "#8B5CF6"],
          borderRadius: 7,
        },
      ],
    };
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
}
