# TODO

- add tests [x]
  -- row [x]
  -- headers [x]
  -- markers [x]
  -- scrollelement []
  --- very difficult...needs help
  -- sidebar [x]
  -- timeline [x]
  -- interaction [x]
- refactor context [x]
  -- timeline.tsx [x]
  -- Items.tsx [x]
  -- remove prop types package [x]
- update dependencies (interactjs, classnames) [x]
- refactor components to use functional approach []
  -- items/\*.tsx [x]
  -- columns/\*.tsx [x]
  -- interaction/PreventClickOnDrag.tsx [x]
  -- sidebar/sidebar.tsx [x]
  -- scroll/ScrollElement [] >> naah, we need to fix the test first
  -- marker context, canvas etc []
  -- headers/\*.tsx []
- use esm []
  -- move to storybook 7 []
  -- move to lodash-es []
- get rid of date driver and commit to date-fns []
- merge timeline contexts []
- resolve types.ts as much as possible []
- add a linter []
- eliminate dead code []

## Bugs

Header shows wrong format for large periods

## Questions

Markers: Public / Implementations... please explain structure and intent?
Test (why the tests for statefull / stateless components?)
Tests (do unexported utilites in utility folder need testing at all?)

## Improvements

- lightweight styling / theming solution? []
- add tests for columns []
