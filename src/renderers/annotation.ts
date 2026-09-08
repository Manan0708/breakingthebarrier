import { CONTENT_IGNORE_ATTRIBUTE } from "../shared/config";
import type { NodeState } from "../content/node-state";
import type { TransliterationResult } from "../engines/contracts";
import type { Renderer } from "./contracts";

const RUBY_STYLE_ID = "btb-ruby-style";

function ensureRubyStyle(doc: Document): void {
  if (doc.getElementById(RUBY_STYLE_ID) !== null) {
    return;
  }
  const style = doc.createElement("style");
  style.id = RUBY_STYLE_ID;
  style.textContent = `
    ruby.btb-ruby-token {
      display: inline-ruby !important;
      ruby-position: over !important;
      ruby-align: center !important;
      line-height: normal !important;
    }
    rt.btb-ruby-rt {
      display: ruby-text !important;
      font-size: 0.68em !important;
      line-height: 1.1 !important;
      font-weight: 700 !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      color: #00e5ff !important;
      text-shadow: 0 0 2px rgba(0, 0, 0, 0.9), 0 1px 3px rgba(0, 0, 0, 0.7) !important;
      letter-spacing: 0.02em !important;
      user-select: none !important;
      pointer-events: none !important;
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

    const rendered = result.rendered.trim();
    if (rendered.length === 0 || rendered === state.source) {
      return false;
    }

    const doc = target.ownerDocument;
    const parent = target.parentNode;
    if (parent === null) {
      return false;
    }

    ensureRubyStyle(doc);

    const parentElem = parent as HTMLElement;
    if (
      parentElem.localName === "ruby" &&
      parentElem.classList.contains("btb-ruby-token")
    ) {
      const rt = parentElem.querySelector("rt.btb-ruby-rt");
      if (rt !== null) {
        rt.textContent = rendered;
      }
      state.rendered = state.source;
      state.status = "rendered";
      return true;
    }

    const rubyElement = doc.createElement("ruby");
    rubyElement.className = "btb-ruby-token";
    rubyElement.setAttribute(CONTENT_IGNORE_ATTRIBUTE, "");

    parent.insertBefore(rubyElement, target);
    rubyElement.appendChild(target);

    const rtElement = doc.createElement("rt");
    rtElement.className = "btb-ruby-rt";
    rtElement.setAttribute(CONTENT_IGNORE_ATTRIBUTE, "");
    rtElement.textContent = rendered;
    rubyElement.appendChild(rtElement);

    state.rendered = state.source;
    state.rendererId = "annotation-v1";
    state.status = "rendered";
    state.container = rubyElement;

    return true;
  },
};


