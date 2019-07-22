import {
    NetworkStatus,
    NetworkStatusChangeCallback,
} from "@aerogear/voyager-client";

export class ToggleNetworkStatus implements NetworkStatus {
    private callback: NetworkStatusChangeCallback = null;
    private online: boolean = true;

    public onStatusChangeListener(callback: NetworkStatusChangeCallback) {
        this.callback = callback;
    }

    public async isOffline() {
        return !this.online;
    }

    public goOnline() {
        this.setOnline(true);
    }

    public goOffline() {
        this.setOnline(false);
    }

    private setOnline(online: boolean) {
        this.online = online;

        if (this.callback !== null) {
            this.callback.onStatusChange({ online });
        }
    }
}
