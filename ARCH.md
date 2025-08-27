# Architecture

## Backend
- **API Gateway:** NestJS 20 (TypeScript). REST /v1 with OpenAPI 3.1, Zod DTOs, Problem+JSON errors, RBAC (Casbin), RLS enforced in DB, Idempotency-Key, Request-ID.
- **Workers (Python 3.11 + FastAPI microservices):**
  - `asr-worker`: WhisperX GPU, Vosk/Coqui CPU fallback.
  - `punct-worker`: punctuation + casing cleanup.
  - `cmd-worker`: voice command grammar & NL post-edit parsing.
  - `ner-worker`: NER for smart fields (people, orgs, dates, amounts, URLs).
  - `format-worker`: apply structure ops to sections/lists/tables.
  - `template-worker`: slot filling from templates.
  - `export-worker`: render DOCX, PDF, MDX, HTML.
  - `sync-worker`: integrations (Notion, Google Docs, Jira).
  - `probe-worker`: ffprobe media preflight.
  - `moderation-worker`: profanity/PII masking.
- **Queues/Bus:** NATS (audio.ingest, audio.asr, text.punct, doc.format, doc.export, doc.sync) or Redis Streams; Celery/RQ orchestration.
- **Datastores:** Postgres 16 + pgvector; S3/R2 for audio, transcripts, exports; Redis for sessions/jobs; optional ClickHouse for high-cardinality events.
- **Realtime:** WS gateway in NestJS; SSE fallback; WebRTC SFU (mediasoup/janus).
- **Observability:** OpenTelemetry traces/metrics/logs; Prometheus/Grafana; Sentry.
- **Security:** TLS, HSTS, encryption at rest, signed URLs, RLS for tenants, consent logs, optional HIPAA enterprise mode.

## Data Model (high-level tables)
- Orgs, Users, Memberships, API Keys
- Projects, Documents, Audio Blobs
- Transcripts, Edits
- Sections, Tables, Checklists, Entities
- Templates, Slot Values
- Integrations, Exports
- Comments, Audit Log

## Frontend
- **Framework:** Next.js 14 (React 18) deployed on Vercel.
- **UI:** Mantine UI + Tailwind utilities.
- **Editor:** TipTap for rich-text structured editing.
- **State/Data:** TanStack Query; Zustand for UI state.
- **Media:** Web Audio API + WebRTC capture; waveform visualizations.
- **Realtime:** WS client; SSE fallback.
- **Components:** Recorder, LiveTranscript, StructurePanel, SlotEditor, ExportPanel, Comments, Search.
- **Pages:** Record, Edit, Templates, Exports, Search, Dashboard.
