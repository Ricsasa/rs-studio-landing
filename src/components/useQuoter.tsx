import { useMemo, useState } from "react";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  EXTRA_NOTES_MAX_LENGTH,
  formatAnswersMessage,
  isQuestionAnswered,
  toggleMultiSelect,
  truncateExtraNotes,
  truncateOtherValue,
  type QuoterAnswer,
  type QuoterAnswerRecord,
  type QuoterQuestion,
} from "@/lib/quoter";

export interface QuoterLabels {
  next?: string;
  back?: string;
  step?: string;
  summaryTitle?: string;
  sendToWhatsApp?: string;
  otherLabel?: string;
  unspecified?: string;
  extraNotesTitle?: string;
  extraNotesPlaceholder?: string;
  extraNotesLabel?: string;
  charactersLeft?: string;
  singleSelectHint?: string;
  multiSelectHint?: string;
}

export interface UseQuoterOptions {
  questions: QuoterQuestion[];
  sectionTitle: string;
  whatsappNumber: string;
  whatsappTemplate: string;
  labels?: QuoterLabels;
  onSubmit?: (answers: QuoterAnswerRecord) => void;
}

const DEFAULT_LABELS: Required<QuoterLabels> = {
  next: "Siguiente",
  back: "Atrás",
  step: "Pregunta {current} de {total}",
  summaryTitle: "Resumen",
  sendToWhatsApp: "Enviar a WhatsApp",
  otherLabel: "Otro",
  unspecified: "sin especificar",
  extraNotesTitle: "¿Algo más que quieras decirnos?",
  extraNotesPlaceholder: "Cuéntanos cualquier detalle adicional",
  extraNotesLabel: "Comentarios adicionales",
  charactersLeft: "{count}/{max} caracteres",
  singleSelectHint: "Selecciona una opción",
  multiSelectHint: "Puedes seleccionar varias opciones",
};

/**
 * Headless state/behavior for the Quoter flow — no markup, no styling.
 * Any presentation layer (the current Quoter.tsx, a future design-system
 * component) can drive itself off this hook's return value.
 */
export function useQuoter({
  questions,
  sectionTitle,
  whatsappNumber,
  whatsappTemplate,
  labels,
  onSubmit,
}: UseQuoterOptions) {
  const t: Required<QuoterLabels> = { ...DEFAULT_LABELS, ...labels };
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<QuoterAnswerRecord>({});
  const [extraNotes, setExtraNotes] = useState("");
  const [showSummary, setShowSummary] = useState(false);

  const total = questions.length;
  const question = questions[stepIndex];
  const answer = answers[question?.id ?? ""];
  const answered = question ? isQuestionAnswered(question, answer) : false;
  const progress = total === 0 ? 0 : Math.round(((stepIndex + (showSummary ? total : 0)) / total) * 100);

  const whatsappUrl = useMemo(() => {
    const answersText = formatAnswersMessage(
      questions,
      answers,
      t.otherLabel,
      t.unspecified,
      extraNotes,
      t.extraNotesLabel,
    );
    const message = buildWhatsAppMessage(whatsappTemplate, sectionTitle, answersText);
    return buildWhatsAppUrl(whatsappNumber, message);
  }, [
    questions,
    answers,
    extraNotes,
    whatsappTemplate,
    sectionTitle,
    whatsappNumber,
    t.otherLabel,
    t.unspecified,
    t.extraNotesLabel,
  ]);

  function selectSingle(optionId: string) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { questionId: question.id, selectedOptionIds: [optionId] },
    }));
  }

  function selectMulti(optionId: string) {
    const nextIds = toggleMultiSelect(question, answer, optionId);
    setAnswers((prev) => ({
      ...prev,
      [question.id]: { questionId: question.id, selectedOptionIds: nextIds },
    }));
  }

  function selectOption(optionId: string) {
    if (question.type === "single") selectSingle(optionId);
    else selectMulti(optionId);
  }

  function setOtherValue(value: string) {
    setAnswers((prev) => ({
      ...prev,
      [question.id]: {
        questionId: question.id,
        selectedOptionIds: prev[question.id]?.selectedOptionIds ?? [],
        otherValue: truncateOtherValue(value),
      },
    }));
  }

  function goNext() {
    if (stepIndex + 1 < total) {
      setStepIndex(stepIndex + 1);
    } else {
      setShowSummary(true);
    }
  }

  function goBack() {
    if (showSummary) {
      setShowSummary(false);
      return;
    }
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function handleSend() {
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    onSubmit?.(answers);
  }

  function isOptionSelected(optionId: string): boolean {
    return answer?.selectedOptionIds.includes(optionId) ?? false;
  }

  function showsOtherField(optionId: string): boolean {
    return Boolean(
      question?.options.find((o) => o.id === optionId)?.includeOtherField &&
        isOptionSelected(optionId),
    );
  }

  function summaryFor(q: QuoterQuestion): string | null {
    const a = answers[q.id];
    if (!a || a.selectedOptionIds.length === 0) return null;
    return a.selectedOptionIds
      .map((id) => {
        const opt = q.options.find((o) => o.id === id);
        if (!opt) return id;
        if (opt.includeOtherField) {
          return `${opt.label}: ${a.otherValue?.trim() || t.unspecified}`;
        }
        return opt.label;
      })
      .join(", ");
  }

  const charactersLeftText = t.charactersLeft
    .replace("{count}", String(extraNotes.length))
    .replace("{max}", String(EXTRA_NOTES_MAX_LENGTH));

  return {
    labels: t,
    questions,
    stepIndex,
    total,
    question,
    answer,
    answered,
    progress,
    showSummary,
    answers,
    extraNotes,
    extraNotesMaxLength: EXTRA_NOTES_MAX_LENGTH,
    charactersLeftText,
    whatsappUrl,
    setExtraNotes: (value: string) => setExtraNotes(truncateExtraNotes(value)),
    selectOption,
    setOtherValue,
    isOptionSelected,
    showsOtherField,
    summaryFor,
    goNext,
    goBack,
    handleSend,
  };
}

export type UseQuoterReturn = ReturnType<typeof useQuoter>;
