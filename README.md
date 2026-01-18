# CertPlanner

CertPlanner is a full-stack learning and certification planner that builds personalized roadmaps, recommends certifications, and tracks progress across web and mobile.

## What it does
- Collects user goals, skills, and time availability
- Generates AI-assisted learning roadmaps
- Recommends certifications with context
- Curates learning resources
- Tracks progress and weekly milestones

## Live links
- Web app(identical to app UI): https://certificate-planner-web.vercel.app/
- iOS (Expo app): https://expo.dev/preview/update?message=v1&updateRuntimeVersion=1.0.0&createdAt=2026-01-17T08%3A45%3A33.589Z&slug=exp&projectId=03577257-9000-4315-96e9-cb2f6b69aa05&group=447b4543-cbdc-4a70-9f8d-1ebdc9cf42a7
- Android APK download: [Certificate Planner Andriod.apk](Certificate%20Planner%20Andriod.apk)

## Mobile builds
- Android APK download: [Certificate Planner Andriod.apk](Certificate%20Planner%20Andriod.apk)
- Android APK build (EAS):
  - cd mobile
  - eas build -p android --profile preview
- iOS: open the Expo app and use the link above

## Tech stack
- Backend: Node.js, Express, PostgreSQL, OpenAI API, YouTube Data API
- Web: Next.js, React, TypeScript, Tailwind CSS, Recharts
- Mobile: React Native, Expo, TypeScript, React Navigation

## Repo structure
- backend: API server, database, and integrations
- web: Next.js web dashboard
- mobile: Expo mobile app

## Local development
- Backend: cd backend && npm install && npm run dev
- Web: cd web && npm install && npm run dev
- Mobile: cd mobile && npm install && npm start
