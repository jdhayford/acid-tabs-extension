
export class StorageManager {
    constructor(strategy) {
        const acceptedStrategies = [chrome.storage.sync, chrome.storage.local];
        if (!acceptedStrategies.find(s => s === strategy)) {
            throw Error('StorageManager recieved invalid strategy');
        }

        this.storageArea = strategy;
    }

    getAll = (ptrn) => {
        return new Promise((resolve) => {
            this.storageArea.get(null, (data) => {
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

    removeAll = (pattern) => {
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
export const syncStorage = new StorageManager(chrome.storage.local);
