export class DebugOverlay {

    constructor({environment = 'prod', onApplyThrottle, onZoomChange, initialZoom = 1, zoomBounds, onZoomDelta, onApplyShipAttributes, onToggleBoundingBoxes, initialBoundingBoxesVisible = false} = {}) {
        this.environment = environment;
        this.onApplyThrottle = onApplyThrottle;
        this.onZoomChange = onZoomChange;
        this.onZoomDelta = onZoomDelta;
        this.onApplyShipAttributes = onApplyShipAttributes;
        this.onToggleBoundingBoxes = onToggleBoundingBoxes;
        this.zoomBounds = Object.assign({min: 0.5, max: 2.5}, zoomBounds);
        this.zoomValue = Number.isFinite(initialZoom) ? initialZoom : 1;
        this.boundingBoxesVisible = Boolean(initialBoundingBoxesVisible);
        this.refreshCallback = null;
        this.visible = false;
        this.lastKnownThrottle = null;
        this.lastShipAttributes = null;
        this.dom = this.getDomHandles();
        this.enabled = this.environment !== 'prod' && this.dom.overlay;
        this.boundKeyHandler = this.handleKeyDown.bind(this);
        this.boundWheelHandler = this.handleWheel.bind(this);

        if (!this.enabled) {
            this.teardownDom();
            return;
        }

        this.initialize();
    }

    getDomHandles() {
        return {
            overlay: document.getElementById('debug-overlay'),
            close: document.getElementById('debug-close'),
            tabs: document.querySelectorAll('[data-debug-tab]'),
            panelSystem: document.getElementById('debug-panel-system'),
            panelShip: document.getElementById('debug-panel-ship'),
            fps: document.getElementById('debug-fps'),
            updateId: document.getElementById('debug-update-id'),
            snapshotSize: document.getElementById('debug-snapshot-size'),
            snapshotAvg: document.getElementById('debug-snapshot-avg'),
            throttleEnabled: document.getElementById('debug-throttle-enabled'),
            throttleInterval: document.getElementById('debug-throttle-interval'),
            apply: document.getElementById('debug-apply-throttle'),
            refresh: document.getElementById('debug-refresh-throttle'),
            status: document.getElementById('debug-throttle-status'),
            zoomSlider: document.getElementById('debug-zoom'),
            zoomValue: document.getElementById('debug-zoom-value'),
            zoomReset: document.getElementById('debug-zoom-reset'),
            boundingBoxesToggle: document.getElementById('debug-show-bounding-boxes'),
            shipForm: document.getElementById('debug-ship-form'),
            shipReset: document.getElementById('debug-ship-reset'),
            shipStatus: document.getElementById('debug-ship-status'),
            shipInputs: {
                mass: document.getElementById('debug-ship-mass'),
                maxCapacitor: document.getElementById('debug-ship-max-capacitor'),
                reactor: document.getElementById('debug-ship-reactor'),
                thrusterEnergy: document.getElementById('debug-ship-thruster-energy'),
                thrusterForce: document.getElementById('debug-ship-thruster-force'),
                rotationEnergy: document.getElementById('debug-ship-rotation-energy'),
                laserCost: document.getElementById('debug-ship-laser-cost'),
                laserFuel: document.getElementById('debug-ship-laser-fuel'),
                laserConsumption: document.getElementById('debug-ship-laser-consumption'),
                shieldMax: document.getElementById('debug-ship-shield-max'),
                shieldRecharge: document.getElementById('debug-ship-shield-recharge'),
                shieldDecay: document.getElementById('debug-ship-shield-decay')
            }
        };
    }

    teardownDom() {
        if (this.dom.overlay) {
            this.dom.overlay.remove();
        }
    }

    initialize() {
        this.dom.close.addEventListener('click', () => this.hide());
        this.dom.apply.addEventListener('click', () => this.requestApply());
        this.dom.refresh.addEventListener('click', () => this.requestRefresh());
        document.addEventListener('keydown', this.boundKeyHandler);
        window.addEventListener('wheel', this.boundWheelHandler, {passive: false});
        this.initializeZoomControls();
        this.initializeBoundingBoxControl();
        this.initializeTabs();
        this.initializeShipControls();
        this.hide(); // ensure consistent initial state
    }

    destroy() {
        document.removeEventListener('keydown', this.boundKeyHandler);
        window.removeEventListener('wheel', this.boundWheelHandler, {passive: false});
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
        this.requestRefresh();
    }

    hide() {
        if (!this.enabled) {
            return;
        }
        this.visible = false;
        this.dom.overlay.classList.add('hidden');
    }

    handleKeyDown(event) {
        if (event.key === 'F2') {
            event.preventDefault();
            this.toggleVisibility();
            return;
        }
        if (!this.enabled) {
            return;
        }
        if (event.key === '+' || event.key === '=' || event.key === '-') {
            event.preventDefault();
            const delta = (event.key === '-' ? -1 : 1) * 0.15;
            this.applyZoomDelta(delta);
        }
    }

    handleWheel(event) {
        if (!this.enabled) {
            return;
        }
        if (!event.ctrlKey) {
            return;
        }
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.05 : 0.05;
        this.applyZoomDelta(delta);
    }

    applyZoomDelta(delta) {
        if (typeof this.onZoomDelta === 'function') {
            this.onZoomDelta(delta);
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

    initializeZoomControls() {
        if (!this.dom.zoomSlider) {
            return;
        }

        const minZoom = Number(this.zoomBounds.min) || 0.5;
        const maxZoom = Number(this.zoomBounds.max) || 2.5;
        this.dom.zoomSlider.min = minZoom;
        this.dom.zoomSlider.max = maxZoom;
        if (!this.dom.zoomSlider.step) {
            this.dom.zoomSlider.step = 0.05;
        }
        this.dom.zoomSlider.value = this.clampZoom(this.zoomValue);
        this.setZoomDisplay(this.zoomValue);

        this.dom.zoomSlider.addEventListener('input', (event) => {
            const parsed = Number(event.target.value);
            if (!Number.isFinite(parsed)) {
                return;
            }
            const clamped = this.clampZoom(parsed);
            event.target.value = clamped;
            this.setZoomDisplay(clamped);
            if (typeof this.onZoomChange === 'function') {
                this.onZoomChange(clamped);
            }
        });

        if (this.dom.zoomReset) {
            this.dom.zoomReset.addEventListener('click', () => {
                const defaultZoom = 1;
                this.dom.zoomSlider.value = this.clampZoom(defaultZoom);
                this.setZoomDisplay(defaultZoom);
                if (typeof this.onZoomChange === 'function') {
                    this.onZoomChange(defaultZoom);
                }
            });
        }
    }

    initializeBoundingBoxControl() {
        const toggle = this.dom.boundingBoxesToggle;
        if (!toggle) {
            return;
        }
        toggle.checked = this.boundingBoxesVisible;
        toggle.addEventListener('change', (event) => {
            const checked = Boolean(event.target.checked);
            this.boundingBoxesVisible = checked;
            if (typeof this.onToggleBoundingBoxes === 'function') {
                this.onToggleBoundingBoxes(checked);
            }
        });
    }

    clampZoom(value) {
        if (!Number.isFinite(value)) {
            return this.zoomValue;
        }
        const minZoom = Number(this.zoomBounds.min) || 0.5;
        const maxZoom = Number(this.zoomBounds.max) || 2.5;
        const clamped = Math.min(maxZoom, Math.max(minZoom, value));
        this.zoomValue = clamped;
        return clamped;
    }

    setZoomDisplay(value) {
        if (this.dom.zoomValue) {
            this.dom.zoomValue.textContent = `${value.toFixed(2)}x`;
        }
    }

    initializeTabs() {
        if (!this.dom.tabs || this.dom.tabs.length === 0) {
            return;
        }
        this.dom.tabs.forEach((button) => {
            button.addEventListener('click', () => {
                const tab = button.dataset.debugTab;
                this.activateTab(tab);
            });
        });
        this.activateTab('system');
    }

    activateTab(tabId) {
        const panels = {
            system: this.dom.panelSystem,
            ship: this.dom.panelShip
        };
        if (!panels.system || !panels.ship) {
            return;
        }
        this.dom.tabs.forEach((button) => {
            const isActive = button.dataset.debugTab === tabId;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });
        Object.entries(panels).forEach(([id, panel]) => {
            const isActive = id === tabId;
            panel.classList.toggle('is-active', isActive);
            if (isActive) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', 'hidden');
            }
        });
    }

    initializeShipControls() {
        if (!this.dom.shipForm) {
            return;
        }
        this.disableShipForm(true);
        this.dom.shipForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const payload = this.collectShipFormValues();
            if (!payload) {
                this.setShipStatus('Enter valid numeric values for all fields.', 'error');
                return;
            }
            if (typeof this.onApplyShipAttributes === 'function') {
                this.onApplyShipAttributes(payload);
            }
        });
        if (this.dom.shipReset) {
            this.dom.shipReset.addEventListener('click', () => {
                if (this.lastShipAttributes) {
                    this.populateShipForm(this.lastShipAttributes);
                    this.setShipStatus('Reset to last known ship values.', 'info');
                } else {
                    this.setShipStatus('No ship values available to reset.', 'error');
                }
            });
        }
    }

    collectShipFormValues() {
        if (!this.dom.shipInputs) {
            return null;
        }
        const readNumber = (input) => {
            if (!input) {
                return null;
            }
            const parsed = Number(input.value);
            if (!Number.isFinite(parsed)) {
                return null;
            }
            return parsed;
        };
        const payload = {
            mass: readNumber(this.dom.shipInputs.mass),
            maxCapacitor: readNumber(this.dom.shipInputs.maxCapacitor),
            reactorOutputPerSecond: readNumber(this.dom.shipInputs.reactor),
            thrusterEnergyPerSecond: readNumber(this.dom.shipInputs.thrusterEnergy),
            thrusterForceProduced: readNumber(this.dom.shipInputs.thrusterForce),
            rotationEnergyPerSecond: readNumber(this.dom.shipInputs.rotationEnergy),
            laserEnergyCost: readNumber(this.dom.shipInputs.laserCost),
            laserFuelCapacity: readNumber(this.dom.shipInputs.laserFuel),
            laserFuelConsumptionRate: readNumber(this.dom.shipInputs.laserConsumption),
            maxShieldStrength: readNumber(this.dom.shipInputs.shieldMax),
            shieldRechargeRate: readNumber(this.dom.shipInputs.shieldRecharge),
            shieldDecayRate: readNumber(this.dom.shipInputs.shieldDecay)
        };
        const hasInvalid = Object.values(payload).some((value) => value === null || value < 0);
        if (hasInvalid) {
            return null;
        }
        return payload;
    }

    updateShipAttributes(ship) {
        if (!this.dom.shipForm) {
            return;
        }
        if (!ship) {
            this.lastShipAttributes = null;
            this.disableShipForm(true);
            this.clearShipForm();
            this.setShipStatus('No active ship detected.', 'error');
            return;
        }
        const snapshot = this.extractShipAttributes(ship);
        this.lastShipAttributes = snapshot;
        this.populateShipForm(snapshot);
        this.disableShipForm(false);
        this.setShipStatus('Live ship values loaded.', 'success');
    }

    extractShipAttributes(ship) {
        return {
            mass: Number(ship.mass) || 0,
            maxCapacitor: Number(ship.maxCapacitor) || 0,
            reactorOutputPerSecond: Number(ship.reactorOutputPerSecond) || 0,
            thrusterEnergyPerSecond: Number(ship.thrusterEnergyPerSecond) || 0,
            thrusterForceProduced: Number(ship.thrusterForceProduced) || 0,
            rotationEnergyPerSecond: Number(ship.rotationEnergyPerSecond) || 0,
            laserEnergyCost: Number(ship.laserEnergyCost) || 0,
            laserFuelCapacity: Number(ship.laserFuelCapacity) || 0,
            laserFuelConsumptionRate: Number(ship.laserFuelConsumptionRate) || 0,
            maxShieldStrength: Number(ship.maxShieldStrength) || 0,
            shieldRechargeRate: Number(ship.shieldRechargeRate) || 0,
            shieldDecayRate: Number(ship.shieldDecayRate) || 0
        };
    }

    populateShipForm(attrs) {
        if (!this.dom.shipInputs || !attrs) {
            return;
        }
        Object.entries(this.dom.shipInputs).forEach(([key, input]) => {
            if (!input) {
                return;
            }
            const value = attrs[this.mapShipInputKey(key)];
            if (typeof value === 'number' && Number.isFinite(value)) {
                input.value = value;
            } else {
                input.value = '';
            }
        });
    }

    clearShipForm() {
        if (!this.dom.shipInputs) {
            return;
        }
        Object.values(this.dom.shipInputs).forEach((input) => {
            if (input) {
                input.value = '';
            }
        });
    }

    mapShipInputKey(key) {
        const mapping = {
            mass: 'mass',
            maxCapacitor: 'maxCapacitor',
            reactor: 'reactorOutputPerSecond',
            thrusterEnergy: 'thrusterEnergyPerSecond',
            thrusterForce: 'thrusterForceProduced',
            rotationEnergy: 'rotationEnergyPerSecond',
            laserCost: 'laserEnergyCost',
            laserFuel: 'laserFuelCapacity',
            laserConsumption: 'laserFuelConsumptionRate',
            shieldMax: 'maxShieldStrength',
            shieldRecharge: 'shieldRechargeRate',
            shieldDecay: 'shieldDecayRate'
        };
        return mapping[key] || key;
    }

    disableShipForm(disabled) {
        if (!this.dom.shipForm || !this.dom.shipInputs) {
            return;
        }
        Object.values(this.dom.shipInputs).forEach((input) => {
            if (input) {
                input.disabled = disabled;
            }
        });
        if (this.dom.shipForm) {
            const buttons = this.dom.shipForm.querySelectorAll('button');
            buttons.forEach((button) => {
                button.disabled = disabled;
            });
        }
    }

    setShipStatus(message, variant = 'info') {
        if (!this.dom.shipStatus) {
            return;
        }
        this.dom.shipStatus.textContent = message || '';
        this.dom.shipStatus.classList.remove('error', 'success');
        if (variant === 'error') {
            this.dom.shipStatus.classList.add('error');
        } else if (variant === 'success') {
            this.dom.shipStatus.classList.add('success');
        }
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

