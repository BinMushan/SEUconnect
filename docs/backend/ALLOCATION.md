# Specialization / majoring allocation (Phase 4)

Module: `Backend/modules/allocation` · API base: `/api/v1/allocations` · tests: `tests/unit/allocationEngine.test.js`, `tests/phase4.test.js`.

## Flow
1. **Round** (faculty officer): `POST /rounds` for a programme + batch. `kind` (specialization vs majoring) is derived from the programme's tracks; the start year/semester is a snapshot of `programme.specializationStarts`. `POST /rounds/:id/transition` `{to:'open'|'closed'}`.
2. **Capacities**: `PUT /capacities {specialization,batch,seats}` (cannot drop below seats already held).
3. **Applications** (students, own scope): `POST /applications {round, preferences:[trackId,...]}` – ranked, unique, active tracks of the programme; student must be `Active`, in the round's programme + batch and at/after the configured year/semester. Re-submitting amends and keeps the earlier list in `history`. Students cannot submit GPA; academic metrics are read from a published `GPARecord` (cumulative) **only if that model exists**, or recorded by an officer: `PUT /applications/:id/metrics {metrics,note}` (stored as `supplied`, audited).
4. **Dry run**: `POST /runs/dry-run {round}` – full result, **no writes**.
5. **Run**: `POST /runs {round}` – round must be `closed`; one transaction; replaces the previous provisional run (kept as history); result `provisional`. At most one live allocation per student (partial unique index).
6. **Publish**: `POST /runs/:id/publish` – transaction; allocations → `published`, `Student.specializationRef` set, round `published`; students notified after commit (allocated: `allocation.published`; unallocated: `allocation.review`).
7. **Manual change**: `POST /changes {student?, to, requestReason, attachments[]}` (student for self, or HOD/faculty officer on behalf) → `POST /changes/:id/decision {decision, decisionReason}` (`allocations.change`: HOD within department, faculty admin faculty-wide). Capacity is re-checked at decision time; the previous allocation becomes `superseded` (never overwritten); an append-only `AllocationChange` and an audit row are written. Unallocated students are placed the same way (previous = none).
8. Reads: `GET /rounds|capacities|applications|allocations|changes`, `GET /me`, `GET /history/:studentId`, `GET /runs[/:id]` (department+ only; HOD sees their department's rows). Students see only their own **published** allocations.

Generic request engine: handler `specialization_change` is registered in `core/hooks` (`validate` normalises the payload, `onApproved` runs the same change logic inside the approval transaction).

## Engine (`engine.js`, pure)
Rank eligible applicants by the policy's weighted criteria → configured tie-breakers → application time → student id (deterministic) → serial allocation giving each student the highest-ranked preference with free seats. Students whose preferences are all full/unavailable are **unallocated and flagged for manual review** – never assigned to a track they did not list. Missing metric → ineligible (`MISSING_METRIC:key`), never invented.

## Policies (data, not code)
| Key | Used for | Status |
|---|---|---|
| `allocation.criteria` (scope: programme) `{criteria:[{key,weight,direction}], tieBreakers?, eligibility?:{minValues}}` | ranking + eligibility | **Not seeded.** Must be created and **approved (active)**; otherwise runs fail with `POLICY_NOT_CONFIGURED`. Weights/criteria/tie-breakers need Faculty confirmation. |
| `allocation.majoring.minApplications` | BBST minimum (default 10 from the spec) | seeded `pending_confirmation`; flagged in the run's `policySnapshot.needsConfirmation` |
| `allocation.majoring.countBasis` (`any_preference`/`first_preference`) | how applications are counted for the minimum | seeded `pending_confirmation` (**assumption**) |

Min-applications handling removes the weakest under-subscribed division first and re-evaluates (applicants count towards their next preference) until stable.

## Permissions
Existing catalogue keys `allocations.apply|read|manage|change`. Added via `extendCatalog`: `faculty_admin` gets `allocations.change` (faculty).
