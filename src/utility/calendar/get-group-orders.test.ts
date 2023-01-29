import { describe, expect, test } from "vitest";
import { getGroupOrders } from "./calendar.js";
import { groups } from "../../__fixtures__/itemsAndGroups.js";

describe("getGroupOrders", () => {
  test("works as expected", () => {
    expect(getGroupOrders(groups)).toMatchSnapshot();
  });
});
