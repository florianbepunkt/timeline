import { describe, expect, test } from "vitest";
import { getGroupOrders } from "./calendar";
import { groups } from "../../../__fixtures__/itemsAndGroups";

describe("getGroupOrders", () => {
  test("works as expected", () => {
    expect(getGroupOrders(groups)).toMatchSnapshot();
  });
});
