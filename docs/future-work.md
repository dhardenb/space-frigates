## Future Work Backlog

### Network Optimization

1. **Client-side interpolation/extrapolation**
   - Buffer multiple authoritative snapshots on the client, then render positions using interpolation (and extrapolation for short gaps) to smooth remote motion when outbound snapshots are throttled below the physics tick rate.
   - Requires refactoring snapshot handling to store per-entity history, reconciling with the deterministic local sim, and potentially layering client prediction for the local player to keep controls responsive.

2. **Interest filtering with global minimap exceptions**
   - Deliver reduced per-player snapshots based on proximity buckets while always including lightweight metadata for all ships (for HUD/minimap rendering). This likely requires separating “full” vs. “minimap” representations in the packed payload.
   - Needs new spatial partitioning utilities, per-connection output buffers, and client logic to gracefully handle ships entering/leaving the detailed interest set.

3. **Per-client delta snapshots**
   - Cache each client’s last acknowledged snapshot on the server, then emit only object changes (adds/removals/field diffs) plus occasional full refreshes. Reduces bandwidth dramatically once throttling/interest filtering already trimmed the payload.
   - Requires new data structures for diffing packed states, client-side patch application logic, and resilience mechanisms (full-state resyncs, checksum validation) to recover from missed deltas.

4. **Schema-based binary protocol**
   - Move the ad-hoc DataView layout to a formal schema (e.g., FlatBuffers, protobuf, Cap’n Proto) so field changes are versioned automatically and tooling can generate encoders/decoders for other runtimes.
   - Adds room for richer validation (checksums, signatures) and could unlock streaming partial updates once the delta system is in place.

