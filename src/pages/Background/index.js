import debounce from 'lodash.debounce';

let collapsed = false;

const getAll = (ptrn) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(null, (data) => {
            if (!data) {
                resolve(undefined);
            } else {
                if (ptrn) {
                    resolve(Object.entries(data).filter(([k, v]) => k.match(ptrn)));
                } else {
                    resolve(Object.entries(data));
                }
            }
        
        });
    })
};

const get = (key) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(key, (data) => {
            if (!data) {
                resolve(undefined);
            } else {
                resolve(data[key]);
            }
        
        });
    })
};

const set = (key, value) => {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [key]: value }, (data) => {
            resolve(data);
        });
    });
};

const tabColors = [ 'grey', 'yellow', 'blue', 'purple', 'green', 'red', 'pink', 'cyan', 'orange' ];

function matchRuleShort(rule) {
    var escapeRegex = (str) => str.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
    return new RegExp(rule.split("*").map(escapeRegex).join(".*"));
}

const getRules = async () => {
    const groupRules = await get('groupRules');
    return groupRules ? groupRules.sort((a, b) => a.key - b.key) : [];
}

const getCurrentWindow = async () => {
    const window = await chrome.windows.getCurrent();
    return window;
}


const getRuleForTabGroup = async (tabGroupId) => {
    const windowGroupEntries = await getAll(`window:.*:rule:.*:groupId`);    
    const match = windowGroupEntries.find(([k,v]) => v === tabGroupId);
    if (match) {
        const [k, v] = match;
        const ruleId = k.replace(new RegExp('window:.*:rule:'), '').replace(':groupId', '')
        const groupRules = await get('groupRules');
        return groupRules.find(r => r.id.toString() === ruleId);
    }
    return null;
};

const getAcidTabGroups = async (windowId = null) => {
    const pattern = windowId ? `window:${windowId}:rule:.*:groupId` : `window:.*:rule:.*:groupId`
    const windowGroupEntries = await getAll(pattern);
    return windowGroupEntries.map(([k,v]) => v) || [];
};

const getTabGroup = async (id) => {
    const tabGroups = await new Promise(resolve => chrome.tabGroups.query({}, resolve))
    return tabGroups.find(t => t.id === id)
};

const updateTabGroups = async (args = {}) => {
    if (chrome.tabGroups) {
        if (args.collapsed !== undefined) {
            collapsed = args.collapsed;
        }
        const tabGroups = await getAcidTabGroups();
        for (const tabGroupId of tabGroups) {
            try {
                const group = await getTabGroup(tabGroupId)
                if (!group) {
                    console.log('no group');
                    continue
                }
                chrome.tabGroups.update(tabGroupId, args);
                const rule = await getRuleForTabGroup(tabGroupId);
                if (rule) updateTabGroupForRule(group.windowId, group.id, rule);
            } catch (e) {
                console.error(e.stack)
            }
        }
    }
};

const kickoutNonMatchingTabs = async () => {
    const window = await getCurrentWindow();
    const tabGroups = await getAcidTabGroups();
    const rules = await getRules();
    const allTabs = await chrome.tabs.query({ windowId: window.id });
    for (const tabGroupId of tabGroups) {
        const tabsInGroup = allTabs.filter(t => t.groupId === tabGroupId)
        for (const tab of tabsInGroup) {
            const rule = checkForRuleMatch(tab.url, rules) || null;
            if (!rule) await chrome.tabs.ungroup(tab.id)
        }
    }
};


const getColorForRule = (rule, rules) => {
    if (rule.color) return rule.color;
    const index = rules.findIndex(r => r.id === rule.id);
    const color = tabColors[index % tabColors.length];
    return color;
}

const getGroupIdForRule = async (windowId, rule) => {
    const key = `window:${windowId}:rule:${rule.id}:groupId`;
    const ruleId = await get(key);
    return ruleId;
}

const setGroupIdForRule = async (rule, windowId, groupId) => {
    const key = `window:${windowId}:rule:${rule.id}:groupId`;
    await set(key, groupId);
}

const getActiveGroupIds = async (windowId) => {
    const rules = await getRules();
    const groupIds = await Promise.all(rules.map(r => getGroupIdForRule(windowId, r)));
    return groupIds.filter(gId => !!gId) || [];
}

const assignAllTabsInWindow = async () => {
    const tabs = await chrome.tabs.query({ status: 'complete' });
    const window = await getCurrentWindow()
    for (const tab of tabs) {
        await handleTab(tab.id)
    }
    alignTabs(window.id)
}

const checkForRuleMatch = (url, rules) => {
    for (const rule of rules) {
        const lineSplit = rule.pattern.split('\n');
        const patterns = lineSplit
            .reduce((prev, cur) => prev.concat(cur.split(' ')), [])
            .filter(p => p.length)
            .map(p => matchRuleShort(p.trim()));
        for (const pattern of patterns) {
            if (url.match(pattern)) return rule;
        }
    }
   return null;
}

const clearOldWindowEntries = async () => {
    const allWindowEntries = await getAll('window:.*:tabGroups');
    const windows = await chrome.windows.getAll();
    const oldWindowEntries = allWindowEntries.filter(([k, v]) => !windows.some(w => k.includes(`window:${w.id}:tabGroups`)))

    const oldKeys = oldWindowEntries.map(([k, _]) => k);
    await chrome.storage.sync.remove(oldKeys)
}

const clearOldEntries = async () => {
    const allRuleGroupEntries = await getAll('window:.*:rule:.*:groupId');
    const rules = await getRules();
    const oldRuleGroupEntries = allRuleGroupEntries.filter(([k, v]) => !rules.some(r => k.includes(`rule:${r.id}:groupId`)))

    for (const [k, groupId] of oldRuleGroupEntries) {
        const tabs = await new Promise(resolve => chrome.tabs.query({}, resolve));
        const tabsStillInGroup = tabs.filter(t => t.groupId === groupId)
        for (const tab of tabsStillInGroup) {
            await new Promise(resolve => chrome.tabs.ungroup(tab.id, resolve));
        }
    }
    const oldKeys = oldRuleGroupEntries.map(([k, _]) => k);
    await chrome.storage.sync.remove(oldKeys)
}

const updateTabGroupForRule = async (windowId, groupId, rule) => {
    if (chrome.tabGroups) {
        const rules = await getRules();
        const color = getColorForRule(rule, rules);
        const group = await getTabGroup(groupId);
        if (!group) return;

        const tabs = await new Promise(resolve => chrome.tabs.query({ windowId }, resolve));
        const tabsInGroup = tabs.filter(t => t.groupId === groupId);
        const title =  group.collapsed && tabsInGroup.length ? `${rule.name} (${tabsInGroup.length})` : rule.name;
        chrome.tabGroups.update(groupId, { title, color })
    }
}

const getOrCreateTabGroup = async (windowId, tabId, existingGroupId) => {
    const createProperties = existingGroupId ? undefined : { windowId };
    let groupId;
    try {
        groupId = await chrome.tabs.group({ tabIds: tabId, groupId: existingGroupId, createProperties })
    } catch (e) {
        const createProperties = { windowId };
        groupId = await chrome.tabs.group({ tabIds: tabId, createProperties })
    }
    return groupId;
}

const alignTabs = async (windowId) => {
    if (chrome.tabGroups) {
        const rules = await getRules();
        const orderedRules = rules.sort((a, b) => a.key - b.key);
        const currentTabGroups = await new Promise(resolve => chrome.tabGroups.query({ windowId }, resolve))
        const tabs = await new Promise(resolve => chrome.tabs.query({ windowId }, resolve))
        let offset = 0;
        for (const r of orderedRules) {
            const groupId = await getGroupIdForRule(windowId, r);
            const tabsInGroup = tabs.filter(t => t.groupId === groupId);
            if (currentTabGroups.some(g => g.id === groupId)) {
                chrome.tabGroups.move(groupId, { index: offset }, () => {
                    if (chrome.runtime.lastError) {
                        console.log(chrome.runtime.lastError.message);
                    }
                })
                // await new Promise(resolve => chrome.tabGroups.move(groupId, { index: 0 }, resolve))
                offset = offset + tabsInGroup.length;
            }
        }
    }
}

const handleTab = async (tabId) => {
    try {
        const tab = await chrome.tabs.get(tabId);
        const windowId = tab.windowId;
        const rules = await getRules();
        const rule = checkForRuleMatch(tab.url, rules) || null;
        if (rule) {
            const existingGroupId = await getGroupIdForRule(windowId, rule);
            const groupId = await getOrCreateTabGroup(windowId, tabId, existingGroupId);
            updateTabGroupForRule(windowId, groupId, rule)
            if (existingGroupId !== groupId) {
                await setGroupIdForRule(rule, windowId, groupId)
            }
        } else {
            const tabGroups = await getAcidTabGroups();
            const inAcidTabGroup = tabGroups.includes(tab.groupId);
            if (inAcidTabGroup) await chrome.tabs.ungroup(tab.id);
        }
    } catch (e) {
        console.error(e.stack)
    }
}

chrome.webNavigation.onCommitted.addListener(async ({ tabId, url }) => {
    handleTab(tabId)
})

chrome.tabs.onActivated.addListener(async ({ tabId, windowId }) => {
    handleTab(tabId)
})

// Scan all existing tabs and assign them
try {
    assignAllTabsInWindow();
    kickoutNonMatchingTabs();
} catch (e) {
    console.error(e.stack);
}

chrome.action.onClicked.addListener(tab => {
    assignAllTabsInWindow();
    kickoutNonMatchingTabs();
});

chrome.commands.onCommand.addListener(command => {
    if (command === 'toggle-collapse') {
        updateTabGroups({ collapsed: !collapsed });
    }
});

chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    try {
        if (request.updated) {
            await kickoutNonMatchingTabs();
            await clearOldEntries();
            await clearOldWindowEntries();
            assignAllTabsInWindow();
        } else if (request.collapse) {
            updateTabGroups({ collapsed: true })
        } else if (request.expand) {
            updateTabGroups({ collapsed: false })
        }
    } catch (e) {
        console.error(e.stack);
    }
});

const handleTabGroupUpdate = async (tabGroup) => {
    alignTabs(tabGroup.windowId)
    const rules = await getRules();
    for (const r of rules) {
        const gId = await getGroupIdForRule(tabGroup.windowId, r);
        if (gId === tabGroup.id) {
            updateTabGroupForRule(tabGroup.windowId, tabGroup.id, r)
            return
        }
    }
};

if (chrome.tabGroups) {
    chrome.tabGroups.onUpdated.addListener(debounce(handleTabGroupUpdate, 100, { leading: true, trailing: false }));
}