## Future Work Backlog

### Network Optimization

1. **Client-side interpolation/extrapolation**
   - Buffer multiple authoritative snapshots on the client, then render positions using interpolation (and extrapolation for short gaps) to smooth remote motion when outbound snapshots are throttled below the physics tick rate.
   - Requires refactoring snapshot handling to store per-entity history, reconciling with the deterministic local sim, and potentially layering client prediction for the local player to keep controls responsive.

