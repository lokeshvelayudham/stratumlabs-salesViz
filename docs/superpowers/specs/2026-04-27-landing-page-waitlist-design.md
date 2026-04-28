# Landing Page Waitlist Design

## Problem
The project needs a focused landing page that targets SMB founders/executives and drives **waitlist signups** with a bold, aggressive voice aligned to company positioning.

## Goals
- Maximize waitlist conversion from a single page experience.
- Keep implementation aligned with existing shadcn/tailwind styling patterns.
- Reuse one waitlist submission flow across all CTA locations.

## Non-Goals
- Shipping finalized production social proof content.
- Building a multi-page marketing site.
- Introducing a separate design system.

## Information Architecture
The landing page is a single dedicated route composed of reusable sections in this order:

1. **Hero**: high-impact headline, subheadline, primary waitlist CTA.
2. **Social Proof**: placeholder logos and short testimonials.
3. **How It Works**: 3-step explanation of the autonomous sales loop.
4. **Final CTA**: repeated waitlist conversion block.

## Components
- **LandingPageShell**: route-level composition container.
- **HeroSection**: value proposition + waitlist form trigger.
- **SocialProofSection**: placeholder trust signals.
- **HowItWorksSection**: three clear process steps.
- **FinalCtaSection**: repeated conversion prompt.
- **WaitlistForm** (shared): used in hero and final CTA to ensure consistent behavior and messaging.

## Data Flow
Both CTA locations invoke the same waitlist submission path:

1. User enters email and submits.
2. Client validates input format and required fields.
3. Submission is sent to server action/API.
4. Server writes to waitlist storage.
5. UI returns one of:
   - success confirmation state,
   - duplicate-email response,
   - explicit failure with retry path.

## Error Handling
- Invalid email: inline validation message before submit.
- Duplicate email: deterministic "already on waitlist" response.
- Submission/network failure: explicit error copy and retry action.
- Form input should be preserved on failure to reduce re-entry friction.

## UX and Content Direction
- Tone: **bold and aggressive** (matching current company voice).
- Visual style: stay in existing shadcn/tailwind system, but with stronger hierarchy, contrast, and CTA emphasis.
- Keep section copy concise and conversion-focused.

## Testing Strategy
- Component-level tests for section rendering order and CTA presence.
- Form validation tests for invalid/valid input behavior.
- Integration tests for successful signup, duplicate email, and failure/retry states.

## Open Content Placeholders
- Social proof logos and testimonial content will be placeholders in first implementation and swapped later.

