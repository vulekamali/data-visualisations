Reusable data visualisation library for vulekamali.gov.za
=========================================================

General code style to aim for is [chainable functions operating on a selection of elements.](https://bost.ocks.org/mike/chart/)

We use [Storybook for HTML](https://storybook.js.org/docs/guides/guide-html/) to easily present several different configurations of a chart and verify that they work as intended in all supported browsers.

The production storybook version can be seen at https://vulekamali-viz.netlify.com/

See the checks section in pull requests for links to Deploy Previews which show storybook builds for that branch. This is what we use to verify things still work before approving pull requests.

Required browser support:

```
    "last 12 chrome versions",
    "last 12 firefox versions",
    "last 6 safari versions",
    "explorer >= 11",
    "edge > 0"
```

Keep `yarn.lock` updated in version control to ensure we're testing and dev-ing on the same dependency versions.

Installing dependencies:

```
yarn
```

Running storybook locally for development:

```
yarn storybook
```

Producing a static build, e.g. what's used for netlify deploy previews:

```
yarn build-storybook
```