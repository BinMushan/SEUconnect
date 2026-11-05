const mongoose = require('mongoose');
const { Schema } = mongoose;
const ref = (name, extra = {}) => ({ type: Schema.Types.ObjectId, ref: name, ...extra });
const model = (name, schema) => mongoose.models[name] || mongoose.model(name, schema);

// Course code: three letters followed by five numerals (e.g. ICT21013).
const COURSE_CODE = /^[A-Z]{3}\d{5}$/;
// Type A: theory only | Type B: theory + practical | Type C: practical only
const COMPONENTS_BY_TYPE = { A: ['theory'], B: ['theory', 'practical'], C: ['practical'] };

const CourseSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, match: COURSE_CODE },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    credits: { type: Number, required: true, min: 0 },
    type: { type: String, enum: ['A', 'B', 'C'], required: true },
    department: ref('Department', { required: true, index: true }),
    programme: ref('DegreeProgramme', { required: true, index: true }),
    specialization: ref('Specialization', { default: null }),
    defaultYear: { type: Number, min: 1, max: 8, required: true },
    defaultSemester: { type: Number, min: 1, max: 4, required: true },
    coordinator: ref('Staff', { default: null }),
    status: { type: String, enum: ['active', 'inactive', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

const CoursePrerequisiteSchema = new Schema({ course: ref('Course', { required: true, index: true }), prerequisite: ref('Course', { required: true }) }, { timestamps: true });
CoursePrerequisiteSchema.index({ course: 1, prerequisite: 1 }, { unique: true });

// Reusable assessment structure; weights are percentages that must add up to 100 (validated in the service).
const AssessmentConfigurationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    caWeight: { type: Number, required: true, min: 0, max: 100 },
    esaWeight: { type: Number, required: true, min: 0, max: 100 },
    minCaPercent: { type: Number, min: 0, max: 100, default: null },
    minEsaPercent: { type: Number, min: 0, max: 100, default: null },
    minFinalPercent: { type: Number, min: 0, max: 100, default: null },
    status: { type: String, enum: ['active', 'archived'], default: 'active' },
  },
  { timestamps: true }
);

// A course offered to one batch in one semester. Lecturer/demonstrator assignments live in CourseStaffAssignment.
const CourseOfferingSchema = new Schema(
  {
    course: ref('Course', { required: true, index: true }),
    semester: ref('Semester', { required: true, index: true }),
    batch: ref('AcademicBatch', { required: true, index: true }),
    status: { type: String, enum: ['planned', 'open', 'running', 'completed', 'cancelled'], default: 'planned' },
    capacity: { type: Number, min: 1, default: null },
    registeredCount: { type: Number, default: 0, min: 0 }, // live (pending + approved) registrations, maintained atomically
    coordinator: ref('Staff', { default: null }),
    components: [
      {
        _id: false,
        type: { type: String, enum: ['theory', 'practical'], required: true },
        assessmentConfiguration: ref('AssessmentConfiguration', { required: true }),
        weightInCourse: { type: Number, min: 0, max: 100, required: true }, // % of the course mark
      },
    ],
  },
  { timestamps: true }
);
CourseOfferingSchema.index({ course: 1, semester: 1, batch: 1 }, { unique: true });

const CourseStaffAssignmentSchema = new Schema(
  {
    offering: ref('CourseOffering', { required: true, index: true }),
    componentType: { type: String, enum: ['theory', 'practical'], required: true },
    staff: ref('Staff', { required: true, index: true }),
    role: { type: String, enum: ['lecturer', 'demonstrator', 'coordinator'], required: true },
    from: { type: Date, default: Date.now },
    to: { type: Date, default: null },
    active: { type: Boolean, default: true },
    assignedBy: ref('User'),
    endedBy: ref('User'),
    note: { type: String, default: '' },
  },
  { timestamps: true }
);
// At most one ACTIVE lecturer / coordinator per offering component; demonstrators may be several.
CourseStaffAssignmentSchema.index(
  { offering: 1, componentType: 1, role: 1 },
  { unique: true, partialFilterExpression: { active: true, role: { $in: ['lecturer', 'coordinator'] } } }
);
CourseStaffAssignmentSchema.index({ offering: 1, componentType: 1, role: 1, staff: 1 }, { unique: true, partialFilterExpression: { active: true } });

module.exports = {
  COURSE_CODE,
  COMPONENTS_BY_TYPE,
  Course: model('Course', CourseSchema),
  CoursePrerequisite: model('CoursePrerequisite', CoursePrerequisiteSchema),
  AssessmentConfiguration: model('AssessmentConfiguration', AssessmentConfigurationSchema),
  CourseOffering: model('CourseOffering', CourseOfferingSchema),
  CourseStaffAssignment: model('CourseStaffAssignment', CourseStaffAssignmentSchema),
};
