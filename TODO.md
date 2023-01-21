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
  -- timeline... end boss style []
  -- headers/\*.tsx [x]
- integrate PR https://github.com/namespace-ee/react-calendar-timeline/pull/893 [x]
- add CI pipeline [x]
- use esm []
  -- move to storybook 7 []
  -- move to lodash-es []
- get rid of date driver and commit to date-fns []
- merge timeline contexts []
- resolve types.ts as much as possible []
- dissolve \_\_fixtures\_\_ folder []
- add a linter []
- eliminate dead code []

## Integrated / solved PRs

- https://github.com/namespace-ee/react-calendar-timeline/pull/893
- https://github.com/namespace-ee/react-calendar-timeline/pull/819

## PR candidates

- https://github.com/namespace-ee/react-calendar-timeline/pull/889/files []
- https://github.com/namespace-ee/react-calendar-timeline/pull/875 []

## Bugs

Header shows wrong format for large periods

## Questions

Markers: Public / Implementations... please explain structure and intent?
Test (why the tests for statefull / stateless components?)
Tests (do unexported utilites in utility folder need testing at all?)
Are these Component.secretKey stuff needed anymore?

## Improvements

- lightweight styling / theming solution? []
- add tests for columns []
