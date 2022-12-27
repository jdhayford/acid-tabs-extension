
export class StorageManager {
    constructor(strategy) {
        const acceptedStrategies = [chrome.storage.sync, chrome.storage.local];
        if (!acceptedStrategies.find(s => s === strategy)) {
            throw Error('StorageManager recieved invalid strategy');
        }

        this.storageArea = strategy;
    }

    getAll = (pattern) => {
        return new Promise((resolve) => {
            this.storageArea.get(null, (data) => {
                if (!data) {
                    resolve(undefined);
                } else {
                    if (pattern) {
                        resolve(Object.entries(data).filter(([k, v]) => k.match(pattern)));
                    } else {
                        resolve(Object.entries(data));
                    }
                }

            });
        })
    };

    get = (key) => {
        return new Promise((resolve) => {
            this.storageArea.get(key, (data) => {
                if (!data) {
                    resolve(undefined);
                } else {
                    resolve(data[key]);
                }
            });
        })
    };

    set = (key, value) => {
        return new Promise((resolve) => {
            this.storageArea.set({ [key]: value }, (data) => {
                resolve(data);
            });
        });
    };

    remove = (keys) => {
        return new Promise((resolve) => {
            this.storageArea.remove(keys, resolve);
        });
    };

    removePattern = (pattern) => {
        return new Promise((resolve) => {
            this.storageArea.get(null, (data) => {
                const keys = Object.keys(data).filter((x) => x.startsWith(pattern));
                this.storageArea.remove(keys);
                resolve();
            });
        });
    };
}

export const localStorage = new StorageManager(chrome.storage.local);
export const syncStorage = new StorageManager(chrome.storage.sync);
