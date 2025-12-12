# Renderer Optimizations

1. **Cache procedural ship art**
   - Render the animated human ship into an offscreen canvas (or `OffscreenCanvas`) at a canonical scale/rotation, then draw that bitmap with `drawImage` for each instance. This amortizes the cost of gradients, shadows, and path construction across frames, trading CPU paint work for cheap GPU blits.

2. **Reduce expensive filters**
   - Replace the blur-based ground shadow with a pre-rendered sprite or a simple alpha ellipse so the main render loop avoids `ctx.filter = "blur(...)"`, which forces extra GPU passes each frame.

3. **Adaptive animation detail**
   - Skip or throttle running-light/engine flicker updates for distant ships or every other frame, reducing the number of gradient/glow calculations when the ship occupies only a few screen pixels.

4. **Reuse gradients and paths**
   - Move static gradients (fuselage metal, canopy base colors) and frequently used `Path2D`s into cached objects so they aren’t recreated on every draw call, lowering garbage generation and JS execution time.

# Gameplay Balance

1. **Realistic energy model**
   - Revisit capacitor capacities, reactor output, and weapon energy costs so they use plausible joule values (and possibly units) instead of the current game-only placeholders, then rebalance regen and consumption around the new scale.
2. **Weapon & hull scaling**
   - Support variable-strength weapons (lasers, future variations) whose damage ties into physically meaningful metrics, and correlate hull durability to ship mass/structure so heavier ships naturally sustain more punishment.
3. **Laser energy configurability**
   - Move laser starting fuel and burn rate out of hard-coded constants so different laser classes (or ship loadouts) can define their own endurance and damage profiles.
4. **Autopilot braking**
   - Replace the arcade brake with an autopilot routine that computes retrograde thrust/rotation and executes coordinated burns to bring the ship to a stop, while still feeling friendly to players.
5. **Rotation tuning**
   - Introduce per-ship rotation acceleration/decay settings (or an advanced flight mode) so rotational thrusters can feel distinct without making new players spin uncontrollably.

# Network Optimization

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
   - Move the ad-hoc DataView layout to a formal schema (e.g., FlatBuffers, protobuf, Cap'n Proto) so field changes are versioned automatically and tooling can generate encoders/decoders for other runtimes.
   - Adds room for richer validation (checksums, signatures) and could unlock streaming partial updates once the delta system is in place.

# Bot AI Improvements

1. **Lead targeting (predictive aiming)**
   - Instead of aiming at where the target IS, aim where it WILL BE when the laser arrives. Calculate time-to-target based on distance and laser speed (100 units), then predict the target's future position using their heading and velocity. This significantly improves hit rate against moving targets.

2. **Tighter angle tolerance**
   - Reduce firing angle tolerance from 10° to 5° for more accurate shots. Trade-off is slightly longer time to align before firing.

3. **Enable shields during combat**
   - Automatically activate shields when entering attack mode (if capacitor > 30). Provides defensive capability while engaging targets.

4. **Opportunistic firing while rotating**
   - Fire when rotation velocity < 1 instead of waiting for complete stop. Gets more shots off while tracking moving targets, accepting slightly reduced accuracy for higher volume of fire.

5. **Close distance while attacking**
   - After firing, if target is > 50 units away, also thrust forward to close the gap. Shorter range means higher hit probability and more damage (lasers lose fuel/damage over distance).

6. **Faster attack scan rate**
   - Reduce attack scan interval from 200ms to 100ms for more responsive target tracking. Trade-off is slightly higher server CPU usage per bot.

7. **Target prioritization**
   - Currently targets closest human. Could factor in: target health (finish wounded targets), threat level (kill count), whether target is facing the bot (prioritize distracted targets), or target velocity (easier to hit slow targets).

8. **Evasive maneuvers**
   - Add lateral thrust or rotation while attacking to make bots harder to hit. Could trigger when detecting incoming fire or when target is also facing the bot.

9. **Energy management**
   - Monitor capacitor levels and temporarily disengage (stop firing, disable shields) to recharge if energy gets critically low, rather than draining shields for weapons.

# New Features

- Add shield sound effects
- Add explosion sound effects
- Better energy meters
- Damage systemss
- Guided Missiles
- Flares
- "Warp in"
- Add the ability of explosions to create force and do damage

# Bugs

- Missiles do not work on Bobby and Micah's computers