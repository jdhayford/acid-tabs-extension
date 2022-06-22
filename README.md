# Acid Tabs

Store Link - https://chrome.google.com/webstore/detail/acid-tabs/hgceopemmcmigbmhphbcgkeffommpjfc

## Feature Requests

If you have any feature requests for the Acid Tabs chrome extension, please submit an Issue describing the feature and use case. Please do this before you consider opening up a pull request for any changes that would largely impact the UX as I'd prefer to discuss that on an issue first.

## General Organization

Popup - https://github.com/jdhayford/acid-extension/tree/master/src/pages/Popup

Contains React interface logic to allow users to create and modify rules. These rules are persisted in chrome's sync storage.

Background - https://github.com/jdhayford/acid-extension/tree/master/src/pages/Background

In charge of orchestrating actual tab groups, including grouping/ungrouping tags, updating order, colors and names of groups.

## Local Dev

To run and use the extension locally:

```
npm install
npm start
```

This should start a webpackdev server and creates a local `build/` folder with the proper source files. You can then select this folder from the "Manage Extensions" page on chrome, activate the developer settings and "Load Unpacked Extension".

### Credits

Shoutout to @lxieyang for creating one of my favorite chrome extension boilerplates out there https://github.com/lxieyang/chrome-extension-boilerplate-react



