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
    span.btb-ruby-container {
      display: inline !important;
      line-height: normal !important;
    }
    ruby.btb-ruby-token {
      display: inline-flex !important;
      flex-direction: column-reverse !important;
      align-items: center !important;
      text-align: center !important;
      vertical-align: baseline !important;
      margin: 0 1px !important;
      font-style: normal !important;
    }
    rt.btb-ruby-rt {
      display: block !important;
      font-size: 0.68em !important;
      line-height: 1.15 !important;
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

    const hasTransliteratedReading = result.segments.some(
      (seg) => {
        const reading = seg.romanized ?? seg.reading;
        return (
          reading !== null &&
          reading.trim().length > 0 &&
          reading !== seg.source
        );
      },
    );

    if (!hasTransliteratedReading) {
      return false;
    }

    const container = doc.createElement("span");
    container.className = "btb-ruby-container";

    for (const seg of result.segments) {
      const sourceText = seg.source;
      const reading = seg.romanized ?? seg.reading;
      const isDifferent =
        reading !== null &&
        reading.trim().length > 0 &&
        reading !== sourceText;

      if (isDifferent) {
        const rubyElement = doc.createElement("ruby");
        rubyElement.className = "btb-ruby-token";
        rubyElement.textContent = sourceText;

        const rtElement = doc.createElement("rt");
        rtElement.className = "btb-ruby-rt";
        rtElement.textContent = reading;
        rubyElement.appendChild(rtElement);

        container.appendChild(rubyElement);
      } else {
        container.appendChild(doc.createTextNode(sourceText));
      }
    }

    parent.replaceChild(container, target);

    state.container = container;
    state.rendered = state.source;
    state.rendererId = "annotation-v1";
    state.status = "rendered";

    return true;
  },
};
