export const get = (keys) => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(keys, (data) => {
        resolve(data);
        });
    })
};

export const set = (key, value) => {
    return new Promise((resolve) => {
        chrome.storage.sync.set({ [key]: value }, (data) => {
        resolve(data);
        });
    });
};
