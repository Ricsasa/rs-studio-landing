import { describe, expect, it } from "vitest";
import {
  buildWhatsAppMessage,
  buildWhatsAppUrl,
  formatAnswersMessage,
  isQuestionAnswered,
  toggleMultiSelect,
  truncateExtraNotes,
  truncateOtherValue,
  type QuoterAnswer,
  type QuoterQuestion,
} from "./quoter";

const singleQuestion: QuoterQuestion = {
  id: "q1",
  type: "single",
  label: "¿Tipo de negocio?",
  options: [
    { id: "a", label: "Estética" },
    { id: "other", label: "Otro", includeOtherField: true },
  ],
};

const multiQuestion: QuoterQuestion = {
  id: "q2",
  type: "multi",
  label: "¿Activos?",
  options: [
    { id: "logo", label: "Logo" },
    { id: "photos", label: "Fotos" },
    { id: "none", label: "Ninguno", exclusive: true },
    { id: "other", label: "Otros", includeOtherField: true },
  ],
};

describe("isQuestionAnswered", () => {
  it("requires exactly one option for required single", () => {
    expect(isQuestionAnswered(singleQuestion, undefined)).toBe(false);
    expect(
      isQuestionAnswered(singleQuestion, {
        questionId: "q1",
        selectedOptionIds: ["a"],
      }),
    ).toBe(true);
  });

  it("requires at least one option for required multi", () => {
    expect(isQuestionAnswered(multiQuestion, undefined)).toBe(false);
    expect(
      isQuestionAnswered(multiQuestion, {
        questionId: "q2",
        selectedOptionIds: ["logo"],
      }),
    ).toBe(true);
  });

  it("is always answered when required is false", () => {
    const optional: QuoterQuestion = { ...singleQuestion, required: false };
    expect(isQuestionAnswered(optional, undefined)).toBe(true);
  });
});

describe("toggleMultiSelect", () => {
  it("adds and removes options", () => {
    const afterAdd = toggleMultiSelect(multiQuestion, undefined, "logo");
    expect(afterAdd).toEqual(["logo"]);

    const current: QuoterAnswer = { questionId: "q2", selectedOptionIds: afterAdd };
    const afterRemove = toggleMultiSelect(multiQuestion, current, "logo");
    expect(afterRemove).toEqual([]);
  });

  it("selecting exclusive option clears all others", () => {
    const current: QuoterAnswer = {
      questionId: "q2",
      selectedOptionIds: ["logo", "photos"],
    };
    expect(toggleMultiSelect(multiQuestion, current, "none")).toEqual(["none"]);
  });

  it("selecting another option clears the exclusive one", () => {
    const current: QuoterAnswer = { questionId: "q2", selectedOptionIds: ["none"] };
    expect(toggleMultiSelect(multiQuestion, current, "logo")).toEqual(["logo"]);
  });
});

describe("truncateOtherValue", () => {
  it("caps at 100 characters", () => {
    const long = "a".repeat(150);
    expect(truncateOtherValue(long)).toHaveLength(100);
  });
});

describe("truncateExtraNotes", () => {
  it("caps at 75 characters", () => {
    const long = "a".repeat(150);
    expect(truncateExtraNotes(long)).toHaveLength(75);
  });
});

describe("formatAnswersMessage", () => {
  it("formats selected answers as bullet lines", () => {
    const answers = {
      q1: { questionId: "q1", selectedOptionIds: ["a"] },
    };
    const text = formatAnswersMessage([singleQuestion], answers, "Otro", "sin especificar");
    expect(text).toBe("- ¿Tipo de negocio?: Estética");
  });

  it("shows unspecified label for empty otro value", () => {
    const answers = {
      q1: { questionId: "q1", selectedOptionIds: ["other"], otherValue: "" },
    };
    const text = formatAnswersMessage([singleQuestion], answers, "Otro", "sin especificar");
    expect(text).toBe("- ¿Tipo de negocio?: Otro: sin especificar");
  });

  it("includes otro value when provided", () => {
    const answers = {
      q1: { questionId: "q1", selectedOptionIds: ["other"], otherValue: "Panadería" },
    };
    const text = formatAnswersMessage([singleQuestion], answers, "Otro", "sin especificar");
    expect(text).toBe("- ¿Tipo de negocio?: Otro: Panadería");
  });

  it("joins multiple selections with commas", () => {
    const answers = {
      q2: { questionId: "q2", selectedOptionIds: ["logo", "photos"] },
    };
    const text = formatAnswersMessage([multiQuestion], answers, "Otro", "sin especificar");
    expect(text).toBe("- ¿Activos?: Logo, Fotos");
  });

  it("skips unanswered questions", () => {
    const text = formatAnswersMessage([singleQuestion, multiQuestion], {}, "Otro", "sin especificar");
    expect(text).toBe("");
  });

  it("appends extra notes as a trailing bullet when present", () => {
    const answers = { q1: { questionId: "q1", selectedOptionIds: ["a"] } };
    const text = formatAnswersMessage(
      [singleQuestion],
      answers,
      "Otro",
      "sin especificar",
      "Necesito esto para el jueves",
      "Comentarios adicionales",
    );
    expect(text).toBe(
      "- ¿Tipo de negocio?: Estética\n- Comentarios adicionales: Necesito esto para el jueves",
    );
  });

  it("omits extra notes line when blank", () => {
    const answers = { q1: { questionId: "q1", selectedOptionIds: ["a"] } };
    const text = formatAnswersMessage([singleQuestion], answers, "Otro", "sin especificar", "   ", "Comentarios adicionales");
    expect(text).toBe("- ¿Tipo de negocio?: Estética");
  });
});

describe("buildWhatsAppMessage", () => {
  it("replaces placeholders", () => {
    const result = buildWhatsAppMessage(
      "Hola {sectionTitle}:\n{answers_json}",
      "Landing Pages",
      "- foo: bar",
    );
    expect(result).toBe("Hola Landing Pages:\n- foo: bar");
  });
});

describe("buildWhatsAppUrl", () => {
  it("url-encodes the message and includes the phone number", () => {
    const url = buildWhatsAppUrl("522206315612", "hola & adiós");
    expect(url).toBe(
      `https://wa.me/522206315612?text=${encodeURIComponent("hola & adiós")}`,
    );
  });

  it("escapes special characters", () => {
    const url = buildWhatsAppUrl("522206315612", "100% seguro? sí/no");
    expect(url).toContain(encodeURIComponent("100% seguro? sí/no"));
  });
});
