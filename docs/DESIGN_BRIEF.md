# ROTEX — Website UI/UX Design Brief v1.0

## Role & Objective

Act as a Senior Product Designer, UI/UX Engineer, and Frontend Developer with experience designing professional healthcare SaaS platforms.

Your task is to design and implement the interface for **ROTEX — Rotation Therapy Exercise**, a web platform for shoulder rehabilitation management.

The product consists of:
1. Public informational landing page.
2. Authentication and patient self-registration.
3. Admin dashboard.
4. Doctor dashboard.
5. Patient dashboard.
6. Therapy scheduling.
7. Therapy journaling and clinical assessment.
8. Range of Motion (ROM) progress visualization.

The website must feel like a real, carefully designed digital healthcare product — not a generic AI-generated dashboard or landing page.

**Design direction: Professional, minimal, refined, trustworthy, modern, and information-rich without visual clutter.**

The website's primary language is **Bahasa Indonesia**.

---

## 1. Core Design Philosophy

Apply the following principles throughout the product.

### Intentional Minimalism

Use clean layouts and controlled whitespace.

Minimalism does not mean removing useful information or leaving large empty sections. Every page should contain purposeful content, meaningful hierarchy, and functional elements.

A page should feel structured, not sparse.

### Professional Healthcare Aesthetic

The product should communicate:
- Clinical credibility.
- Clarity and reliability.
- Precision and attention to detail.
- Calmness and accessibility.
- Modern medical technology.

Avoid making the product look like a futuristic AI startup, cryptocurrency dashboard, or generic corporate template.

### Information-First Design

Prioritize readability, structured data, and practical workflows.

Doctors should be able to quickly locate patients, review their history, record therapy results, and manage appointments.

Patients should easily understand their therapy progress, upcoming appointments, and completed clinical journals.

### Visual Restraint

Use a coherent visual system with subtle accents.

Do not rely on excessive gradients, floating decorations, random illustrations, or animation to make the interface interesting.

Visual richness should come from typography, layout composition, meaningful data, diagrams, photography, and thoughtful detailing.

---

## 2. Visual Identity

### Primary Colors

- Primary green: `#176B50`
- Primary hover: `#11543E`
- Secondary blue: `#26759B`
- Dark heading: `#152B30`
- Body text: `#435760`
- Muted text: `#74858B`
- Application background: `#F7F9F8`
- Main surface: `#FFFFFF`
- Subtle border: `#E3EAE7`

### Semantic Colors

- Success: `#17805D`
- Warning: `#B7791F`
- Error: `#C14646`
- Info: `#26759B`

Use semantic colors only for statuses and meaningful feedback.

Avoid coloring every card or section.

### Color Distribution

Use neutral backgrounds for most of the interface.

Green should primarily appear in:
- Primary buttons.
- Active navigation.
- Important links.
- Selected states.
- Brand elements.

Blue should appear in:
- ROM visualization.
- Secondary highlights.
- Supporting information.

Use subtle tinted backgrounds rather than large, saturated color panels.

---

## 3. Typography

Use:
- Heading font: Plus Jakarta Sans.
- Body font: Inter.

Typography must create clear visual hierarchy.

### Landing Page

- Hero heading: 56–72px desktop, 36–44px mobile.
- Section headings: 32–44px.
- Main paragraph: 16–18px.
- Supporting text: 14–16px.

### Dashboard

- Page title: 24–30px.
- Section title: 17–20px.
- Card title: 14–16px.
- Body text: 14px.
- Table text: 13–14px.
- Metadata: 12–13px.

Use font weights intentionally.

Avoid excessive uppercase text, very thin fonts, and unnecessary typographic decoration.

---

## 4. Layout System

Use a consistent layout grid and spacing scale.

### Landing Page

- Maximum content width: 1200–1280px.
- Horizontal padding desktop: 32–48px.
- Horizontal padding mobile: 20–24px.
- Section spacing desktop: approximately 80–112px.
- Section spacing mobile: 48–64px.

Use varied section compositions to establish rhythm.

Not every section should consist of a centered heading followed by three identical cards.

### Application Dashboard

Use:
- Left navigation sidebar.
- Top header.
- Main content area.
- Consistent page titles.
- Breadcrumbs when necessary.
- Clear primary page action.

Recommended sidebar width: 240–256px.

The dashboard must be information-efficient without feeling overcrowded.

Use a responsive sidebar drawer on smaller screens.

---

## 5. Landing Page Design

The landing page must introduce ROTEX as a real medical engineering innovation.

### Navigation

Logo ROTEX on the left.

Navigation:
- Beranda
- Tentang ROTEX
- Fitur
- Cara Kerja
- Tim Pengembang

Actions:
- Masuk
- Daftar sebagai Pasien

Use a clean sticky header with subtle border and restrained styling.

### Hero Section

Primary headline:

"Setiap derajat gerak bahu terukur, tercatat, dan terpantau."

Visually emphasize selected words using brand green and blue, but do not overuse colored typography.

Supporting paragraph:

"ROTEX merupakan inovasi alat rehabilitasi bahu dengan penyesuaian tinggi otomatis dan pengukuran Range of Motion (ROM), didukung platform digital untuk pencatatan terapi dan pemantauan perkembangan pasien."

Primary CTA: "Masuk ke Dashboard"

Secondary CTA: "Kenali ROTEX"

Include a meaningful visual area containing actual product photography, an approved 3D render, or a carefully designed product illustration.

Do not generate or display misleading medical equipment imagery and present it as the actual ROTEX device.

### About ROTEX

Use an asymmetric two-column layout.

Include:
- Description of the rehabilitation device.
- Problems it aims to solve.
- Benefits for rehabilitation documentation.
- Context of its development.

Use a product image or relevant technical illustration.

### Product Features

Explain:
1. Auto Height Adjustment.
2. Four Shoulder Movements.
3. ROM Measurement.
4. Digital Therapy Journaling.
5. Progress Monitoring.

Use a combination of product visuals, annotated diagrams, and compact feature blocks.

Do not create five identical gradient cards.

### Supported Shoulder Movements

Explain:
- Flexion.
- Extension.
- Abduction.
- Adduction.

Use accurate anatomical diagrams, simple directional illustrations, or meaningful visual references.

Do not include internal/external rotation as supported ROTEX movements.

### How ROTEX Works

Use a simple numbered process:

1. Patient receives examination and therapy guidance.
2. Patient performs rehabilitation using the ROTEX device.
3. Doctor records measurement results on the website.
4. Doctor evaluates the therapy session.
5. Patient reviews their therapy journal and progress.

This is a manually documented process. Do not depict automatic device-to-website data synchronization.

### Digital Monitoring Preview

Present an attractive interface preview showing:
- Therapy journals.
- ROM progress graphs.
- Therapy schedules.
- Patient history.

Use plausible mock data and clearly treat it as illustrative.

### Development Team

Include the official ROTEX development team and institutional affiliation.

Use real team photos only if supplied or approved.

Avoid inventing team members, professional credentials, institutional partnerships, or product certifications.

### Footer

Use a structured footer with product information, navigation, contact details where available, and a privacy policy link.

---

## 6. Authentication Pages

Design login and registration pages with a clean, professional interface.

Prefer a restrained split-screen layout on desktop.

One side may contain:
- ROTEX brand identity.
- A concise product statement.
- Subtle product imagery.

The other side contains the authentication form.

Do not use oversized floating abstract shapes, excessive gradients, or generic motivational slogans.

### Login

Fields:
- Email.
- Password.

Actions:
- Login.
- Forgot password.
- Register as patient.

Users are redirected based on role.

Do not ask users to manually select an Admin, Doctor, or Patient role during login.

### Patient Registration

Fields:
- Full name.
- Email.
- Password.
- Confirm password.
- Privacy consent.

Only the Patient role can register publicly.

Doctor accounts are created by administrators.

---

## 7. Admin Dashboard

The admin interface should resemble a mature SaaS administration platform.

### Main Navigation

- Overview.
- Manajemen Dokter.
- Manajemen Pasien.
- Penugasan Pasien.
- Jadwal Terapi.
- Pengaturan.

### Dashboard Overview

Display:
- Total doctors.
- Total patients.
- Active accounts.
- Upcoming appointments.
- Recent administrative activity.

Use compact statistic cards with meaningful icons.

Avoid oversized numbers that consume too much vertical space.

### Data Tables

Tables should support:
- Search.
- Pagination.
- Filters.
- Status indicators.
- Row actions.
- Loading states.
- Empty states.

Use thin borders, subtle dividers, aligned columns, and clear typography.

Admin does not edit clinical journals or diagnoses.

---

## 8. Doctor Dashboard

This should be the most workflow-oriented area of the application.

### Main Navigation

- Overview.
- Pasien Saya.
- Jadwal Terapi.
- Jurnal Terapi.
- Monitoring ROM.
- Profil.

### Doctor Overview

Display:
- Total assigned patients.
- Today's appointments.
- Draft journals.
- Recent therapy sessions.

The main area should prioritize today's schedule and patients requiring attention.

Avoid displaying generic statistics without actionable context.

### Patient Detail

Organize patient information using clear sections or tabs:
- Overview.
- Riwayat Terapi.
- Pengukuran ROM.
- Evaluasi Klinis.
- Jadwal.

### Therapy Journaling

Use a structured multi-section form, not one extremely long unorganized form.

Suggested sections:
1. Informasi Sesi.
2. Kondisi dan Keluhan.
3. Pengukuran ROM.
4. Observasi dan Evaluasi.
5. Diagnosis / Assessment.
6. Rencana Tindak Lanjut.

For ROM measurements, support:
- Shoulder side.
- Movement type.
- Active/passive mode.
- Measurement method.
- ROM value in degrees.
- Duration.
- Repetitions.

One therapy session may contain multiple ROM measurements.

Provide clear actions:
- Simpan Draft.
- Finalisasi Jurnal.

Finalizing a journal makes the entire journal visible to the relevant patient.

Show appropriate confirmation before finalization.

### Therapy Scheduling

Design a clear calendar and appointment list.

Include:
- Day/week calendar views.
- Appointment detail.
- Create appointment.
- Reschedule.
- Cancel.
- Completed/no-show states.

Use semantic status colors sparingly.

Avoid excessive event decorations.

### ROM Monitoring

Provide:
- Historical line charts.
- Movement filters.
- Shoulder-side filters.
- Date range filters.
- First and latest measurements.
- Links to the source therapy sessions.

Never use the chart itself to automatically diagnose a medical condition.

---

## 9. Patient Dashboard

The patient dashboard must be simpler than the doctor dashboard.

The primary audience may include individuals recovering from stroke or experiencing limited physical mobility.

Prioritize clear language, legible text, and straightforward navigation.

### Main Navigation

- Beranda.
- Jadwal Terapi.
- Riwayat Terapi.
- Perkembangan ROM.
- Catatan Dokter.
- Profil Saya.

### Patient Overview

Show:
- Welcome message.
- Next appointment.
- Latest completed therapy session.
- Recent ROM results.
- Progress graph.
- Latest doctor evaluation.

Avoid unnecessary medical jargon.

The interface should not make unsupported claims about recovery percentages or automatically label a patient as clinically recovered.

### Therapy Journal Detail

Display all sections of a finalized doctor's journal in a readable format.

Clearly differentiate:
- Measurement results.
- Clinical observations.
- Doctor assessments.
- Follow-up instructions.

Draft journals must not appear in the patient dashboard.

### Empty States

Provide meaningful states for patients who:
- Have just registered.
- Have not been assigned to a doctor.
- Have no appointments.
- Have no therapy history.
- Do not yet have ROM measurements.

Do not populate real patient accounts with fake therapy data.

---

## 10. Component Design System

Create reusable components rather than styling each page independently.

### Essential Components

- AppSidebar
- AppHeader
- PageHeader
- Breadcrumbs
- StatCard
- DataTable
- StatusBadge
- SearchInput
- FilterToolbar
- DateRangePicker
- AppointmentCard
- AppointmentCalendar
- PatientCard
- TherapyJournalForm
- ROMMeasurementFields
- ROMProgressChart
- EmptyState
- LoadingSkeleton
- ConfirmationDialog
- FeedbackToast

### Component Characteristics

Buttons:
- Clear primary, secondary, and destructive variants.
- Comfortable click targets.
- Consistent height.
- Subtle hover and focus states.

Cards:
- White background.
- Subtle border.
- Modest radius.
- Minimal shadows.

Forms:
- Labels above fields.
- Clear required indicators.
- Inline validation messages.
- Descriptive helper text when necessary.
- Visible save and cancel actions.

Tables:
- Practical row height.
- Consistent spacing.
- Strong alignment.
- Clearly differentiated row actions.

Use Lucide icons consistently.

Avoid mixing unrelated icon families.

---

## 11. Anti-AI-Slop Design Rules

The following patterns are explicitly prohibited unless there is a genuine functional reason.

1. Excessive purple, cyan, or neon gradients.
2. Giant floating glassmorphism cards.
3. Random glowing orbs in the background.
4. Overused pill-shaped labels.
5. Identical three-column feature cards repeated across every section.
6. Arbitrary gradient text on headings.
7. Excessive shadows and blurred backgrounds.
8. Generic abstract illustrations unrelated to rehabilitation.
9. Unnecessary charts or fake metrics added merely to fill space.
10. Large empty areas with no clear purpose.
11. Floating elements without structural meaning.
12. Too many different border radii.
13. Excessive animation on every scroll.
14. Unnecessary promotional language in clinical workflows.
15. Dashboard cards that display decorative information but provide no useful action.

Instead, create visual interest through:
- Strong typography.
- Editorial compositions.
- High-quality product visuals.
- Meaningful clinical data.
- Carefully designed tables.
- Purposeful iconography.
- Subtle color contrast.
- Clear section hierarchy.
- Consistent spacing.
- Realistic workflow content.

The result should feel like a polished healthcare product built by an experienced design team.

---

## 12. Interaction & Motion

Use subtle microinteractions.

Recommended:
- Hover transitions: approximately 150–200ms.
- Dialog entrance animations.
- Sidebar transitions.
- Skeleton loading.
- Clear button loading states.
- Smooth but restrained chart transitions.

Avoid large parallax animations, excessive scroll-triggered motion, or elements that continuously move.

Respect reduced-motion preferences.

---

## 13. Responsive Design

Design desktop-first for doctor and admin workflows, but ensure all essential workflows remain usable on mobile.

Breakpoints should support:
- Mobile.
- Tablet.
- Laptop.
- Desktop.

On mobile:
- Convert sidebar into drawer navigation.
- Stack dashboard cards intelligently.
- Preserve readable tables using appropriate responsive patterns.
- Keep primary actions visible.
- Avoid horizontal overflow.
- Use comfortable form controls.

The patient dashboard should receive special attention on mobile.

---

## 14. Accessibility & Usability

Target WCAG 2.2 AA accessibility practices.

Ensure:
- Sufficient text contrast.
- Accessible keyboard navigation.
- Visible focus indicators.
- Proper input labels.
- Screen-reader-friendly semantics.
- Adequate touch targets.
- Non-color-only status indicators.
- Understandable error messages.
- Legible charts with accompanying text values.

Prioritize accessibility for older patients and patients with physical limitations.

---

## 15. Recommended Frontend Stack

- Next.js with App Router.
- TypeScript.
- Tailwind CSS v4.
- shadcn/ui.
- Lucide Icons.
- Recharts.
- React Hook Form.
- Zod.

Use the existing project architecture and dependencies if already established.

Do not introduce unnecessary frameworks or complex frontend abstractions.

Implement a maintainable, component-driven design system.

---

## 16. Implementation Expectations

Before creating pages:

1. Define design tokens.
2. Define typography scale.
3. Establish spacing and grid rules.
4. Create reusable foundational components.
5. Create public and dashboard layouts.
6. Create representative page wireframes.
7. Implement pages with realistic content.
8. Review responsive behavior.
9. Review interaction states.
10. Check visual consistency.

Do not build the entire interface as a single large component.

Organize the code by features and shared UI components.

Keep mock data separate from presentation components.

Do not claim features are connected to a backend unless they actually are.

---

## 17. Quality Bar

Evaluate the finished interface against these questions:

- Does the website look credible for a healthcare-related product?
- Is the information hierarchy immediately understandable?
- Can a doctor find and record therapy information quickly?
- Can a patient understand their progress without training?
- Does the landing page explain ROTEX clearly?
- Are the dashboard layouts consistent?
- Is whitespace used intentionally rather than excessively?
- Do all cards and interface elements have a meaningful purpose?
- Are loading, empty, error, and success states handled?
- Does the design remain professional on both desktop and mobile?

Do not consider the implementation finished merely because all pages render.

**Final objective:** Produce a clean, distinctive, production-quality healthcare website with thoughtful visual design, strong usability, and clear clinical workflows.

The aesthetic benchmark should be a premium, mature SaaS product — simple but not empty, detailed but not cluttered, and modern without looking artificially generated.
