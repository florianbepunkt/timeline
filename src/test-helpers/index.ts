export { RenderWrapper } from "./marker-renderer";
export const noop = () => undefined;
export const sel = (selectorString: string) => `[data-testid="${selectorString}"]`;
export const parsePxToNumbers = (value: string) => +value.replace("px", "");
export { RenderHeadersWrapper } from "./header-renderer";
export {
  getCustomHeadersInTimeline,
  renderSidebarHeaderWithCustomValues,
  renderTimelineWithLeftAndRightSidebar,
} from "./header-renderers";
