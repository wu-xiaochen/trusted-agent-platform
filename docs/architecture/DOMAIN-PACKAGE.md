# Executable Business Package and Release Envelope

**Version:** 0.2.0 · **Status:** Design specification; exact native metadata is gated by TP-02 · **Updated:** 2026-11-03

## Purpose and single-source-of-truth rule

A published task release is the immutable, reviewable input to the business service kernel. **ObjectStack's native metadata is the only definition of business objects, fields, relationships, actions, permissions and views if TP-02 passes.** This project's package envelope stores that native metadata bundle by reference/digest plus only the task evidence, source mappings, policy and deployment records ObjectStack does not own. Do not translate native definitions into a parallel project schema, shadow CRUD API, rule engine or view engine.

If TP-02 shows that a critical native metadata capability cannot safely support this contract, stop and record a superseding ADR before selecting one replacement core. Do not carry ObjectStack and a second core together.

## Logical release envelope

The following is a logical envelope, not a JSON Schema for ObjectStack metadata. `nativeBundleRef` points to a pinned, validated ObjectStack-native export. The platform extension uses references to native IDs and never recreates their shapes.

```json
{
  "envelopeVersion": "1.0.0",
  "taskId": "maintenance-preparation",
  "taskVersion": "0.1.0",
  "lifecycle": "draft",
  "title": "Prepare maintenance and spare-parts request",
  "objectStack": {
    "runtimeVersion": "qualified-version",
    "nativeBundleRef": "bundle_...",
    "nativeMetadataDigest": "sha256:..."
  },
  "platformExtension": {
    "sourceMappings": [{"nativeObjectId":"...","nativeFieldId":"...","sourceCatalogEntryId":"...","mappingRevision":"..."}],
    "evidenceRefs": [],
    "ruleDecisionRefs": [],
    "connectorSafetyRefs": [],
    "automationPolicyRefs": [],
    "readinessEvidenceRefs": []
  },
  "applicationRelease": {
    "appSpecRef": "appspec_...",
    "componentCatalogVersion": "...",
    "apiCompatibility": "v1"
  },
  "digest": "sha256:..."
}
```

The exact keys and digests are finalized only after TP-02 qualifies the runtime and TP-04 defines the extension envelope. The native ObjectStack export remains authoritative for native object/action/permission/view structure.

## Extension contract

Allowed platform-specific extension data is limited to:

- **Task/evidence:** task goal, source/file evidence references, provenance state (`source_observed`, `agent_proposed`, `owner_confirmed`, `conflicting`, `unknown`), owner and revision. These states describe knowledge provenance; they do not grant access.
- **Source mappings:** references to ObjectStack object/field/relation IDs plus source catalog entry, transformation version, source authority, tests and owner.
- **Rule decisions:** reference to a native rule/action/field ID, actor, decision scope, evidence, policy version and timestamp. Predicate/validation syntax comes from a qualified native mechanism or a separately reviewed adapter, not from model-authored free text or a parallel general rule engine.
- **Connector evidence:** verified operation IDs, principal mode, schema fingerprint, freshness/completeness/budget, idempotency and reconciliation capability. The connector port is not a second public CRUD API.
- **Readiness:** per-capability test and blocker references; it cannot override native permissions or source authority.
- **Action safety:** versioned automation-policy and idempotency/reconciliation references attached to native action IDs; this extension can narrow native access, never widen it.
- **App release manifest:** route/layout composition and artifact provenance only where the qualified ObjectStack view/component metadata does not already represent it. All objects, fields, actions, visibility permissions and component contracts reference native metadata/catalog IDs.

No extension may redefine native object types, field types, relationships, action parameters, permissions, view/component schemas, generic REST semantics, or identity. Any claimed gap requires a TP-02 finding and an ADR decision before implementation.

## Query and action bindings

A task's read capability binds an ObjectStack-native view/query or typed service operation to an approved connector operation. The connector contract supplies allowed inputs, output mapping, source identity, row/time/byte limits, freshness and partial-result semantics. Do not create a second arbitrary SQL/query language. SQL access is read-only and parameterized; no LLM-authored SQL.

A business command binds an ObjectStack-native action ID to a named source-owned operation and its connector safety evidence. The platform extension references required business decisions, canonical effect construction, requester confirmation/approval policy, idempotency and reconciliation. `retryClassification` is `safe-with-stable-key`, `safe-after-reconcile`, or `manual-only`; the validator rejects a claim that exceeds connector evidence. Effective permissions are the intersection of current platform policy, ObjectStack authorization, package grant, source identity and source-system authorization.

## Draft-to-release lifecycle

```text
draft → linted → simulated → reviewed → published → disabled → superseded
```

- **Draft:** Agent and user propose native metadata changes and extension records. Nothing is a published capability.
- **Linted:** ObjectStack's native validator checks native metadata; platform validator checks only extension references, provenance, connector evidence and cross-boundary invariants.
- **Simulated:** synthetic cases exercise the native service path and extension checks. Connected-data trials are authorized reads only.
- **Reviewed:** authorized business owner confirms meanings/rules; integration administrator grants source capability; publisher reviews exact release diff. Decisions are distinct.
- **Published:** immutable native metadata digest plus extension and app-release digests are addressable to the runtime.
- **Disabled:** new use stops; in-flight side effects require reconciliation.
- **Superseded:** newer release exists; historic runs retain their exact references subject to current authorization and retention.

A release never freezes user permissions, source credentials, source records, or secret values. Revocation and policy restrictions apply to existing releases immediately.

## Canonicalization and compatibility

Use ObjectStack's canonicalization and compatibility rules for native metadata where available. The platform envelope is canonicalized only for its own extension fields and sorted reference sets; preserve intentional app layout order. Numeric effects require exact decimal/unit semantics. Record exact runtime, extension, connector, policy, component catalog and API versions.

A semantic change to native action meaning, required rule or mapping creates a new immutable revision. Schema migration preserves old run references and includes a forward migration. Compatibility behavior is verified against the pinned ObjectStack version rather than guessed from this logical envelope.

## Extension validator errors

Platform-specific stable error IDs may include `UNKNOWN_NATIVE_REFERENCE`, `MAPPING_TYPE_MISMATCH`, `MISSING_EVIDENCE`, `UNCONFIRMED_REQUIRED_DECISION`, `SOURCE_UNVERIFIED`, `UNSAFE_ACTION_RETRY`, `MISSING_RECONCILIATION`, `INVALID_APP_BINDING`, `POLICY_EXCEEDS_NATIVE_GRANT`, and `INCOMPATIBLE_RUNTIME_VERSION`. Native metadata errors are returned by the qualified native validator and must not be duplicated in a second platform validator. Errors identify a JSON pointer/reference and resolving role without leaking source payloads.
