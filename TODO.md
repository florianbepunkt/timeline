# TODO

- dissolve \_\_fixtures\_\_ folder []
- refactor timeline as functional ... end boss style []
- remove all the todos []
- add a linter []
- add living documentation in form of typescript docs and stories []

## Integrated / solved PRs

- https://github.com/namespace-ee/react-calendar-timeline/pull/893
- https://github.com/namespace-ee/react-calendar-timeline/pull/819

## PR candidates

- https://github.com/namespace-ee/react-calendar-timeline/pull/889/files []
- https://github.com/namespace-ee/react-calendar-timeline/pull/875 []

## Bugs

Header shows wrong format for large periods [x]

## Questions

Markers: Public / Implementations... please explain structure and intent?
Test (why the tests for statefull / stateless components?)
Tests (do unexported utilites in utility folder need testing at all?)
Are these Component.secretKey stuff needed anymore?

## Improvements

- lightweight styling / theming solution? []
- add tests for columns []

## DONE

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
  -- marker context, canvas etc [x]
  -- headers/\*.tsx [x]
- integrate PR https://github.com/namespace-ee/react-calendar-timeline/pull/893 [x]
- add CI pipeline [x]
- use esm [x]
  -- move to storybook 7 [x]
  -- move to lodash-es [x]
- merge timeline contexts [x]
- get rid of date driver and commit to date-fns [x]
- date localization context [x]
- resolve types.ts as much as possible [x]
- TodayMarker should be renamed to NowMarker [x]
- eliminate dead code [x]
