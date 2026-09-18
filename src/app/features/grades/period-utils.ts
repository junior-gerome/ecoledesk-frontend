/**
 * Utilities partagees pour le calcul des fenetres de periode (sequence / trimestre)
 * Convention : Trimestre 1 = Sequences 1-2, Trimestre 2 = Sequences 3-4, Trimestre 3 = Sequences 5+
 */
import { Sequence } from "@app/features/sequence/domain/models";

const SEQUENCE_RE = /^sequence\s+(\d+)$/i;
const TRIMESTRE_RE = /^trimestre\s+(\d+)$/i;

export interface PeriodResolution {
  sequenceOrder: number;
  windowPeriod: string;
  displayLabel: string;
  trimester: number;
}

export interface PeriodOption {
  kind: "sequence" | "trimestre";
  sequence: number;
  label: string;
  value: string;
}

export function parseSequenceOrder(label: string): number {
  const parsed = Number(String(label ?? "").match(/(\d+)/)?.[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

export function resolveTrimesterFromOrder(order: number): number {
  if (order <= 2) return 1;
  if (order <= 4) return 2;
  return 3;
}

export function buildPeriodOptions(sequences: Sequence[]): PeriodOption[] {
  const sequenceOptions: PeriodOption[] = (sequences ?? [])
    .map((entry) => entry.libelleSequence?.trim())
    .filter((label): label is string => !!label && SEQUENCE_RE.test(label))
    .sort((left, right) => parseSequenceOrder(left) - parseSequenceOrder(right))
    .map((label) => ({
      kind: "sequence" as const,
      sequence: parseSequenceOrder(label),
      label,
      value: label,
    }));

  const maxOrderByTrimester = new Map<number, number>();
  sequenceOptions.forEach((option) => {
    const trimester = resolveTrimesterFromOrder(option.sequence);
    const current = maxOrderByTrimester.get(trimester) ?? 0;
    maxOrderByTrimester.set(trimester, Math.max(current, option.sequence));
  });

  const trimesterOptions: PeriodOption[] = Array.from(
    maxOrderByTrimester.entries(),
  )
    .sort((left, right) => left[0] - right[0])
    .map(([trimester, order]) => ({
      kind: "trimestre" as const,
      sequence: order,
      label: `Trimestre ${trimester}`,
      value: `Trimestre ${trimester}`,
    }));

  return [...sequenceOptions, ...trimesterOptions];
}

export function resolvePeriod(value: string): PeriodResolution {
  const raw = String(value ?? "").trim();
  const trimestreMatch = TRIMESTRE_RE.exec(raw);
  if (trimestreMatch) {
    const trimester = Number(trimestreMatch[1]);
    const boundary = trimester === 1 ? 2 : trimester === 2 ? 4 : Math.max(trimester * 2, 6);
    return {
      sequenceOrder: boundary,
      windowPeriod: `Sequence ${boundary}`,
      displayLabel: raw,
      trimester,
    };
  }

  const order = parseSequenceOrder(raw);
  if (order > 0) {
    return {
      sequenceOrder: order,
      windowPeriod: `Sequence ${order}`,
      displayLabel: raw,
      trimester: resolveTrimesterFromOrder(order),
    };
  }

  return {
    sequenceOrder: 1,
    windowPeriod: "Sequence 1",
    displayLabel: raw || "Sequence 1",
    trimester: 1,
  };
}

export function resolveSelectedPeriod(
  sequences: Sequence[],
  value: string,
): PeriodResolution {
  const options = buildPeriodOptions(sequences);
  const option = options.find((entry) => entry.value === value);
  if (!option) {
    return resolvePeriod(value);
  }

  return {
    sequenceOrder: option.sequence,
    windowPeriod: `Sequence ${option.sequence}`,
    displayLabel: option.label,
    trimester:
      option.kind === "trimestre"
        ? Number(TRIMESTRE_RE.exec(option.value)?.[1] ?? 0)
        : 0,
  };
}