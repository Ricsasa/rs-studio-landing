import { useEffect, useRef } from "react";
import { useQuoter, type QuoterLabels } from "./useQuoter";
import type { QuoterAnswerRecord, QuoterQuestion } from "@/lib/quoter";

export interface QuoterProps {
  instanceId: string;
  sectionTitle: string;
  questions: QuoterQuestion[];
  whatsappNumber: string;
  whatsappTemplate: string;
  className?: string;
  onSubmit?: (answers: QuoterAnswerRecord) => void;
  labels?: QuoterLabels;
}

const optionButtonClass = (checked: boolean) =>
  `flex min-h-13 w-full cursor-pointer items-center gap-3 border px-5 py-3.5 text-left text-lead-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-moss ${
    checked
      ? "border-moss bg-moss text-paper"
      : "border-rule text-ink hover:border-moss hover:bg-substrate"
  }`;

export default function Quoter({
  instanceId,
  sectionTitle,
  questions,
  whatsappNumber,
  whatsappTemplate,
  className,
  onSubmit,
  labels,
}: QuoterProps) {
  const q = useQuoter({ questions, sectionTitle, whatsappNumber, whatsappTemplate, labels, onSubmit });
  const t = q.labels;
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 96;
    window.scrollTo({ top, behavior: "smooth" });
  }, [q.stepIndex, q.showSummary]);

  if (q.showSummary) {
    return (
      <div
        ref={rootRef}
        data-quoter-instance={instanceId}
        className={`relative border border-rule-strong bg-paper ${className ?? ""}`}
      >
        <div className="h-1.5 w-full bg-fern" />
        <div className="p-6 sm:p-10">
          <h3 className="font-display text-xl text-ink">{t.summaryTitle}</h3>
          <ul className="mt-4 flex flex-col gap-3">
            {q.questions.map((question) => {
              const summary = q.summaryFor(question);
              if (!summary) return null;
              return (
                <li key={question.id} className="border-b border-rule pb-3 text-sm text-graphite">
                  <span className="text-ink">{question.label}</span>
                  <br />
                  {summary}
                </li>
              );
            })}
          </ul>

          <div className="mt-6">
            <label htmlFor={`${instanceId}-extra-notes`} className="font-display text-lead text-ink">
              {t.extraNotesTitle}
            </label>
            <textarea
              id={`${instanceId}-extra-notes`}
              rows={3}
              maxLength={q.extraNotesMaxLength}
              value={q.extraNotes}
              onChange={(e) => q.setExtraNotes(e.target.value)}
              placeholder={t.extraNotesPlaceholder}
              className="mt-3 w-full resize-none border border-rule px-4 py-3 text-sm text-ink placeholder:text-mute focus:border-moss focus:outline-none"
            />
            <p className="mt-1 text-right text-xs text-mute">{q.charactersLeftText}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={q.goBack}
              className="border border-rule px-6 py-3 text-sm font-medium text-graphite transition-colors duration-200 hover:border-moss hover:text-moss"
            >
              {t.back}
            </button>
            <button
              type="button"
              onClick={q.handleSend}
              className="bg-fern px-6 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-moss hover:text-paper active:scale-[0.99]"
            >
              {t.sendToWhatsApp}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = q.question;
  if (!question) return null;

  return (
    <div
      ref={rootRef}
      data-quoter-instance={instanceId}
      className={`relative border border-rule-strong bg-paper ${className ?? ""}`}
    >
      <div className="h-1.5 w-full bg-substrate">
        <div
          className="h-full bg-fern transition-[width] duration-300"
          style={{ width: `${Math.max(q.progress, q.total ? 100 / q.total / 2 : 0)}%` }}
        />
      </div>
      <div className="p-6 sm:p-10">
        <p className="font-mono text-xs tracking-wide text-mute uppercase">
          {t.step.replace("{current}", String(q.stepIndex + 1)).replace("{total}", String(q.total))}
        </p>
        <fieldset className="mt-3">
          <legend className="font-display text-xl text-ink">{question.label}</legend>
          <p className="mt-1.5 text-sm text-mute">
            {question.type === "single" ? t.singleSelectHint : t.multiSelectHint}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const checked = q.isOptionSelected(option.id);
              return (
                <div key={option.id} className={option.includeOtherField ? "sm:col-span-2" : undefined}>
                  <label className={optionButtonClass(checked)}>
                    <input
                      type={question.type === "single" ? "radio" : "checkbox"}
                      name={question.id}
                      checked={checked}
                      onChange={() => q.selectOption(option.id)}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                  {q.showsOtherField(option.id) && (
                    <input
                      type="text"
                      maxLength={100}
                      value={q.answer?.otherValue ?? ""}
                      onChange={(e) => q.setOtherValue(e.target.value)}
                      placeholder={option.otherFieldPlaceholder}
                      className="mt-2 w-full border border-rule px-4 py-3 text-sm text-ink placeholder:text-mute focus:border-moss focus:outline-none"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-8 flex gap-3">
          {q.stepIndex > 0 && (
            <button
              type="button"
              onClick={q.goBack}
              className="border border-rule px-6 py-3 text-sm font-medium text-graphite transition-colors duration-200 hover:border-moss hover:text-moss"
            >
              {t.back}
            </button>
          )}
          <button
            type="button"
            disabled={!q.answered}
            onClick={q.goNext}
            className="bg-moss px-6 py-3 text-sm font-medium text-paper transition-colors duration-200 hover:bg-pine active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t.next}
          </button>
        </div>
      </div>
    </div>
  );
}
