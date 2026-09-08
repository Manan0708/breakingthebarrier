import type { NodeState } from "../content/node-state";
import type { TransliterationResult } from "../engines/contracts";
import type { Renderer } from "./contracts";

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

    const dualText = `${state.source} (${rendered})`;
    state.rendered = dualText;
    state.rendererId = "annotation-v1";
    state.status = "rendered";
    target.data = dualText;

    return true;
  },
};



