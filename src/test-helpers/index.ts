export { RenderWrapper } from "./marker-renderer";
export { expectDateDriver } from "./expect-date-driver";
export const noop = () => {};
export const sel = (selectorString: string) => `[data-testid="${selectorString}"]`;
export const parsePxToNumbers = (value: string) => +value.replace("px", "");
export { RenderHeadersWrapper } from "./header-renderer";
export {
  getCustomHeadersInTimeline,
  renderSidebarHeaderWithCustomValues,
  renderTimelineWithLeftAndRightSidebar,
} from "./header-renderers";
