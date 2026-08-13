import { describe, expect, it } from "vitest";
import { renderRichText } from "./markdown";

describe("renderRichText", () => {
  it("wraps a single line in a paragraph", () => {
    expect(renderRichText("Hola mundo")).toBe("<p>Hola mundo</p>");
  });

  it("converts **bold** markers to <strong>", () => {
    expect(renderRichText("**hola** mundo")).toBe("<p><strong>hola</strong> mundo</p>");
  });

  it("converts _italic_ markers to <em>", () => {
    expect(renderRichText("_hola_ mundo")).toBe("<p><em>hola</em> mundo</p>");
  });

  it("splits blank-line-separated blocks into separate paragraphs", () => {
    expect(renderRichText("uno\n\ndos")).toBe("<p>uno</p><p>dos</p>");
  });

  it("converts a single newline inside a block to <br />", () => {
    expect(renderRichText("uno\ndos")).toBe("<p>uno<br />dos</p>");
  });

  it("drops blocks left empty after trimming", () => {
    expect(renderRichText("uno\n\n\n\ndos")).toBe("<p>uno</p><p>dos</p>");
  });

  it("escapes HTML in the source before applying markup", () => {
    expect(renderRichText("<script>alert(1)</script>")).toBe(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
  });

  it("escapes HTML even inside bold/italic spans", () => {
    expect(renderRichText("**<b>x</b>**")).toBe("<p><strong>&lt;b&gt;x&lt;/b&gt;</strong></p>");
  });

  it("returns an empty string for empty input", () => {
    expect(renderRichText("")).toBe("");
  });
});
