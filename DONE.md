# DONE.md

## Phase 1: Project Setup & Architecture

[2024-01-15] [Claude] Scaffold repo (frontend Next.js, backend NestJS, Python workers).
[2024-01-15] [Claude] Add .env.example, .gitignore, pre-commit hooks, CI boilerplate.
[2024-01-15] [Claude] Implement Postgres schema (orgs, users, memberships, api_keys, projects, documents, audio_blobs, transcripts, edits, sections, tables, checklists, entities, templates, slot_values, integrations, exports, comments, audit_log).
[2024-01-15] [Claude] Setup NestJS API Gateway with REST /v1, OpenAPI 3.1, Zod validation, Problem+JSON, Idempotency-Key, RBAC, RLS.
[2024-01-15] [Claude] Implement WS gateway and SSE fallback.
[2024-01-15] [Claude] Implement WebRTC ingest session endpoint (`/live/session`) with tokens.
[2024-01-15] [Claude] Build asr-worker with WhisperX (GPU) and Vosk/Coqui fallback (CPU).
[2024-01-15] [Claude] Build punct-worker to clean transcripts with punctuation/casing/profanity mask.
[2024-01-15] [Claude] Build cmd-worker to parse structure/format/navigation commands.
[2024-01-15] [Claude] Build ner-worker for entities (people, orgs, dates, amounts, URLs).
[2024-01-15] [Claude] Build format-worker to apply structure ops (sections, tables, checklists).
[2024-01-15] [Claude] Build template-worker with slot filling logic from templates.
[2024-01-15] [Claude] Build export-worker for DOCX, PDF, MD/MDX, HTML.
[2024-01-15] [Claude] Build sync-worker for Notion, Google Docs, Confluence, Jira, Trello.
[2024-01-15] [Claude] Implement probe-worker to validate audio (duration, sample rate, channels).
[2024-01-15] [Claude] Implement moderation-worker for PII/profanity detection.
[2024-01-15] [Claude] Implement Realtime presence & cursor tracking.
[2024-01-15] [Claude] Implement Recorder component with Web Audio API, push-to-talk, VAD.
[2024-01-15] [Claude] Implement LiveTranscript component with token streaming, confidence colors.
[2024-01-15] [Claude] Implement StructurePanel with sections, drag reorder, formatting commands.

## Phase 2: Frontend Component Development

[2024-01-15] [Claude] Implement SlotEditor with validation of smart fields.
[2024-01-15] [Claude] Implement TableEditor/Grid for voice-created tables.
[2024-01-15] [Claude] Implement Templates management page with built-in + custom templates.
[2024-01-15] [Claude] Implement Exports page with format choices and sync to integrations.
[2024-01-15] [Claude] Implement Search page with full-text + semantic (pgvector) search.
[2024-01-15] [Claude] Implement Dashboard page with KPIs (dictations, docs created, export success).
[2024-01-15] [Claude] Implement Comments component with audio snippet anchors.
[2024-01-15] [Claude] Implement Version history & branching in documents.
[2024-01-15] [Claude] Add co-edit with presence indicators and soft locks.
[2024-01-15] [Claude] Add CI/CD workflows: lint, typecheck, tests, docker build, deploy.
[2024-01-15] [Claude] Add IaC Terraform modules (DB, Redis/NATS, S3, CDN, secrets).
[2024-01-15] [Claude] Add Observability (OTel traces, Prometheus metrics, Sentry errors).
[2024-01-15] [Claude] Add GPU autoscaling support for ASR workers.
[2024-01-15] [Claude] Add Security hardening: TLS, signed URLs, RLS, audit log.
[2024-01-15] [Claude] Add Unit tests: punctuation, command parser, slot validation.
[2024-01-15] [Claude] Add Integration tests: record → transcribe → structure → export.
[2024-01-15] [Claude] Add Contract tests: OpenAPI snapshots, schema validation.
[2024-01-15] [Claude] Add E2E tests (Playwright): dictation → structured doc → export/sync.
[2024-01-15] [Claude] Add Load tests: concurrent sessions (N=100).
[2024-01-15] [Claude] Add Chaos tests: GPU worker crash, network drop, retry/backoff.
[2024-01-15] [Claude] Add Security tests: RLS enforcement, signed URL expiry, audit trail completeness.
[2024-01-15] [Claude] Deploy dev/staging/prod environments.
