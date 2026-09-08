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
      margin: 0 2px !important;
      font-style: normal !important;
    }
    rt.btb-ruby-rt {
      display: block !important;
      font-size: 0.7em !important;
      line-height: 1.2 !important;
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

    // If target is already inside a ruby token, update rt text content
    if (
      parent instanceof Element &&
      parent.tagName.toLowerCase() === "ruby" &&
      parent.classList.contains("btb-ruby-token")
    ) {
      const rt = parent.querySelector("rt.btb-ruby-rt");
      if (rt !== null) {
        rt.textContent = result.rendered;
      }
      state.rendered = state.source;
      state.status = "rendered";
      return true;
    }

    // Create ruby wrapper container
    const rubyElement = doc.createElement("ruby");
    rubyElement.className = "btb-ruby-token";

    // Insert ruby element before target, then append target inside ruby
    parent.insertBefore(rubyElement, target);
    rubyElement.appendChild(target);

    // Append <rt> annotation element inside ruby containing transliterated text
    const rtElement = doc.createElement("rt");
    rtElement.className = "btb-ruby-rt";
    rtElement.textContent = result.rendered;
    rubyElement.appendChild(rtElement);

    state.rendered = state.source;
    state.rendererId = "annotation-v1";
    state.status = "rendered";

    return true;
  },
};
