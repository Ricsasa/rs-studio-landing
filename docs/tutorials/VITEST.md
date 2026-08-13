# Vitest tutorial for this project

This tutorial explains, step by step, how unit testing works in this
repository. It does not list every test. It walks through one real example
per pattern, and explains why the test is written that way.

## 1. Why Vitest

The project builds with Vite (through Astro). Vitest reuses that same build
pipeline, so it understands the project's TypeScript config and path
aliases without extra setup. It also has a Jest-compatible API
(`describe`, `it`, `expect`, `vi.mock`), so most Jest knowledge transfers
directly.

## 2. Installation

```bash
npm i -D vitest @vitest/coverage-v8
```

- `vitest` is the test runner.
- `@vitest/coverage-v8` is optional. It adds code coverage reports using
  Node's built-in V8 coverage engine (`npm run test:coverage`).

## 3. Configuration file (`vitest.config.ts`)

```ts
import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/lib/**", "src/i18n/**"],
    },
  },
});
```

Line by line:

- `defineConfig` from `vitest/config`, not from `vite`. It merges Vite's
  config shape with the extra `test` key Vitest reads. Using the Vite
  version here means the type checker rejects a `test` key, since Vite
  itself does not know about it.
- `resolve.alias` mirrors the `@/*` path alias declared in `tsconfig.json`.
  Vitest does not read `tsconfig.json` paths on its own, so the alias is
  repeated here. Without this block, an import like `import x from
  "@/lib/whatsapp"` resolves at compile time (TypeScript) but fails at run
  time (Vitest), because only TypeScript reads `tsconfig.json` paths.
- `environment: "node"` runs tests in a plain Node context, not a browser
  DOM (`jsdom`/`happy-dom`). All tests in this project cover plain
  functions (`.ts` files), not rendered components, so no DOM is needed.
  This also keeps the suite fast: a DOM environment adds real overhead per
  file.
- `include: ["src/**/*.test.ts"]` tells Vitest where to look. The
  convention in this project is a `*.test.ts` file next to the file it
  tests (for example `src/lib/markdown.ts` and
  `src/lib/markdown.test.ts` in the same folder). This keeps a test next
  to the code it exercises, so a rename or delete of the source file makes
  the orphaned test obvious.
- `coverage.include` scopes coverage reports to `src/lib/**` and
  `src/i18n/**`, the two folders that hold pure, testable logic. Without
  this, the coverage report would also try to instrument `.astro` files,
  which Vitest cannot execute, and the report would misreport them as
  0% covered code that was never actually a test target.

## 4. npm scripts

Added to `package.json`:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

- `vitest run` executes once and exits. Use this in CI and for a normal
  "did I break anything" check.
- `vitest` (no `run`) starts watch mode: it re-runs affected tests on file
  save. Use this while writing a test.
- `--coverage` adds the V8 coverage report on top of a single run.

## 5. File naming and placement convention

- Test file: `<name>.test.ts`, in the same folder as `<name>.ts`.
- One `describe()` block per exported function.
- One `it()` per behavior, not per input. Group related inputs into a
  single `it()` only when they test the exact same behavior (for example,
  several file extensions all being "accepted").

The remaining sections below cover one worked example per test pattern
found in this codebase.

## 6. Pattern: pure function, no mocks

File: `src/lib/markdown.ts` → `src/lib/markdown.test.ts`

`renderRichText` takes a string and returns an HTML string. It reads no
file, calls no external module, and depends on no global state. This is
the simplest pattern: call the function, assert the return value.

```ts
import { describe, expect, it } from "vitest";
import { renderRichText } from "./markdown";

describe("renderRichText", () => {
  it("wraps a single line in a paragraph", () => {
    expect(renderRichText("Hola mundo")).toBe("<p>Hola mundo</p>");
  });

  it("escapes HTML in the source before applying markup", () => {
    expect(renderRichText("<script>alert(1)</script>")).toBe(
      "<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>",
    );
  });
});
```

What makes this test worth writing, beyond the happy path:

- The escape test locks in a security property: user-authored copy can
  never inject an HTML tag through this function. If a future change
  reorders escaping after markup conversion, this test catches it.
- Edge cases specific to the implementation get their own `it()`: multiple
  blank lines collapsing to one paragraph break, a single newline becoming
  `<br />` instead of a new paragraph, and empty input returning `""`.
  Each of these maps to one branch or regex in the source, so each gets
  its own assertion instead of being folded into the happy-path test.

When to reach for this pattern: the function under test has no
`import` of `node:fs`, no import of `i18next`, and touches nothing outside
its own arguments. Read the function's imports first — if it imports
nothing stateful, this pattern applies.

## 7. Pattern: mocking `node:fs`

File: `src/lib/screenshots.ts` → `src/lib/screenshots.test.ts`

`readScreenshots` calls `readdirSync` to list files on disk. A unit test
must not touch the real filesystem: it should not depend on which files
happen to exist in `public/projects/` on the machine running the test, and
it must be able to simulate a missing folder without actually deleting
one.

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import { readdirSync } from "node:fs";

vi.mock("node:fs", () => ({
  readdirSync: vi.fn(),
}));

const mockedReaddirSync = vi.mocked(readdirSync);

describe("readScreenshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty list when the folder does not exist", async () => {
    mockedReaddirSync.mockImplementation(() => {
      throw new Error("ENOENT");
    });
    const { readScreenshots } = await import("./screenshots");
    expect(readScreenshots("missing-project")).toEqual([]);
  });

  it("sorts filenames in natural numeric order, not lexicographic order", async () => {
    mockedReaddirSync.mockReturnValue(["10.avif", "2.avif", "1.avif"] as any);
    const { readScreenshots } = await import("./screenshots");
    expect(readScreenshots("acme")).toEqual([
      "/projects/acme/1.avif",
      "/projects/acme/2.avif",
      "/projects/acme/10.avif",
    ]);
  });
});
```

Mechanics worth understanding line by line:

- `vi.mock("node:fs", () => ({ readdirSync: vi.fn() }))` replaces the
  entire `node:fs` module with a fake one, for every file in this test
  file. Vitest hoists this call to the top of the file automatically
  (before the `import` statements run), which is why the mock is in place
  before `./screenshots` gets imported anywhere. The fake module only
  exposes `readdirSync` — importing any other export from `node:fs` in the
  test file would be `undefined`.
- `vi.mocked(readdirSync)` is a TypeScript-only helper. At run time it
  returns the exact same mock function; it exists purely so the compiler
  treats `readdirSync` as a `Mock` (with `.mockReturnValue`,
  `.mockImplementation`, etc.) instead of its real `node:fs` type.
- `beforeEach(() => vi.clearAllMocks())` resets call history and any
  `mockReturnValue`/`mockImplementation` set by the previous test. Without
  this, a `mockImplementation` that throws in one test would leak into the
  next test and make it fail for the wrong reason.
- `await import("./screenshots")` (dynamic import, inside the test) rather
  than a static `import { readScreenshots } from "./screenshots"` at the
  top of the file. Either form works for this particular module, since
  `readScreenshots` reads `readdirSync` only when called, not at import
  time. The dynamic form is used here on purpose, as a defensive habit for
  any module whose top-level code might run on import — a static import
  would execute that top-level code before the mock's return value is
  configured for that specific test.
- Casting the mock's return value `as any` (or a narrower `as unknown as
  ReturnType<typeof readdirSync>`) sidesteps `readdirSync`'s real,
  overloaded return type (`string[] | Buffer[] | Dirent[]`, depending on
  the options argument). The test only ever needs the plain `string[]`
  overload.

When to reach for this pattern: the function under test imports something
from `node:fs`, `node:path`, or any other Node built-in with I/O. Mock the
built-in, not the function under test.

## 8. Pattern: binary data built by hand, instead of fixture files

File: `src/lib/imageSize.ts` → `src/lib/imageSize.test.ts`

`readImageSize` parses raw image file headers (PNG, JPEG, AVIF) to pull
out width and height, without a full image-decoding library. Testing this
by checking in real `.png`/`.jpg`/`.avif` sample files works, but it is
opaque: a reader cannot tell, by looking at a binary fixture file, which
byte encodes the width. Building the minimum valid header by hand, in the
test file itself, keeps the byte layout that the parser expects visible
and self-documenting.

```ts
/** Minimal valid PNG header: signature + IHDR chunk with width/height. */
function buildPngBuffer(width: number, height: number): Buffer {
  const buffer = Buffer.alloc(24);
  buffer.write("IHDR", 12, "ascii");
  buffer.writeUInt32BE(width, 16);
  buffer.writeUInt32BE(height, 20);
  return buffer;
}

it("reads width and height from a PNG IHDR chunk", async () => {
  mockedReadFileSync.mockReturnValue(buildPngBuffer(800, 600));
  const { readImageSize } = await import("./imageSize");
  expect(readImageSize("/projects/x/1.png")).toEqual({ width: 800, height: 600 });
});
```

Why this shape:

- `Buffer.alloc(24)` allocates 24 zero-filled bytes because
  `src/lib/imageSize.ts`'s `pngSize()` function only reads up to byte
  offset 24 (`IHDR` type tag at offset 12, then two big-endian 32-bit
  integers at offsets 16 and 20). The buffer needs to be exactly as long
  as the parser's read window, no more.
- `buffer.writeUInt32BE(width, 16)` matches the parser's own
  `buffer.readUInt32BE(16)` call in `pngSize()`. The test buffer is built
  with the same offsets and the same endianness (`BE`, big-endian) as the
  code under test reads. Reading the source function's byte offsets first
  is required before writing this kind of test — guessing the layout
  produces a fixture that happens to make the happy-path assertion pass
  for the wrong reason.
- A second helper, `buildAvifBuffer`, is reused with `Buffer.concat` to
  build a file with two `ispe` boxes (a fake thumbnail box followed by a
  full-size box). That test asserts the parser picks the larger box,
  which is a real branch in `avifSize()` that a single-box fixture could
  never exercise.
- `readFileSync` (the disk read) is mocked exactly as in Section 7, so no
  actual file is written to or read from disk — the constructed buffer is
  returned directly, in memory.

When to reach for this pattern: the function under test parses a binary
or otherwise strictly-positional format, and the interesting behavior
depends on specific byte offsets rather than on the file's general
"shape". Build the minimum buffer that satisfies the parser's read
window, and cross-check every offset against the source before trusting
the test.

## 9. Pattern: mocking `i18next`

File: `src/lib/whatsapp.ts` → `src/lib/whatsapp.test.ts`

`whatsappHref` calls `i18n.t("whatsapp.message")` as its default argument,
to get a localized greeting. In a real Astro page render, `i18next` is
initialized with the current locale's translation files. A unit test does
not want to load real translation JSON or depend on which locale is
active — it wants to control exactly what `t()` returns.

```ts
import { describe, expect, it, vi } from "vitest";
import i18n from "i18next";
import { WHATSAPP_PHONE, whatsappHref } from "./whatsapp";

vi.mock("i18next", () => ({
  default: {
    t: vi.fn(() => "Hola, quiero cotizar un proyecto"),
  },
}));

it("builds a wa.me link with the phone number and the default localized message", () => {
  const href = whatsappHref();
  expect(href).toBe(
    `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent("Hola, quiero cotizar un proyecto")}`,
  );
  expect(i18n.t).toHaveBeenCalledWith("whatsapp.message");
});
```

Key detail: the mock factory returns `{ default: { t: vi.fn(...) } }`, not
`{ t: vi.fn(...) }`. `i18next`'s real package exports its `i18n` instance
as a default export (`import i18n from "i18next"`), so the mock has to
match that same shape — a `default` key wrapping the object — or the
import in `whatsapp.ts` receives `undefined`.

Because `i18n.t` is a `vi.fn()`, the test can also assert on how it was
called (`toHaveBeenCalledWith`), not only on what it returned. This
matters here because `whatsappHref`'s default-argument message is only
correct if it asked i18next for the exact translation key
`"whatsapp.message"` — a typo'd key would silently return the key itself
in a real i18next setup, and this assertion is what would catch that.

When to reach for this pattern: the function under test imports the
default export from `i18next` directly and calls `.t(...)` on it.

## 10. Pattern: mocking a third-party module alongside `i18next`

File: `src/i18n/routing.ts` → `src/i18n/routing.test.ts`

`routing.ts` combines two external dependencies: `i18n.language` (state
read from the `i18next` singleton) and `getLocalizedPathname` (a pure
function imported from the `astro-react-i18next/utils` package). Both get
mocked, so the test can drive the "current locale" directly and check the
routing functions' own logic (which path segments get combined) without
depending on the real localization package's internals.

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "i18next";

vi.mock("i18next", () => ({
  default: { language: "es-MX" },
}));

vi.mock("astro-react-i18next/utils", () => ({
  // Real behavior: default locale ("es-MX") returns the bare path,
  // any other locale gets prefixed with "/<locale>".
  getLocalizedPathname: vi.fn((path: string, language: string) =>
    language === "es-MX" ? path : `/${language}${path}`,
  ),
}));

describe("sectionHref", () => {
  beforeEach(() => {
    (i18n as unknown as { language: string }).language = "es-MX";
  });

  it("returns the bare hash when already on the home page", async () => {
    const { sectionHref } = await import("./routing");
    expect(sectionHref("/", "#contact")).toBe("#contact");
  });

  it("prefixes the hash with the home path when not on the home page", async () => {
    const { sectionHref } = await import("./routing");
    expect(sectionHref("/work/acme", "#contact")).toBe("/#contact");
  });
});
```

What is different from the previous `i18next` mock in Section 9:

- The mocked `getLocalizedPathname` is not a bare `vi.fn()` returning a
  fixed value — it has a real (if simplified) implementation, re-creating
  the actual package's locale-prefixing rule. This is a judgment call: the
  test is not for `astro-react-i18next` (that package has its own tests),
  but `routing.ts`'s functions only make sense in combination with that
  rule, so the mock reimplements just enough of it to make the routing
  test meaningful.
- `i18n.language` is mutated directly between tests (via a cast, since the
  mock's type is looser than the real `i18next` type) instead of being
  re-mocked. Because `vi.mock` replaces the module once for the whole test
  file, and the module is a singleton object, writing to
  `(i18n as ...).language = "en-US"` changes what every subsequent
  `import i18n from "i18next"` sees, anywhere in the file — that includes
  inside `routing.ts` itself, once it is imported. A `beforeEach` resets
  it to `"es-MX"` so tests do not depend on execution order.
- Every test still uses `await import("./routing")` rather than a
  top-level static import, for the same reason as Section 7: it keeps
  each test explicit about depending on the mocked state being ready
  first, even though in this particular case the module happens to have
  no meaningful import-time side effect either way.

When to reach for this pattern: the function under test combines
`i18next` state with another package's helper function, and the
interesting behavior lives in how the two are combined — not in either
dependency alone.

