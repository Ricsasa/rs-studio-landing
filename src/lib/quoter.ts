export interface QuoterOption {
  id: string;
  label: string;
  includeOtherField?: boolean;
  otherFieldPlaceholder?: string;
  exclusive?: boolean;
}

export interface QuoterQuestion {
  id: string;
  type: "single" | "multi";
  label: string;
  options: QuoterOption[];
  required?: boolean;
}

export interface QuoterAnswer {
  questionId: string;
  selectedOptionIds: string[];
  otherValue?: string;
}

export type QuoterAnswerRecord = Record<string, QuoterAnswer>;

const OTHER_FIELD_MAX_LENGTH = 100;
export const EXTRA_NOTES_MAX_LENGTH = 75;

export function isQuestionAnswered(
  question: QuoterQuestion,
  answer: QuoterAnswer | undefined,
): boolean {
  if (question.required === false) return true;
  const count = answer?.selectedOptionIds.length ?? 0;
  if (question.type === "single") return count === 1;
  return count >= 1;
}

export function toggleMultiSelect(
  question: QuoterQuestion,
  current: QuoterAnswer | undefined,
  optionId: string,
): string[] {
  const option = question.options.find((o) => o.id === optionId);
  const selected = new Set(current?.selectedOptionIds ?? []);

  if (selected.has(optionId)) {
    selected.delete(optionId);
    return [...selected];
  }

  if (option?.exclusive) {
    return [optionId];
  }

  const hadExclusive = question.options.some(
    (o) => o.exclusive && selected.has(o.id),
  );
  if (hadExclusive) {
    return [optionId];
  }

  selected.add(optionId);
  return [...selected];
}

export function truncateOtherValue(value: string): string {
  return value.slice(0, OTHER_FIELD_MAX_LENGTH);
}

export function truncateExtraNotes(value: string): string {
  return value.slice(0, EXTRA_NOTES_MAX_LENGTH);
}

export function formatAnswersMessage(
  questions: QuoterQuestion[],
  answers: QuoterAnswerRecord,
  otherLabel: string,
  unspecifiedLabel: string,
  extraNotes?: string,
  extraNotesLabel?: string,
): string {
  const lines: string[] = [];

  for (const question of questions) {
    const answer = answers[question.id];
    if (!answer || answer.selectedOptionIds.length === 0) continue;

    const parts = answer.selectedOptionIds.map((optionId) => {
      const option = question.options.find((o) => o.id === optionId);
      if (!option) return optionId;
      if (option.includeOtherField) {
        const otherValue = answer.otherValue?.trim();
        return `${option.label}: ${otherValue ? otherValue : unspecifiedLabel}`;
      }
      return option.label;
    });

    lines.push(`- ${question.label}: ${parts.join(", ")}`);
  }

  const trimmedNotes = extraNotes?.trim();
  if (trimmedNotes) {
    lines.push(`- ${extraNotesLabel}: ${trimmedNotes}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppMessage(
  template: string,
  sectionTitle: string,
  answersText: string,
): string {
  return template
    .replace(/{sectionTitle}/g, sectionTitle)
    .replace(/{answers_json}/g, answersText);
}

export function buildWhatsAppUrl(
  whatsappNumber: string,
  message: string,
): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}
