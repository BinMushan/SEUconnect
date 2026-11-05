/**
 * Initial faculty structure and default policy values, taken from the requirement specification.
 * This is SEED DATA ONLY: it is written to the database once and can then be edited there; no business
 * logic reads this file. Policy values marked pending_confirmation must be confirmed against the
 * Faculty Handbook before they are treated as approved.
 */
module.exports = {
  departments: [
    { code: 'DICT', name: 'Department of Information and Communication Technology', shortName: 'ICT' },
    { code: 'DBST', name: 'Department of Biosystems Technology', shortName: 'BST' },
  ],
  programmes: [
    {
      code: 'BICT',
      name: 'Bachelor of Information and Communication Technology',
      department: 'DICT',
      tracks: [
        { code: 'SWT', name: 'Software Technologies', kind: 'specialization' },
        { code: 'NST', name: 'Network and Security Technologies', kind: 'specialization' },
      ],
    },
    {
      code: 'BBST',
      name: 'Bachelor of Biosystems Technology',
      department: 'DBST',
      tracks: [
        { code: 'AAT', name: 'Animal and Aquatic Science and Technology', kind: 'majoring' },
        { code: 'AEE', name: 'Agricultural Economics and Entrepreneurship', kind: 'majoring' },
        { code: 'BSE', name: 'Biosystems Engineering', kind: 'majoring' },
        { code: 'CST', name: 'Crop Science and Technology', kind: 'majoring' },
        { code: 'FST', name: 'Food Science and Technology', kind: 'majoring' },
      ],
    },
  ],
  policies: [
    { key: 'semester.weeks', value: 15, description: 'Teaching weeks in a semester', source: 'Handbook (as quoted in the specification)' },
    { key: 'registration.windowWeeks', value: 2, description: 'Length of the subject-registration period in weeks', source: 'Handbook (as quoted in the specification)' },
    { key: 'registration.maxCredits', value: 22, description: 'Maximum normal academic workload (credits) per semester', source: 'Handbook (as quoted in the specification)' },
    { key: 'assessment.minCaPercent', value: 40, description: 'Default minimum CA percentage to pass a component', source: 'Handbook (as quoted in the specification)' },
    { key: 'assessment.minEsaPercent', value: 35, description: 'Default minimum ESA percentage to pass a component', source: 'Handbook (as quoted in the specification)' },
    { key: 'registration.autoApprove', value: false, description: 'Approve rule-compliant registrations automatically (false = an officer approves each one)', source: 'ASSUMPTION - needs confirmation' },
    { key: 'allocation.majoring.minApplications', value: 10, description: 'A majoring division is offered only with at least this many applications', source: 'Handbook (as quoted in the specification)' },
    { key: 'allocation.majoring.countBasis', value: 'any_preference', description: 'How applications are counted for the minimum: any_preference | first_preference', source: 'ASSUMPTION - needs confirmation' },
  ],
};
