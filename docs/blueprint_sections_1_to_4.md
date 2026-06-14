# Multi-Modal AI Content Forensics Platform
## Software Engineering Blueprint — Sections 1–4

**Document Version:** 3.0 (Comprehensive FYP Architecture & Feasibility Plan)
**Type:** Internal Architecture & Engineering Reference
**Scope:** Sections 1–4 of 14
**Target Audience:** Development Team, Faculty Supervisor, External Examiners
**Project Duration:** 6–8 months | **Team Size:** 1–3 students

---

## SECTION 1 — PROJECT FEASIBILITY

### 1.1 Complexity Analysis

**Overall System Complexity Rating: HIGH (8.5 / 10)**

This is not a single-model research project. It is a distributed software platform that integrates multiple independent ML inference pipelines under a shared API gateway, queue infrastructure, explainability layer, report engine, and web dashboard.

To ensure successful delivery within an academic timeline, the project adopts a strictly phased approach, moving the riskiest components to later phases.

#### Per-Modality Complexity Breakdown

| Modality | ML Complexity | Preprocessing Complexity | Engineering Integration | Explainability | Phase Designation | Total Rating |
|---|---|---|---|---|---|---|
| **Text** | Medium | Low | Low | Medium (SHAP) | Phase 1 (Core) | 5/10 |
| **Image** | Medium | Medium | Medium | Medium (GradCAM) | Phase 2 (Core) | 6/10 |
| **Audio** | High | High | High | High (Spectrograms) | Phase 3 (Core) | 8/10 |
| **Video** | Very High | Very High | Very High | Very High | Phase 4 (Stretch) | 9.5/10 |
| **System** | — | — | High | — | Phase 1 (Core) | 8/10 |

**Strategic Pivot for Video Constraints:**
Video deepfake detection is disproportionately hard. Frame extraction, face-crop detection (MTCNN), temporal aggregation, and processing 30fps video are computationally prohibitive without smart sampling. State-of-the-art models often fail to generalize. **Video is explicitly demoted to a Phase 4 stretch goal** to prevent it from blocking core platform delivery.

---

### 1.2 Team Size Requirements

#### One Student (Minimum Viable Scenario)

- **Achievable:** Text + Image detection only. Unified API, simple frontend.
- **Compromise:** No video, no audio, no advanced fusion layer, minimal explainability.
- **Risk:** High — any blocking issue delays the entire project.
- **Workload:** ~400–500 hours of focused engineering.

#### Two Students (Recommended Configuration)

- **Student A (Backend / ML Integration Engineer):** FastAPI services, model integration (PyTorch/HuggingFace), PostgreSQL, RabbitMQ, Docker setup, Text & Audio pipelines.
- **Student B (Frontend / DevOps / ML Engineer):** Next.js dashboard, CI/CD, report generation, explainability visualizations, Image pipeline, Platform Fusion Layer.
- **Achievable:** Text, Image, and Audio modalities; REST API, dashboard, explainability for text/image, PDF reports, and cross-modality weighted fusion.
- **Workload:** ~350–400 hours per student over 6–8 months.

#### Three Students (Optimal Configuration)

- **Student A:** Backend infrastructure — FastAPI, PostgreSQL, RabbitMQ, Docker, CI/CD.
- **Student B:** ML pipeline engineering — All 4 detection services (including Video), fusion layer, explainability algorithms.
- **Student C:** Frontend + DevOps — Next.js, PDF report engine, monitoring, dataset curation, and academic evaluation matrix.
- **Achievable:** Near-production system with proper microservice separation and all 4 modalities.

---

### 1.3 Expected Timeline (6-Month Phased Delivery, 2 Students)

| Month | Phase | Focus Area |
|---|---|---|
| **Month 1** | Phase 1 (Infrastructure & Scaffolding) | Docker Compose stack, PostgreSQL schema, FastAPI skeleton, Next.js skeleton, GitHub Actions CI/CD setup |
| **Month 2** | Phase 1 (Text Modality & API) | Text detection pipeline end-to-end (DeBERTa fine-tuned), SHAP token visualization integration |
| **Month 3** | Phase 2 (Image Modality & Storage) | Image detection pipeline end-to-end (ResNet-50 / Corvi Ensemble), MinIO/S3 file upload pipeline integration, GradCAM visualization |
| **Month 4** | Phase 3 (Audio Modality & Queues) | Audio detection pipeline (AASIST pre-trained), RabbitMQ async job system for long-running inference handling |
| **Month 5** | Phase 4 (System Fusion & Reporting) | Weighted fusion algorithm, PDF report engine, end-to-end test suite execution |
| **Month 6** | Phase 4 (Evaluation & Stretch Goals) | Cross-dataset evaluation matrix, Video detection integration (if time permits), Final documentation |

---

### 1.4 GPU Requirements

#### Minimum Viable (Inference Only)

| Modality | Minimum GPU VRAM | Recommended GPU | CPU Feasible? |
|---|---|---|---|
| **Text (DeBERTa-v3)** | 4 GB | RTX 3060+ | Yes (slow, ~8–15s) |
| **Image (ResNet-50 / Corvi)** | 4 GB | RTX 3060+ | Yes (~2–5s) |
| **Audio (AASIST)** | 2 GB | RTX 2060+ | Yes (~5–10s) |
| **Video (XceptionNet)** | 6 GB | RTX 3060+ | Very slow (minutes) |

#### Fine-Tuning Requirements (One-Time Cloud Cost)

> **Strategy:** Fine-tune once on cloud, checkpoint the model, and use it for local inference thereafter.

| Task | GPU | Estimated Time | Cloud Cost (A100 40GB) |
|---|---|---|---|
| DeBERTa text fine-tune (RAID) | A100 40GB | 2–4 hours | ~$5–10 |
| **Total fine-tuning budget** | — | **< 5 hours** | **< $15** |

---

### 1.5 Storage Requirements

| Category | Description | Estimated Size |
|---|---|---|
| **Development Datasets** | RAID text, CIFAKE, ASVspoof LA, GenImage subset | ~60–80 GB |
| **Model Checkpoints** | Pre-trained and fine-tuned models | ~10–20 GB |
| **Application Data** | Runtime uploads, Postgres data, MinIO local | ~10–50 GB |
| **Docker & System** | Base images, build cache, logs | ~30 GB |
| **Total Recommended** | **NVMe SSD strictly required** | **500 GB – 1 TB** |

> ⚠️ Do NOT try to work from an external HDD — model loading times and data iteration will stall the project.

---

### 1.6 Cost Estimates (6-Month Budget)

| Expense | Option A (Budget) | Option B (Comfortable) |
|---|---|---|
| **Cloud GPU (Fine-tuning)** | $10 (Colab Pro or Lambda Labs) | $50 (Vast.ai / RunPod burst) |
| **Storage (Local SSD)** | $0 (Existing hardware) | $80–120 (1TB NVMe) |
| **Infrastructure / DB** | $0 (Local Docker) | $0 (Local Docker) |
| **Total 6-month estimate** | **$10** | **$130–$170** |

---

### 1.7 Scope Definition

#### Final Year Project Scope (Strictly Scoped for Success)

**Included:**
- Text, Image, and Audio detection services
- Explainability for Text (SHAP) and Image (GradCAM) only
- Unified REST API, PostgreSQL database, RabbitMQ async queues, Docker Compose deployment, Next.js dashboard, PDF Reports
- Multi-modality weighted fusion layer to generate a master confidence score

#### What Should NOT Be Implemented (Scope Creep Traps)

| Item | Reason to Exclude |
|---|---|
| **Custom transformer architecture** | 6–18 months of research effort. Use HuggingFace. |
| **Real-time video streaming (WebRTC)** | Requires video encoding pipelines. Accept pre-uploaded static files only. |
| **MLflow / Model Registries / Hot-swapping** | Overkill for an academic FYP deployment. Load models at startup. |
| **Video explainability (deep temporal)** | Extremely complex to visualize meaningfully on the web. Mark as explicit "future work." |
| **Custom neural fusion model** | Weighted LR calibration is sufficient and interpretable for FYP evaluation. |

#### Phase 4 Stretch Goals (Attempt Only After Core Platform is Complete)

| Stretch Goal | Prerequisite | Estimated Effort |
|---|---|---|
| **Browser Extension** | Core REST API complete and deployed | 3–4 weeks (Student B) |
| **Source Model Attribution** | Text detection working; RAID attribution labels available | 2–3 weeks (Student A) |
| **Adversarial Robustness Testing** | All detection services running; paraphrasing pipeline needed | 2 weeks (Student A) |
| **Video Deepfake Detection** | Phases 1–5 complete; GPU available with ≥ 6 GB VRAM | 4–6 weeks (Both) |

> ⚠️ **Redis is NOT in scope creep — it is a mandatory core dependency.** Redis is used for: (1) JWT refresh token storage and blacklisting in auth-service, (2) rate-limit sliding window counters in the API Gateway via `slowapi`, and (3) login throttle counters for brute-force protection. Do NOT remove Redis from the stack.

---

### 1.8 Engineering Risk Register

| Risk | Probability | Impact | Mitigation Strategy |
|---|---|---|---|
| **Video detector pipeline too slow/complex** | High | High | Demote video to Phase 4 stretch goal. Use frame sampling (2fps) if implemented. |
| **Dataset download restrictions (FF++)** | Medium | High | Submit academic access requests on Day 1. Have CIFAKE ready as a fallback. |
| **Local GPU out-of-memory (OOM) errors** | High | High | Enforce strict file size limits at the API gateway; limit batch sizes. |
| **API blocking during long inference** | Medium | High | Mandatory implementation of RabbitMQ for image/audio/video processing. |
| **Integration Failure (Services cannot talk)** | Low | High | Establish rigid OpenAPI 3.0 specs in Week 2. Stub all API responses before ML integration. |

---

## SECTION 2 — SYSTEM REQUIREMENTS

### 2.1 Functional Requirements

#### Core Detection & Fusion

| ID | Requirement |
|---|---|
| **FR-01** | System SHALL accept plain text input (UTF-8, max 10,000 characters) and return an AI-detection probability score between 0.0 and 1.0. |
| **FR-02** | System SHALL accept image files (JPEG, PNG, WebP) up to 10 MB and return an AI-generation probability score. |
| **FR-03** | System SHALL accept audio files (WAV, MP3, FLAC) up to 30 MB / 120 seconds and return a synthetic speech probability score via async queueing. |
| **FR-04** | System SHALL provide explainability output: SHAP token attribution for text, and GradCAM heatmap generation for images. |
| **FR-05** | **[FUSION LAYER]** System SHALL implement a multimodal fusion layer to calculate an overall confidence score using a weighted average: `P_final = Σ(wᵢ · pᵢ)` where `wᵢ` is the configured weight for modality `i`, derived via validation set calibration. |

#### API & Dashboard Requirements

| ID | Requirement |
|---|---|
| **FR-06** | System SHALL expose a RESTful HTTP API with OpenAPI 3.0 specification auto-generated at `/api/docs`. |
| **FR-07** | System SHALL support asynchronous job submission with a polling endpoint (`/api/v1/jobs/{job_id}`). |
| **FR-08** | System SHALL provide a web dashboard (Next.js) for file upload, real-time job status, and inline result visualization. |
| **FR-09** | System SHALL generate downloadable PDF reports containing: input summary, probability score, confidence, verdict, explainability visualizations, and model metadata. |

---

### 2.2 Non-Functional Requirements

| ID | Requirement |
|---|---|
| **NFR-01** | Each detection modality SHALL be implemented as an independently scalable service. |
| **NFR-02** | All services SHALL be containerized with Docker and orchestrated via a single `docker-compose up` command. |
| **NFR-03** | Service configuration SHALL be fully externalized to `.env` files. |
| **NFR-04** | Database schema changes SHALL be managed via versioned Alembic migration files — no manual DDL. |
| **NFR-05** | Python code SHALL comply with PEP 8 enforced via `ruff` in CI. |

---

### 2.3 Performance Requirements

| ID | Requirement |
|---|---|
| **PR-01** | Text detection P95 latency (1,000 chars, GPU) < 2 seconds. |
| **PR-02** | Image detection P95 latency (5 MB JPEG, GPU) < 5 seconds. |
| **PR-03** | Audio detection job completion (60-second clip, GPU) < 30 seconds. |
| **PR-04** | API gateway overhead (routing only) < 50 ms. |

---

### 2.4 Security Requirements

| ID | Requirement |
|---|---|
| **SR-01** | API SHALL require JWT authentication for all detection endpoints. |
| **SR-02** | Uploaded files SHALL be validated for MIME type via `python-magic`, not just file extension. |
| **SR-03** | Uploaded files SHALL be stored in isolated object storage (MinIO), never in the web server root. |
| **SR-04** | API SHALL rate-limit requests (e.g., 60 requests/minute) via `slowapi`. |
| **SR-05** | Database queries SHALL use SQLAlchemy parameterized statements to prevent SQL injection. |

---

## SECTION 3 — BUILD VS BUY ANALYSIS

> **Decision Framework:** For each modality, we evaluate options across a 4-point matrix:
> - **A** = Use existing pre-trained model as-is (inference only)
> - **B** = Fine-tune an existing pre-trained model on task-specific data
> - **C** = Build custom architecture from scratch *(Never recommended for FYP)*
> - **D** = Ensemble multiple existing models
>
> **General Principle:** The engineering contribution lies in the platform, data handling, fusion layer, and explainability — not in the novel detector algorithm.

---

### 3.1 Text Detection

#### Available Open-Source Models

| # | Model | Parameters | Notes |
|---|---|---|---|
| 1 | **RoBERTa GPT-2 Detector (OpenAI, 2019)** | 355M | Critically outdated; fails on GPT-4/Claude |
| 2 | **Binoculars (Hans et al., 2024)** | 2× 7B = 14B | Near-SOTA accuracy but ~28 GB VRAM — impractical |
| 3 | **Fast-DetectGPT (Bao et al., 2023)** | 2B–7B | Zero-shot, too heavy for standard local hardware |
| 4 | **DeBERTa-v3 fine-tuned on RAID** | 86M | Best balance of accuracy, speed, and deployability ✅ |

#### TEXT Final Decision

> **DECISION: B — Fine-tune DeBERTa-v3-base on RAID dataset.**
>
> **Reasoning:** Best balance of modern accuracy, speed, and deployability. 86M params fits easily on CPU/GPU. Integrates perfectly with SHAP for frontend visualization. Trains in 2 hours on cloud GPU. Sub-100ms inference.

---

### 3.2 Image Detection

> Modern AI image detection must handle GANs (spatial artifacts) and Diffusion models (spectral/reconstruction artifacts). Single models fail to cover both.

#### Available Open-Source Models

| # | Model | Architecture | Specialty | Notes |
|---|---|---|---|---|
| 1 | **Wang et al. CNNDetection (2020)** | ResNet-50 | GAN detection | Excellent on GANs, poor on Diffusion. Sub-100ms inference ✅ |
| 2 | **UnivFD (Liu et al., 2022)** | CLIP ViT-L/14 + linear probe | Both | Good generalizer, slightly heavier |
| 3 | **DIRE (Wang et al., 2023)** | ResNet-50 + diffusion model | Diffusion | SOTA for diffusion but ~12 GB VRAM, 10s/image — too heavy |
| 4 | **Corvi et al. (2023)** | EfficientNet-B0 (frequency) | Diffusion | Lightweight, sub-200ms inference ✅ |

#### IMAGE Final Decision

> **DECISION: A + D (Inference Only Ensemble).**
>
> **Reasoning:** Primary ResNet-50 (Wang et al.) for GANs, ensembled with Corvi et al. for Diffusion. Weighted average output. Both are lightweight, fit in memory, and support `pytorch-grad-cam` for explainability heatmaps. Avoid DIRE due to massive compute requirements.

---

### 3.3 Audio Detection

> The primary benchmark is ASVspoof 2019 LA track (detecting TTS/Voice Conversion vs. real speech).

#### Available Open-Source Models

| # | Model | Parameters | EER (ASVspoof 2019 LA) | Notes |
|---|---|---|---|---|
| 1 | **AASIST (Jung et al., 2022)** | 297K | 0.83% | Near-SOTA, sub-50ms inference, pre-trained weights available ✅ |
| 2 | **RawGAT-ST (Tak et al., 2021)** | ~500K | 1.06% | Superseded by AASIST |
| 3 | **Wav2Vec2 Fine-Tuned** | 95M | ~1.8% | Stronger generalization, but 8–12h fine-tuning on A100 required |

#### AUDIO Final Decision

> **DECISION: A (AASIST inference-only).**
>
> **Reasoning:** AASIST provides near-SOTA accuracy with practically zero engineering footprint or fine-tuning cost. It requires <1 GB VRAM, ensuring it won't crash alongside other models. Skip Wav2Vec2 fine-tuning to save time.

---

### 3.4 Video Detection (Phase 4 Stretch Goal)

#### Available Open-Source Models

| # | Model | Architecture | Generalization | Notes |
|---|---|---|---|---|
| 1 | **XceptionNet (FaceForensics++ Baseline)** | Modified Inception | Medium | Widely reproduced, fast frame inference ✅ |
| 2 | **SBI (Self-Blended Images, 2022)** | EfficientNet-B4 | Strong cross-dataset | Best real-world performance but ~6 GB VRAM |
| 3 | **FTCN (Zheng et al., 2021)** | Fully temporal 1D CNN | Strong temporal | Too complex for variable-length web uploads |

#### VIDEO Final Decision (If Attempted)

> **DECISION: A (Inference Only Frame-Level Strategy).**
>
> **Reasoning:** Sample frames at 2fps → MTCNN face crop → XceptionNet inference → average probabilities. Do NOT attempt 3D/temporal models or train from scratch.

---

### 3.5 System Fusion Layer Strategy

To combine independent modal outputs into a single platform verdict, the system requires a Fusion Layer.

| Property | Detail |
|---|---|
| **Method** | Late Fusion (Score-level) |
| **Algorithm** | Weighted Linear Combination: `P_final = Σ(wᵢ · pᵢ)` where weights sum to 1.0 |
| **Default Weights (Bootstrap)** | `w_text = 0.50, w_image = 0.30, w_audio = 0.20` — empirically motivated starting point based on relative model accuracy. Used when calibration data is not yet available. |
| **Calibration Strategy** | Once all detection services are running (Phase 5, Week 17), run `scripts/calibrate_fusion_weights.py`. This fits a constrained Logistic Regression model (no intercept, non-negative coefficients forced to sum to 1.0) on a held-out synthetic multimodal validation set (min. 100 labelled samples). Saves calibrated weights to `config/fusion_weights.json`. The `FusionEngine` loads weights from this file at startup and falls back to hardcoded defaults if the file is absent. |
| **Weight Precedence** | `config/fusion_weights.json` (calibrated) > `FusionEngine` constructor defaults (hardcoded) |
| **Image Sub-Ensemble** | Within the image modality, the ResNet-50 / Corvi sub-ensemble uses fixed weights: `w_resnet = 0.55, w_corvi = 0.45`. These reflect ResNet-50's stronger GAN generalization and Corvi's diffusion specialization. These weights are NOT recalibrated by the fusion LR script — they are image-modality-internal constants. |
| **Purpose** | Provide an interpretable, auditable, and reproducible fusion decision that can be reported in the dissertation with full methodology transparency. |

---

## SECTION 4 — DATASET & EVALUATION ANALYSIS

### 4.1 Text Detection Datasets

| Dataset | Total Samples | Generators | Domains | License | Storage | Purpose |
|---|---|---|---|---|---|---|
| **RAID (2024)** | 500,000+ | 11 LLMs (GPT-4, Claude, Llama-2) | 11 | MIT | ~3 GB | Primary fine-tuning (Use 100K subset) |
| **M4 (2023)** | 122,000 | 6 LLMs | 4 | Apache 2.0 | ~600 MB | Cross-domain evaluation |
| **HC3 (2023)** | 24,000 | GPT-3.5 Only | 5 | CC BY-SA | ~50 MB | ChatGPT-specific baseline |
| **TuringBench** | 200,000 | 19 Legacy LLMs | News | MIT | ~2 GB | Avoid (Outdated distributions) |

**Dataset Links:**
- RAID: https://huggingface.co/datasets/liamdugan/raid
- M4: https://github.com/mbzuai-nlp/M4
- HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3

---

### 4.2 Image Detection Datasets

| Dataset | Total Images | Generation Methods | License | Storage | Purpose |
|---|---|---|---|---|---|
| **GenImage** | 2.66M | 8 (SD, MJ, DALL-E) | CC BY 4.0 | 200 GB | Generalization eval (Download 30 GB subset only) |
| **CIFAKE** | 120,000 | Stable Diffusion (CIFAR-style) | CC0 | 500 MB | Rapid prototyping / Unit tests |
| **FaceForensics++** | 1M+ frames | 5 face manipulation methods | Academic | 17 GB (c40) | Face GAN evaluation |
| **ArtiFact** | 2.5M | 25+ generators | MIT | 500 GB | Holdout generalization test (use tiny subset) |

**Dataset Links:**
- GenImage: https://github.com/GenImage-Dataset/GenImage
- CIFAKE: https://huggingface.co/datasets/chesterkuo/cifake
- FaceForensics++: https://github.com/ondyari/FaceForensics (academic request required)

---

### 4.3 Audio Detection Datasets

| Dataset | Total Utterances | Attack Types | License | Storage | Purpose |
|---|---|---|---|---|---|
| **ASVspoof 2019 LA** | 121,461 | 19 TTS + 6 VC | CC BY-SA | 14 GB | Primary benchmark & Evaluation |
| **ASVspoof 2021 DF** | 611,829 | In-the-wild TTS | CC BY-SA | 130 GB | Avoid (Too large for FYP) |
| **WaveFake** | 117,985 | 6 neural vocoders | MIT | 52 GB | Vocoder-specific evaluation |
| **In-the-Wild** | 31,000 | Real-world internet TTS | CC BY 4.0 | 4 GB | Cross-dataset generalization eval |

**Dataset Links:**
- ASVspoof 2019: https://datashare.ed.ac.uk/handle/10283/3336
- WaveFake: https://github.com/RUB-SysSec/WaveFake
- In-the-Wild: https://deepfake-total.com/in_the_wild

---

### 4.4 Academic Evaluation Plan & Metrics

To demonstrate rigorous engineering to external examiners, the platform will be evaluated not just on validation sets, but via strict cross-dataset testing to prove real-world robustness.

#### Core Modality Evaluation Matrix

| Modality | Primary Training/Tuning | Holdout Testing (Generalization) | Target Metric |
|---|---|---|---|
| **Text** | RAID (Sub-domain A) | M4 English Test Set | F1-Score, AUROC |
| **Image** | Pre-trained weights | GenImage (Subset) + CIFAKE | AUC |
| **Audio** | Pre-trained (ASVspoof 19) | In-the-Wild Dataset | EER (Equal Error Rate) |

#### Fusion Evaluation Plan

The overall platform architecture will be evaluated by constructing a **"Synthetic Multimodal Test Set"** (e.g., 100 fake news articles containing AI text, AI images, and AI audio clips). The overall accuracy of the Fusion Layer (`P_final`) will be plotted on an ROC curve against the individual modalities to prove that the whole system performs better than its isolated parts.

---

### 4.5 Storage Budget & Dataset Action Plan

#### Aggregated Storage Plan (Local NVMe)

| Category | Estimated Size |
|---|---|
| Text Datasets | ~5 GB |
| Image Datasets (Subsets only) | ~35 GB |
| Audio Datasets | ~20 GB |
| Models + Checkpoints | ~15 GB |
| Development Workspace (Docker, DB) | ~30 GB |
| **Total Expected Utilization** | **~105 GB** |

#### Dataset Access Timeline

| Week | Action |
|---|---|
| **Week 1** | Submit FaceForensics++ academic access requests (approval takes 3–10 days). Download CIFAKE and RAID. |
| **Week 2** | Download ASVspoof 2019 LA track via Edinburgh DataShare. |
| **Week 4** | Download specific 3-generator subset of GenImage (~30 GB). |

---

*End of Sections 1–4 | Continued in: blueprint_sections_5_to_8.md (Research Papers, Architecture, Microservices, Database)*
