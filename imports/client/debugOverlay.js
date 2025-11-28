export class DebugOverlay {

    constructor({environment = 'prod', onApplyThrottle} = {}) {
        this.environment = environment;
        this.onApplyThrottle = onApplyThrottle;
        this.refreshCallback = null;
        this.visible = false;
        this.lastKnownThrottle = null;
        this.dom = this.getDomHandles();
        this.enabled = this.environment !== 'prod' && this.dom.overlay && this.dom.toggle;
        this.boundKeyHandler = this.handleKeyDown.bind(this);

        if (!this.enabled) {
            this.teardownDom();
            return;
        }

        this.initialize();
    }

    getDomHandles() {
        return {
            overlay: document.getElementById('debug-overlay'),
            toggle: document.getElementById('debug-toggle'),
            close: document.getElementById('debug-close'),
            fps: document.getElementById('debug-fps'),
            updateId: document.getElementById('debug-update-id'),
            snapshotSize: document.getElementById('debug-snapshot-size'),
            snapshotAvg: document.getElementById('debug-snapshot-avg'),
            throttleEnabled: document.getElementById('debug-throttle-enabled'),
            throttleInterval: document.getElementById('debug-throttle-interval'),
            apply: document.getElementById('debug-apply-throttle'),
            refresh: document.getElementById('debug-refresh-throttle'),
            status: document.getElementById('debug-throttle-status')
        };
    }

    teardownDom() {
        if (this.dom.toggle) {
            this.dom.toggle.remove();
        }
        if (this.dom.overlay) {
            this.dom.overlay.remove();
        }
    }

    initialize() {
        this.dom.toggle.classList.remove('hidden');
        this.dom.toggle.addEventListener('click', () => this.toggleVisibility());
        this.dom.close.addEventListener('click', () => this.hide());
        this.dom.apply.addEventListener('click', () => this.requestApply());
        this.dom.refresh.addEventListener('click', () => this.requestRefresh());
        document.addEventListener('keydown', this.boundKeyHandler);
        this.hide(); // ensure consistent initial state
    }

    destroy() {
        document.removeEventListener('keydown', this.boundKeyHandler);
    }

    isAvailable() {
        return this.enabled;
    }

    setRefreshCallback(callback) {
        this.refreshCallback = callback;
    }

    toggleVisibility() {
        if (this.visible) {
            this.hide();
        } else {
            this.show();
        }
    }

    show() {
        if (!this.enabled) {
            return;
        }
        this.visible = true;
        this.dom.overlay.classList.remove('hidden');
        this.dom.toggle.setAttribute('aria-expanded', 'true');
        this.requestRefresh();
    }

    hide() {
        if (!this.enabled) {
            return;
        }
        this.visible = false;
        this.dom.overlay.classList.add('hidden');
        this.dom.toggle.setAttribute('aria-expanded', 'false');
    }

    handleKeyDown(event) {
        if (event.key === 'F2') {
            event.preventDefault();
            this.toggleVisibility();
        }
    }

    requestRefresh() {
        if (typeof this.refreshCallback === 'function') {
            this.setStatus('Syncing throttle state…', 'info');
            this.refreshCallback();
        }
    }

    requestApply() {
        if (typeof this.onApplyThrottle !== 'function') {
            return;
        }

        const payload = {
            enabled: Boolean(this.dom.throttleEnabled.checked),
            intervalMs: this.parseInterval(this.dom.throttleInterval.value)
        };

        this.setStatus('Applying throttle settings…', 'info');
        this.onApplyThrottle(payload);
    }

    parseInterval(value) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) {
            return null;
        }
        return parsed;
    }

    setThrottleState(state) {
        if (!state) {
            return;
        }
        this.lastKnownThrottle = state;

        if (typeof state.enabled === 'boolean') {
            this.dom.throttleEnabled.checked = state.enabled;
        }
        if (typeof state.intervalMs === 'number') {
            this.dom.throttleInterval.value = Math.round(state.intervalMs);
        }

        const lines = [];
        if (typeof state.effectiveIntervalMs === 'number') {
            lines.push(`Effective: ${Math.round(state.effectiveIntervalMs)} ms`);
        }
        if (typeof state.defaultIntervalMs === 'number') {
            lines.push(`Default: ${Math.round(state.defaultIntervalMs)} ms`);
        }
        this.setStatus(lines.join(' • ') || 'Throttle idle', 'success');
    }

    updateStats({fps, updateId, snapshotBytes, snapshotAvgBytes} = {}) {
        if (typeof fps === 'number' && this.dom.fps) {
            this.dom.fps.textContent = fps.toFixed(0);
        }
        if ((typeof updateId === 'number' || typeof updateId === 'string') && this.dom.updateId) {
            this.dom.updateId.textContent = updateId;
        }
        if (typeof snapshotBytes === 'number' && this.dom.snapshotSize) {
            this.dom.snapshotSize.textContent = `${this.formatBytes(snapshotBytes)}`;
        }
        if (typeof snapshotAvgBytes === 'number' && this.dom.snapshotAvg) {
            this.dom.snapshotAvg.textContent = `${this.formatBytes(snapshotAvgBytes)}`;
        }
    }

    setStatus(message, variant = 'info') {
        if (!this.dom.status) {
            return;
        }
        this.dom.status.textContent = message || '';
        this.dom.status.classList.remove('error', 'success');
        if (variant === 'error') {
            this.dom.status.classList.add('error');
        } else if (variant === 'success') {
            this.dom.status.classList.add('success');
        }
    }

    formatBytes(value) {
        if (!Number.isFinite(value) || value <= 0) {
            return '0 B';
        }
        if (value < 1024) {
            return `${value.toFixed(0)} B`;
        }
        if (value < 1024 * 1024) {
            return `${(value / 1024).toFixed(1)} KB`;
        }
        return `${(value / (1024 * 1024)).toFixed(1)} MB`;
    }
}

