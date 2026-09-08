import { CONTENT_IGNORE_ATTRIBUTE } from "../shared/config";

const IMAGE_OVERLAY_CLASS = "btb-image-overlay-banner";
const IMAGE_OVERLAY_STYLE_ID = "btb-image-overlay-style";

function ensureImageOverlayStyle(doc: Document): void {
  if (doc.getElementById(IMAGE_OVERLAY_STYLE_ID) !== null) {
    return;
  }
  const style = doc.createElement("style");
  style.id = IMAGE_OVERLAY_STYLE_ID;
  style.textContent = `
    div.${IMAGE_OVERLAY_CLASS} {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      box-sizing: border-box !important;
      margin: 4px 0 !important;
      padding: 6px 12px !important;
      border: 1px solid #00e5ff !important;
      border-radius: 6px !important;
      background: rgba(16, 24, 40, 0.88) !important;
      color: #ffffff !important;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
      font-size: 13px !important;
      line-height: 1.4 !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25) !important;
      backdrop-filter: blur(4px) !important;
    }
    div.${IMAGE_OVERLAY_CLASS} span.btb-img-orig {
      font-size: 12px !important;
      color: #94a3b8 !important;
    }
    div.${IMAGE_OVERLAY_CLASS} span.btb-img-rt {
      font-size: 13px !important;
      font-weight: 700 !important;
      color: #00e5ff !important;
      letter-spacing: 0.02em !important;
    }
  `;
  doc.head.appendChild(style);
}

export interface ImageOverlayState {
  element: HTMLImageElement;
  originalAlt: string | null;
  originalTitle: string | null;
  overlayElement?: HTMLElement;
}

export function applyImageTransliteration(
  img: HTMLImageElement,
  sourceText: string,
  renderedText: string,
  mode: "annotation" | "replace",
): ImageOverlayState {
  const doc = img.ownerDocument;
  ensureImageOverlayStyle(doc);

  const state: ImageOverlayState = {
    element: img,
    originalAlt: img.getAttribute("alt"),
    originalTitle: img.getAttribute("title"),
  };

  if (mode === "replace") {
    img.setAttribute("alt", renderedText);
    img.setAttribute("title", renderedText);
  }

  // Create overlay banner positioned after image element
  const overlay = doc.createElement("div");
  overlay.className = IMAGE_OVERLAY_CLASS;
  overlay.setAttribute(CONTENT_IGNORE_ATTRIBUTE, "");

  if (mode === "annotation") {
    const origSpan = doc.createElement("span");
    origSpan.className = "btb-img-orig";
    origSpan.textContent = `Original: ${sourceText}`;
    overlay.appendChild(origSpan);
  }

  const rtSpan = doc.createElement("span");
  rtSpan.className = "btb-img-rt";
  rtSpan.textContent = `Transliteration: ${renderedText}`;
  overlay.appendChild(rtSpan);

  const parent = img.parentNode;
  if (parent !== null) {
    if (img.nextSibling !== null) {
      parent.insertBefore(overlay, img.nextSibling);
    } else {
      parent.appendChild(overlay);
    }
    state.overlayElement = overlay;
  }

  return state;
}

export function restoreImageElement(state: ImageOverlayState): void {
  if (state.originalAlt !== null) {
    state.element.setAttribute("alt", state.originalAlt);
  } else {
    state.element.removeAttribute("alt");
  }

  if (state.originalTitle !== null) {
    state.element.setAttribute("title", state.originalTitle);
  } else {
    state.element.removeAttribute("title");
  }

  state.overlayElement?.remove();
}
