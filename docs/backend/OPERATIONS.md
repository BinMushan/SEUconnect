# Academic operations (Phase 5): attendance, CA, ESA, results and GPA

All endpoints are under `/api/v1`, need a bearer token, and are scoped by role (see `ARCHITECTURE.md` section 6).
Lecturers and demonstrators only reach offering components they are **actively assigned** to
(lecturer: theory, demonstrator: practical). Students see only their own rows, and only **published** results.

## Attendance (`/attendance`)
| Endpoint | Purpose |
|---|---|
| `POST /sessions` | create a session for an offering component |
| `GET /sessions`, `GET /sessions/:id` | list / read (scoped) |
| `POST /sessions/:id/cancel` | cancel (refused once attendance was marked) |
| `PUT /sessions/:id/records` | bulk mark `present / absent / excused`; only students with an **approved** registration; changing a record needs `reason`; every change is kept in `history` |
| `GET /sessions/:id/records` | records (students: own row only) |
| `GET /summary?student=` or `?offering=` | conducted, attended, percentage, theory vs practical, eligibility |
| `POST /corrections`, `GET /corrections`, `POST /corrections/:id/decision` | correction requests (student for own records, or assigned staff) decided by assigned staff |

## CA assessments (`/assessments`)
`POST /` create (name, type, maxMarks, weight, deadline) -> `POST /:id/open` -> `PUT /:id/marks` (validated 0..maxMarks, explicit
`absent:true`, history per mark) -> `POST /:id/submit` (all registered students need a mark) -> `POST /:id/verify` (HOD, department)
-> `POST /:id/approve` -> `POST /:id/lock`. `POST /:id/return` sends marks back (reason). The submitter cannot verify/approve.
Approved/locked marks change only through `POST /:id/corrections` + `POST /:id/corrections/:cid/decision` (history kept; any
calculated result is flagged `needsRecalculation`). `GET /ca-summary?offering&componentType` gives the weighted CA% per student.

## ESA (`/esa`)
`POST /schedules` (format written/practical/oral/other, date, start/end, venue, invigilators, maxMarks; venue and invigilator clashes are
refused), `GET /schedules/:id/eligibility` (from attendance policy), then the same open / marks / submit / verify / approve / lock / return /
corrections flow as CA. Entering a mark for an ineligible student needs `eligibilityOverride.reason` and a department-level officer.
Theory and practical ESAs are separate records; several formats per component are allowed (their marks combine as sum(marks)/sum(max)).

## Results and GPA (`/grade-policies`, `/results`, `/gpa`, `/transcripts`)
* **Grade policy** (bands, rounding, pass rule, GPA rules) is data: `POST /grade-policies` (draft) -> `POST /:id/approve` by a *different*
  officer. **Without an active policy every calculation fails with `GRADE_POLICY_NOT_CONFIGURED`.**
* `POST /results/calculate {offering, students?}` builds `draft` GradeRecords from **approved** CA and ESA marks only
  (otherwise `RESULT_INPUTS_NOT_APPROVED`). Formula (all weights from the offering's AssessmentConfiguration, decimal arithmetic):
  `component = CA% * caWeight + ESA% * esaWeight` · `course = sum(component * weightInCourse)` · grade from the active policy bands.
* States: `draft -> submitted (lecturer/demonstrator) -> verified (HOD) -> approved (Dean/Faculty Admin) -> published (Faculty Admin)`;
  `POST /results/{submit|verify|approve|publish|return}` take `{ids}` and are **all-or-nothing**. Publishing recomputes SGPA/CGPA (GPARecord).
* Published results are locked. `POST /results/:id/corrections` + `/decision` reopens one (previous values kept in `revisions`, GPA marked
  `outdated` until republished). The same behaviour is registered for the generic request types `result_correction` and `attendance_correction`.

## Policy keys used (all need confirmation / approval before they affect students)
| Key | Meaning | Status |
|---|---|---|
| `attendance.minPercent` | number, or `{overall, theory, practical}` | **not seeded - must be configured and approved**; without it eligibility is `policy_not_configured` |
| `attendance.excusedCountsAsPresent` | boolean | **not seeded**; with Excused sessions and no policy the percentage is hidden |
| `assessment.minCaPercent`, `assessment.minEsaPercent` | defaults copied into new AssessmentConfigurations | seeded (pending_confirmation) |
| GradePolicy document | `bands`, `rounding{mode,decimals,applyTo}`, `passRule`, `gpaRules{repeatHandling, excludeCourseTypes, countFailedCredits, gpaDecimals, gpaRounding}` | created by the Faculty |

Only **approved (active)** attendance policies are used to judge eligibility. Assumptions to confirm with the Faculty: a course passes only if
every component passes its own minimums (`passRule: all_components`, switchable to `course_mark_only`); failed courses count in the GPA denominator
(`countFailedCredits`, default true); a CA assessment a student did not attempt needs an explicit `absent:true` (counted as zero), never inferred.

## Running the tests
`node --test tests/unit/resultEngine.test.js tests/unit/attendanceMath.test.js` (no database) and `node --test tests/phase5.test.js`
(throw-away Atlas database, dropped afterwards). The test file requires `../server` before `start()` so module permission grants reach the role catalogue.
