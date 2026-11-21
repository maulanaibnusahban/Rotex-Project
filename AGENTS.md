# ROTEX — AI Agent Development Guidelines

## 1. Project Identity

Project: ROTEX Web Platform
Product: Rotation Therapy Exercise
Type: Healthcare Rehabilitation Management System
Primary Language: Indonesian (Bahasa Indonesia)

ROTEX is a shoulder rehabilitation device designed to support:

- Flexion
- Extension
- Abduction
- Adduction

The web application is a companion platform for managing patients, therapy schedules, clinical journals, and rehabilitation progress.

The website does NOT operate or communicate directly with the physical ROTEX device.

All therapy measurements are manually recorded by authorized doctors after examining the patient and using the physical device.

### Core Principle

Build a professional, secure, maintainable healthcare application.

Prioritize:

1. Correct business logic
2. Patient data privacy and security
3. Clear user experience
4. Maintainable architecture
5. Visual consistency
6. Performance and accessibility

Do not prioritize visual effects over functionality.

---

## 2. Source of Truth

Before implementing any feature, consult:

1. `AGENTS.md` — development conventions.
2. `docs/PRD.md` — product requirements.
3. `docs/DESIGN_BRIEF.md` — visual design direction.
4. Existing code and established project conventions.

If these sources conflict:

- Follow the latest explicit user instruction.
- Preserve finalized business decisions.
- Do not silently introduce product requirements.
- Ask for clarification when a conflict materially affects functionality or security.

Do not assume a feature exists merely because it appears in a mockup.

If referenced documentation is missing, do not invent its contents.

---

## 3. Product Scope

### Included

- Public landing page
- Patient self-registration
- Authentication and authorization
- Admin dashboard
- Doctor dashboard
- Patient dashboard
- Doctor and patient management
- Doctor-patient assignment
- Therapy appointment scheduling
- Manual therapy journaling
- Shoulder ROM measurements
- Doctor clinical assessments
- Historical ROM progress charts
- Patient access to finalized journals

### Explicitly Excluded

Do NOT implement:

- Device registration or device IDs
- ESP32 integration
- MQTT communication
- WebSocket device telemetry
- Automatic sensor synchronization
- Remote device operation
- Motor control
- Automatic diagnosis
- AI-generated medical recommendations
- Online payment
- Video consultation

Do not add excluded functionality without explicit approval.

---

## 4. User Roles

The system contains exactly three application roles:

- `ADMIN`
- `DOCTOR`
- `PATIENT`

### ADMIN

Can:

- Manage doctor accounts
- Manage patient accounts
- Assign doctors to patients
- Manage administrative account status
- View operational appointment information
- Access relevant administrative audit information

Cannot:

- Create clinical journals
- Modify ROM measurements
- Write clinical diagnoses
- Finalize therapy journals
- Access clinical content by default

### DOCTOR

Can:

- View assigned patients
- View patient therapy history
- Create and manage therapy appointments
- Create therapy journals
- Record ROM measurements
- Record clinical assessments
- Save journal drafts
- Finalize journals
- Correct finalized journals through an auditable revision process
- View assigned patients' ROM progress

Cannot:

- Access unrelated patients
- Manage admin accounts
- Assign arbitrary application roles

### PATIENT

Can:

- Register independently
- Verify their email
- Log in
- Update permitted personal profile fields
- View their own appointments
- View their own ROM progress
- Read all contents of their finalized therapy journals
- Read finalized doctor assessments

Cannot:

- Create or modify therapy journals
- Modify ROM measurements
- View draft journals
- Access other patients' data
- Assign themselves to doctors
- Change their own application role

### Authorization

Never rely only on frontend role checks.

Enforce authorization on the server for every sensitive operation.

Validate both:

- User role
- Resource ownership or doctor-patient assignment

Never trust a client-provided `userId`, `patientId`, or role without server-side authorization.

---

## 5. Authentication Rules

Patients may register publicly.

Doctors and admins cannot register through the public registration form.

New public registrations must always receive the `PATIENT` role on the server.

Implement:

- Secure password handling
- Email verification
- Password reset
- Protected sessions
- Secure logout
- Login rate limiting
- Appropriate error messages

Never:

- Store plaintext passwords
- Expose authentication tokens in logs
- Trust client-provided roles
- Store secrets in source code
- Commit `.env` files

---

## 6. Clinical Business Rules

### Therapy Journals

Only authorized doctors may create or modify therapy journals.

A journal contains:

- Patient
- Responsible doctor
- Therapy date
- Optional linked appointment
- Shoulder side
- Therapy mode
- ROM measurements
- Duration and repetitions
- Clinical observations
- Assessment or diagnosis
- Follow-up plan

A single therapy session may contain multiple ROM measurements.

Do not assume every session includes all four movements.

### Journal Status

Use:

- `DRAFT`
- `FINALIZED`

Rules:

- Draft journals are visible only to authorized doctors.
- Patients cannot access drafts.
- Finalized journals become visible to the relevant patient.
- Patients may read all contents of finalized journals.
- Finalized clinical records must not be silently overwritten.
- Corrections must preserve the previous version and audit information.

Never expose draft content through APIs, search results, or cached responses.

### ROM Measurements

Supported movement types:

- `FLEXION`
- `EXTENSION`
- `ABDUCTION`
- `ADDUCTION`

Store ROM values in degrees.

Each measurement should include:

- Movement type
- Shoulder side
- Measurement value
- Measurement method
- Therapy mode where applicable

ROM measurements are entered manually.

Do not automatically interpret ROM changes as medical recovery.

Do not calculate a clinical recovery percentage without a validated, explicitly approved methodology.

Do not generate diagnoses based only on ROM values.

### Appointments

Doctors can schedule therapy for assigned patients.

Appointments require:

- Patient
- Doctor
- Start time
- End time
- Status

Prevent overlapping appointments for the same doctor unless an explicitly approved override policy exists.

Appointment statuses:

- `SCHEDULED`
- `COMPLETED`
- `CANCELLED`
- `NO_SHOW`

Rescheduling should preserve relevant change history.

Appointment status and journal status are independent.

A completed appointment does not automatically finalize its journal.

A journal may exist without a linked appointment.

---

## 7. Recommended Technology Stack

Use the established project dependencies when available.

Preferred stack:

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- Lucide React
- PostgreSQL
- Prisma ORM
- Auth.js or equivalent
- Zod
- React Hook Form
- Recharts

Do not introduce additional libraries without a clear technical reason.

Prefer native platform capabilities and existing dependencies.

Use a modular monolith architecture.

Do not create microservices for the MVP.

---

## 8. Project Architecture

Follow a feature-oriented architecture.

Suggested structure:

src/
app/
(public)/
(auth)/
(dashboard)/
admin/
doctor/
patient/
api/

components/
ui/
layout/
shared/

features/
auth/
users/
patients/
doctors/
appointments/
journals/
rom/
dashboard/

lib/
auth/
db/
permissions/
validations/
utils/

types/

prisma/
schema.prisma
migrations/

docs/
PRD.md
DESIGN_BRIEF.md

### Architecture Rules

- Keep route files focused.
- Separate business logic from UI components.
- Place feature-specific code inside its feature directory.
- Keep shared components generic and reusable.
- Centralize permission checks.
- Centralize database access patterns.
- Centralize validation schemas where practical.
- Avoid circular dependencies.
- Avoid deeply nested component structures.
- Avoid unnecessary abstraction.

Do not create a new shared component for a pattern used only once unless it materially improves clarity.

---

## 9. TypeScript & Code Quality

Use TypeScript consistently.

Rules:

- Avoid `any`.
- Prefer explicit domain types.
- Use descriptive variable and function names.
- Keep functions focused.
- Prefer early returns.
- Handle errors explicitly.
- Avoid excessive comments describing obvious code.
- Document non-obvious business rules.
- Remove unused imports and dead code.
- Do not duplicate business logic.

Use enums or validated unions for:

- User roles
- Journal statuses
- Appointment statuses
- Movement types
- Shoulder sides
- Therapy modes

Never use magic strings for critical business states.

### Database

- Use migrations for schema changes.
- Define appropriate foreign keys.
- Index frequently filtered relational fields.
- Use transactions for multi-step writes.
- Preserve referential integrity.
- Do not delete clinical history through cascading deletion.
- Store timestamps consistently.
- Use UUIDs for internal entity identifiers.

Do not confuse internal database IDs with physical device IDs.

---

## 10. UI/UX Design Principles

Design direction:

**Modern Healthcare SaaS**

The interface must be:

- Professional
- Minimal
- Refined
- Trustworthy
- Calm
- Functional
- Information-rich without clutter
- Visually consistent

Minimalism does not mean empty pages.

Avoid excessive whitespace that makes the interface feel unfinished.

Use intentional spacing, strong typography, useful content, and meaningful visual hierarchy.

### Visual Identity

Primary green: `#176B50`
Primary hover: `#11543E`
Secondary blue: `#26759B`

Heading: `#152B30`
Body text: `#435760`
Muted text: `#74858B`

Background: `#F7F9F8`
Surface: `#FFFFFF`
Border: `#E3EAE7`

Success: `#17805D`
Warning: `#B7791F`
Error: `#C14646`

Use semantic colors only for meaningful states.

### Typography

Preferred fonts:

- Plus Jakarta Sans for headings
- Inter for body text and application UI

Dashboard typography:

- Page title: 24–30px
- Section title: 17–20px
- Body: 14–16px
- Metadata: 12–13px

Maintain consistent line heights and hierarchy.

### Layout

Landing page:

- Maximum width: 1200–1280px
- Intentional section spacing
- Varied section compositions
- Responsive typography

Dashboard:

- Sidebar approximately 240–256px
- Compact top header
- Consistent content padding
- Clear page title and primary actions
- Breadcrumbs where useful

Prefer restrained borders over excessive shadows.

Use consistent spacing and border radius tokens.

---

## 11. Anti-AI-Slop Rules

The ROTEX website must NOT look like a generic AI-generated template.

Avoid:

- Random glowing orbs
- Purple/neon gradients
- Excessive glassmorphism
- Giant floating decorative cards
- Gradient text everywhere
- Overused pill badges
- Identical three-column cards in every section
- Excessive whitespace
- Unnecessary animations
- Fake statistics
- Generic motivational copy
- Meaningless decorative charts
- Random icons unrelated to content
- Heavy shadows on every element
- Inconsistent spacing
- Oversized dashboard headers

Instead use:

- Strong editorial typography
- Purposeful composition
- Clean clinical data tables
- Meaningful data visualization
- Realistic workflow content
- Subtle visual accents
- Consistent component patterns
- High-quality approved product visuals

Do not add decorative UI merely to make a page look more complex.

Every major element should support communication or interaction.

---

## 12. Component Design Rules

Use shadcn/ui as a foundation where appropriate.

Prefer reusable components.

Common components:

- AppSidebar
- AppHeader
- PageHeader
- StatCard
- DataTable
- StatusBadge
- FilterToolbar
- AppointmentCalendar
- AppointmentCard
- TherapyJournalForm
- ROMMeasurementFields
- ROMProgressChart
- EmptyState
- LoadingSkeleton
- ConfirmationDialog

### Forms

- Put labels above inputs.
- Mark required fields clearly.
- Validate with Zod on the server.
- Show understandable errors.
- Preserve user input after validation errors.
- Provide loading and disabled states.
- Make destructive actions explicit.

### Tables

- Support relevant sorting and filtering.
- Use pagination where necessary.
- Maintain readable row height.
- Align numeric values consistently.
- Show meaningful empty states.
- Do not truncate important clinical data without a way to expand it.

### Charts

- Use Recharts.
- Include accessible labels.
- Show units.
- Use consistent colors.
- Support filtering by movement and shoulder side.
- Distinguish measurements from different methods.
- Never fabricate real patient data.

---

## 13. Landing Page Rules

The landing page must explain the physical ROTEX device and the supporting web platform accurately.

Primary headline:

"Setiap derajat gerak bahu terukur, tercatat, dan terpantau."

Sections:

1. Hero
2. Tentang ROTEX
3. Fitur Alat
4. Gerakan Rehabilitasi
5. Cara Kerja
6. Monitoring & Journaling
7. Tim Pengembang
8. Footer

Do not claim the website receives measurements automatically.

Do not invent medical certifications, partnerships, or clinical validation results.

Do not use unrelated stock imagery as though it were a photograph of the actual ROTEX device.

Use approved photos, CAD renders, or clearly labeled conceptual illustrations.

---

## 14. Dashboard-Specific Rules

### Admin

Prioritize:

- User management
- Doctor-patient assignments
- Account status
- Operational scheduling

Use compact tables and useful filters.

### Doctor

Prioritize:

- Today's appointments
- Assigned patients
- Draft journals
- Patient history
- ROM recording
- Clinical evaluation

The doctor dashboard is the primary workflow benchmark.

Do not make clinical forms visually decorative at the expense of usability.

### Patient

Prioritize:

- Upcoming appointments
- Latest therapy results
- ROM history
- Finalized journals
- Doctor assessments

Use accessible and understandable language.

Avoid unnecessary clinical jargon when a simpler label is available.

---

## 15. Accessibility & Responsiveness

Target WCAG 2.2 AA practices.

Ensure:

- Keyboard accessibility
- Visible focus indicators
- Sufficient contrast
- Accessible form labels
- Legible chart information
- Screen-reader-friendly semantics
- Appropriate touch targets
- Reduced-motion support

Use responsive design throughout.

Desktop is important for doctor and admin workflows.

Mobile usability is especially important for patients.

Do not allow horizontal overflow from tables, cards, or charts.

---

## 16. Loading, Error & Empty States

Every data-driven page must handle:

- Loading
- Empty
- Error
- Success
- Unauthorized

Use skeletons for meaningful loading states.

Use clear and actionable error messages.

Do not display fake production data when real data is absent.

Do not expose internal error details or sensitive information.

---

## 17. Performance

Prefer Server Components by default.

Use Client Components only when needed for:

- Interactivity
- Local state
- Browser-dependent APIs
- Rich forms
- Charts

Avoid unnecessary client-side JavaScript.

Avoid unnecessary API requests.

Use pagination for large datasets.

Optimize images and fonts.

Do not prematurely introduce Redis, message queues, or complex caching infrastructure.

Never cache private patient data in publicly accessible caches.

---

## 18. Security & Privacy

Treat patient information as sensitive health data.

Requirements:

- Server-side authorization
- Least-privilege access
- Safe session handling
- Input validation
- Audit trails
- Protection against common web vulnerabilities
- Secure secret management
- Restricted database access
- Appropriate backup and recovery procedures

Do not log:

- Passwords
- Session tokens
- Full clinical journal contents
- Sensitive patient information unnecessarily

Prevent insecure direct object references.

Every patient resource lookup must enforce ownership or doctor assignment.

Use safe error messages that do not leak private information.

Do not expose patient data through public metadata, static generation, or shared caches.

Review applicable privacy and healthcare requirements before production deployment.

---

## 19. Testing Requirements

Test critical workflows.

### Authentication

- Patient registration
- Email verification
- Login
- Logout
- Role redirect
- Unauthorized access

### Authorization

- Patient cannot read another patient's journal
- Doctor cannot access unrelated patients
- Admin cannot edit clinical journals
- Patients cannot access drafts

### Scheduling

- Create appointment
- Detect doctor schedule conflicts
- Reschedule
- Cancel
- Mark completed/no-show

### Journaling

- Create draft
- Save measurements
- Finalize journal
- Patient visibility after finalization
- Preserve amendment history

### ROM Monitoring

- Correct filtering
- Correct movement labels
- Correct shoulder side
- Correct degree units
- Accurate historical data rendering

Do not mark features complete without checking their behavior.

---

## 20. Agent Workflow

Before coding:

1. Inspect the existing project.
2. Read relevant requirements.
3. Identify affected modules.
4. Check established patterns.
5. Plan only the necessary changes.

During coding:

1. Follow the existing architecture.
2. Reuse existing components.
3. Keep changes focused.
4. Preserve business rules.
5. Avoid unrelated refactoring.
6. Maintain accessibility and responsiveness.

After coding:

1. Review changed files.
2. Run relevant linting.
3. Run TypeScript checks.
4. Run relevant tests.
5. Check for unauthorized data exposure.
6. Verify UI consistency.
7. Summarize what changed.

Never claim tests passed unless they were actually executed.

If a command fails, report the failure clearly.

Do not hide incomplete functionality.

---

## 21. Communication Guidelines

Communicate with the project owner in Bahasa Indonesia.

When explaining implementation:

- Be concise.
- Explain important technical decisions.
- Identify relevant files.
- Mention dependencies or migrations.
- State any remaining limitations.

Do not use unnecessarily complicated terminology.

Do not modify unrelated features unless required.

Do not implement speculative functionality.

When a user explicitly requests a design-only task, do not silently create backend services or database migrations.

When a user requests implementation, produce working code rather than only mockups whenever the required environment is available.

---

## 22. Definition of Done

A feature is complete only when:

- Requirements are satisfied.
- Business rules are enforced.
- Server-side authorization is implemented.
- Input validation exists.
- Loading and error states are handled.
- UI follows the design system.
- Responsive layouts work.
- Accessibility basics are addressed.
- Relevant tests pass.
- No unrelated functionality is broken.
- Documentation is updated when necessary.

A visually polished but nonfunctional page is not considered complete.

A functional page with poor usability is also not considered complete.

---

## Final Instruction

Always develop ROTEX as a real healthcare management product, not a prototype filled with decorative UI.

The highest priorities are:

**Clinical correctness, security, usability, consistency, and maintainability.**

Build deliberately. Reuse established patterns. Keep the interface professional, simple, informative, and visually refined.
