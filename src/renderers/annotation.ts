import type { NodeState } from "../content/node-state";
import type { TransliterationResult } from "../engines/contracts";
import type { Renderer } from "./contracts";

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

    // Build fragment of plain text and <ruby> tokens
    const fragment = doc.createDocumentFragment();

    for (const segment of result.segments) {
      const isTransliterated =
        segment.romanized !== null &&
        segment.romanized.trim().length > 0 &&
        segment.romanized !== segment.source;

      if (isTransliterated) {
        const rubyElement = doc.createElement("ruby");
        rubyElement.className = "btb-ruby-token";

        // Base text (e.g., 勉強)
        const baseText = doc.createTextNode(segment.source);
        rubyElement.appendChild(baseText);

        // Annotation text (e.g., benkyou)
        const rtElement = doc.createElement("rt");
        rtElement.className = "btb-ruby-rt";
        rtElement.textContent = segment.romanized;
        rubyElement.appendChild(rtElement);

        fragment.appendChild(rubyElement);
      } else {
        fragment.appendChild(doc.createTextNode(segment.source));
      }
    }

    // Update state rendered tracking string
    state.rendered = result.rendered;
    state.status = "rendered";

    // Insert fragment after target and remove target
    parent.insertBefore(fragment, target);
    parent.removeChild(target);

    return true;
  },
};
