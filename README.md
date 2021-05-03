# Acid Tabs

Store Link - https://chrome.google.com/webstore/detail/acid-tabs/hgceopemmcmigbmhphbcgkeffommpjfc

## General Organization

Popup - https://github.com/jdhayford/acid-extension/tree/master/src/pages/Popup

Contains React interface logic to allow users to create and modify rules. These rules are persisted in chrome's sync storage.

Background - https://github.com/jdhayford/acid-extension/tree/master/src/pages/Background

In charge of orchestrating actual tab groups, including grouping/ungrouping tags, updating order, colors and names of groups.

## Local Dev

To run locally:

```
npm install
npm start
```

This should start a webpackdev server and creates a local build folder with the proper source files. You can then select this folder from the "Manage Extensions" page on chrome, activate the developer settings and "Load Unpacked Extension".

### Credits

Shoutout to @lxieyang for creating one of my favorite chrome extension boilerplates. https://github.com/lxieyang/chrome-extension-boilerplate-react



