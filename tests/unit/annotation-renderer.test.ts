import { describe, expect, it } from "vitest";
import { JSDOM } from "jsdom";
import { annotationRenderer } from "../../src/renderers/annotation";
import type { NodeState } from "../../src/content/node-state";
import type { TransliterationResult } from "../../src/engines/contracts";

describe("AnnotationRenderer", () => {
  it("wraps transliterated tokens in isolated <ruby> and <rt> elements", () => {
    const dom = new JSDOM("<!DOCTYPE html><html><body><p id='target'>勉強</p></body></html>");
    const doc = dom.window.document;
    const p = doc.querySelector("#target");
    const targetText = p?.firstChild as Text;

    const state: NodeState = {
      source: "勉強",
      rendered: null,
      revision: 1,
      sessionEpoch: 1,
      rendererId: "annotation-v1",
      optionsKey: "default",
      status: "queued",
      boundaryPrefix: "",
    };

    const result: TransliterationResult = {
      itemId: "1",
      source: "勉強",
      rendered: "benkyou",
      segments: [
        {
          start: 0,
          end: 2,
          source: "勉強",
          reading: "benkyou",
          romanized: "benkyou",
        },
      ],
      warnings: [],
      versions: {
        engine: "5.3.0",
        dictionary: "5.3.0",
        romanizationPolicy: "ascii-hepburn-v1",
        spacingPolicy: "japanese-spacing-v1",
      },
    };

    const success = annotationRenderer.apply(targetText, result, state);
    expect(success).toBe(true);
    expect(state.status).toBe("rendered");
    expect(state.container).toBeDefined();

    const ruby = p?.querySelector("ruby");
    expect(ruby).not.toBeNull();
    expect(ruby?.classList.contains("btb-ruby-token")).toBe(true);
    expect(ruby?.getAttribute("data-btb-ignore")).toBe("");
    expect(ruby?.textContent).toContain("勉強");

    const rt = ruby?.querySelector("rt");
    expect(rt).not.toBeNull();
    expect(rt?.textContent).toBe("benkyou");
  });
});



