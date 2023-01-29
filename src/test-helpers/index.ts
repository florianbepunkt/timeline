export { RenderWrapper } from "./marker-renderer.js";
export const noop = () => {};
export const sel = (selectorString: string) => `[data-testid="${selectorString}"]`;
export const parsePxToNumbers = (value: string) => +value.replace("px", "");
export { RenderHeadersWrapper } from "./header-renderer.js";
export {
  getCustomHeadersInTimeline,
  renderSidebarHeaderWithCustomValues,
  renderTimelineWithLeftAndRightSidebar,
} from "./header-renderers.js";
