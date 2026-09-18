# Feedback Loop

## Implementation Details

We have successfully integrated a global feedback mechanism in Shadow Arena to gather real-time bug reports and UX suggestions from users on the Midnight Preprod network.

- **Component**: `<FeedbackModal />` is globally available on all `/` app routes via the main layout.
- **Data Model**: Uses the `Feedback` model in our Prisma schema.
- **Fields Collected**:
  - `overallRating`: 1-5 scale for quick pulse checks.
  - `whatBroke`: Freeform text for bug reporting.
  - `whatConfused`: Target UX pain points.
  - `suggestions`: General feature requests.
  - `walletAddress`: Extracted directly from the connected 1AM wallet to tie feedback to specific on-chain states.

## Future Plans

This data will be aggregated into our upcoming Admin Dashboard (Phase 3) where the team can filter bug reports by cohort and prioritize fixes based on user segment.
