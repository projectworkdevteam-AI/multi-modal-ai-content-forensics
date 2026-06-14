# Multi-Modal AI Content Forensics Platform
## Software Engineering Blueprint — Sections 9–14

**Document Version:** 1.0
**Type:** Internal Architecture & Engineering Reference
**Scope:** Sections 9–14 of 14
**Target Audience:** Development Team, Faculty Supervisor, External Examiners
**Continuation of:** Sections 1–8

---

## SECTION 9 — IMPLEMENTATION ROADMAP

> **Format:** 24-week roadmap for a 2-student team. Each week block lists: tasks, deliverables, dependencies, risk, and estimated effort. Phases are cumulative — never skip a phase.

---

### 9.1 Roadmap Overview

```
PHASE 1: Foundation          Weeks 01–04  ████████████████
PHASE 2: Text Modality       Weeks 05–08  ████████████████
PHASE 3: Image Modality      Weeks 09–12  ████████████████
PHASE 4: Audio Modality      Weeks 13–16  ████████████████
PHASE 5: Fusion & Reporting  Weeks 17–20  ████████████████
PHASE 6: Evaluation & Polish Weeks 21–24  ████████████████
```

---

### 9.2 Phase 1 — Foundation & Infrastructure (Weeks 1–4)

---

#### Week 1 — Repository Setup & Docker Scaffolding

| Field | Detail |
|---|---|
| **Goal** | Zero-to-running local environment with all containers healthy |
| **Student A Tasks** | Create GitHub repo, branch strategy (main/dev/feature/*). Set up Docker Compose with postgres, redis, rabbitmq, minio containers. Write `.env.example`. Configure `Makefile` (make up / down / logs). |
| **Student B Tasks** | Scaffold Next.js 14 frontend (App Router). Create FastAPI gateway skeleton with `/health` endpoint. Set up GitHub Actions CI for linting only. |
| **Deliverables** | `docker-compose up` brings all infra containers healthy. `/health` returns 200. Next.js shows placeholder page. |
| **Dependencies** | Docker Desktop installed. GitHub org created. |
| **Risk** | Docker networking conflicts on Windows WSL2 — allocate 4h buffer for port conflicts |
| **Effort** | Student A: 20h / Student B: 18h |

---

#### Week 2 — Database Schema & Alembic Migrations

| Field | Detail |
|---|---|
| **Goal** | All 8 database tables created via Alembic migrations |
| **Student A Tasks** | Write all SQLAlchemy ORM models (Section 8.5). Write Alembic migration files 001–008 in order. Run `alembic upgrade head`. Verify all indexes created via `\d+ table_name` in psql. |
| **Student B Tasks** | Write shared Pydantic DTOs (Section 8.6). Create `shared/` Python package with `pyproject.toml` for editable install. Configure GitHub Actions to run `alembic check` on every PR. |
| **Deliverables** | All 8 tables verified in PostgreSQL. `alembic current` shows head. CI fails if migrations are not up to date. |
| **Dependencies** | Week 1 complete. PostgreSQL container healthy. |
| **Risk** | Enum type conflicts on re-runs — add `IF NOT EXISTS` guards |
| **Effort** | Student A: 22h / Student B: 16h |

---

#### Week 3 — Auth Service & JWT Flow

| Field | Detail |
|---|---|
| **Goal** | Complete working authentication flow: register → login → get protected resource |
| **Student A Tasks** | Build auth-service FastAPI app: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`. Implement bcrypt hashing, JWT generation, refresh token storage in Redis. Write unit tests for all auth functions. |
| **Student B Tasks** | Integrate auth into API Gateway middleware. Create `GET /api/v1/auth/me` endpoint. Build Next.js login/register pages with form validation. Implement token storage in `httpOnly` cookie. |
| **Deliverables** | User can register, log in, receive JWT, and access a protected route. Expired token returns 401. Logout invalidates refresh token. 12 unit tests passing. |
| **Dependencies** | Week 2 complete. Redis container healthy. |
| **Risk** | CORS configuration for Next.js ↔ FastAPI — allocate 4h |
| **Effort** | Student A: 24h / Student B: 22h |

---

#### Week 4 — MinIO Storage & RabbitMQ Queue Scaffolding

| Field | Detail |
|---|---|
| **Goal** | File upload pipeline working end-to-end. Queue publish/consume cycle verified. |
| **Student A Tasks** | Implement `StorageService` (MinIO upload/download/presign). Implement `QueueService` (publish to queues). Write `POST /api/v1/detect/image` endpoint that: validates MIME, uploads to MinIO, creates job in DB, publishes to queue, returns 202. |
| **Student B Tasks** | Build the Next.js file `UploadDropzone` component (react-dropzone). Display job ID and status after upload. Implement `GET /api/v1/jobs/{id}` polling. Build `JobStatusCard` component that auto-refreshes every 3 seconds. |
| **Deliverables** | File upload → MinIO object stored → Job row in DB → Message in RabbitMQ queue. Frontend shows job polling. Detection stub consumer logs the message. |
| **Dependencies** | Weeks 1–3 complete. MinIO and RabbitMQ containers healthy. |
| **Risk** | `python-magic` requires libmagic system library in Docker — add to Dockerfile |
| **Effort** | Student A: 26h / Student B: 24h |

---

### 9.3 Phase 2 — Text Detection Modality (Weeks 5–8)

---

#### Week 5 — RAID Dataset Preparation & DeBERTa Fine-Tuning

| Field | Detail |
|---|---|
| **Goal** | Fine-tuned DeBERTa-v3-base checkpoint ready for integration |
| **Student A Tasks** | Download RAID dataset from HuggingFace (100K subset). Write `scripts/prepare_raid.py` — filter to English, balance classes (50K human / 50K AI), train/val/test split (80/10/10). Write `scripts/finetune_deberta.py` using HuggingFace Trainer API. Run fine-tuning on Google Colab Pro A100 (~2h). Save checkpoint to `models/deberta_v3_raid_v1.2/`. |
| **Student B Tasks** | Write training evaluation script: compute F1, AUROC, precision, recall. Generate confusion matrix. Save all metrics to `results/text_training_metrics.json`. Document hyperparameters (lr=2e-5, batch=16, epochs=4). |
| **Deliverables** | Fine-tuned model checkpoint. Validation F1 ≥ 0.85 on RAID val split. Training metrics report. |
| **Dependencies** | Google Colab Pro or Vast.ai A100 access. RAID dataset downloaded. |
| **Risk** | OOM on Colab A100 if batch size too large — use gradient_accumulation_steps=4 |
| **Cloud Cost** | ~$8 (Colab Pro compute unit budget) |
| **Effort** | Student A: 20h / Student B: 14h |

---

#### Week 6 — Text Detection Service Implementation

| Field | Detail |
|---|---|
| **Goal** | text-service container running DeBERTa inference end-to-end |
| **Student A Tasks** | Implement `TextDetector` class (Section 8.9). Load model at startup using FastAPI lifespan event. Implement `POST /internal/detect` synchronous endpoint. Add preprocessing: tokenisation, 512-token truncation, sentence-boundary detection. Handle CUDA/CPU fallback. |
| **Student B Tasks** | Implement `SHAPTextExplainer`: initialise `shap.Explainer` once at startup with `masker=shap.maskers.Text(tokenizer)`. Generate top-20 token attributions per request. Build HTML heatmap renderer (inline CSS coloured spans). |
| **Deliverables** | Text detection returns JSON with `ai_probability`, `confidence_score`, `verdict`. SHAP heatmap generated. Unit tests: 8 passing (including edge cases: empty text, non-English, truncation). |
| **Dependencies** | Week 5 checkpoint in `/models/`. |
| **Risk** | SHAP initialisation takes 30–60s the first time — init at startup, not per-request |
| **Effort** | Student A: 24h / Student B: 22h |

---

#### Week 7 — Text API Integration & Frontend Visualization

| Field | Detail |
|---|---|
| **Goal** | User can submit text via dashboard and see results with token heatmap |
| **Student A Tasks** | Wire Gateway `POST /api/v1/detect/text` to call text-service synchronously (httpx). Store result in `detection_results` table. Store explanation in `explanations` table. Return completed job response directly (no polling needed for text). |
| **Student B Tasks** | Build `TextResultVisualization` React component. Render token heatmap from `html_heatmap` field. Build bar chart (Recharts) for top AI-indicator tokens and their attribution scores. Add confidence meter UI component. |
| **Deliverables** | Full end-to-end: text input → submit → result + heatmap displayed within 3 seconds. |
| **Dependencies** | Weeks 5–6 complete. |
| **Risk** | Large SHAP heatmaps (>100 tokens) may be slow to render — paginate or truncate display |
| **Effort** | Student A: 18h / Student B: 20h |

---

#### Week 8 — Text Modality Evaluation & Cross-Dataset Testing

| Field | Detail |
|---|---|
| **Goal** | Documented evaluation results for text modality |
| **Student A Tasks** | Download M4 English test set. Run text-service against M4 test samples (1,000 samples). Record F1, AUROC, precision, recall. Compare performance: RAID in-distribution vs M4 cross-domain. Write `results/text_cross_dataset_evaluation.md`. |
| **Student B Tasks** | Write 5 integration tests covering: normal text, AI text from GPT-4, paraphrased AI text, non-English input, text at exact 10,000 char limit. Set up test fixtures in `tests/conftest.py`. |
| **Deliverables** | Cross-dataset evaluation report. 5 integration tests passing. |
| **Dependencies** | Week 7 complete. M4 dataset downloaded. |
| **Risk** | M4 performance significantly lower than RAID val — expected, document gap clearly |
| **Effort** | Student A: 16h / Student B: 18h |

---

### 9.4 Phase 3 — Image Detection Modality (Weeks 9–12)

---

#### Week 9 — Model Download & Image Preprocessing Pipeline

| Field | Detail |
|---|---|
| **Goal** | Both image models loaded, preprocessing pipeline verified |
| **Student A Tasks** | Clone CNNDetection repo. Download ResNet-50 weights (`blur_jpg_prob0.5.pth`). Clone DMimageDetection repo. Download Corvi EfficientNet-B0 weights. Write `ImagePreprocessor` class: PIL load, RGBA→RGB, Grayscale→RGB, resize to 224×224, ImageNet normalization. Write `FrequencyPreprocessor` class: 2D FFT, high-pass filter, log-magnitude. |
| **Student B Tasks** | Download CIFAKE (500MB). Write `scripts/verify_image_models.py` — run both models on 100 CIFAKE samples, verify scores are in [0,1] range, measure inference time. Write results summary. |
| **Deliverables** | Both models produce valid scores. ResNet-50 < 100ms/image. Corvi < 200ms/image. CIFAKE quick-test passes. |
| **Dependencies** | Phase 2 complete. GPU available locally or Colab. |
| **Risk** | Corvi FFT preprocessing requires exact normalization constants — verify against paper |
| **Effort** | Student A: 22h / Student B: 18h |

---

#### Week 10 — Image Detection Service & GradCAM

| Field | Detail |
|---|---|
| **Goal** | image-service container producing ensemble scores and GradCAM heatmaps |
| **Student A Tasks** | Implement `ImageDetector` class with ensemble scoring. Implement async consumer from `forensics.image.detect` queue. Download file from MinIO. Run both models. Compute ensemble: `0.55 × P_resnet + 0.45 × P_corvi`. Compute confidence from score divergence. Upload result to DB. |
| **Student B Tasks** | Implement GradCAM using `pytorch-grad-cam` library: target layer = `model.layer4[-1]` for ResNet-50. Generate heatmap PNG. Overlay on original image with `alpha=0.5` colormap. Upload overlay PNG to MinIO. Store `artifact_object_key` in `explanations` table. |
| **Deliverables** | Image detection pipeline end-to-end. GradCAM heatmap stored in MinIO. Ensemble score in DB. |
| **Dependencies** | Week 9 complete. |
| **Risk** | GradCAM target layer name differs between model versions — verify layer name programmatically |
| **Effort** | Student A: 24h / Student B: 22h |

---

#### Week 11 — Image Frontend & Heatmap Visualization

| Field | Detail |
|---|---|
| **Goal** | User uploads image, sees result with side-by-side GradCAM overlay |
| **Student A Tasks** | Wire Gateway `POST /api/v1/detect/image` to async flow. Implement presigned URL generation for heatmap. Return `heatmap_url` in job result response. |
| **Student B Tasks** | Build `HeatmapViewer` React component: side-by-side original and heatmap overlay. Add opacity slider (0–100%) to toggle heatmap intensity. Display `model_ensemble` breakdown (ResNet vs Corvi individual scores) in expandable panel. |
| **Deliverables** | Image upload → async processing → frontend displays heatmap within polling cycle. Opacity slider works. |
| **Dependencies** | Week 10 complete. |
| **Risk** | Presigned URL expiry — set to 3600s; refresh on dashboard revisit |
| **Effort** | Student A: 14h / Student B: 22h |

---

#### Week 12 — Image Evaluation & AUC Benchmarking

| Field | Detail |
|---|---|
| **Goal** | Documented AUC results across CIFAKE and GenImage subset |
| **Student A Tasks** | Download GenImage 3-generator subset (30GB). Run image-service on 500 CIFAKE samples + 500 GenImage samples. Compute AUC separately for: ResNet-50 alone, Corvi alone, ensemble. Plot ROC curves (matplotlib). Save to `results/image_evaluation.png`. |
| **Student B Tasks** | Write 6 integration tests: JPEG, PNG, WebP, RGBA input, corrupted file (expects 422), oversized file (expects 413). |
| **Deliverables** | ROC curve plot. Ensemble AUC ≥ individual model AUC. 6 integration tests passing. |
| **Dependencies** | Week 11 complete. GenImage subset downloaded. |
| **Risk** | GenImage subset download may take 8–12h on slow connection — start download in Week 11 |
| **Effort** | Student A: 20h / Student B: 16h |

---

### 9.5 Phase 4 — Audio Detection Modality (Weeks 13–16)

---

#### Week 13 — ASVspoof Dataset & AASIST Setup

| Field | Detail |
|---|---|
| **Goal** | AASIST model running on ASVspoof 2019 LA data, baseline EER verified |
| **Student A Tasks** | Download ASVspoof 2019 LA (14GB) from Edinburgh DataShare. Clone AASIST repo. Run official evaluation script on ASVspoof 2019 LA eval set. Verify EER ≈ 0.83%. Write `AudioPreprocessor`: load WAV/MP3/FLAC via torchaudio, resample to 16kHz mono, pad/truncate to 64,600 samples. |
| **Student B Tasks** | Download In-the-Wild dataset (4GB). Write `scripts/verify_aasist.py` — test AASIST on 50 bonafide + 50 spoof samples from ASVspoof, log EER. Document: what does the AASIST graph attention output mean? Write a 1-page technical note. |
| **Deliverables** | AASIST running. Verified EER ≤ 1.0% on ASVspoof LA eval. Audio preprocessing pipeline verified on MP3, WAV, FLAC. |
| **Dependencies** | Edinburgh DataShare access approved. 20GB free disk space. |
| **Risk** | torchaudio FFmpeg backend version conflicts — pin `torchaudio==2.1.0` in requirements.txt |
| **Effort** | Student A: 20h / Student B: 16h |

---

#### Week 14 — Audio Detection Service Implementation

| Field | Detail |
|---|---|
| **Goal** | audio-service container processing audio jobs from RabbitMQ |
| **Student A Tasks** | Implement `AudioDetector` class. Implement async consumer from `forensics.audio.detect` queue. Full pipeline: download from MinIO → `AudioPreprocessor` → AASIST inference → sigmoid probability → update DB. Handle edge cases: silent audio, very short clips, non-speech. |
| **Student B Tasks** | Implement spectrogram visualization: `librosa.feature.melspectrogram` → `librosa.display.specshow` → matplotlib savefig to PNG buffer → upload to MinIO. Annotate spectrogram with frequency-band anomaly markers if score > 0.6. |
| **Deliverables** | Audio job processed end-to-end. EER logged for test batch. Spectrogram PNG stored in MinIO. |
| **Dependencies** | Week 13 complete. |
| **Risk** | librosa + soundfile + torchaudio version conflicts — test in clean venv first |
| **Effort** | Student A: 26h / Student B: 22h |

---

#### Week 15 — Audio Frontend & Async UX

| Field | Detail |
|---|---|
| **Goal** | User uploads audio, polling UI shows progress, result displayed with spectrogram |
| **Student A Tasks** | Wire Gateway `/detect/audio` endpoint. Implement async polling response for audio jobs. Add `estimated_completion_seconds: 30` in `JobCreatedResponse`. |
| **Student B Tasks** | Build `AudioResultVisualization` component. Display mel-spectrogram image. Add audio playback widget (`<audio>` HTML5 element via presigned URL). Show processing progress bar with estimated time countdown. |
| **Deliverables** | Audio upload → 202 response → polling → spectrogram + score displayed. |
| **Dependencies** | Week 14 complete. |
| **Risk** | Large audio files may need chunked upload via multipart — add server-side streaming if needed |
| **Effort** | Student A: 14h / Student B: 20h |

---

#### Week 16 — Audio Cross-Dataset Evaluation

| Field | Detail |
|---|---|
| **Goal** | Cross-dataset EER measured on In-the-Wild dataset |
| **Student A Tasks** | Run AASIST on 500 samples from In-the-Wild dataset. Compute EER (in-the-wild expected: 15–20%). Compare against ASVspoof 2019 LA EER (0.83%). Document the generalization gap. Write `results/audio_evaluation.md`. |
| **Student B Tasks** | Write 5 integration tests: WAV, MP3, FLAC, silent file (expects low AI score), <1s clip (expects 422). |
| **Deliverables** | Cross-dataset evaluation documented. Generalization gap acknowledged in methodology. 5 tests passing. |
| **Dependencies** | Week 15 complete. In-the-Wild dataset downloaded. |
| **Risk** | EER > 20% on in-the-wild — expected; frame as a limitation, not a failure |
| **Effort** | Student A: 16h / Student B: 16h |

---

### 9.6 Phase 5 — Fusion Layer, Reports & System Integration (Weeks 17–20)

---

#### Week 17 — Fusion Engine & Multimodal Endpoint

| Field | Detail |
|---|---|
| **Goal** | `POST /detect/multimodal` returns a single fused verdict across all submitted modalities |
| **Student A Tasks** | Implement `FusionEngine` class. Run calibration script on a synthetic multimodal test set (manually constructed 100 samples). Save calibrated weights to `config/fusion_weights.json`. Implement multimodal job orchestration in Gateway: fan-out to multiple queues, wait for all results, run fusion, write `fusion_results` table. |
| **Student B Tasks** | Build `MultiModalResultDashboard` component. Show each modality score in a radar chart (Recharts `RadarChart`). Show fusion score prominently. Color-code verdict badge. |
| **Deliverables** | Multimodal endpoint returns fused result. Calibration weights saved. Radar chart displayed. |
| **Dependencies** | Phases 2–4 complete. All detection services running. |
| **Risk** | Fan-out timeout if one modality service is slow — implement per-modality timeout (60s) |
| **Effort** | Student A: 26h / Student B: 22h |

---

#### Week 18 — Report Service & PDF Generation

| Field | Detail |
|---|---|
| **Goal** | Downloadable PDF report generated for every completed job |
| **Student A Tasks** | Implement `ReportGenerator` class. Write Jinja2 HTML templates for all 5 report pages. Write report CSS (WeasyPrint-compatible). Wire `POST /internal/report/generate/{job_id}` endpoint. Store PDF in MinIO. Generate 24h presigned download URL. |
| **Student B Tasks** | Build `ReportDownloadButton` React component. Wire `GET /api/v1/reports/{job_id}/pdf` endpoint in Gateway. Add "Generate Report" button on result page. Trigger report generation on job completion. Display download link when ready. |
| **Deliverables** | PDF report downloadable from the dashboard. Report contains all 5 sections. Embedded heatmap images render correctly. |
| **Dependencies** | Week 17 complete. WeasyPrint system fonts installed in Docker image. |
| **Risk** | WeasyPrint SVG rendering issues — convert SVG explanations to PNG before embedding |
| **Effort** | Student A: 28h / Student B: 18h |

---

#### Week 19 — System Integration Testing

| Field | Detail |
|---|---|
| **Goal** | Full end-to-end integration tests passing across all modalities |
| **Student A Tasks** | Write 3 full end-to-end integration test scenarios: (1) Text-only detection with SHAP. (2) Image detection with GradCAM. (3) Multimodal (text + image) with fusion. Each scenario: submit → poll until complete → verify all DB fields populated → verify MinIO artifacts exist → verify report generates. |
| **Student B Tasks** | Write Playwright E2E tests for the frontend: (1) Login flow. (2) Text upload and result display. (3) Image upload and heatmap display. (4) Report download. Run against local Docker Compose stack. |
| **Deliverables** | 3 backend E2E tests passing. 4 Playwright tests passing. No critical bugs outstanding. |
| **Dependencies** | Week 18 complete. |
| **Risk** | Timing-dependent tests flake on slow CI — add explicit wait conditions, not fixed sleeps |
| **Effort** | Student A: 22h / Student B: 22h |

---

#### Week 20 — Load Testing & Performance Baseline

| Field | Detail |
|---|---|
| **Goal** | Performance baseline documented; bottlenecks identified and addressed |
| **Student A Tasks** | Write Locust load test. Run: 10 concurrent users, 60-second text detection requests for 5 minutes. Record P50, P95, P99 latencies. Profile text-service with `py-spy` if P95 > 2s. |
| **Student B Tasks** | Add Prometheus metrics to all services: request count, latency histogram, queue depth gauge. Import Grafana dashboard template for FastAPI. |
| **Deliverables** | Load test report: P95 text latency < 2s under 10 concurrent users. Grafana dashboard running. |
| **Dependencies** | Week 19 complete. Prometheus and Grafana containers healthy. |
| **Risk** | Single CPU-bound model causing high latency — consider `asyncio.to_thread()` for inference calls |
| **Effort** | Student A: 18h / Student B: 20h |

---

### 9.7 Phase 6 — Evaluation, Polish & Documentation (Weeks 21–24)

---

#### Week 21 — Academic Evaluation Matrix

| Field | Detail |
|---|---|
| **Goal** | All evaluation results computed, tabulated, and ready for dissertation |
| **Student A Tasks** | Run full evaluation matrix: Text (RAID val + M4). Image (CIFAKE + GenImage subset). Audio (ASVspoof eval + In-the-Wild). Fusion (synthetic multimodal ROC vs individual modalities). Compute all metrics: F1, AUROC, EER, AUC. |
| **Student B Tasks** | Generate all visualizations: ROC curves, confusion matrices, precision-recall curves. Save all plots as high-res PNGs. Write `results/final_evaluation_report.md`. |
| **Deliverables** | Complete evaluation table ready to copy into dissertation. All plots generated. |
| **Effort** | Student A: 24h / Student B: 20h |

---

#### Week 22 — Security Hardening & UAT

| Field | Detail |
|---|---|
| **Goal** | Security audit passed. UAT with 3 non-team testers completed. |
| **Student A Tasks** | Run OWASP ZAP baseline scan. Fix any HIGH-severity findings. Verify: MIME validation, rate limiting (trigger 429), JWT tampering (should return 401), file upload bypass attempts. |
| **Student B Tasks** | Conduct UAT with 3 external testers (classmates). Provide test scenario cards. Collect feedback. Fix top-3 UX issues. |
| **Deliverables** | ZAP scan: 0 HIGH findings. UAT feedback report. Top-3 UX fixes applied. |
| **Effort** | Student A: 20h / Student B: 22h |

---

#### Week 23 — Documentation & Video Demo

| Field | Detail |
|---|---|
| **Goal** | All documentation complete. 5-minute demo video recorded. |
| **Student A Tasks** | Write final `README.md` with: project overview, setup instructions (`make up`), API usage examples, model download instructions. Write `CONTRIBUTING.md`. Export OpenAPI spec. |
| **Student B Tasks** | Record 5-minute demo video: login → text detection with SHAP → image detection with GradCAM → audio detection → multimodal fusion → PDF report download. Upload to YouTube (unlisted). |
| **Deliverables** | README complete. Demo video link in README. OpenAPI spec exported to `docs/openapi.yaml`. |
| **Effort** | Student A: 16h / Student B: 16h |

---

#### Week 24 — Final Submission Preparation

| Field | Detail |
|---|---|
| **Goal** | Project submission ready. Presentation prepared. |
| **Student A Tasks** | Tag final release `v1.0.0` on GitHub. Create GitHub Release with changelog. Push Docker images to GitHub Container Registry. Final `docker-compose up --pull always` smoke test from clean machine. |
| **Student B Tasks** | Prepare 20-slide presentation deck. Slides: Problem → Related Work → Architecture → Demo → Evaluation Results → Limitations → Future Work → Conclusion. Practice demo live. |
| **Deliverables** | v1.0.0 GitHub release. Docker images published. Presentation deck ready. |
| **Effort** | Student A: 12h / Student B: 16h |

---

### 9.8 Milestone Summary Table

| Milestone | Week | Deliverable | Success Criteria |
|---|---|---|---|
| M1: Infrastructure | 4 | Docker stack running | `docker-compose up` → all green |
| M2: Text Detection | 8 | Text service + SHAP | F1 ≥ 0.85 on RAID val |
| M3: Image Detection | 12 | Image ensemble + GradCAM | Ensemble AUC ≥ 0.90 on CIFAKE |
| M4: Audio Detection | 16 | Audio service + spectrogram | EER ≤ 1.0% on ASVspoof eval |
| M5: Fusion + Reports | 20 | Fusion + PDF reports | E2E tests passing |
| M6: Final Submission | 24 | Tagged release v1.0.0 | Demo recorded; docs complete |

---

## SECTION 10 — MODEL INTEGRATION STRATEGY

### 10.1 Text Detection — DeBERTa-v3-base (RAID Fine-Tuned)

| Property | Detail |
|---|---|
| **Model** | microsoft/deberta-v3-base (fine-tuned) |
| **GitHub** | https://github.com/liamdugan/raid + HuggingFace Hub |
| **Parameters** | 86 million |
| **Expected F1** | 0.87–0.92 on RAID val; 0.74–0.80 cross-domain (M4) |
| **Expected Inference Time** | 80–150ms on GPU; 400–800ms on CPU (512 tokens) |
| **VRAM Required** | 2GB GPU / 4GB RAM CPU |

```python
# scripts/finetune_deberta.py — Run once on cloud GPU
from datasets import load_dataset
from transformers import (
    DebertaV2ForSequenceClassification, DebertaV2Tokenizer,
    TrainingArguments, Trainer,
)
import numpy as np
from sklearn.metrics import f1_score, roc_auc_score

MODEL_NAME = "microsoft/deberta-v3-base"
OUTPUT_DIR = "./models/deberta_v3_raid_v1.2"

tokenizer = DebertaV2Tokenizer.from_pretrained(MODEL_NAME)
model = DebertaV2ForSequenceClassification.from_pretrained(MODEL_NAME, num_labels=2)

dataset = load_dataset("liamdugan/raid", split="train")
dataset = dataset.filter(lambda x: x["language"] == "en")

def tokenize(batch):
    return tokenizer(batch["generation"], truncation=True, max_length=512, padding="max_length")

tokenized = dataset.map(tokenize, batched=True, batch_size=1000)

training_args = TrainingArguments(
    output_dir=OUTPUT_DIR,
    num_train_epochs=4,
    per_device_train_batch_size=16,
    gradient_accumulation_steps=2,
    learning_rate=2e-5,
    warmup_ratio=0.1,
    weight_decay=0.01,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="f1",
    fp16=True,
    report_to="none",
)

def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    probs = np.exp(logits) / np.sum(np.exp(logits), axis=-1, keepdims=True)
    return {
        "f1": f1_score(labels, preds),
        "auroc": roc_auc_score(labels, probs[:, 1]),
    }

trainer = Trainer(
    model=model, args=training_args,
    train_dataset=tokenized["train"],
    eval_dataset=tokenized["validation"],
    compute_metrics=compute_metrics,
)
trainer.train()
trainer.save_model(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
```

```python
# Production inference wrapper
# services/text-service/app/services/text_detector.py
import time, asyncio, torch
from transformers import DebertaV2ForSequenceClassification, DebertaV2Tokenizer

MODEL_PATH = "/models/deberta_v3_raid_v1.2"
_model, _tokenizer, _device = None, None, None

def load_model_sync():
    global _model, _tokenizer, _device
    _device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    _tokenizer = DebertaV2Tokenizer.from_pretrained(MODEL_PATH)
    _model = DebertaV2ForSequenceClassification.from_pretrained(MODEL_PATH)
    _model.eval().to(_device)

async def predict_text(text: str) -> dict:
    return await asyncio.to_thread(_predict_sync, text)

def _predict_sync(text: str) -> dict:
    t0 = time.perf_counter()
    inputs = _tokenizer(text, return_tensors="pt", max_length=512, truncation=True, padding=True)
    inputs = {k: v.to(_device) for k, v in inputs.items()}
    with torch.no_grad():
        logits = _model(**inputs).logits[0]
    probs = torch.softmax(logits, dim=-1)
    ai_prob = probs[1].item()
    return {
        "ai_probability": round(ai_prob, 4),
        "confidence_score": round(float(probs.max()), 4),
        "verdict": _score_to_verdict(ai_prob),
        "processing_time_ms": int((time.perf_counter() - t0) * 1000),
        "device_used": str(_device),
    }

def _score_to_verdict(s: float) -> str:
    if s >= 0.80: return "AI_GENERATED"
    if s >= 0.60: return "LIKELY_AI"
    if s >= 0.40: return "INCONCLUSIVE"
    if s >= 0.20: return "LIKELY_HUMAN"
    return "HUMAN_GENERATED"
```

---

### 10.2 Image Detection — ResNet-50 + Corvi EfficientNet-B0 Ensemble

| Property | Detail |
|---|---|
| **Model 1** | ResNet-50 (Wang et al. CNNDetection) — GAN detector |
| **Model 2** | EfficientNet-B0 + FFT (Corvi et al.) — Diffusion detector |
| **GitHub 1** | https://github.com/peterwang512/CNNDetection |
| **GitHub 2** | https://github.com/grip-unina/DMimageDetection |
| **Ensemble AUC** | 0.92–0.96 across GAN+Diffusion generators |
| **Total Inference Time** | ~230ms on GPU (both models sequential) |
| **VRAM Required** | ~1.5GB for both models loaded simultaneously |

```python
# services/image-service/app/services/image_detector.py
import io, time, asyncio, torch, torch.nn as nn
import torchvision.transforms as T
from PIL import Image
import numpy as np

class ResNetGANDetector:
    WEIGHTS_PATH = "/models/resnet50_cnn_detection_v2.0/blur_jpg_prob0.5.pth"
    TRANSFORM = T.Compose([
        T.Resize(256), T.CenterCrop(224), T.ToTensor(),
        T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])
    def load(self, device):
        import torchvision.models as models
        self._model = models.resnet50(pretrained=False)
        self._model.fc = nn.Linear(2048, 1)
        state = torch.load(self.WEIGHTS_PATH, map_location=device)
        self._model.load_state_dict(state["model"])
        self._model.eval().to(device)
        self._device = device
    def predict(self, img: Image.Image) -> float:
        tensor = self.TRANSFORM(img).unsqueeze(0).to(self._device)
        with torch.no_grad():
            return torch.sigmoid(self._model(tensor)[0, 0]).item()

class CorviDiffusionDetector:
    WEIGHTS_PATH = "/models/corvi_effnet_v1.0/model.pth"
    def load(self, device):
        import timm
        self._model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=1)
        self._model.load_state_dict(torch.load(self.WEIGHTS_PATH, map_location=device))
        self._model.eval().to(device)
        self._device = device
    def _fft_features(self, img: Image.Image) -> torch.Tensor:
        gray = np.array(img.convert("L"), dtype=np.float32) / 255.0
        fft = np.fft.fftshift(np.fft.fft2(gray))
        mag = np.log1p(np.abs(fft))
        h, w = mag.shape
        mag[h//2-h//10:h//2+h//10, w//2-w//10:w//2+w//10] = 0
        mag = (mag - mag.min()) / (mag.max() - mag.min() + 1e-8)
        tensor = torch.from_numpy(mag).float().unsqueeze(0).repeat(3, 1, 1)
        return T.Resize((224, 224))(tensor.unsqueeze(0)).squeeze(0)
    def predict(self, img: Image.Image) -> float:
        tensor = self._fft_features(img).unsqueeze(0).to(self._device)
        with torch.no_grad():
            return torch.sigmoid(self._model(tensor)[0, 0]).item()

class ImageEnsembleDetector:
    GAN_WEIGHT = 0.55; DIFF_WEIGHT = 0.45
    def __init__(self):
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._gan = ResNetGANDetector()
        self._diff = CorviDiffusionDetector()
    def load(self):
        self._gan.load(self._device)
        self._diff.load(self._device)
    async def predict(self, image_bytes: bytes) -> dict:
        return await asyncio.to_thread(self._predict_sync, image_bytes)
    def _predict_sync(self, image_bytes: bytes) -> dict:
        t0 = time.perf_counter()
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        p_gan = self._gan.predict(img)
        p_diff = self._diff.predict(img)
        p_ensemble = self.GAN_WEIGHT * p_gan + self.DIFF_WEIGHT * p_diff
        confidence = max(0.0, 1.0 - 2.0 * abs(p_gan - p_diff))
        return {
            "ai_probability": round(p_ensemble, 4),
            "confidence_score": round(confidence, 4),
            "verdict": _score_to_verdict(p_ensemble),
            "model_ensemble": [
                {"model": "ResNet50-GANDetector", "weight": 0.55, "score": round(p_gan, 4)},
                {"model": "Corvi-DiffusionDetector", "weight": 0.45, "score": round(p_diff, 4)},
            ],
            "processing_time_ms": int((time.perf_counter() - t0) * 1000),
        }

def _score_to_verdict(s: float) -> str:
    if s >= 0.80: return "AI_GENERATED"
    if s >= 0.60: return "LIKELY_AI"
    if s >= 0.40: return "INCONCLUSIVE"
    if s >= 0.20: return "LIKELY_HUMAN"
    return "HUMAN_GENERATED"
```

---

### 10.3 Audio Detection — AASIST-L (Pre-Trained, Inference Only)

| Property | Detail |
|---|---|
| **Model** | AASIST-L (Large variant, official pre-trained) |
| **GitHub** | https://github.com/clovaai/aasist |
| **Parameters** | 297,000 (under 1MB checkpoint) |
| **Expected EER** | 0.83% on ASVspoof 2019 LA eval; ~15–20% on in-the-wild |
| **Inference Time** | 25–40ms per 4s clip on GPU; 80–120ms on CPU |
| **VRAM Required** | < 500MB |

```python
# services/audio-service/app/services/audio_detector.py
import io, time, asyncio, torch, torchaudio
import torchaudio.transforms as AT
from app.models.aasist import AASIST   # Copy from official repo

WEIGHTS_PATH  = "/models/aasist_l_v1.0/AASIST-L.pth"
SAMPLE_RATE   = 16_000
FIXED_SAMPLES = 64_600   # ~4.03 seconds

class AASISTDetector:
    def load(self):
        import json
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        with open("/models/aasist_l_v1.0/AASIST-L.conf") as f:
            config = json.load(f)
        self._model = AASIST(**config["model"])
        state = torch.load(WEIGHTS_PATH, map_location=self._device)
        self._model.load_state_dict(state["model"])
        self._model.eval().to(self._device)

    def _preprocess(self, audio_bytes: bytes) -> torch.Tensor:
        waveform, sr = torchaudio.load(io.BytesIO(audio_bytes))
        if waveform.shape[0] > 1:
            waveform = waveform.mean(dim=0, keepdim=True)
        if sr != SAMPLE_RATE:
            waveform = AT.Resample(sr, SAMPLE_RATE)(waveform)
        waveform = waveform.squeeze(0)
        n = waveform.shape[0]
        if n < FIXED_SAMPLES:
            waveform = torch.nn.functional.pad(waveform, (0, FIXED_SAMPLES - n))
        else:
            waveform = waveform[:FIXED_SAMPLES]
        return waveform.unsqueeze(0)

    async def predict(self, audio_bytes: bytes) -> dict:
        return await asyncio.to_thread(self._predict_sync, audio_bytes)

    def _predict_sync(self, audio_bytes: bytes) -> dict:
        t0 = time.perf_counter()
        waveform = self._preprocess(audio_bytes).to(self._device)
        with torch.no_grad():
            _, logit = self._model(waveform)
            probs = torch.softmax(logit[0], dim=-1)
            spoof_prob = probs[1].item()
        return {
            "ai_probability": round(spoof_prob, 4),
            "confidence_score": round(float(probs.max()), 4),
            "verdict": _score_to_verdict(spoof_prob),
            "processing_time_ms": int((time.perf_counter() - t0) * 1000),
            "device_used": str(self._device),
        }

def _score_to_verdict(s: float) -> str:
    if s >= 0.80: return "AI_GENERATED"
    if s >= 0.60: return "LIKELY_AI"
    if s >= 0.40: return "INCONCLUSIVE"
    if s >= 0.20: return "LIKELY_HUMAN"
    return "HUMAN_GENERATED"
```

---

### 10.4 Video Detection — XceptionNet Frame-Level (Phase 4)

| Property | Detail |
|---|---|
| **Model** | XceptionNet (FaceForensics++ trained) |
| **GitHub** | https://github.com/ondyari/FaceForensics |
| **Pipeline** | ffmpeg 2fps → MTCNN face crop → XceptionNet batch → temporal aggregation |
| **Aggregation** | `P = 0.5×mean + 0.3×max + 0.2×vote_fraction` |
| **Expected AUC** | ~0.90 on FF++ c23; ~0.74 cross-dataset |
| **Inference Time** | ~7s for 30 frames at batch_size=8 on GPU |

---

### 10.5 Model Integration Performance Summary

| Modality | Model | Expected Accuracy | P95 Latency | VRAM | Fine-Tune? |
|---|---|---|---|---|---|
| Text | DeBERTa-v3-RAID | F1: 0.87–0.92 | < 2s (CPU) | 2–4GB | ✅ Yes (once on cloud) |
| Image | ResNet50+Corvi | AUC: 0.92–0.96 | < 500ms (GPU) | 1.5GB | ❌ No (pre-trained) |
| Audio | AASIST-L | EER: 0.83% (bench) | < 100ms (CPU) | < 1GB | ❌ No (pre-trained) |
| Video | XceptionNet | AUC: ~0.90 (bench) | ~7s (GPU, 30 frames) | 2GB | ❌ No (pre-trained) |

---

## SECTION 11 — EXPLAINABILITY

### 11.1 Method Decision Matrix

| Method | Modality | Difficulty | Runtime | Usefulness | Status |
|---|---|---|---|---|---|
| **SHAP Token Attribution** | Text | Medium | 2–5s | ⭐⭐⭐⭐⭐ | ✅ Phase 2 |
| **GradCAM Heatmap** | Image | Low | <100ms | ⭐⭐⭐⭐⭐ | ✅ Phase 3 |
| **Mel-Spectrogram** | Audio | Low | <50ms | ⭐⭐⭐⭐ | ✅ Phase 4 |
| **LIME** | Text/Image | Medium | 5–30s | ⭐⭐⭐ | ⚠️ Optional fallback |
| **Attention Weights** | Text | High | Medium | ⭐⭐⭐ | ❌ Future work |
| **Frame Grid** | Video | Medium | Medium | ⭐⭐⭐⭐ | ⚠️ Phase 4 |
| **Saliency Maps** | Image | Low | Low | ⭐⭐ | ❌ Redundant vs GradCAM |

---

### 11.2 SHAP — Token Attribution for Text

**Algorithm:** Marginal contribution per token via permutation game with Text masker.

```python
# services/text-service/app/services/shap_explainer.py
import asyncio, shap, torch, numpy as np
from transformers import DebertaV2Tokenizer, DebertaV2ForSequenceClassification

class SHAPTextExplainer:
    MAX_TOKENS = 256

    def __init__(self, model, tokenizer, device):
        self._model, self._tokenizer, self._device = model, tokenizer, device
        self._explainer = self._build_explainer()

    def _build_explainer(self):
        def predict_fn(texts):
            inputs = self._tokenizer(texts, return_tensors="pt",
                max_length=self.MAX_TOKENS, truncation=True, padding=True)
            inputs = {k: v.to(self._device) for k, v in inputs.items()}
            with torch.no_grad():
                probs = torch.softmax(self._model(**inputs).logits, dim=-1)
            return probs[:, 1].cpu().numpy()
        return shap.Explainer(predict_fn, shap.maskers.Text(self._tokenizer))

    async def explain(self, text: str) -> dict:
        return await asyncio.to_thread(self._explain_sync, text)

    def _explain_sync(self, text: str) -> dict:
        truncated = " ".join(text.split()[:self.MAX_TOKENS])
        sv = self._explainer([truncated])
        values, tokens = sv.values[0], sv.data[0]
        attrs = sorted([
            {"token": t, "attribution": round(float(v), 4), "position": i}
            for i, (t, v) in enumerate(zip(tokens, values))
        ], key=lambda x: abs(x["attribution"]), reverse=True)
        top_ai = [a["token"] for a in attrs[:20] if a["attribution"] > 0]
        return {
            "method": "SHAP",
            "token_attributions": attrs[:20],
            "top_ai_indicator_tokens": top_ai[:10],
            "html_heatmap": self._render_heatmap(tokens, values),
            "truncated": len(text.split()) > self.MAX_TOKENS,
        }

    def _render_heatmap(self, tokens, values) -> str:
        max_val = max(abs(values)) if len(values) > 0 else 1.0
        parts = []
        for tok, val in zip(tokens, values):
            if tok in ["[CLS]", "[SEP]", "[PAD]"]: continue
            intensity = abs(val) / (max_val + 1e-8)
            r, g, b = (255, 0, 0) if val > 0 else (0, 180, 0)
            tok_clean = tok.replace("▁", " ").strip()
            parts.append(
                f'<span style="background:rgba({r},{g},{b},{intensity*0.7:.2f});'
                f'padding:1px 3px;border-radius:2px;" title="SHAP:{val:.3f}">{tok_clean}</span>'
            )
        return " ".join(parts)
```

---

### 11.3 GradCAM — Image Heatmap

```python
# services/image-service/app/services/gradcam_explainer.py
import io, asyncio, numpy as np, torch
from PIL import Image
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

class GradCAMExplainer:
    def __init__(self, model, target_layer_name="layer4"):
        target_layer = getattr(model, target_layer_name)[-1]
        self._cam = GradCAM(model=model, target_layers=[target_layer])

    async def explain(self, image_bytes: bytes) -> bytes:
        return await asyncio.to_thread(self._explain_sync, image_bytes)

    def _explain_sync(self, image_bytes: bytes) -> bytes:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize((224, 224))
        img_arr = np.array(img, dtype=np.float32) / 255.0
        mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
        inp = torch.from_numpy(((img_arr - mean) / std).transpose(2, 0, 1)).float().unsqueeze(0)
        cam = self._cam(input_tensor=inp)[0]
        vis = show_cam_on_image(img_arr, cam, use_rgb=True)
        buf = io.BytesIO()
        Image.fromarray(vis).save(buf, format="PNG")
        return buf.getvalue()

    def get_highlighted_regions(self, cam: np.ndarray) -> list[dict]:
        h, w = cam.shape
        regions = {
            "top-left": cam[:h//2, :w//2].mean(), "top-right": cam[:h//2, w//2:].mean(),
            "bottom-left": cam[h//2:, :w//2].mean(), "bottom-right": cam[h//2:, w//2:].mean(),
            "center": cam[h//4:3*h//4, w//4:3*w//4].mean(),
        }
        return [{"region": n, "intensity": round(float(v), 4)}
                for n, v in sorted(regions.items(), key=lambda x: -x[1]) if v > 0.3]
```

---

### 11.4 Mel-Spectrogram — Audio Visualization

```python
# services/audio-service/app/services/spectrogram_visualizer.py
import io, asyncio, numpy as np, librosa, librosa.display
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import torchaudio

class SpectrogramVisualizer:
    SR = 16_000
    async def generate(self, audio_bytes: bytes, ai_probability: float) -> bytes:
        return await asyncio.to_thread(self._gen_sync, audio_bytes, ai_probability)
    def _gen_sync(self, audio_bytes: bytes, ai_probability: float) -> bytes:
        waveform, sr = torchaudio.load(io.BytesIO(audio_bytes))
        if waveform.shape[0] > 1: waveform = waveform.mean(dim=0)
        y = waveform.numpy().squeeze()
        if sr != self.SR: y = librosa.resample(y, orig_sr=sr, target_sr=self.SR)
        y = y[:self.SR * 10]
        mel = librosa.feature.melspectrogram(y=y, sr=self.SR, n_mels=128, fmax=8000)
        mel_db = librosa.power_to_db(mel, ref=np.max)
        fig, (ax1, ax2) = plt.subplots(2, 1, figsize=(12, 6), facecolor="#1a1a2e")
        fig.suptitle(f"Audio Forensics | AI Probability: {ai_probability*100:.1f}%",
                     color="white", fontsize=13, fontweight="bold")
        for ax in (ax1, ax2): ax.set_facecolor("#16213e"); ax.tick_params(colors="white")
        librosa.display.waveshow(y, sr=self.SR, ax=ax1, color="#e94560")
        ax1.set_title("Waveform", color="white")
        img = librosa.display.specshow(mel_db, sr=self.SR, x_axis="time", y_axis="mel",
                                       fmax=8000, ax=ax2, cmap="magma")
        fig.colorbar(img, ax=ax2, format="%+2.0f dB")
        ax2.set_title("Mel-Spectrogram (dB)", color="white")
        plt.tight_layout()
        buf = io.BytesIO()
        plt.savefig(buf, format="png", dpi=120, bbox_inches="tight", facecolor="#1a1a2e")
        plt.close(fig)
        return buf.getvalue()
```

---

### 11.5 Explanation Narrative Generator

```python
# shared/services/narrative_generator.py
VERDICT_TEMPLATES = {
    "AI_GENERATED":    "The {modality} content is classified as AI-generated ({score:.0%} probability, {confidence:.0%} confidence). {evidence}",
    "LIKELY_AI":       "The {modality} content shows strong AI indicators ({score:.0%} probability). {evidence}",
    "INCONCLUSIVE":    "Analysis is inconclusive ({score:.0%} AI probability). {evidence} Manual review recommended.",
    "LIKELY_HUMAN":    "The {modality} content appears likely human-generated ({score:.0%} AI probability). {evidence}",
    "HUMAN_GENERATED": "No significant AI indicators detected ({score:.0%} probability). {evidence}",
}

def generate_text_narrative(result: dict, explanation: dict) -> str:
    tokens = ", ".join(f"'{t}'" for t in explanation.get("top_ai_indicator_tokens", [])[:5])
    evidence = (f"AI indicators: {tokens}. These phrases are statistically over-represented in LLM outputs."
                if result["ai_probability"] >= 0.5
                else "Text shows natural variation consistent with human authorship.")
    return VERDICT_TEMPLATES[result["verdict"]].format(
        modality="text", score=result["ai_probability"],
        confidence=result["confidence_score"], evidence=evidence
    )

def generate_image_narrative(result: dict, regions: list[dict]) -> str:
    region_names = ", ".join(r["region"] for r in regions[:3])
    evidence = (f"GradCAM highlights {region_names} as primary artifact regions."
                if result["ai_probability"] >= 0.5
                else "No significant GAN upsampling or diffusion artifacts detected.")
    return VERDICT_TEMPLATES[result["verdict"]].format(
        modality="image", score=result["ai_probability"],
        confidence=result["confidence_score"], evidence=evidence
    )
```

---

## SECTION 12 — TESTING STRATEGY

### 12.1 Testing Pyramid

```
              ┌───────────────┐   10 Playwright E2E tests
           ┌──┴───────────────┴──┐
           │  25 Integration Tests│  (pytest + httpx + testcontainers)
        ┌──┴─────────────────────┴──┐
        │   80 Unit Tests            │  (pytest + pytest-asyncio + pytest-mock)
     ┌──┴───────────────────────────┴──┐
     │    5 Model Validation Scripts    │  (per-modality regression tests)
  ┌──┴─────────────────────────────────┴──┐
  │       3 Locust Load Test Scenarios     │
  └────────────────────────────────────────┘
```

---

### 12.2 Unit Tests (80 tests)

```python
# tests/unit/test_fusion_engine.py
import pytest
from app.services.fusion_engine import FusionEngine

class TestFusionEngine:
    def setup_method(self): self.engine = FusionEngine()

    def test_single_text_ai(self):
        r = self.engine.fuse({"text": 0.91})
        assert r.final_verdict == "AI_GENERATED"
        assert r.final_score == pytest.approx(0.91, abs=0.01)

    def test_high_agreement_high_confidence(self):
        r = self.engine.fuse({"text": 0.90, "image": 0.88})
        assert r.final_confidence > 0.70

    def test_high_disagreement_low_confidence(self):
        r = self.engine.fuse({"text": 0.95, "image": 0.10})
        assert r.final_confidence < 0.40

    def test_boundary_inconclusive(self):
        r = self.engine.fuse({"text": 0.50})
        assert r.final_verdict == "INCONCLUSIVE"

    def test_weights_sum_to_one(self):
        r = self.engine.fuse({"text": 0.80, "audio": 0.80})
        assert sum(r.weights_applied.values()) == pytest.approx(1.0, abs=0.001)

    def test_empty_raises(self):
        with pytest.raises(ValueError): self.engine.fuse({})

    def test_score_in_range(self):
        r = self.engine.fuse({"text": 1.0})
        assert 0.0 <= r.final_score <= 1.0
        assert 0.0 <= r.final_confidence <= 1.0

# tests/unit/test_verdict_mapping.py
def test_verdict_thresholds():
    from app.services.text_detector import _score_to_verdict
    assert _score_to_verdict(0.95) == "AI_GENERATED"
    assert _score_to_verdict(0.80) == "AI_GENERATED"   # boundary inclusive
    assert _score_to_verdict(0.799) == "LIKELY_AI"
    assert _score_to_verdict(0.50) == "INCONCLUSIVE"
    assert _score_to_verdict(0.30) == "LIKELY_HUMAN"
    assert _score_to_verdict(0.10) == "HUMAN_GENERATED"
```

---

### 12.3 Integration Tests (25 tests)

```python
# tests/integration/test_text_detection_api.py
import pytest
from httpx import AsyncClient
from app.main import app

class TestTextDetectionEndpoint:
    @pytest.mark.asyncio
    async def test_valid_text_returns_result(self, auth_headers):
        async with AsyncClient(app=app, base_url="http://test") as c:
            r = await c.post("/api/v1/detect/text",
                json={"text": "The ramifications of advanced ML " * 10},
                headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert 0.0 <= data["results"][0]["ai_probability"] <= 1.0

    @pytest.mark.asyncio
    async def test_short_text_returns_422(self, auth_headers):
        async with AsyncClient(app=app, base_url="http://test") as c:
            r = await c.post("/api/v1/detect/text",
                json={"text": "Too short."}, headers=auth_headers)
        assert r.status_code == 422

    @pytest.mark.asyncio
    async def test_no_auth_returns_401(self):
        async with AsyncClient(app=app, base_url="http://test") as c:
            r = await c.post("/api/v1/detect/text", json={"text": "Some text here."})
        assert r.status_code == 401

    @pytest.mark.asyncio
    async def test_explanation_present_when_requested(self, auth_headers):
        async with AsyncClient(app=app, base_url="http://test") as c:
            r = await c.post("/api/v1/detect/text",
                json={"text": "Furthermore it is important to note " * 20, "explain": True},
                headers=auth_headers)
        assert r.json()["results"][0]["explanation"] is not None

    @pytest.mark.asyncio
    async def test_image_wrong_mime_returns_400(self, auth_headers):
        async with AsyncClient(app=app, base_url="http://test") as c:
            r = await c.post("/api/v1/detect/image",
                files={"file": ("test.jpg", b"%PDF-1.4 fake", "application/pdf")},
                headers=auth_headers)
        assert r.status_code == 400
        assert r.json()["error"] == "INVALID_MIME_TYPE"
```

---

### 12.4 Model Validation Scripts

```python
# scripts/validate_models.py
FIXTURES = {
    "text": [
        ("The mitochondria is the powerhouse of the cell. ", "HUMAN_GENERATED", 0.0, 0.40),
        ("Furthermore, it is worth noting that the utilization " * 5, "LIKELY_AI", 0.60, 1.0),
    ],
}
def validate_text(fixtures):
    from app.services.text_detector import load_model_sync, _predict_sync
    load_model_sync()
    passed = 0
    for text, expected_verdict, lo, hi in fixtures:
        r = _predict_sync(text)
        ok = lo <= r["ai_probability"] <= hi and r["verdict"] == expected_verdict
        print(f"  [{'PASS' if ok else 'FAIL'}] {expected_verdict} | Got: {r['verdict']} ({r['ai_probability']:.3f})")
        passed += ok
    return passed == len(fixtures)
```

---

### 12.5 Load Testing (Locust)

```python
# tests/load/locustfile.py
from locust import HttpUser, task, between

class ForensicsUser(HttpUser):
    wait_time = between(1, 3)
    def on_start(self):
        r = self.client.post("/api/v1/auth/login",
            json={"email": "loadtest@test.com", "password": "loadtest_pass"})
        self.headers = {"Authorization": f"Bearer {r.json()['access_token']}"}

    @task(5)
    def detect_text_fast(self):
        self.client.post("/api/v1/detect/text",
            json={"text": "AI text detection benchmark " * 10, "explain": False},
            headers=self.headers)

    @task(2)
    def detect_text_with_shap(self):
        self.client.post("/api/v1/detect/text",
            json={"text": "Furthermore the utilization of advanced ML " * 15, "explain": True},
            headers=self.headers)

    @task(1)
    def list_jobs(self):
        self.client.get("/api/v1/jobs", headers=self.headers)
```

```bash
# Run load test
locust -f tests/load/locustfile.py \
  --host http://localhost:8000 \
  --users 10 --spawn-rate 2 --run-time 5m \
  --headless --csv results/load_test_$(date +%Y%m%d)
# Target SLOs:
# Text P95 (no SHAP) < 2000ms | Text P95 (with SHAP) < 6000ms
# Job list P95 < 100ms | Error rate < 1%
```

---

### 12.6 Security Testing Checklist

| Test | Tool | Pass Criteria |
|---|---|---|
| Dependency vulnerabilities | `pip-audit -r requirements.txt` | 0 CRITICAL / 0 HIGH |
| OWASP baseline | `zap-baseline.py -t http://localhost:8000` | 0 HIGH alerts |
| SQL injection | SQLMap `--level 2` | No injections found |
| JWT tampering | Manual: alter payload, re-sign wrong key | Returns 401 |
| File type bypass | Upload `.php` as `image/jpeg` | Returns 400 |
| Rate limit | 70 req/min | 429 after request 61 |
| Secrets in code | `git secrets --scan` | 0 findings |
| Plaintext passwords | Check DB directly | Only bcrypt hashes |

---

### 12.7 UAT Plan (10 Scenarios)

| # | Scenario | Action | Expected | Accept Criteria |
|---|---|---|---|---|
| 1 | Registration | Fill form, submit | Account created | No error |
| 2 | Submit AI text (GPT-4 essay) | Paste text, detect | AI_GENERATED, heatmap visible | Score > 0.70 |
| 3 | Submit human text (hand-written) | Paste text, detect | HUMAN or INCONCLUSIVE | Score < 0.50 |
| 4 | Upload AI image (Midjourney) | Drop PNG file | LIKELY_AI, GradCAM visible | Score > 0.60 |
| 5 | Upload real photo | Drop personal JPEG | HUMAN or INCONCLUSIVE | Score < 0.50 |
| 6 | Upload TTS audio (ElevenLabs) | Drop MP3 | LIKELY_AI, spectrogram visible | Score > 0.60 |
| 7 | Download PDF report | Click button | PDF downloaded with all sections | File > 50KB |
| 8 | View job history | Navigate to job list | Past jobs listed | ≥ 3 jobs shown |
| 9 | Upload invalid file type | Drop PDF as image | Clear error shown | No crash |
| 10 | Session expiry | Wait 16min, detect | Redirected to login | Graceful logout |

---

## SECTION 13 — DEVOPS

### 13.1 Dockerfile (Multi-Stage, All Services)

```dockerfile
# services/text-service/Dockerfile
FROM python:3.11-slim AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev libmagic1 \
    && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --upgrade pip && pip install --no-cache-dir --prefix=/install -r requirements.txt

FROM python:3.11-slim AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends libpq5 libmagic1 ffmpeg curl \
    && rm -rf /var/lib/apt/lists/*
COPY --from=builder /install /usr/local
COPY ./app ./app
RUN useradd -m -u 1001 appuser && chown -R appuser:appuser /app
USER appuser
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:8001/internal/health || exit 1
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001", \
     "--workers", "1", "--loop", "uvloop"]
```

---

### 13.2 Docker Compose

```yaml
# docker-compose.yml (key services — full version in repo)
version: "3.9"
x-common-env: &common-env
  DATABASE_URL: postgresql+asyncpg://forensics_user:${POSTGRES_PASSWORD}@postgres:5432/forensics_db
  REDIS_URL: redis://redis:6379/0
  RABBITMQ_URL: amqp://forensics:${RABBITMQ_PASSWORD}@rabbitmq:5672/
  MINIO_ENDPOINT: minio:9000
  MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY}
  MINIO_SECRET_KEY: ${MINIO_SECRET_KEY}
  MINIO_BUCKET: forensics-bucket

services:
  postgres:
    image: postgres:16-alpine
    environment: {POSTGRES_DB: forensics_db, POSTGRES_USER: forensics_user, POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"}
    volumes: ["./data/postgres:/var/lib/postgresql/data"]
    healthcheck: {test: ["CMD", "pg_isready", "-U", "forensics_user"], interval: 30s, retries: 5}

  redis:
    image: redis:7-alpine
    volumes: ["./data/redis:/data"]
    healthcheck: {test: ["CMD", "redis-cli", "ping"], interval: 30s}

  rabbitmq:
    image: rabbitmq:3.13-management-alpine
    environment: {RABBITMQ_DEFAULT_USER: forensics, RABBITMQ_DEFAULT_PASS: "${RABBITMQ_PASSWORD}"}
    ports: ["127.0.0.1:15672:15672"]
    healthcheck: {test: ["CMD", "rabbitmq-diagnostics", "check_running"], interval: 30s}

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment: {MINIO_ROOT_USER: "${MINIO_ACCESS_KEY}", MINIO_ROOT_PASSWORD: "${MINIO_SECRET_KEY}"}
    volumes: ["./data/minio:/data"]
    ports: ["127.0.0.1:9001:9001"]

  api-gateway:
    build: ./services/api-gateway
    ports: ["8000:8000"]
    environment:
      <<: *common-env
      JWT_SECRET_KEY: ${JWT_SECRET_KEY}
      TEXT_SERVICE_URL: http://text-service:8001
      IMAGE_SERVICE_URL: http://image-service:8002
      AUDIO_SERVICE_URL: http://audio-service:8003
      REPORT_SERVICE_URL: http://report-service:8005
      AUTH_SERVICE_URL: http://auth-service:8006
    depends_on:
      postgres: {condition: service_healthy}
      redis: {condition: service_healthy}
      rabbitmq: {condition: service_healthy}

  text-service:
    build: ./services/text-service
    expose: ["8001"]
    environment: {<<: *common-env, TEXT_MODEL_PATH: /models/deberta_v3_raid_v1.2}
    volumes: ["./models:/models:ro"]
    deploy: {resources: {limits: {memory: 5G}}}

  image-service:
    build: ./services/image-service
    expose: ["8002"]
    environment: {<<: *common-env, IMAGE_MODEL_GAN_PATH: /models/resnet50_cnn_detection_v2.0, IMAGE_MODEL_DIFF_PATH: /models/corvi_effnet_v1.0}
    volumes: ["./models:/models:ro"]
    deploy:
      resources:
        limits: {memory: 7G}
        reservations:
          devices: [{driver: nvidia, count: 1, capabilities: [gpu]}]

  prometheus:
    image: prom/prometheus:v2.51.0
    volumes: ["./config/prometheus.yml:/etc/prometheus/prometheus.yml:ro", "./data/prometheus:/prometheus"]
    ports: ["127.0.0.1:9090:9090"]

  grafana:
    image: grafana/grafana:10.3.0
    volumes: ["./data/grafana:/var/lib/grafana"]
    environment: {GF_SECURITY_ADMIN_PASSWORD: "${GRAFANA_PASSWORD}"}
    ports: ["127.0.0.1:3001:3000"]
```

---

### 13.3 GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI
on:
  push: {branches: [main, dev]}
  pull_request: {branches: [main, dev]}
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.11", cache: pip}
      - run: pip install ruff mypy
      - run: ruff check services/ shared/
      - run: mypy services/ shared/ --ignore-missing-imports

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgres:16-alpine
        env: {POSTGRES_DB: test_db, POSTGRES_USER: test_user, POSTGRES_PASSWORD: test_pass}
        ports: ["5432:5432"]
        options: "--health-cmd pg_isready --health-interval 10s --health-retries 5"
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
        options: "--health-cmd 'redis-cli ping' --health-interval 10s"
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: {python-version: "3.11", cache: pip}
      - run: pip install -e shared/ && pip install pytest pytest-asyncio pytest-cov pytest-mock httpx
      - name: Run migrations
        env:
          DATABASE_URL: postgresql+asyncpg://test_user:test_pass@localhost:5432/test_db
        run: cd shared/db && alembic upgrade head
      - name: Run tests
        env:
          DATABASE_URL: postgresql+asyncpg://test_user:test_pass@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379/0
          JWT_SECRET_KEY: test_secret_key_minimum_32_characters_here
        run: pytest services/ shared/ --cov=. --cov-report=xml -v --ignore=tests/load

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    strategy:
      matrix:
        service: [api-gateway, text-service, image-service, audio-service, report-service, auth-service]
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with: {registry: ghcr.io, username: "${{ github.actor }}", password: "${{ secrets.GITHUB_TOKEN }}"}
      - uses: docker/build-push-action@v5
        with:
          context: ./services/${{ matrix.service }}
          push: true
          tags: "ghcr.io/${{ github.repository_owner }}/forensics-${{ matrix.service }}:${{ github.sha }}"
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

---

### 13.4 Prometheus Configuration

```yaml
# config/prometheus.yml
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: api-gateway
    static_configs: [{targets: ["api-gateway:8000"]}]
  - job_name: text-service
    static_configs: [{targets: ["text-service:8001"]}]
  - job_name: image-service
    static_configs: [{targets: ["image-service:8002"]}]
  - job_name: audio-service
    static_configs: [{targets: ["audio-service:8003"]}]
  - job_name: rabbitmq
    static_configs: [{targets: ["rabbitmq:15692"]}]
    metrics_path: /metrics
```

```python
# Add to each service's main.py
from prometheus_fastapi_instrumentator import Instrumentator
from prometheus_client import Counter, Histogram

DETECTIONS = Counter("forensics_detections_total", "Total detections", ["modality", "verdict"])
LATENCY = Histogram("forensics_latency_seconds", "Inference latency", ["modality"],
                    buckets=[0.1, 0.5, 1.0, 2.5, 5.0, 10.0])
Instrumentator().instrument(app).expose(app)
```

---

### 13.5 Structured Logging

```python
# shared/logging_config.py
import structlog

def configure_logging(log_format: str = "json"):
    processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
    ]
    processors.append(
        structlog.processors.JSONRenderer() if log_format == "json"
        else structlog.dev.ConsoleRenderer()
    )
    structlog.configure(processors=processors,
                        logger_factory=structlog.PrintLoggerFactory())

# Usage:
# logger = structlog.get_logger()
# logger.info("detection_complete", job_id=job_id, score=0.87, latency_ms=340)
```

---

### 13.6 Alerting Rules

```yaml
# config/alerting_rules.yml
groups:
  - name: forensics
    rules:
      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels: {severity: critical}
        annotations: {summary: "Service {{ $labels.job }} is down"}

      - alert: HighDetectionLatency
        expr: histogram_quantile(0.95, forensics_latency_seconds_bucket) > 5
        for: 5m
        labels: {severity: warning}
        annotations: {summary: "P95 latency > 5s for {{ $labels.modality }}"}

      - alert: QueueBacklog
        expr: forensics_queue_depth > 50
        for: 2m
        labels: {severity: warning}
        annotations: {summary: "Queue {{ $labels.queue_name }} has {{ $value }} pending"}

      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) / rate(http_requests_total[5m]) > 0.05
        for: 3m
        labels: {severity: critical}
        annotations: {summary: "Error rate > 5% on {{ $labels.job }}"}
```

---

### 13.7 Versioning & Release Strategy

```
VERSIONING: Semantic Versioning (MAJOR.MINOR.PATCH)
  v1.0.0 → Initial FYP release
  v1.1.0 → Add audio modality
  v1.2.0 → Add fusion engine
  v2.0.0 → Breaking API change

BRANCH STRATEGY: GitHub Flow
  main       ← Always deployable (protected)
  dev        ← Integration branch
  feature/*  ← Feature branches
  hotfix/*   ← Emergency fixes

COMMIT FORMAT (Conventional Commits):
  feat(audio): add AASIST integration
  fix(gateway): resolve MIME validation for WebP
  docs(api): update OpenAPI spec
  test(text): add M4 cross-dataset evaluation
  chore(deps): upgrade torch to 2.2.0

DOCKER TAGS:
  :latest      ← Tracks main
  :v1.0.0      ← Immutable release
  :sha-abc1234 ← Commit SHA

RELEASE PROCESS:
  1. PR: feature/* → dev (1 review + CI green)
  2. PR: dev → main (1 review + CI green + smoke test)
  3. git tag -a v1.x.x -m "Changelog"
  4. GitHub Release auto-generated from commits
  5. Docker images pushed (tagged :latest + :v1.x.x)
  6. SSH deploy: docker compose pull && docker compose up -d
```

---

## SECTION 14 — FINAL RECOMMENDATION

### 14.1 Executive Summary

> For a 1–3 student FYP team with limited GPU, 6–8 months, and goals of academic rigor plus industry relevance, this section provides the exact non-negotiable choices. Every decision prioritizes: (1) achievability in the given timeline, (2) maximum resume signal, (3) academic rigor, (4) real-world applicability.

---

### 14.2 Exact Datasets

| Priority | Modality | Dataset | Action |
|---|---|---|---|
| ⭐ MUST | Text | **RAID (100K subset)** — ACL 2024, MIT license | Download Week 1 from HuggingFace |
| ⭐ MUST | Text | **M4 English test** — cross-domain eval | Download Week 7 |
| ⭐ MUST | Image | **CIFAKE (120K)** — 500MB, CC0 | Download Week 1 |
| ⭐ MUST | Image | **GenImage (30GB subset)** — 3 generators | Download Week 11 |
| ⭐ MUST | Audio | **ASVspoof 2019 LA (14GB)** — canonical benchmark | Request access Week 1 |
| ⭐ MUST | Audio | **In-the-Wild (4GB)** — generalization test | Download Week 13 |
| ⚠️ SKIP | Image | ArtiFact (500GB) — too large | Use GenImage |
| ⚠️ SKIP | Audio | ASVspoof 2021 DF (130GB) — too large | Use 2019 LA |
| ❌ AVOID | Video | Any large video dataset — Phase 4 stretch only | Skip unless time permits |

---

### 14.3 Exact Models

| Modality | Model | Reason |
|---|---|---|
| **Text** | `microsoft/deberta-v3-base` fine-tuned on RAID | Best accuracy/size ratio, SHAP-compatible, HuggingFace ecosystem |
| **Image GAN** | ResNet-50 (CNNDetection `blur_jpg_prob0.5.pth`) | Proven, 25M params, sub-100ms, GradCAM-compatible |
| **Image Diffusion** | Corvi EfficientNet-B0 | Lightweight, frequency-based, trainable on single RTX 3090 |
| **Audio** | AASIST-L (pre-trained) | 297K params, 30ms inference, near-SOTA EER, pre-trained available |
| **Video (Phase 4)** | XceptionNet (FF++ trained) | Academic standard, MTCNN-compatible, widely cited |
| ❌ AVOID | DIRE | 12GB VRAM at inference — impossible for web service |
| ❌ AVOID | Binoculars | Two 7B models simultaneously — hardware infeasible |
| ❌ AVOID | Any custom transformer | 6–18 months work — use HuggingFace |

---

### 14.4 Exact GitHub Repositories

| Component | Repository | Integration |
|---|---|---|
| RAID dataset | `liamdugan/raid` | HuggingFace datasets API |
| DeBERTa fine-tune | `huggingface/transformers` | `Trainer` API, copy script from Section 10.1 |
| ResNet-50 GAN detector | `peterwang512/CNNDetection` | Copy `networks/resnet.py` + download weights |
| Corvi diffusion detector | `grip-unina/DMimageDetection` | Copy model architecture + download weights |
| GradCAM | `jacobgil/pytorch-grad-cam` | `pip install grad-cam` — 5 lines |
| AASIST audio detector | `clovaai/aasist` | Clone, copy `models/AASIST.py` + config + weights |
| MTCNN face detection | `timesler/facenet-pytorch` | `pip install facenet-pytorch` |
| XceptionNet video | `ondyari/FaceForensics` | Download weights + `xception.py` |
| SHAP | `slundberg/shap` | `pip install shap` |
| API | `tiangolo/fastapi` | `pip install fastapi[standard]` |
| Queue | `mosquito/aio-pika` | `pip install aio-pika` |
| Object storage | `minio/minio-py` | `pip install minio` |
| PDF reports | `Kozea/WeasyPrint` | `pip install weasyprint` |
| Load testing | `locustio/locust` | `pip install locust` |
| Linting | `astral-sh/ruff` | `pip install ruff` |

---

### 14.5 Exact Architecture

| Decision | Choice | Reason |
|---|---|---|
| API Framework | FastAPI (Python 3.11) | Async, auto OpenAPI, type-safe, standard for ML APIs |
| Frontend | Next.js 14, TypeScript, App Router | Strongest resume signal. SSR + polling in one framework |
| Database | PostgreSQL 16 | ACID, JSONB, array types for flexible result storage |
| ORM | SQLAlchemy 2.0 async + Alembic | Type-safe, async-native, migration management |
| Queue | RabbitMQ (durable + DLX) | Better than Redis Streams for ACK + retry |
| Object Storage | MinIO (S3-compatible) | Self-hosted, zero cloud cost, swap to AWS S3 via env var |
| Cache | Redis 7 | JWT blacklist + rate limit counters only |
| Containerization | Docker Compose (single host) | Right tool for FYP. Do NOT use Kubernetes. |
| Sync vs Async | Text: sync / Image+Audio: async queue | Text < 2s. Image/Audio need queue for backpressure |
| Model loading | Singleton at startup | Never load per-request. FastAPI lifespan events. |
| GPU assignment | Image service only | Image benefits most. Text/Audio fast on CPU. |
| Explainability | SHAP + GradCAM + Spectrogram | Practical, documented, visualizable in browser |
| Fusion | Weighted linear (calibrated LR) | Interpretable, fast, validated |
| Reports | WeasyPrint + Jinja2 | No paid deps. Full CSS control. |
| Monitoring | Prometheus + Grafana | Docker-native, importable dashboards |
| CI/CD | GitHub Actions | Free for public repos, standard industry toolchain |
| Linting | Ruff | 100× faster than black+flake8, single tool |

---

### 14.6 Deployment Strategy

```bash
# Development (Weeks 1–20) — single command
make up           # docker compose up -d --build
make migrate      # docker compose exec api-gateway alembic upgrade head
make test         # pytest services/ shared/ -v
make logs s=text  # docker compose logs -f text-service

# Staging (Weeks 21–24) — DigitalOcean $24/mo Droplet (4vCPU, 8GB RAM)
# nginx + Let's Encrypt SSL (certbot auto-renew)
# GitHub Actions CD: SSH deploy on merge to main
# docker compose pull && docker compose up -d --remove-orphans

# DO NOT USE:
# Kubernetes  → Overkill. 3× setup time for no FYP benefit.
# Terraform   → Overkill for single VM.
# AWS ECS/GCP → Adds cost and complexity. Use DigitalOcean.
# Multiple envs → One staging environment sufficient for FYP.
```

---

### 14.7 Final Implementation Checklist

```
PHASE 1 — FOUNDATION
  [ ] GitHub repo + branch strategy (main/dev/feature/*)
  [ ] docker-compose.yml: all containers healthy
  [ ] All 8 Alembic migrations applied and verified
  [ ] Auth: register → login → JWT → protected route
  [ ] File upload → MinIO → job in DB → RabbitMQ message verified
  [ ] GitHub Actions CI: lint + tests on every PR

PHASE 2 — TEXT
  [ ] RAID dataset downloaded and balanced (100K English)
  [ ] DeBERTa fine-tuned on cloud GPU (budget ≤ $10)
  [ ] text-service: F1 ≥ 0.85 on RAID validation
  [ ] SHAP heatmap generating and rendering in UI
  [ ] M4 cross-dataset evaluation documented

PHASE 3 — IMAGE
  [ ] ResNet-50 + Corvi models downloaded and verified
  [ ] image-service: ensemble scoring end-to-end
  [ ] GradCAM heatmap overlay in frontend UI
  [ ] AUC on CIFAKE + GenImage subset documented

PHASE 4 — AUDIO
  [ ] AASIST baseline EER ≤ 1.0% on ASVspoof 2019 LA
  [ ] audio-service: async processing via RabbitMQ
  [ ] Mel-spectrogram displayed in frontend
  [ ] In-the-Wild cross-dataset EER documented

PHASE 5 — SYSTEM
  [ ] FusionEngine calibrated, weights saved to config/
  [ ] PDF report generating with embedded visuals
  [ ] 3 backend E2E integration tests passing
  [ ] 4 Playwright frontend tests passing
  [ ] P95 text detection < 2s under 10 concurrent users
  [ ] Prometheus + Grafana dashboards running

PHASE 6 — SUBMISSION
  [ ] OWASP ZAP: 0 HIGH severity findings
  [ ] UAT: 3 testers, top-3 issues fixed
  [ ] All evaluation metrics computed and tabulated
  [ ] README with `make up` setup instructions
  [ ] 5-minute demo video recorded and linked
  [ ] GitHub Release v1.0.0 tagged
  [ ] Docker images pushed to GHCR
```

---

### 14.8 Resume Value Map

| Technology Used | Job Description Signal |
|---|---|
| FastAPI + async Python | "Python backend, REST APIs, async programming" |
| SQLAlchemy + PostgreSQL + Alembic | "Database design, ORM, schema migrations" |
| RabbitMQ async queues | "Message queuing, distributed systems, async processing" |
| Docker Compose + multi-stage builds | "Containerization, Docker, microservices" |
| GitHub Actions CI/CD | "DevOps, CI/CD pipelines, automated testing" |
| HuggingFace Transformers (DeBERTa) | "LLM fine-tuning, NLP, transformer models" |
| PyTorch (ResNet, AASIST, GradCAM) | "Deep learning, PyTorch, computer vision, audio ML" |
| SHAP + GradCAM explainability | "Explainable AI, XAI, model interpretability" |
| Next.js 14 TypeScript | "Full-stack, React, TypeScript, modern web development" |
| Prometheus + Grafana | "Observability, monitoring, MLOps, SRE" |
| Pydantic v2 DTOs | "Type safety, API contracts, data validation" |
| MinIO S3-compatible | "Cloud storage, object storage, AWS S3" |
| Locust load testing | "Performance testing, SLO validation" |
| Multi-modal fusion (SHAP calibration) | "ML system design, ensemble methods, calibration" |

---

*Blueprint Complete — 14 of 14 Sections*
*Documents:*
*  blueprint_sections_1_to_4.md*
*  blueprint_sections_5_to_8.md*
*  blueprint_sections_9_to_14.md*
