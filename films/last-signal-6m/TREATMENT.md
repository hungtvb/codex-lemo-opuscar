# TREATMENT — LỆNH CUỐI (LAST SIGNAL)
Original action short film • 06:00 • 1280×720 • 24 fps • Vietnamese dialogue
Style: **80s Cel Anime** (Lemo-Opuscar `styles/cel-anime-80s/STYLE.md`); retro cel animation, neon-painted backgrounds, on-twos character poses, restrained VHS/CRT post-processing.

## Three candidate story structures
1. **Race against the flood (selected)** — a messenger races across a rain-soaked megacity to restore decentralized flood safety systems. Strong single objective and escalating environments.
2. **One long rooftop fight** — strong action but monotonous at six minutes.
3. **Two opposing couriers** — interesting moral conflict but exposition-heavy for short film.

## Premise
Vân Đô, a fictional coastal megacity in 2091. A centralized flood-control system has locked civilian evacuation gates. Courier **Linh**, wearing a bright saffron-red scarf, carries the master access key. Her sidekick **K-7**, a little blue scouting drone, warns about a hard six-minute deadline. Enforcer drones hunt them as she races through elevated bridges, rooftops, the flooded metro, and a control tower. At the core, Linh learns that the key does not restore the public system — it monopolizes control. She rejects the command, distributes access to ordinary people, and the city opens its own gates.

## Cinematic references — grammar only
- 1980s hand-painted Japanese sci-fi OVA: layered airbrushed neon plates, stark two-tone cels, rain reflections and coloured ink.
- Classic action film staging: geography-first wides, inserts before decisions, compressed slow-motion before impacts, and long held close-ups after near-losses.
Do not copy existing characters, designs, music, locations or signature compositions.

## Character sheet
**Linh**: mid-twenties woman; angular profile, black asymmetrical bob under midnight-blue half-helmet, orange-red scarf, slate suit, armored gloves and boot soles, emerald-tinted visor. Keep scarf as the one accent colour in all settings. Avoid oversized eyes.
**K-7**: small hovering teal-blue four-fin reconnaissance sphere, luminous amber eye, damaged fin in act IV.
**Guard**: tall graphite-armored faceless enforcer with narrow crimson visor, square shoulders.
**Hunter drones**: black mechanical triangles/circles with red scanners, visually distinct from K-7.

## Six act story / major action
I 00–60: signal fails; Linh receives last key, dodges ambush, escapes on motorbike.
II 60–120: neon freeway motorcycle pursuit; leap from broken flyover onto tower roofs.
III 120–180: rooftop parkour and hand-to-hand duel; K-7 saves her fall.
IV 180–240: flooded underground train tunnel; near-hit by train; K-7 damaged, keeps its last charge.
V 240–300: tower ascent; enemy showdown; reveal that the key would empower the antagonist.
VI 300–360: Linh distributes access to the city's people; flood gates open; lights return at dawn.

## Shot list and camera language
48 shots; 8 per act. Shot durations repeat a purposefully varied 6/8/4/10/5/9/7/11-second grid within each 60-second act.
Cameras: aerial crane (scale), lateral chase plate (momentum), low diagonal tracking (force), extreme inserts (choice), impact freeze on two frames (physical blows), quiet held closeups (sacrifice), sunrise return to earlier establishing composition (change).
Each shot is enumerated with absolute timestamps, action, camera, dialogue and duration in `story.json`. Motion contrasts fast (bridge chase, combat) with held, quieter aftermath (K-7's fall and recovery). The opening hook is a security drone flaring in the rain before the title.

## Sound
Music: original hybrid analog synth, FM bells, electric bass, rhythmic gated snare, strings/brass pads; grows from 96 BPM to 144 BPM then stops for silence at K-7 loss, rises at city-wide pulse. Foley: wet footsteps, bike motor, radio hiss, rotor drones, metallic impacts, sparks, alarms, train rumbles, power pulse. Minimal character dialogue in Vietnamese (female courier, robotic K-7, male guard, radio/citizens). Voice 9 dB above ducked music. Final -14 LUFS mastering target.

## Delivery quality
Must call **upstream** `core/render/video.mjs`, not substitute PIL/FFmpeg-only animation. 8640 frames; 360s 720p, 24fps H.264/AAC. Render >12 representative stills, QC dark/blank frames, 48-shot continuity and playback. Deliver film, SRT, source, poster, render evidence, and credits. Differentiate objective QC from professional animation claims.
