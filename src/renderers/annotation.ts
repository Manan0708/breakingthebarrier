import type { NodeState } from "../content/node-state";
import type { TransliterationResult } from "../engines/contracts";
import type { Renderer } from "./contracts";

const ANNOTATION_STYLE_ID = "btb-annotation-style";

function ensureAnnotationStyle(doc: Document): void {
  if (doc.getElementById(ANNOTATION_STYLE_ID) !== null) {
    return;
  }
  const style = doc.createElement("style");
  style.id = ANNOTATION_STYLE_ID;
  style.textContent = `
    ruby.btb-ruby-token {
      display: inline-flex !important;
      flex-direction: column-reverse !important;
      align-items: center !important;
      text-align: center !important;
      vertical-align: baseline !important;
      margin: 0 1px !important;
    }
    rt.btb-ruby-rt {
      display: block !important;
      font-size: 0.65em !important;
      line-height: 1.1 !important;
      font-weight: 600 !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      color: #00e5ff !important;
      letter-spacing: 0.02em !important;
      user-select: none !important;
      pointer-events: none !important;
      text-transform: lowercase !important;
    }
  `;
  doc.head.appendChild(style);
}

export const annotationRenderer: Renderer = {
  id: "annotation-v1",
  apply(target: Text, result: TransliterationResult, state: NodeState): boolean {
    if (target.data !== state.source || result.source !== state.source) {
      return false;
    }

    const doc = target.ownerDocument;
    const parent = target.parentNode;
    if (parent === null) {
      return false;
    }

    ensureAnnotationStyle(doc);

    // Check if any segment has a transliteration distinct from source
    const transliteratedSegment = result.segments.find(
      (seg) =>
        seg.romanized !== null &&
        seg.romanized.trim().length > 0 &&
        seg.romanized !== seg.source,
    );

    if (transliteratedSegment?.romanized == null) {
      return false;
    }

    // Create ruby wrapper container
    const rubyElement = doc.createElement("ruby");
    rubyElement.className = "btb-ruby-token";

    // Insert ruby wrapper before target, then move target inside ruby
    parent.insertBefore(rubyElement, target);
    rubyElement.appendChild(target);

    // Append <rt> annotation element inside ruby
    const rtElement = doc.createElement("rt");
    rtElement.className = "btb-ruby-rt";
    rtElement.textContent = transliteratedSegment.romanized;
    rubyElement.appendChild(rtElement);

    // Track node state
    state.rendered = state.source;
    state.rendererId = "annotation-v1";
    state.status = "rendered";

    return true;
  },
};
