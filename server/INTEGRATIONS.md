# Customization boundary contract (not live integration acceptance)

No adapter is registered in production. All wallet, verification and retry HTTP
operations fail closed. Only a browser-owned unavailable draft can be created.
Draft creation is idempotent while a blocked draft exists. Request IDs do not grant
access: all reads, skins and generated world selections check the session owner.
No fixture appears in the application or production seed.

Optional PLAYCRAFT_INTEGRATION_CONFIG JSON is read server-side to inventory unresolved
fields (network, contract, tokens, amountPolicy, finality, ownership, metadata,
analysis, generation, recovery). Its values are never returned publicly. Field
presence is not validation or approval. Even a fully populated object cannot enable
payments. No public RPC endpoint, destination, or send button is published.

Before implementing a concrete chain, obtain approved token/network identifiers,
contract event interface, decimals and amount policy, under/overpayment treatment,
finality/reorg policy, and recovery policy. The internal checkEvidence boundary
compares canonical adapter evidence using integer base units. It is not itself an
RPC verifier. The HTTP server never accepts an evidence object as truth.

Persistent account recovery and a supported chain signature library must be chosen
before issuing wallet challenges. Stored challenges bind player, request, wallet,
network, exact origin, random nonce and expiry. consumeChallenge accepts ONLY the
output of a trusted signature adapter, never browser JSON. Challenge issuance and
cryptographic signature verification are not implemented or exposed. Drafts cannot
transition to awaiting transfer via an API. Do not migrate guest ownership into paid
ownership without an approved claim/recovery protocol.

A concrete metadata adapter must restrict DNS/IPs (including rebinding), schemes,
redirects, MIME, byte/time budgets and metadata identity before fetching. The current
orchestrator does not fetch URLs. It validates the returned approved HTTPS source,
PNG magic/CRC/dimensions/size, stores original bytes and provenance hash. No user URL
is accepted. Logo bytes go to analysis and generation; no text-only substitute is
used. SVG and non-PNG input need an explicitly secure conversion adapter.

processGeneration is an internal orchestration boundary, not a running worker. It
requires a verified entitlement, explicit recovery policy and all four actual
provider methods: resolveLogo, analyzeLogo, reconcile, generate. A stable job key is
persisted before submission. Reconcile must return absent, unknown, or ready;
unknown never triggers a second generation. Providers MUST honor idempotency keys
and support reconciliation. Calls have a 30-second timeout; late calls cannot grant
an appearance, and future attempts reconcile the same key. A five-minute database
lease prevents simultaneous runs. There is no automatic retry/refund policy or
background restart scheduler until approved. Persisted failed/interrupted jobs keep
their entitlement and job key; processing never requests another payment.

Playcraft atlas v1: opaque PNG 192x16, 12 tiles of 16x16. Tiles: torso, head, hair,
left leg, right leg, left arm, right arm, left boot, right boot, left eye, right eye,
belt. Each part repeats its tile on all six faces. Geometry/proportions stay fixed.
Validated assets go under /data/uploads, served only through ownership-checked API.
The client supports generated appearance preview and equip; no generated appearance
exists until an actual adapter succeeds. Tests use isolated labelled fixture images.

Remaining live-launch work: approved configuration schema/version snapshot for paid
requests (drafts store blocker snapshots only), persistent accounts, concrete chain
and signature adapters, approved metadata/AI providers, durable scheduled worker and
reconciliation, end-to-end real chain/provider acceptance, rates/quotas, and approved
post-payment support/refund procedures. None is implied complete by fixture tests.

## Sandbox token studio (local only, no payment)

`server/local.mjs` is a concrete adapter for the explicitly local sandbox path. It
implements resolveLogo (the bytes the session uploaded), analyzeLogo
(`server/imaging.mjs` pixel analysis: palette, background, coverage, symmetry,
brightness/saturation), reconcile (always absent before first submission) and
generate (deterministic 192×16 Playcraft atlas from the analyzed palette and a pixelated
12×12 chest emblem of the logo). The idempotency key is the SHA-256 of the uploaded
bytes, so retries reconcile the same job; no network access is performed.

`POST /api/requests/:id/logo` accepts `{image: dataURL PNG, name, symbol}` from the
request owner only, validates the PNG (magic/CRC/dimensions/≤2 MB/visible pixels),
stores provenance and processes synchronously with `options.requireVerified:false`.
`POST /api/requests/:id/retry` regenerates from the stored provenance asset and keeps
the same job key. These routes create appearances and equip-able skins but never mark
a request verified, never create a redemption and never accept payment evidence.
Requests without provenance (the paid path) still fail closed with 503.

The sandbox adapter is not a launch switch for payments: `capabilities().live` stays
false, wallet/transfer endpoints remain unavailable, and generated appearances are
owned by the browser session that uploaded them (ownership-checked on read).

