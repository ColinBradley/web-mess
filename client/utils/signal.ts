export default class Signal {

    private readonly callbacks = new Set<() => unknown>();

    public on(callback: () => unknown) {
        this.callbacks.add(callback);
    }

    public off(callback: () => unknown) {
        this.callbacks.delete(callback);
    }

    public raise() {
        if (this.callbacks.size === 0) {
            return;
        }

        for (const callback of [...this.callbacks.values()]) {
            callback();
        }
    }
}