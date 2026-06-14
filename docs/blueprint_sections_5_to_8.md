# Multi-Modal AI Content Forensics Platform
## Software Engineering Blueprint — Sections 5–8

**Document Version:** 4.0 (Full LLD Expansion)
**Type:** Internal Architecture & Engineering Reference
**Scope:** Sections 5–8 of 14
**Target Audience:** Development Team, Faculty Supervisor, External Examiners
**Continuation of:** Sections 1–4 (blueprint_sections_1_to_4.md)

---

## SECTION 5 — RESEARCH PAPER SURVEY

> **Reading Strategy for Implementation:** Focus on the **GitHub** column first. Papers with working repos reduce integration time from weeks to days. Read the full paper only when you need to understand a hyperparameter or architectural decision.

### 5.1 Text AI Detection Papers

---

#### Paper T-01: Detecting GPT-2 Generated Text (RoBERTa Detector)

| Field | Detail |
|---|---|
| **Title** | Release Strategies and the Social Impacts of Language Models |
| **Year** | 2019 |
| **Conference** | OpenAI Technical Report (arXiv:1908.09203) |
| **Dataset Used** | GPT-2 WebText outputs vs. real WebText articles |
| **Hardware Used** | TPU v3-8 (OpenAI internal) |
| **Algorithm** | RoBERTa-Large fine-tuned as binary classifier on GPT-2 vs human text |
| **Key Metrics** | Accuracy: 88% (in-distribution); drops to ~54% on GPT-3+ outputs |
| **Critical Limitations** | Fundamentally broken on modern LLMs. Acts as a false baseline — do NOT use as your primary detector |
| **GitHub** | https://github.com/openai/gpt-2-output-dataset |
| **FYP Relevance** | Literature review only. Establishes why we need DeBERTa re-trained on RAID. |

---

#### Paper T-02: DetectGPT — Zero-Shot Machine-Generated Text Detection

| Field | Detail |
|---|---|
| **Title** | DetectGPT: Zero-Shot Machine-Generated Text Detection Using Probability Curvature |
| **Year** | 2023 |
| **Conference** | ICML 2023 (Oral) |
| **Dataset Used** | XSum, SQuAD, Reddit WritingPrompts |
| **Hardware Used** | 4× A100 80GB |
| **Algorithm** | Generates ~100 perturbations via T5 masking, re-scores with source LLM, computes curvature |
| **Key Metrics** | AUROC: 0.95 (in-distribution); 0.72–0.85 (cross-model) |
| **Critical Limitations** | Requires source LLM at inference, ~20–30s per query. NOT deployable in web service. |
| **GitHub** | https://github.com/eric-mitchell/detect-gpt |
| **FYP Relevance** | Cite as theoretical baseline. Do NOT implement. |

---

#### Paper T-03: Fast-DetectGPT

| Field | Detail |
|---|---|
| **Title** | Fast-DetectGPT: Efficient Zero-Shot Detection via Conditional Probability Curvature |
| **Year** | 2024 |
| **Conference** | ICLR 2024 |
| **Algorithm** | Single conditional sampling pass instead of 100 perturbation calls. 340× faster than DetectGPT |
| **Key Metrics** | AUROC: 0.98 (GPT-3.5), 0.91 (GPT-4) |
| **Critical Limitations** | Still requires 7B+ scoring model at runtime. Not suitable for low-VRAM FYP deployment. |
| **GitHub** | https://github.com/baoguangsheng/fast-detect-gpt |
| **FYP Relevance** | Good citation. Feasible only if spare 7B scoring model available. |

---

#### Paper T-04: RADAR — Robust AI-Text Detection via Adversarial Learning

| Field | Detail |
|---|---|
| **Title** | RADAR: Robust AI-Text Detection via Adversarial Learning |
| **Year** | 2023 |
| **Conference** | NeurIPS 2023 |
| **Dataset Used** | HC3 + adversarially paraphrased variants |
| **Algorithm** | Joint adversarial training: Vicuna-7B paraphraser vs DeBERTa detector |
| **Key Metrics** | F1: 0.89 on HC3; 0.82 on adversarial inputs vs 0.61 for vanilla classifiers |
| **GitHub** | https://github.com/IBM/RADAR |
| **FYP Relevance** | Cite for adversarial robustness discussion. Do NOT replicate training from scratch. |

---

#### Paper T-05: RAID Benchmark ⭐ PRIMARY

| Field | Detail |
|---|---|
| **Title** | RAID: A Shared Benchmark for Robust Evaluation of Machine-Generated Text Detectors |
| **Year** | 2024 |
| **Conference** | ACL 2024 |
| **Dataset** | 500,000+ samples, 11 LLMs × 11 domains × multiple attack types |
| **Key Metrics** | Best detector: ~75% F1 at 5% FPR on adversarial attacks |
| **GitHub** | https://github.com/liamdugan/raid |
| **FYP Relevance** | **PRIMARY REFERENCE.** Use RAID dataset for fine-tuning. Use RAID evaluation methodology. |

---

#### Paper T-06: Binoculars

| Field | Detail |
|---|---|
| **Title** | Spotting LLMs With Binoculars: Zero-Shot Detection of Machine-Generated Text |
| **Year** | 2024 |
| **Conference** | ICML 2024 |
| **Algorithm** | Ratio of Performer (Falcon-7B) perplexity to Observer (Falcon-7B-Instruct) cross-perplexity |
| **Key Metrics** | AUROC: 0.99 on GPT-3.5/4; 0.91 on RAID |
| **Critical Limitations** | Requires TWO 7B models simultaneously (~28 GB VRAM). Not feasible for FYP hardware. |
| **GitHub** | https://github.com/ahans30/Binoculars |
| **FYP Relevance** | Cite as SOTA upper-bound benchmark. Do NOT deploy as primary service. |

---

### 5.2 Image AI Detection Papers

---

#### Paper I-01: CNNDetection ⭐ PRIMARY (GAN)

| Field | Detail |
|---|---|
| **Title** | CNN-Generated Images Are Surprisingly Easy to Spot... For Now |
| **Year** | 2020 |
| **Conference** | CVPR 2020 |
| **Dataset Used** | 11 GANs (ProGAN, CycleGAN, StyleGAN, BigGAN) |
| **Algorithm** | ResNet-50 fine-tuned on ProGAN with aggressive augmentation (JPEG, blur, resize) |
| **Key Metrics** | AUC: 0.99 (ProGAN); 0.81–0.96 (unseen GANs); 0.51–0.60 (Diffusion — near-random) |
| **GitHub** | https://github.com/peterwang512/CNNDetection |
| **FYP Relevance** | **PRIMARY IMAGE MODEL (GAN component).** Pre-trained weights available directly. |

---

#### Paper I-02: UnivFD

| Field | Detail |
|---|---|
| **Title** | Towards Universal Fake Image Detection by Training on a Front Door Criterion |
| **Year** | 2023 |
| **Conference** | CVPR 2023 |
| **Algorithm** | CLIP ViT-L/14 frozen feature extractor + linear probe. Causal front-door intervention. |
| **Key Metrics** | AUC: 0.95 average across 17 generators |
| **GitHub** | https://github.com/Ekko-zn/AIGC-AD |
| **FYP Relevance** | Strong alternative/backup model. Adds ~50ms inference but better diffusion generalization. |

---

#### Paper I-03: DIRE

| Field | Detail |
|---|---|
| **Title** | DIRE for Diffusion-Generated Image Detection |
| **Year** | 2023 |
| **Conference** | ICCV 2023 |
| **Algorithm** | DDIM inversion reconstruction error. AI images have low error (lie on diffusion manifold). |
| **Key Metrics** | AUC: 0.99 in-distribution |
| **Critical Limitations** | Requires full diffusion model at inference (~12 GB VRAM, 10s per image). Completely impractical. |
| **GitHub** | https://github.com/ZhendongWang6/DIRE |
| **FYP Relevance** | Cite as SOTA diffusion detection. Do NOT implement. Use Corvi instead. |

---

#### Paper I-04: Corvi et al. ⭐ PRIMARY (Diffusion)

| Field | Detail |
|---|---|
| **Title** | On the Detection of Synthetic Images Generated by Diffusion Models |
| **Year** | 2023 |
| **Conference** | ICASSP 2023 |
| **Algorithm** | 2D FFT magnitude + high-pass residuals → EfficientNet-B0 binary classifier |
| **Key Metrics** | AUC: 0.97 (LDM); 0.93 (DALL-E 2); ~150ms inference on GPU |
| **Hardware** | Single NVIDIA RTX 3090 |
| **GitHub** | https://github.com/grip-unina/DMimageDetection |
| **FYP Relevance** | **PRIMARY IMAGE MODEL (Diffusion component).** Lightweight, trainable on single GPU. |

---

#### Paper I-05: GradCAM ⭐ Explainability

| Field | Detail |
|---|---|
| **Title** | Grad-CAM: Visual Explanations from Deep Networks via Gradient-based Localization |
| **Year** | 2017/2019 |
| **Conference** | ICCV 2017 |
| **Algorithm** | Gradient of class score w.r.t. last conv layer activations → weighted feature map heatmap |
| **GitHub** | https://github.com/jacobgil/pytorch-grad-cam |
| **FYP Relevance** | **EXPLAINABILITY LAYER for Image Detection.** 5 lines of code to integrate. |

---

### 5.3 Audio AI Detection Papers

---

#### Paper A-01: AASIST ⭐ PRIMARY

| Field | Detail |
|---|---|
| **Title** | AASIST: Audio Anti-Spoofing Using Integrated Spectro-Temporal Graph Attention Networks |
| **Year** | 2022 |
| **Conference** | ICASSP 2022 |
| **Dataset Used** | ASVspoof 2019 LA |
| **Hardware Used** | Single NVIDIA V100 16GB |
| **Algorithm** | Raw waveform → SincNet → Heterogeneous Graph Attention (spectral + temporal) → binary classification |
| **Key Metrics** | EER: 0.83% on ASVspoof 2019 LA eval. 297K parameters. ~30ms inference per 4s clip. |
| **GitHub** | https://github.com/clovaai/aasist |
| **FYP Relevance** | **PRIMARY AUDIO MODEL.** Load pre-trained weights. Under 1MB model. 30ms inference. |

---

#### Paper A-02: RawGAT-ST

| Field | Detail |
|---|---|
| **Title** | End-to-End Spectro-Temporal Graph Attention Networks for Speaker Verification Anti-Spoofing |
| **Year** | 2021 |
| **Conference** | Interspeech 2021 |
| **Key Metrics** | EER: 1.06% (superseded by AASIST) |
| **GitHub** | https://github.com/eurecom-asp/RawGAT-ST |
| **FYP Relevance** | Literature review only. Predecessor to AASIST. |

---

#### Paper A-03: Wav2Vec2 Anti-Spoofing

| Field | Detail |
|---|---|
| **Title** | Automatic Speaker Verification Spoofing and Deepfake Detection Using Wav2Vec 2.0 |
| **Year** | 2022 |
| **Conference** | Odyssey 2022 |
| **Key Metrics** | EER: 1.8% on ASVspoof 2021 DF. Stronger cross-dataset generalization than AASIST. |
| **GitHub** | https://github.com/TakHemlata/SSL_Anti-spoofing |
| **FYP Relevance** | Phase 4 optional upgrade for generalization. Cite when discussing AASIST limitations. |

---

#### Paper A-04: LCNN Baseline

| Field | Detail |
|---|---|
| **Title** | Light CNN for Anti-Spoofing (LFCC+LCNN baseline) |
| **Year** | 2020 |
| **Conference** | ICASSP 2020 |
| **Key Metrics** | EER: 5.06% — traditional approach baseline |
| **GitHub** | https://github.com/asvspoof-challenge/asvspoof2021 |
| **FYP Relevance** | Use as baseline comparison. Provides "traditional vs modern" narrative for methodology chapter. |

---

### 5.4 Video Deepfake Detection Papers

---

#### Paper V-01: FaceForensics++ ⭐ Phase 4

| Field | Detail |
|---|---|
| **Title** | FaceForensics++: Learning to Detect Manipulated Facial Images |
| **Year** | 2019 |
| **Conference** | ICCV 2019 |
| **Dataset Used** | 1,000 original videos × 5 manipulation methods × 3 compression levels |
| **Algorithm** | XceptionNet per-frame binary classifier on face crops (MTCNN pre-processing) |
| **Key Metrics** | Accuracy: 99.4% (c0); 81.4% (c40 social-media quality); 74% cross-dataset |
| **GitHub** | https://github.com/ondyari/FaceForensics |
| **FYP Relevance** | **PRIMARY VIDEO MODEL if Phase 4 attempted.** Academic license required. |

---

#### Paper V-02: SBI — Self-Blended Images

| Field | Detail |
|---|---|
| **Title** | Detecting Deepfakes with Self-Blended Images |
| **Year** | 2022 |
| **Conference** | CVPR 2022 (Oral) |
| **Algorithm** | EfficientNet-B4 trained on synthetic "self-blended" forgeries for cross-dataset generalization |
| **Key Metrics** | AUC: 0.93 (CelebDF-v2); 0.88 (DFDC) — best cross-dataset generalization of its era |
| **GitHub** | https://github.com/mapooon/SelfBlendedImages |
| **FYP Relevance** | Preferred if VRAM allows (~6GB). Better real-world performance than XceptionNet. |

---

#### Paper V-03: FTCN

| Field | Detail |
|---|---|
| **Title** | Exploring Temporal Coherence for More General Video Face Forgery Detection |
| **Year** | 2021 |
| **Conference** | ICCV 2021 |
| **Algorithm** | Fully temporal 1D convolutions. Collapses spatial dims to model temporal incoherence only. |
| **Key Metrics** | AUC: 0.98 (FF++ c23); 0.86 (CelebDF-v2) |
| **GitHub** | https://github.com/yinglinzheng/FTCN |
| **FYP Relevance** | DO NOT implement. Too complex for variable-length web uploads. Cite for temporal rationale. |

---

### 5.5 Multi-Modal Detection Papers

---

#### Paper M-01: FakeBench

| Field | Detail |
|---|---|
| **Title** | FakeBench: Probing Explainability of Foundation Models for Unified Fake Image and Text Detection |
| **Year** | 2024 |
| **Conference** | arXiv 2024 |
| **Algorithm** | Prompts GPT-4V and LLaVA with multi-modal inputs; evaluates whether VLMs can explain fakes |
| **Key Metrics** | GPT-4V: 68% detection accuracy on multi-modal fake content |
| **FYP Relevance** | Cite in related work. Justifies your weighted fusion as a practical alternative. |

---

#### Paper M-02: OmniDetector

| Field | Detail |
|---|---|
| **Title** | Towards Universal Detection of AI-Generated Content |
| **Year** | 2024 |
| **Conference** | arXiv 2024 |
| **Algorithm** | Shared multi-modal transformer backbone with modality-specific input adapters. Joint contrastive + classification loss. |
| **FYP Relevance** | Cite as motivation for unified platform. Justifies why a multi-modal platform has research value. |

---

### 5.6 Research Paper Quick-Reference Matrix

| Paper ID | Title (Shortened) | Year | Conference | Task | Metric | GitHub | FYP Use |
|---|---|---|---|---|---|---|---|
| T-01 | RoBERTa Detector | 2019 | OpenAI | Text | Acc 88% | ✅ | Lit Review |
| T-02 | DetectGPT | 2023 | ICML | Text | AUROC 0.95 | ✅ | Lit Review |
| T-03 | Fast-DetectGPT | 2024 | ICLR | Text | AUROC 0.98 | ✅ | Optional |
| T-04 | RADAR | 2023 | NeurIPS | Text | F1 0.89 | ✅ | Lit Review |
| **T-05** | **RAID Benchmark** | **2024** | **ACL** | **Text** | **F1 75%** | **✅** | **PRIMARY** |
| T-06 | Binoculars | 2024 | ICML | Text | AUROC 0.99 | ✅ | Benchmark |
| **I-01** | **CNNDetection** | **2020** | **CVPR** | **Image-GAN** | **AUC 0.99** | **✅** | **PRIMARY** |
| I-02 | UnivFD | 2023 | CVPR | Image | AUC 0.95 | ✅ | Optional |
| I-03 | DIRE | 2023 | ICCV | Image-Diff | AUC 0.99 | ✅ | Lit Review |
| **I-04** | **Corvi et al.** | **2023** | **ICASSP** | **Image-Diff** | **AUC 0.93** | **✅** | **PRIMARY** |
| I-05 | GradCAM | 2017 | ICCV | Explainability | — | ✅ | Explain |
| **A-01** | **AASIST** | **2022** | **ICASSP** | **Audio** | **EER 0.83%** | **✅** | **PRIMARY** |
| A-02 | RawGAT-ST | 2021 | Interspeech | Audio | EER 1.06% | ✅ | Lit Review |
| A-03 | Wav2Vec2 | 2022 | Odyssey | Audio | EER 1.8% | ✅ | Phase 4 |
| A-04 | LCNN | 2020 | ICASSP | Audio | EER 5.06% | ✅ | Baseline |
| **V-01** | **FaceForensics++** | **2019** | **ICCV** | **Video** | **AUC ~0.95** | **✅** | **Phase 4** |
| V-02 | SBI | 2022 | CVPR | Video | AUC 0.93 | ✅ | Phase 4 |
| V-03 | FTCN | 2021 | ICCV | Video | AUC 0.98 | ✅ | Lit Review |
| M-01 | FakeBench | 2024 | arXiv | Multi-Modal | Acc 68% | ❌ | Lit Review |
| M-02 | OmniDetector | 2024 | arXiv | Multi-Modal | SOTA | ❌ | Motivation |

---

## SECTION 6 — ARCHITECTURE DESIGN

### 6.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          MULTI-MODAL AI CONTENT FORENSICS PLATFORM                      │
│                                    HIGH-LEVEL ARCHITECTURE                              │
└─────────────────────────────────────────────────────────────────────────────────────────┘

  ┌──────────────────┐        ┌──────────────────────────────────────────────────────┐
  │   CLIENT LAYER   │        │                    PLATFORM LAYER                    │
  │                  │        │                                                      │
  │  ┌─────────────┐ │        │  ┌──────────────────────────────────────────────┐   │
  │  │  Next.js    │ │  HTTPS │  │              API GATEWAY SERVICE             │   │
  │  │  Web        │◄├────────┤► │         (FastAPI — Port 8000)                │   │
  │  │  Dashboard  │ │        │  │  • JWT Authentication & Rate Limiting        │   │
  │  └─────────────┘ │        │  │  • Request Routing & OpenAPI Docs            │   │
  │                  │        │  │  • File Validation (MIME, Size)              │   │
  │  ┌─────────────┐ │        │  └─────────────────────┬────────────────────────┘   │
  │  │  API        │ │        │                         │                           │
  │  │  Clients    │ │        │     ┌───────────────────┼───────────────────┐       │
  │  └─────────────┘ │        │     │                   │                   │       │
  └──────────────────┘        │     ▼                   ▼                   ▼       │
                              │  ┌────────┐       ┌────────┐          ┌────────┐   │
                              │  │  TEXT  │       │ IMAGE  │          │ AUDIO  │   │
                              │  │DETECT. │       │DETECT. │          │DETECT. │   │
                              │  │:8001   │       │:8002   │          │:8003   │   │
                              │  └───┬────┘       └───┬────┘          └───┬────┘   │
                              │      └───────────────┬─┴──────────────────┘        │
                              │                      ▼                              │
                              │  ┌────────────────────────────────────────────┐    │
                              │  │              MESSAGE QUEUE                 │    │
                              │  │           (RabbitMQ — Port 5672)           │    │
                              │  └──────────────────────┬─────────────────────┘    │
                              │      ┌──────────────────┼──────────────────┐       │
                              │      ▼                  ▼                  ▼       │
                              │  ┌────────┐       ┌─────────┐       ┌──────────┐  │
                              │  │EXPLAIN │       │ REPORT  │       │   AUTH   │  │
                              │  │:8004   │       │ :8005   │       │  :8006   │  │
                              │  └────────┘       └─────────┘       └──────────┘  │
                              └──────────────────────────────────────────────────-─┘

  ┌─────────────────────────────────────────────────────────────────────────────────────┐
  │                                 INFRASTRUCTURE LAYER                                │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐ │
  │  │PostgreSQL│  │  Redis   │  │  MinIO   │  │RabbitMQ  │  │ Prometheus + Grafana │ │
  │  │ :5432    │  │  :6379   │  │  :9000   │  │  :5672   │  │ :9090 / :3001        │ │
  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────────────────┘ │
  └─────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 Low-Level Data Flow Architecture

```
CLIENT                  API GATEWAY                  DETECTION SERVICE               INFRA
──────                  ───────────                  ─────────────────               ─────
  │──POST /detect ──────►              │                               │
  │  (JWT + File)        │──verifyJWT()►               │
  │                      │◄── {user_id}─│               │
  │                      │──validateMIME(file)           │
  │                      │──putObject(file)────────────────────────────────────────────►
  │                      │◄── {object_key} ───────────────────────────────────────────
  │                      │──INSERT job ─────────────────────────────────────────────►
  │                      │◄── {job_id} ──────────────────────────────────────────────
  │                      │──publish(queue) ─────────────►│
  │◄─202 {job_id} ───────│                               │
  │                      │    ─ ─ ─ ASYNC WORKER ─ ─ ─  │
  │                      │                               │◄─ getObject(object_key) ──
  │                      │                               │──preprocess()
  │                      │                               │──model.predict()
  │                      │                               │──explainability()
  │                      │                               │──UPDATE job ──────────────►
  │──GET /jobs/{id} ─────►                               │
  │                      │──queryJob(db) ───────────────────────────────────────────►
  │◄─200 {full_result} ──│
```

---

### 6.3 Component Diagram

```
┌──────────────── NEXT.JS FRONTEND ──────────────────────┐
│  [Upload] [Dashboard] [JobStatus] [ReportDownload]     │
│               ┌──────────────────────┐                 │
│               │   API Client (axios) │                 │
│               └──────────┬───────────┘                 │
└──────────────────────────│─────────────────────────────┘
                           │ HTTPS
┌──────────────── API GATEWAY ───────────────────────────┐
│  [Auth Middleware] [File Validator] [Rate Limiter]      │
│  [/detect Router] [/jobs Router] [/reports Router]     │
│  [JobService] [StorageService] [QueueService]          │
└──┬──────────┬──────────┬──────────────────────────────┘
   │          │          │
 TEXT       IMAGE      AUDIO
 :8001      :8002      :8003
   │          │          │
[DeBERTa] [ResNet50  [AASIST
[SHAP       +Corvi]    torchaudio]
 embedded]  [GradCAM   [Spectrogram
            embedded]   embedded]
           │
     REPORT SERVICE :8005
     [WeasyPrint][Jinja2][MinIO Upload]
           │
     AUTH SERVICE :8006
     [JWT][bcrypt][Redis Blacklist]
```

> ⚠️ **Architecture Note:** There is NO standalone Explainability microservice. SHAP is embedded inside `text-service`. GradCAM is embedded inside `image-service`. Mel-Spectrogram is embedded inside `audio-service`. This eliminates cross-service serialization of large tensors and model objects over the network. Each detection service owns its own explainability pipeline.

---

### 6.4 Sequence Diagram — Full Async Detection

```
Browser   Gateway   Auth    MinIO    Postgres   RabbitMQ   ImgDetect
  │          │        │       │          │           │           │
  │─POST────►│        │       │          │           │           │
  │          │─verify►│       │          │           │           │
  │          │◄─ok────│       │          │           │           │
  │          │─put────────────►          │           │           │
  │          │◄─key───────────           │           │           │
  │          │─INSERT─────────────────────►          │           │
  │          │◄─job_id────────────────────           │           │
  │          │─publish────────────────────────────────►          │
  │◄─202─────│        │       │          │           │           │
  │          │        │ ASYNC │          │           │◄─consume──│
  │          │        │       │◄─get─────────────────│───────────│
  │          │        │       │─bytes──────────────────────────►│
  │          │        │       │          │           │  predict()│
  │          │        │       │          │           │  gradcam()│
  │          │        │       │◄─put heatmap───────────────────│
  │          │        │       │          │◄─UPDATE────────────-─│
  │─GET─────►│        │       │          │           │           │
  │          │─SELECT─────────────────────►          │           │
  │◄─200─────│        │       │          │           │           │
```

---

### 6.5 Docker Compose Deployment Diagram

```
HOST MACHINE (Ubuntu 22.04 / WSL2)
┌──────────────────────────────────────────────────────────────────────────────────────┐
│  docker network: forensics_net (bridge)                                              │
│                                                                                      │
│  ┌───────────────┐  ┌────────────────┐  ┌──────────────────────────────────────┐    │
│  │  nginx :80/443│  │ frontend :3000 │  │ api-gateway :8000                    │    │
│  │  SSL + Proxy  │◄─│ Next.js        │◄─│ FastAPI | Python 3.11                │    │
│  └───────────────┘  └────────────────┘  └──────────────────────────────────────┘    │
│                                                           ▼                           │
│  ┌────────────────────────────────────────────────────────────────────────────────┐  │
│  │  DETECTION SERVICES                                                            │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │  │text :8001   │  │image :8002  │  │audio :8003  │                             │  │
│  │  │DeBERTa-v3   │  │ResNet50     │  │AASIST       │                             │  │
│  │  │SHAP Engine  │  │+Corvi       │  │torchaudio   │                             │  │
│  │  │(embedded)   │  │GradCAM      │  │Spectrogram  │                             │  │
│  │  │CPU:2 RAM:4G │  │(embedded)   │  │(embedded)   │                             │  │
│  │  └─────────────┘  │GPU(opt)     │  └─────────────┘                             │  │
│  │                   │RAM:6G       │                                               │  │
│  │                   └─────────────┘  ┌─────────────┐  ┌─────────────────────┐  │  │
│  │                                    │report :8005 │  │auth :8006           │  │  │
│  │                                    │WeasyPrint   │  │python-jose          │  │  │
│  │                                    │Jinja2       │  │passlib/bcrypt       │  │  │
│  │                                    └─────────────┘  └─────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                      │
│  ┌────────────────────────────────────────────────────────────────────────────────┐  │
│  │  INFRASTRUCTURE                                                                │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  ┌────────────────────┐    │  │
│  │  │postgres  │  │redis     │  │rabbitmq          │  │minio               │    │  │
│  │  │:5432     │  │:6379     │  │:5672 / :15672    │  │:9000 / :9001       │    │  │
│  │  └──────────┘  └──────────┘  └──────────────────┘  └────────────────────┘    │  │
│  │  ┌──────────┐  ┌──────────┐                                                   │  │
│  │  │prometheus│  │grafana   │                                                   │  │
│  │  │:9090     │  │:3001     │                                                   │  │
│  │  └──────────┘  └──────────┘                                                   │  │
│  └────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

---

## SECTION 7 — MICROSERVICE DESIGN

> **Design Philosophy:** Each microservice is a self-contained, independently deployable unit with its own internal architecture, database access layer, and startup lifecycle. Services communicate via HTTP (synchronous, low-latency) or RabbitMQ (asynchronous, backpressure-tolerant). All services expose a `/internal/health` endpoint following the same contract. No service shares application code via import; only the `shared/` pip package is shared.

---

### 7.0 Inter-Service Communication Architecture

```
                      ┌──────────────────────────────────────────────────────────────┐
                      │                    API GATEWAY :8000                         │
                      │                                                              │
                      │   AUTH_MW ──► RATE_LIMITER ──► MIME_VALIDATOR ──► ROUTER    │
                      └──────┬────────────────┬────────────────┬────────────────────┘
                             │                │                │
                    SYNC     │       SYNC     │       SYNC     │
                  (httpx)    │     (httpx)    │     (httpx)    │
                    TEXT      │      AUTH      │     REPORTS    │
                    :8001     │      :8006     │      :8005     │
                             │                │                │
                             │       ASYNC (RabbitMQ)         │
                             │                                 │
                      ┌──────▼─────────────────────────────┐  │
                      │         RabbitMQ Exchange           │  │
                      │     forensics.direct (durable)      │  │
                      └───────┬────────────────┬────────────┘  │
                              │                │               │
                        IMAGE :8002      AUDIO :8003           │
                    (consumer + worker) (consumer + worker)    │
```

#### 7.0.1 Synchronous Communication (httpx)

Used for: **Text detection** (< 2s), **Auth** (< 50ms), **Report generation** (triggered, not polled)

```python
# shared/http_client.py — used by API Gateway to call sync services
import httpx
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

_clients: dict[str, httpx.AsyncClient] = {}

def get_http_client(service_url: str) -> httpx.AsyncClient:
    if service_url not in _clients:
        _clients[service_url] = httpx.AsyncClient(
            base_url=service_url,
            timeout=httpx.Timeout(connect=2.0, read=30.0, write=5.0, pool=2.0),
            limits=httpx.Limits(max_connections=20, max_keepalive_connections=10),
        )
    return _clients[service_url]

@retry(
    retry=retry_if_exception_type((httpx.ConnectError, httpx.TimeoutException)),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=0.5, max=4),
    reraise=True,
)
async def call_service(service_url: str, endpoint: str, payload: dict) -> dict:
    client = get_http_client(service_url)
    response = await client.post(endpoint, json=payload)
    response.raise_for_status()
    return response.json()
```

#### 7.0.2 Asynchronous Communication (RabbitMQ)

Used for: **Image detection** (~5–30s), **Audio detection** (~5–30s), **Video detection** (minutes)

```
Queue topology:
  forensics.image.detect   → image-service consumer
  forensics.audio.detect   → audio-service consumer
  forensics.video.detect   → video-service consumer
  forensics.*.dlx          → dead-letter queues (failed jobs)

Exchange: forensics.direct (type=direct, durable=true)
DLX Exchange: forensics.dlx (type=direct, durable=true)
Message TTL: 600,000ms (10 min)
Max retries: 3 (x-death header checked in consumer)
```

#### 7.0.3 Circuit Breaker Pattern

```python
# shared/circuit_breaker.py
from circuitbreaker import circuit

@circuit(failure_threshold=5, recovery_timeout=30, expected_exception=Exception)
async def protected_call(service_url: str, endpoint: str, payload: dict) -> dict:
    return await call_service(service_url, endpoint, payload)

# States: CLOSED (normal) → OPEN (failing) → HALF_OPEN (testing) → CLOSED
# After 5 failures: circuit opens for 30 seconds
# Gateway returns 503 with Retry-After: 30 header when circuit is open
```

#### 7.0.4 Service Discovery (Docker Compose DNS)

All services reference each other by container name. No service registry needed at FYP scale:

| Service Name | Internal URL | Protocol |
|---|---|---|
| `text-service` | `http://text-service:8001` | HTTP/1.1 (httpx) |
| `image-service` | `http://image-service:8002` | HTTP/1.1 (health only) |
| `audio-service` | `http://audio-service:8003` | HTTP/1.1 (health only) |
| `auth-service` | `http://auth-service:8006` | HTTP/1.1 (httpx) |
| `report-service` | `http://report-service:8005` | HTTP/1.1 (httpx) |
| `rabbitmq` | `amqp://rabbitmq:5672` | AMQP 0-9-1 |
| `postgres` | `postgresql+asyncpg://postgres:5432` | TCP |
| `redis` | `redis://redis:6379` | TCP |
| `minio` | `http://minio:9000` | HTTP/S3 |

---

### 7.1 API Gateway Service (Port 8000)

#### 7.1.1 Responsibilities & Internal Architecture

```
Incoming Request
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     MIDDLEWARE STACK (ordered)                   │
│                                                                  │
│  1. TrustedHostMiddleware   ─ reject non-whitelisted hosts       │
│  2. CORSMiddleware          ─ allow frontend origin only         │
│  3. RequestIDMiddleware     ─ inject X-Request-ID UUID           │
│  4. StructuredLoggingMiddleware ─ log every request/response     │
│  5. RateLimitMiddleware     ─ slowapi / Redis sliding window     │
│  6. JWTAuthMiddleware       ─ validate Bearer token on /api/v1/* │
│     (excludes: /auth/login, /auth/register, /health)            │
└─────────────────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ROUTE HANDLERS                            │
│                                                                  │
│  /api/v1/auth/*    → AuthRouter   → calls auth-service (sync)   │
│  /api/v1/detect/*  → DetectRouter → StorageService + QueueSvc   │
│  /api/v1/jobs/*    → JobsRouter   → JobRepository (direct DB)   │
│  /api/v1/reports/* → ReportRouter → calls report-service (sync) │
│  /api/v1/models    → ModelRouter  → ModelRepository (direct DB) │
│  /health           → HealthRouter → checks all dependencies      │
└─────────────────────────────────────────────────────────────────┘
      │
      ▼
┌────────────────────────────────────┐  ┌─────────────────────────┐
│  StorageService (MinIO)            │  │  QueueService (RabbitMQ) │
│  upload_file() / presign_url()     │  │  publish_job()           │
└────────────────────────────────────┘  └─────────────────────────┘
```

#### 7.1.2 Complete Endpoint Contract Specification

---

**`POST /api/v1/detect/text`**

```
Auth:    Bearer <access_token>
Content-Type: application/json
Rate Limit: 30 req/min per user

Request Body:
{
  "text":         string,   // REQUIRED. Min 50 chars. Max 10,000 chars.
  "explain":      boolean,  // Optional. Default true. Trigger SHAP explanation.
  "language":     string,   // Optional. Default "en". ISO 639-1.
  "webhook_url":  string    // Optional. POST result here on completion.
}

Validation rules:
  - text after strip() must be >= 50 characters
  - text must be valid UTF-8
  - language must be in ["en", "es", "fr", "de", "zh"] (others: 422)

Success Response 200 OK:
{
  "job_id":      "uuid-v4",
  "status":      "COMPLETED",
  "modality":    "TEXT",
  "submitted_at": "2024-06-01T10:30:00Z",
  "completed_at": "2024-06-01T10:30:02Z",
  "results": [{
    "model_name":        "deberta-v3-raid-v1.2",
    "model_version":     "1.2.0",
    "ai_probability":    0.87,
    "confidence_score":  0.91,
    "verdict":           "AI_GENERATED",
    "processing_time_ms": 340,
    "device_used":       "cuda:0",
    "explanation": {
      "method":                  "SHAP",
      "top_ai_indicator_tokens": ["Furthermore", "it is worth noting", "utilization"],
      "top_human_tokens":        ["however", "I think", "maybe"],
      "html_heatmap":            "<span style='...'>...</span>",
      "truncated":               false
    }
  }]
}

Error Responses:
  400 { "error": "TEXT_TOO_SHORT",     "detail": "Text must be >= 50 characters" }
  401 { "error": "TOKEN_INVALID",      "detail": "JWT signature mismatch" }
  422 { "error": "VALIDATION_ERROR",   "detail": [...pydantic errors...] }
  429 { "error": "RATE_LIMIT_EXCEEDED","detail": "30 req/min limit", "retry_after": 45 }
  503 { "error": "TEXT_SERVICE_DOWN",  "detail": "Upstream unavailable. Try again." }
```

---

**`POST /api/v1/detect/image`**

```
Auth:    Bearer <access_token>
Content-Type: multipart/form-data
Rate Limit: 20 req/min per user

Form Fields:
  file:     File  // REQUIRED. Allowed MIME: image/jpeg, image/png, image/webp, image/gif
  explain:  bool  // Optional. Default true.

Server-side validation pipeline:
  1. Content-Length header check     → reject if > 10MB before full upload
  2. python-magic MIME check         → verify actual bytes match declared type
  3. PIL Image.open() verify         → reject corrupted files
  4. Dimension check                 → reject if < 64×64 px

Success Response 202 Accepted:
{
  "job_id":                    "uuid-v4",
  "status":                    "QUEUED",
  "modality":                  "IMAGE",
  "submitted_at":              "2024-06-01T10:30:00Z",
  "estimated_completion_secs": 15,
  "poll_url":                  "/api/v1/jobs/uuid-v4",
  "object_key":                "uploads/uuid-v4/original.jpg"
}

Completed Job Response 200 OK (from GET /api/v1/jobs/{id}):
{
  "job_id":      "uuid-v4",
  "status":      "COMPLETED",
  "modality":    "IMAGE",
  "results": [{
    "model_name":       "image-ensemble-v1.0",
    "ai_probability":   0.73,
    "confidence_score": 0.61,
    "verdict":          "LIKELY_AI",
    "model_ensemble": [
      { "model": "ResNet50-CNNDetection", "weight": 0.55, "score": 0.82 },
      { "model": "Corvi-EfficientNetB0",  "weight": 0.45, "score": 0.61 }
    ],
    "explanation": {
      "method":            "GradCAM",
      "heatmap_url":       "https://minio/forensics-bucket/heatmaps/uuid-v4/gradcam.png?token=...",
      "heatmap_url_expiry": "2024-06-01T22:30:00Z",
      "highlighted_regions": [
        { "region": "top-right", "intensity": 0.87 },
        { "region": "center",    "intensity": 0.54 }
      ]
    }
  }]
}

Error Responses:
  400 { "error": "INVALID_MIME_TYPE",   "detail": "Got application/pdf, expected image/*" }
  413 { "error": "FILE_TOO_LARGE",      "detail": "Max 10MB. Got 14.2MB" }
  415 { "error": "CORRUPTED_IMAGE",     "detail": "Cannot decode image header" }
  422 { "error": "IMAGE_TOO_SMALL",     "detail": "Min 64×64 px required" }
```

---

**`POST /api/v1/detect/audio`**

```
Auth:    Bearer <access_token>
Content-Type: multipart/form-data
Rate Limit: 10 req/min per user

Form Fields:
  file: File  // REQUIRED. Allowed MIME: audio/mpeg, audio/wav, audio/flac, audio/ogg, audio/mp4

Server-side validation:
  1. MIME check via python-magic
  2. Duration check via torchaudio.info() — reject if < 1s or > 300s
  3. Channel count — accept mono or stereo (auto-convert to mono)

Success Response 202 Accepted:
{
  "job_id":                    "uuid-v4",
  "status":                    "QUEUED",
  "modality":                  "AUDIO",
  "submitted_at":              "2024-06-01T10:30:00Z",
  "estimated_completion_secs": 30,
  "poll_url":                  "/api/v1/jobs/uuid-v4"
}

Completed Job Response 200 OK:
{
  "job_id":   "uuid-v4",
  "status":   "COMPLETED",
  "modality": "AUDIO",
  "results": [{
    "model_name":        "aasist-l-v1.0",
    "ai_probability":    0.92,
    "confidence_score":  0.88,
    "verdict":           "AI_GENERATED",
    "processing_time_ms": 45,
    "explanation": {
      "method":             "Mel-Spectrogram",
      "spectrogram_url":    "https://minio/.../spectrogram.png?token=...",
      "duration_analyzed_s": 4.03,
      "sample_rate":         16000,
      "anomaly_flags":      ["unnatural_f0_continuity", "harmonic_discontinuity"]
    }
  }]
}
```

---

**`POST /api/v1/detect/multimodal`**

```
Auth:    Bearer <access_token>
Content-Type: multipart/form-data
Rate Limit: 5 req/min per user

Form Fields:
  text_content:  string  // Optional. At least one of text/image/audio must be present.
  image_file:    File    // Optional.
  audio_file:    File    // Optional.
  explain:       bool    // Optional. Default true.

Validation: At least 2 modalities must be provided for fusion to be meaningful.
  - 1 modality → 400 { "error": "INSUFFICIENT_MODALITIES",
                        "detail": "Provide ≥ 2 modalities for multimodal fusion" }

Success Response 202 Accepted:
{
  "job_id":                    "uuid-v4",
  "status":                    "QUEUED",
  "modality":                  "MULTIMODAL",
  "child_jobs": {
    "text":  "uuid-text-job",
    "image": "uuid-image-job"
  },
  "estimated_completion_secs": 40,
  "poll_url":                  "/api/v1/jobs/uuid-v4"
}

Completed Fusion Response:
{
  "job_id":   "uuid-v4",
  "status":   "COMPLETED",
  "modality": "MULTIMODAL",
  "fusion_result": {
    "final_score":       0.84,
    "final_confidence":  0.79,
    "final_verdict":     "AI_GENERATED",
    "fusion_method":     "weighted_linear_calibrated",
    "weights_applied":   { "text": 0.55, "image": 0.45 },
    "modality_scores":   { "text": 0.87, "image": 0.79 },
    "agreement_level":   "HIGH",
    "agreement_delta":   0.08
  },
  "child_results": [
    { "modality": "TEXT",  "ai_probability": 0.87, "verdict": "AI_GENERATED" },
    { "modality": "IMAGE", "ai_probability": 0.79, "verdict": "LIKELY_AI" }
  ]
}
```

---

**`GET /api/v1/jobs/{job_id}`**

```
Auth: Bearer <access_token>
Authorization: User may only access their own jobs (checked via user_id in JWT claim)

Response 200 OK — PENDING:
{
  "job_id":         "uuid-v4",
  "status":         "PROCESSING",
  "modality":       "IMAGE",
  "submitted_at":   "2024-06-01T10:30:00Z",
  "progress_pct":   40,
  "current_step":   "model_inference",
  "results":        null
}

Response 200 OK — FAILED:
{
  "job_id":          "uuid-v4",
  "status":          "FAILED",
  "error_code":      "MODEL_OOM",
  "error_message":   "CUDA out of memory. Image resized and retried but still failed.",
  "failed_at":       "2024-06-01T10:30:45Z",
  "retry_attempted": true
}

Response 403: { "error": "ACCESS_DENIED", "detail": "Job belongs to different user" }
Response 404: { "error": "JOB_NOT_FOUND", "detail": "No job with id uuid-v4" }
```

---

**`GET /api/v1/health`**

```
Response 200 OK (all healthy):
{
  "status": "healthy",
  "version": "1.0.0",
  "timestamp": "2024-06-01T10:30:00Z",
  "dependencies": {
    "postgres":   { "status": "up", "latency_ms": 2 },
    "redis":      { "status": "up", "latency_ms": 1 },
    "rabbitmq":   { "status": "up", "latency_ms": 3 },
    "minio":      { "status": "up", "latency_ms": 5 },
    "text_service":  { "status": "up", "latency_ms": 12 },
    "auth_service":  { "status": "up", "latency_ms": 8 },
    "report_service":{ "status": "up", "latency_ms": 11 }
  }
}

Response 503 (degraded):
{
  "status": "degraded",
  "dependencies": {
    "postgres":   { "status": "up",   "latency_ms": 2 },
    "text_service":{ "status": "down", "error": "Connection refused" }
  }
}
```

#### 7.1.3 Rate Limiting Strategy

```python
# services/api-gateway/app/middleware/rate_limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address, storage_uri="redis://redis:6379/1")

# Applied per endpoint:
# @limiter.limit("30/minute")   → /detect/text
# @limiter.limit("20/minute")   → /detect/image
# @limiter.limit("10/minute")   → /detect/audio
# @limiter.limit("5/minute")    → /detect/multimodal
# @limiter.limit("60/minute")   → /jobs/* (polling)
# @limiter.limit("100/minute")  → /health

# Response headers on every request:
# X-RateLimit-Limit: 30
# X-RateLimit-Remaining: 22
# X-RateLimit-Reset: 1717235460
```

#### 7.1.4 File Validation Pipeline

```python
# services/api-gateway/app/services/file_validator.py
import magic, io
from PIL import Image
import torchaudio

ALLOWED_IMAGE_MIMES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
ALLOWED_AUDIO_MIMES = {"audio/mpeg", "audio/wav", "audio/x-wav", "audio/flac",
                       "audio/ogg", "audio/mp4", "audio/x-m4a"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024   # 10 MB
MAX_AUDIO_BYTES = 50 * 1024 * 1024   # 50 MB

async def validate_image(file_bytes: bytes) -> None:
    if len(file_bytes) > MAX_IMAGE_BYTES:
        raise FileTooLargeError(f"Max 10MB. Got {len(file_bytes)/1e6:.1f}MB")
    mime = magic.from_buffer(file_bytes[:2048], mime=True)
    if mime not in ALLOWED_IMAGE_MIMES:
        raise InvalidMimeError(f"Got {mime}, expected image/*")
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
        img = Image.open(io.BytesIO(file_bytes))
        if img.width < 64 or img.height < 64:
            raise ImageTooSmallError(f"Min 64×64 px. Got {img.width}×{img.height}")
    except Exception as e:
        raise CorruptedImageError(str(e))

async def validate_audio(file_bytes: bytes) -> float:
    if len(file_bytes) > MAX_AUDIO_BYTES:
        raise FileTooLargeError(f"Max 50MB. Got {len(file_bytes)/1e6:.1f}MB")
    mime = magic.from_buffer(file_bytes[:2048], mime=True)
    if mime not in ALLOWED_AUDIO_MIMES:
        raise InvalidMimeError(f"Got {mime}, expected audio/*")
    try:
        info = torchaudio.info(io.BytesIO(file_bytes))
        duration_s = info.num_frames / info.sample_rate
        if duration_s < 1.0:
            raise AudioTooShortError(f"Min 1s. Got {duration_s:.2f}s")
        if duration_s > 300.0:
            raise AudioTooLongError(f"Max 300s. Got {duration_s:.1f}s")
        return duration_s
    except Exception as e:
        raise CorruptedAudioError(str(e))
```

#### 7.1.5 API Gateway Startup Lifecycle

```python
# services/api-gateway/app/main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.config import settings
from app.db.session import init_db
from app.services.storage_service import StorageService
from app.services.queue_service import QueueService

@asynccontextmanager
async def lifespan(app: FastAPI):
    # ── STARTUP ──────────────────────────────────────────────
    await init_db()                          # test DB connectivity
    app.state.storage = StorageService()
    await app.state.storage.ensure_bucket()  # create MinIO bucket if absent
    app.state.queue = QueueService()
    await app.state.queue.connect()          # establish RabbitMQ connection pool
    await app.state.queue.declare_topology() # queues + exchanges + DLX
    yield
    # ── SHUTDOWN ─────────────────────────────────────────────
    await app.state.queue.close()

app = FastAPI(title="Forensics Platform API", version="1.0.0",
              lifespan=lifespan, docs_url="/docs", redoc_url="/redoc")
```

#### 7.1.6 Resource Budget

| Resource | Allocated | Justification |
|---|---|---|
| CPU | 2 cores | FastAPI async — I/O bound, not CPU bound |
| RAM | 512 MB | No ML models loaded; pure routing + validation |
| Connections | 20 DB pool / 10 httpx keep-alive per downstream | Concurrent users × expected concurrency |
| Open Files | 1024 | File upload streams |
| SLA | P95 < 200ms (excluding model inference) | Gateway overhead only |

---

### 7.2 Text Detection Service (Port 8001)

#### 7.2.1 Responsibilities & Internal Architecture

```
RabbitMQ Consumer        HTTP (internal)         Gateway calls
(async text jobs)   OR   POST /internal/detect   (sync path)
         │                        │
         └────────────────────────┘
                    │
                    ▼
┌───────────────────────────────────────────────────────┐
│               TEXT DETECTION SERVICE                   │
│                                                        │
│  Startup:                                              │
│    1. Load DeBERTa tokenizer + model to device         │
│    2. Warmup: run 1 dummy inference (fill CUDA cache)  │
│    3. Init SHAP Explainer (masker + predict_fn)        │
│    4. Start RabbitMQ consumer (if ASYNC_MODE=true)     │
│                                                        │
│  Per Request:                                          │
│    TokenizerPreprocess → ModelInference → ScoreMap     │
│         │                                              │
│         └─→ [if explain=true] SHAPExplainer           │
│                   │                                    │
│    WriteDB ◄───────┘                                   │
│    WriteMinIO (heatmap HTML blob)                      │
│    ACK queue message / return HTTP response            │
└───────────────────────────────────────────────────────┘
```

#### 7.2.2 Complete Endpoint Contracts

---

**`POST /internal/detect`** *(called synchronously by API Gateway)*

```
Content-Type: application/json
Internal only — not exposed externally

Request:
{
  "job_id":    "uuid-v4",        // REQUIRED
  "text":      "string",         // REQUIRED. Already validated by gateway.
  "explain":   true,             // Optional. Default true.
  "language":  "en",             // Optional.
  "user_id":   "uuid-user"       // For audit logging.
}

Response 200 OK:
{
  "job_id":            "uuid-v4",
  "model_name":        "deberta-v3-raid-v1.2",
  "model_version":     "1.2.0",
  "ai_probability":    0.87,
  "confidence_score":  0.91,
  "verdict":           "AI_GENERATED",
  "processing_time_ms": 340,
  "device_used":       "cuda:0",
  "token_count":       187,
  "was_truncated":     false,
  "explanation": {
    "method":                  "SHAP",
    "token_attributions":      [...top 20 tokens with SHAP values...],
    "top_ai_indicator_tokens": ["Furthermore", "it is worth noting"],
    "top_human_tokens":        ["I think", "actually"],
    "html_heatmap":            "<span ...>...</span>",
    "shap_computation_ms":     2100,
    "truncated":               false
  }
}

Response 422: { "error": "TEXT_PREPROCESSING_FAILED", "detail": "..." }
Response 500: { "error": "MODEL_INFERENCE_FAILED",    "detail": "..." }
Response 503: { "error": "MODEL_NOT_LOADED",          "detail": "Warmup in progress" }
```

---

**`GET /internal/health`**

```
Response 200:
{
  "service":       "text-service",
  "status":        "healthy",
  "model_loaded":  true,
  "shap_ready":    true,
  "device":        "cuda:0",
  "gpu_memory_mb": { "allocated": 1842, "reserved": 2048, "total": 8192 },
  "warmup_done":   true,
  "uptime_s":      3600,
  "requests_served": 1247,
  "avg_latency_ms":  380
}
```

---

**`GET /internal/model/info`**

```
Response 200:
{
  "model_name":     "deberta-v3-raid-v1.2",
  "model_version":  "1.2.0",
  "architecture":   "DeBERTaV2ForSequenceClassification",
  "parameters":     86_000_000,
  "training_data":  "RAID-2024-EN-100K",
  "val_f1":         0.891,
  "val_auroc":      0.943,
  "max_tokens":     512,
  "device":         "cuda:0",
  "checkpoint_sha256": "a3f7b21c..."
}
```

#### 7.2.3 Failure Handling & Edge Cases

| Scenario | Detection | Response Strategy |
|---|---|---|
| Text > 10,000 chars | `len(text) > 10000` | Truncate at last sentence boundary before char 10,000. Set `was_truncated: true` in response. |
| Text < 50 chars | `len(text.strip()) < 50` | Return 422 immediately before any inference. Do NOT send to model. |
| Non-English text | `langdetect(text) != "en"` | Run inference anyway but add `"language_warning": "Non-English detected. Accuracy may be reduced."` |
| CUDA OOM | `torch.cuda.OutOfMemoryError` | Catch, move model to CPU, retry once. Log CUDA OOM event to Prometheus counter. |
| SHAP timeout | `asyncio.wait_for(..., timeout=5.0)` | Catch `asyncio.TimeoutError`, return result WITHOUT explanation. Set `"explanation": null, "explanation_timeout": true`. |
| Model not loaded | Check singleton at request start | Return 503 with `Retry-After: 30`. Do NOT attempt inference. |
| Tokenizer failure | `TokenizerException` | Return 422. Happens on malformed unicode. |

#### 7.2.4 Concurrency Model

```python
# Text service runs single worker (1 model instance) with async inference
# Model inference is CPU/GPU-bound → offloaded to thread pool
# SHAP computation is CPU-bound → offloaded to thread pool

import asyncio

async def detect(request: TextDetectRequest) -> TextDetectResponse:
    # Inference in thread pool (non-blocking event loop)
    result = await asyncio.to_thread(model.predict_sync, request.text)
    if request.explain:
        explanation = await asyncio.wait_for(
            asyncio.to_thread(explainer.explain_sync, request.text),
            timeout=5.0
        )
        result["explanation"] = explanation
    return TextDetectResponse(**result)

# uvicorn --workers 1 --loop uvloop
# DO NOT use --workers > 1 with loaded PyTorch models
# (model weights duplicated in every worker process = OOM)
# Use GPU reservation via Docker if needed for parallelism
```

#### 7.2.5 Resource Budget & SLA

| Resource | Allocated | Note |
|---|---|---|
| CPU | 2 cores | Inference + SHAP offloaded to asyncio.to_thread |
| RAM | 4 GB | DeBERTa-v3: ~1.7GB. SHAP masker: ~500MB. OS overhead. |
| GPU (optional) | 2 GB VRAM | If GPU available; falls back to CPU automatically |
| Workers | 1 uvicorn worker | Single model instance. Never set > 1. |
| **P95 Latency (no SHAP)** | < 500ms GPU / < 1500ms CPU | Target for text-only verdict |
| **P95 Latency (with SHAP)** | < 5000ms | SHAP adds 2–4s for 256 tokens |
| Throughput | ~2 req/s (GPU) / ~0.7 req/s (CPU) | With SHAP enabled |

---

### 7.3 Image Detection Service (Port 8002)

#### 7.3.1 Responsibilities & Internal Architecture

```
RabbitMQ Consumer (forensics.image.detect queue)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               IMAGE DETECTION SERVICE                        │
│                                                              │
│  Startup:                                                    │
│    1. Load ResNet-50 weights → GPU (if available)           │
│    2. Load Corvi EfficientNet-B0 weights → GPU              │
│    3. Warmup: 1 dummy forward pass each                     │
│    4. Init GradCAM targeting ResNet-50 layer4[-1]           │
│    5. Connect RabbitMQ, start consuming                     │
│                                                              │
│  Per Message:                                                │
│    DownloadFromMinIO                                         │
│       │                                                      │
│       ├─→ [Thread A] ResNet-50 Predict()                    │
│       │       │   → GradCAM Heatmap Generate                 │
│       │       │   → Upload heatmap PNG to MinIO              │
│       │                                                      │
│       └─→ [Thread B] Corvi FFT + EfficientNet Predict()     │
│                                                              │
│    Ensemble(p_resnet, p_corvi) → Verdict → Confidence       │
│    WriteDetectionResult → WriteExplanation → UPDATE job     │
│    ACK message                                               │
└─────────────────────────────────────────────────────────────┘
```

#### 7.3.2 Ensemble Algorithm (Detailed)

```python
# services/image-service/app/services/ensemble.py

RESNET_WEIGHT  = 0.55   # Higher: better generalization to GANs
CORVI_WEIGHT   = 0.45   # Lower: strong on diffusion, weaker on old GANs

def compute_ensemble(p_resnet: float, p_corvi: float) -> dict:
    """
    Weighted linear combination with divergence-based confidence.

    Agreement cases:
      Both HIGH  (>0.7):  ensemble ~0.75+, confidence HIGH
      Both LOW   (<0.3):  ensemble ~0.25-, confidence HIGH
      Divergent  (gap>0.4): confidence LOW → return INCONCLUSIVE leaning
    """
    p_ensemble = RESNET_WEIGHT * p_resnet + CORVI_WEIGHT * p_corvi

    # Confidence: HIGH when both models agree, LOW when they diverge
    divergence = abs(p_resnet - p_corvi)
    confidence = max(0.0, 1.0 - 1.5 * divergence)  # linear decay

    # When models strongly disagree, pull ensemble toward 0.5 (less certain)
    if divergence > 0.40:
        p_ensemble = 0.5 * p_ensemble + 0.5 * 0.50   # blend toward neutral
        confidence = min(confidence, 0.35)             # hard cap confidence

    return {
        "ai_probability":   round(p_ensemble, 4),
        "confidence_score": round(confidence, 4),
        "verdict":          _score_to_verdict(p_ensemble),
        "model_ensemble": [
            {"model": "ResNet50-CNNDetection", "weight": RESNET_WEIGHT, "score": round(p_resnet, 4)},
            {"model": "Corvi-EfficientNetB0",  "weight": CORVI_WEIGHT,  "score": round(p_corvi, 4)},
        ],
        "divergence": round(divergence, 4),
    }
```

#### 7.3.3 Complete Endpoint Contracts

**`GET /internal/health`**

```
Response 200:
{
  "service":          "image-service",
  "status":           "healthy",
  "models_loaded": {
    "resnet50":       true,
    "corvi_effnetb0": true
  },
  "gradcam_ready":    true,
  "queue_consumer":   "connected",
  "queue_name":       "forensics.image.detect",
  "messages_pending": 3,
  "device":           "cuda:0",
  "gpu_memory_mb":    { "allocated": 1460, "reserved": 1600 },
  "jobs_processed":   412,
  "avg_latency_ms":   820
}
```

**`GET /internal/model/info`**

```
Response 200:
{
  "models": [
    {
      "name":        "ResNet50-CNNDetection",
      "version":     "2.0",
      "weights":     "blur_jpg_prob0.5.pth",
      "parameters":  25_557_032,
      "trained_on":  "ProGAN (11 classes, blur+JPEG augmented)",
      "target_layer": "layer4.1.conv2",
      "weight_in_ensemble": 0.55
    },
    {
      "name":        "Corvi-EfficientNetB0",
      "version":     "1.0",
      "parameters":  5_288_548,
      "trained_on":  "LDM, DALL-E2, GLIDE (frequency domain)",
      "preprocessing": "2D-FFT high-pass residuals + log-magnitude",
      "weight_in_ensemble": 0.45
    }
  ]
}
```

#### 7.3.4 Failure Handling & Edge Cases

| Scenario | Detection | Strategy |
|---|---|---|
| RGBA image | `img.mode == "RGBA"` | `img.convert("RGB")` — always at preprocessing |
| Grayscale image | `img.mode == "L"` | `img.convert("RGB")` — replicate channel ×3 |
| Very large image (>5000px) | `max(w,h) > 5000` | Resize to 1024px max side before validation |
| CUDA OOM | `torch.cuda.OutOfMemoryError` | Resize input to 512×512, retry once on CPU |
| GradCAM failure | `Exception` | Return result WITHOUT heatmap. Set `"heatmap_url": null, "gradcam_error": true` |
| MinIO download failure | `MinIOError` | Retry 3× with exp. backoff. After 3 fails → NACK message (→ DLX) |
| Message redelivered > 3× | `x-death` header count | Route to `forensics.image.dlx`. Mark job `FAILED`. |
| Consumer crash | Docker restart policy `unless-stopped` | Container restarts, consumer re-binds, unACKed messages re-queued |

#### 7.3.5 Resource Budget & SLA

| Resource | Allocated | Note |
|---|---|---|
| CPU | 2 cores | Preprocessing + GradCAM overlay |
| RAM | 6 GB | ResNet50 (~380MB) + Corvi (~40MB) + image buffers |
| GPU | 2 GB VRAM | Both models loaded simultaneously |
| Workers | 1 consumer thread | RabbitMQ `prefetch_count=1` |
| **P95 Latency (GPU)** | < 800ms | Both models + GradCAM |
| **P95 Latency (CPU)** | < 4000ms | Fallback mode |
| **Max Queue Depth** | 50 messages | Alert fires above threshold |

---

### 7.4 Audio Detection Service (Port 8003)

#### 7.4.1 Responsibilities & Internal Architecture

```
RabbitMQ Consumer (forensics.audio.detect queue)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               AUDIO DETECTION SERVICE                        │
│                                                              │
│  Startup:                                                    │
│    1. Load AASIST-L from JSON config + .pth weights         │
│    2. Move model to device (CPU typical, GPU if available)   │
│    3. Warmup: 1 dummy inference (64,600 zero samples)       │
│    4. Connect RabbitMQ, start consuming                     │
│                                                              │
│  Per Message:                                                │
│    DownloadFromMinIO (audio bytes)                           │
│       │                                                      │
│       ├─→ AudioPreprocessor:                                 │
│       │     torchaudio.load() → mono → 16kHz → pad/trunc    │
│       │                                                      │
│       ├─→ AASIST Inference:                                  │
│       │     waveform → SincNet → HetGraphAttn → logits      │
│       │     → softmax → spoof_prob                           │
│       │                                                      │
│       └─→ SpectrogramVisualizer:                            │
│             librosa melspectrogram → matplotlib → PNG        │
│             → upload to MinIO                               │
│                                                              │
│    WriteDetectionResult → WriteExplanation → UPDATE job     │
│    ACK message                                               │
└─────────────────────────────────────────────────────────────┘
```

#### 7.4.2 Preprocessing Pipeline (Detailed)

```python
# services/audio-service/app/services/audio_preprocessor.py
import io, torch, torchaudio
import torchaudio.transforms as AT

SAMPLE_RATE   = 16_000        # AASIST requirement: exactly 16kHz
FIXED_SAMPLES = 64_600        # ~4.03 seconds — AASIST training length
MAX_DURATION_S = 60.0         # Truncate longer audio to 60s before AASIST
WARN_DURATION_S = 30.0        # Flag very long clips

class AudioPreprocessor:
    def preprocess(self, audio_bytes: bytes) -> tuple[torch.Tensor, dict]:
        """Returns (waveform_tensor [1, 64600], metadata_dict)"""
        waveform, orig_sr = torchaudio.load(io.BytesIO(audio_bytes))
        metadata = {
            "original_channels": waveform.shape[0],
            "original_sample_rate": orig_sr,
            "original_duration_s": round(waveform.shape[1] / orig_sr, 3),
        }

        # Step 1: Downmix to mono
        if waveform.shape[0] > 1:
            waveform = waveform.mean(dim=0, keepdim=True)

        # Step 2: Resample to 16kHz
        if orig_sr != SAMPLE_RATE:
            waveform = AT.Resample(orig_freq=orig_sr, new_freq=SAMPLE_RATE)(waveform)

        # Step 3: Truncate to MAX_DURATION_S before AASIST window
        max_samples = int(MAX_DURATION_S * SAMPLE_RATE)
        if waveform.shape[1] > max_samples:
            waveform = waveform[:, :max_samples]
            metadata["truncated"] = True

        # Step 4: Pad or crop to FIXED_SAMPLES (AASIST requires exact size)
        n = waveform.shape[1]
        if n < FIXED_SAMPLES:
            waveform = torch.nn.functional.pad(waveform, (0, FIXED_SAMPLES - n))
        else:
            waveform = waveform[:, :FIXED_SAMPLES]

        metadata["preprocessed_duration_s"] = round(FIXED_SAMPLES / SAMPLE_RATE, 3)
        return waveform, metadata
```

#### 7.4.3 Anomaly Flag Generation

```python
# services/audio-service/app/services/anomaly_detector.py
import librosa, numpy as np

def detect_audio_anomalies(audio_bytes: bytes, ai_probability: float) -> list[str]:
    """
    Heuristic anomaly flags for human-readable explanation.
    Not classification features — post-hoc descriptors only.
    """
    flags = []
    if ai_probability < 0.50:
        return flags   # Only generate flags for high-probability AI audio

    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=16000, mono=True)

    # Flag 1: Unnaturally stable pitch (F0 continuity)
    f0, voiced, _ = librosa.pyin(y, fmin=80, fmax=400)
    if voiced.sum() > 10:
        f0_std = np.nanstd(f0[voiced])
        if f0_std < 8.0:   # Human speech F0 std typically 20–60 Hz
            flags.append("unnatural_f0_continuity")

    # Flag 2: Harmonic discontinuity at phrase boundaries
    # (TTS models often have phase artifacts at sentence joins)
    rms = librosa.feature.rms(y=y)[0]
    silences = np.where(rms < rms.mean() * 0.1)[0]
    if len(silences) > 0:
        spec = np.abs(librosa.stft(y))
        harmonic_ratio = librosa.effects.harmonic(y).var() / (y.var() + 1e-8)
        if harmonic_ratio > 0.85:
            flags.append("harmonic_discontinuity")

    # Flag 3: Absence of room acoustics (TTS is often too clean)
    reverb_proxy = librosa.feature.spectral_rolloff(y=y, sr=sr)[0].std()
    if reverb_proxy < 500:
        flags.append("no_room_acoustics_detected")

    return flags[:3]   # Cap at 3 flags
```

#### 7.4.4 Failure Handling & Edge Cases

| Scenario | Detection | Strategy |
|---|---|---|
| Audio < 1s | `duration < 1.0` | Return 422 at gateway before upload |
| Audio > 300s | `duration > 300.0` | Truncate to 60s at preprocessing (longest meaningful segment) |
| Silent audio | `rms.mean() < 0.001` | Process normally but set `"silent_audio_warning": true` |
| Music / non-speech | Heuristic: high spectral centroid | Add `"content_type_warning": "Non-speech audio detected"` in response |
| `torchaudio` codec error | `RuntimeError` during load | Retry with `soundfile` backend. If still fails → NACK → DLX |
| MP3 with corrupted frames | `soundfile.LibsndfileError` | Mark job FAILED with `"error_code": "AUDIO_DECODE_ERROR"` |
| NACK count > 3 | `x-death` header | Route to `forensics.audio.dlx`. Mark job FAILED. Alert Prometheus counter. |

#### 7.4.5 Resource Budget & SLA

| Resource | Allocated | Note |
|---|---|---|
| CPU | 2 cores | torchaudio + librosa preprocessing |
| RAM | 2 GB | AASIST-L weights (<1MB), audio buffers, librosa |
| GPU | 500 MB VRAM (optional) | CPU sufficient for AASIST inference |
| **P95 Latency** | < 100ms inference / < 500ms with spectrogram | Inference is fast; spectrogram generation adds ~300ms |
| Throughput | ~8–10 jobs/min (CPU) | Limited by torchaudio I/O |

---

### 7.5 Video Detection Service (Port 8007 — Phase 4 Stretch Goal)

#### 7.5.1 Architecture Overview

```
RabbitMQ Consumer (forensics.video.detect)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               VIDEO DETECTION SERVICE                        │
│                                                              │
│  ffmpeg subprocess: extract 2 fps frames → JPEG stream      │
│         │                                                    │
│  MTCNN: detect + crop face regions per frame                │
│         │  (skip frames with no face detected)              │
│         ▼                                                    │
│  XceptionNet batch inference (batch_size=8 frames)          │
│         │                                                    │
│  Temporal Aggregation:                                       │
│    P_mean = mean(frame_scores)                              │
│    P_max  = max(frame_scores)                               │
│    P_vote = fraction of frames > 0.50                      │
│    P_final = 0.5×P_mean + 0.3×P_max + 0.2×P_vote          │
│         │                                                    │
│  Frame Grid Generator: thumbnail grid PNG → MinIO           │
│    (Top 9 frames by XceptionNet score, labelled)            │
└─────────────────────────────────────────────────────────────┘
```

#### 7.5.2 Response Contract

```
Completed Video Job Response:
{
  "job_id":   "uuid-v4",
  "modality": "VIDEO",
  "results": [{
    "model_name":      "xceptionnet-ff++",
    "ai_probability":  0.78,
    "confidence_score": 0.65,
    "verdict":         "LIKELY_AI",
    "video_metadata": {
      "duration_s":        45.3,
      "fps_analyzed":      2,
      "total_frames":      90,
      "frames_with_face":  61,
      "frames_analyzed":   61
    },
    "temporal_scores": {
      "p_mean": 0.74, "p_max": 0.96, "p_vote_fraction": 0.72,
      "score_over_time": [[0.0, 0.81], [0.5, 0.76], [1.0, 0.69]]
    },
    "explanation": {
      "method":         "FrameGrid",
      "frame_grid_url": "https://minio/.../frame_grid.png?token=...",
      "top_frames": [
        {"timestamp_s": 12.5, "score": 0.96, "thumbnail_url": "..."},
        {"timestamp_s": 7.0,  "score": 0.91, "thumbnail_url": "..."}
      ]
    }
  }]
}
```

#### 7.5.3 Resource Budget & SLA

| Resource | Allocated | Note |
|---|---|---|
| CPU | 4 cores | ffmpeg subprocess + MTCNN |
| RAM | 4 GB | Frame buffers (batch_size=8, each 224×224×3) |
| GPU | 3 GB VRAM | XceptionNet: ~87MB. MTCNN: ~50MB. Batching overhead. |
| P95 Latency | < 30s for 60s video | Dominated by ffmpeg extraction and face detection |
| **Status** | **Phase 4 — Implement only if Phases 1–5 complete** | |

---

### 7.6 Explainability — Embedded in Detection Services

> ⚠️ **DESIGN DECISION:** There is NO standalone Explainability microservice on a separate port. Explainability algorithms are embedded directly inside each detection service:
> - **SHAP** lives inside `text-service` (shares the loaded DeBERTa model + tokenizer in memory — no serialization)
> - **GradCAM** lives inside `image-service` (hooks directly onto ResNet-50 PyTorch graph — requires same process)
> - **Mel-Spectrogram** lives inside `audio-service` (uses the already-loaded waveform bytes)
>
> A standalone explainability service would require serializing PyTorch model graphs, weight tensors, and raw waveforms over HTTP — adding 200MB+ payloads, 2–5s network overhead, and complex model-loading duplication. The embedded architecture eliminates all of this.

#### 7.6.1 Explainability Ownership Map

| Explainability Method | Owned By | Port | Reason for Co-location |
|---|---|---|---|
| SHAP token attribution | `text-service` | 8001 | Requires DeBERTa tokenizer + model in same process |
| GradCAM heatmap | `image-service` | 8002 | Hooks onto ResNet-50 `layer4` — must be in same process |
| Mel-spectrogram | `audio-service` | 8003 | Uses already-decoded waveform bytes |
| Narrative generator | `report-service` | 8005 | String templating only; no model needed |
| Frame grid (video) | `video-service` | 8007 | Uses already-extracted frame tensors |

#### 7.6.2 Responsibilities & Internal Architecture
```
                    API Gateway (or Detection Services)
                               │ HTTP POST
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                  EXPLAINABILITY SERVICE                       │
│                                                              │
│  Startup:                                                    │
│    1. Load text SHAP explainer (tokenizer + predict_fn)     │
│    2. Load GradCAM wrapper (for on-demand use)              │
│    3. Cache matplotlib figure templates                      │
│                                                              │
│  Engines:                                                    │
│    /explain/text   → SHAPEngine  → token_attributions + HTML │
│    /explain/image  → GradCAMEngine → heatmap PNG bytes      │
│    /explain/audio  → SpectrogramEngine → melspec PNG bytes  │
│    /explain/narrative → NarrativeEngine → string summary    │
│                                                              │
│  All computation is async.to_thread() wrapped               │
└──────────────────────────────────────────────────────────────┘
```

#### 7.6.2 Complete Endpoint Contracts

**`POST /internal/explain/text`**

```
Request:
{
  "job_id":    "uuid-v4",
  "text":      "string",
  "ai_probability": 0.87,
  "model_name": "deberta-v3-raid-v1.2"
}

Response 200:
{
  "job_id":    "uuid-v4",
  "method":    "SHAP",
  "token_attributions": [
    {"token": "Furthermore", "attribution": 0.312, "position": 0},
    {"token": "worth",       "attribution": 0.241, "position": 4},
    ...
  ],
  "top_ai_indicator_tokens": ["Furthermore", "utilization", "it is worth noting"],
  "top_human_tokens":        ["I think", "actually", "hmm"],
  "html_heatmap":            "<span style='background:rgba(255,0,0,0.6)'>Furthermore</span>...",
  "computation_ms":          2150,
  "truncated":               false
}
```

**`POST /internal/explain/image`**

```
Request:
{
  "job_id":        "uuid-v4",
  "object_key":    "uploads/uuid-v4/original.jpg",
  "model_name":    "resnet50-cnndetection",
  "ai_probability": 0.73
}

Response 200:
{
  "job_id":              "uuid-v4",
  "method":              "GradCAM",
  "heatmap_object_key":  "heatmaps/uuid-v4/gradcam_overlay.png",
  "highlighted_regions": [
    {"region": "top-right", "intensity": 0.87},
    {"region": "center",    "intensity": 0.54}
  ],
  "computation_ms":      95
}
```

**`POST /internal/explain/audio`**

```
Request:
{
  "job_id":         "uuid-v4",
  "object_key":     "uploads/uuid-v4/audio.mp3",
  "ai_probability":  0.92
}

Response 200:
{
  "job_id":               "uuid-v4",
  "method":               "Mel-Spectrogram",
  "spectrogram_object_key": "spectrograms/uuid-v4/melspec.png",
  "duration_analyzed_s":  4.03,
  "sample_rate":          16000,
  "anomaly_flags":        ["unnatural_f0_continuity"],
  "computation_ms":       310
}
```

**`POST /internal/explain/narrative`**

```
Request:
{
  "modality":       "TEXT",
  "verdict":        "AI_GENERATED",
  "ai_probability": 0.87,
  "confidence_score": 0.91,
  "explanation_data": { ...modality-specific fields... }
}

Response 200:
{
  "narrative": "The text content is classified as AI-generated (87% probability, 91% confidence). AI indicators: 'Furthermore', 'utilization', 'it is worth noting'. These phrases are statistically over-represented in LLM outputs trained on web text.",
  "narrative_tokens": 42,
  "generated_ms": 2
}
```

#### 7.6.3 Resource Budget & SLA

| Resource | Allocated | Note |
|---|---|---|
| CPU | 4 cores | SHAP and spectrogram are CPU-bound |
| RAM | 3 GB | SHAP masker (~500MB), matplotlib (~200MB), GradCAM buffers |
| **SHAP P95** | < 5s (256 tokens) | Varies with text length |
| **GradCAM P95** | < 100ms | Fast gradient computation |
| **Spectrogram P95** | < 400ms | librosa mel + matplotlib render |

---

### 7.7 Report Generation Service (Port 8005)

#### 7.7.1 Responsibilities & Internal Architecture

```
API Gateway → POST /internal/report/generate/{job_id}
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                   REPORT GENERATION SERVICE                   │
│                                                              │
│  Step 1: Fetch all data                                      │
│    JobRepository.get_full_job(job_id)                       │
│    → job + detection_results + explanations + fusion_result  │
│    → user profile                                            │
│                                                              │
│  Step 2: Resolve MinIO artifacts                            │
│    Generate 1-hour presigned URLs for:                      │
│    - GradCAM heatmap PNG                                    │
│    - Mel-spectrogram PNG                                    │
│    → Embed as <img src="data:image/png;base64,..."> in HTML  │
│      (avoids URL expiry in PDF rendering)                   │
│                                                              │
│  Step 3: Jinja2 render                                      │
│    template.render(job=..., results=...) → HTML string      │
│                                                              │
│  Step 4: WeasyPrint → PDF bytes                             │
│                                                              │
│  Step 5: Upload PDF to MinIO                                │
│    reports/{job_id}/forensics_report_{timestamp}.pdf        │
│                                                              │
│  Step 6: Write report record to `reports` table             │
│    → return presigned download URL (24h expiry)             │
└──────────────────────────────────────────────────────────────┘
```

#### 7.7.2 PDF Report Structure (5-Page Spec)

```
Page 1 — Executive Summary
  ├── Platform header + job ID + timestamp
  ├── FINAL VERDICT badge (color-coded: RED/ORANGE/GREY/GREEN)
  ├── Overall AI probability (large dial graphic)
  ├── Confidence score
  ├── Modalities analyzed (checklist)
  └── One-paragraph narrative explanation

Page 2 — Per-Modality Results Table
  ├── Row per modality: Model | Score | Verdict | Confidence | Time
  ├── Ensemble breakdown (image only): ResNet vs Corvi
  └── Fusion weights applied (multimodal only)

Page 3 — Visual Evidence
  ├── [Text] SHAP heatmap (rendered HTML → CSS box model in WeasyPrint)
  ├── [Image] Original + GradCAM overlay side-by-side
  └── [Audio] Mel-spectrogram + waveform (2 subplots)

Page 4 — Technical Methodology
  ├── Model descriptions (1 paragraph each)
  ├── Preprocessing steps
  ├── Fusion algorithm description
  └── Confidence interpretation guide

Page 5 — Limitations & Disclaimer
  ├── Cross-domain generalization warnings
  ├── Known failure modes per modality
  ├── Legal disclaimer (not forensic evidence)
  └── Platform version + model checksums
```

#### 7.7.3 Complete Endpoint Contracts

**`POST /internal/report/generate/{job_id}`**

```
Request: (no body — job_id in path)

Processing time: 3–8 seconds (WeasyPrint PDF generation)
Response 200:
{
  "job_id":       "uuid-v4",
  "report_id":    "uuid-report",
  "status":       "COMPLETED",
  "pdf_url":      "https://minio/forensics-bucket/reports/.../report.pdf?token=...&expires=...",
  "pdf_url_expiry": "2024-06-02T10:30:00Z",
  "pdf_size_bytes": 487293,
  "page_count":   5,
  "generated_at": "2024-06-01T10:30:08Z"
}

Response 404: { "error": "JOB_NOT_FOUND" }
Response 422: { "error": "JOB_NOT_COMPLETED", "detail": "Job status is PROCESSING" }
Response 500: { "error": "PDF_GENERATION_FAILED", "detail": "WeasyPrint error: ..." }
```

**`GET /internal/report/{job_id}/download`**

```
Response 302 Redirect → MinIO presigned URL (fresh 1h URL generated on each call)
Response 404: { "error": "REPORT_NOT_FOUND", "detail": "Generate report first" }
```

#### 7.7.4 Failure Handling & Edge Cases

| Scenario | Strategy |
|---|---|
| MinIO artifact URL expired during PDF gen | Fetch object bytes directly from MinIO → base64-embed in HTML |
| WeasyPrint font missing | Dockerfile installs: `fonts-liberation fonts-dejavu` |
| Job has no image (text-only) | Conditionally exclude image/audio sections from template |
| PDF > 20MB (large heatmaps) | Resize embedded images to max 1000px before base64 encoding |
| Report already exists | Return existing report metadata without regenerating |

#### 7.7.5 Resource Budget & SLA

| Resource | Allocated | Note |
|---|---|---|
| CPU | 2 cores | WeasyPrint is CPU-bound for PDF rendering |
| RAM | 1 GB | Jinja2 template + WeasyPrint render tree |
| **P95 Latency** | < 10s | DOM layout + PDF export |
| Max PDF size | 20 MB | Enforced by image resize before embedding |

---

### 7.8 Authentication Service (Port 8006)

#### 7.8.1 Responsibilities & Internal Architecture

```
API Gateway calls (sync via httpx)
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│                  AUTHENTICATION SERVICE                       │
│                                                              │
│  /auth/register:                                             │
│    → Validate email format + password strength              │
│    → Check email uniqueness (SELECT WHERE email = ?)        │
│    → bcrypt hash password (cost factor 12)                  │
│    → INSERT user row                                        │
│    → Return user profile (no token on register)             │
│                                                              │
│  /auth/login:                                               │
│    → Lookup user by email                                   │
│    → bcrypt verify password                                 │
│    → Generate access_token (JWT, 15min exp)                 │
│    → Generate refresh_token (JWT, 7 days exp)              │
│    → Store refresh_token hash in Redis (key: user_id)      │
│    → Return token pair                                      │
│                                                              │
│  /auth/refresh:                                             │
│    → Validate refresh_token signature + expiry             │
│    → Check token hash exists in Redis (not blacklisted)    │
│    → Delete old refresh_token from Redis                   │
│    → Generate new access_token + new refresh_token         │
│    → Store new refresh_token hash in Redis                 │
│    → Return new token pair (rotation)                      │
│                                                              │
│  /auth/logout:                                             │
│    → Extract refresh_token from request body               │
│    → Delete from Redis → token immediately invalid         │
│    → Return 204 No Content                                 │
│                                                              │
│  /auth/verify:  ← called by API Gateway middleware          │
│    → Validate JWT signature + expiry + not blacklisted     │
│    → Return { user_id, email, role }                       │
└──────────────────────────────────────────────────────────────┘
```

#### 7.8.2 Token Architecture

```
ACCESS TOKEN (JWT HS256):
  Header: { "alg": "HS256", "typ": "JWT" }
  Payload: {
    "sub":   "uuid-user",            // user_id
    "email": "user@example.com",
    "role":  "USER",                 // or "ADMIN"
    "iat":   1717200000,
    "exp":   1717200900,             // 15 minutes
    "jti":   "uuid-token-id"         // unique token ID for blacklisting
  }
  Signed with: JWT_SECRET_KEY (env var, min 32 chars)

REFRESH TOKEN (JWT HS256):
  Payload: {
    "sub":  "uuid-user",
    "type": "refresh",
    "iat":  1717200000,
    "exp":  1717804800,              // 7 days
    "jti":  "uuid-refresh-id"
  }

Redis Storage:
  Key:   "refresh:{user_id}"
  Value: SHA256(refresh_token_jti)
  TTL:   604800 seconds (7 days)

Blacklisting (logout / token compromise):
  Key:   "blacklist:{jti}"
  Value: "1"
  TTL:   Remaining token lifetime seconds
```

#### 7.8.3 Complete Endpoint Contracts

**`POST /auth/register`**

```
Request:
{
  "email":            "user@example.com",   // REQUIRED. RFC 5321 valid.
  "password":         "Str0ng!Pass",        // Min 8 chars, 1 upper, 1 digit, 1 special.
  "full_name":        "Jane Doe"            // REQUIRED. Max 100 chars.
}

Response 201 Created:
{
  "user_id":    "uuid-v4",
  "email":      "user@example.com",
  "full_name":  "Jane Doe",
  "role":       "USER",
  "created_at": "2024-06-01T10:30:00Z"
}

Errors:
  400 { "error": "WEAK_PASSWORD",    "detail": "Must contain uppercase, digit, special char" }
  409 { "error": "EMAIL_EXISTS",     "detail": "user@example.com is already registered" }
  422 { "error": "INVALID_EMAIL",    "detail": "Not a valid email address" }
```

**`POST /auth/login`**

```
Request:
{
  "email":    "user@example.com",
  "password": "Str0ng!Pass"
}

Response 200:
{
  "access_token":         "eyJhbGc...",
  "refresh_token":        "eyJhbGc...",
  "token_type":           "Bearer",
  "access_token_expires_in":  900,
  "refresh_token_expires_in": 604800,
  "user": {
    "user_id":   "uuid-v4",
    "email":     "user@example.com",
    "full_name": "Jane Doe",
    "role":      "USER"
  }
}

Errors:
  401 { "error": "INVALID_CREDENTIALS", "detail": "Email or password incorrect" }
  423 { "error": "ACCOUNT_LOCKED",      "detail": "Too many failed attempts. Try in 15 min." }
```

**`POST /auth/refresh`**

```
Request:
{
  "refresh_token": "eyJhbGc..."
}

Response 200: (same as login response — new token pair)

Errors:
  401 { "error": "REFRESH_TOKEN_INVALID",  "detail": "Signature mismatch or expired" }
  401 { "error": "REFRESH_TOKEN_REVOKED",  "detail": "Token already used or logged out" }
```

**`POST /auth/verify`** *(internal — called by API Gateway middleware)*

```
Request:
{
  "access_token": "eyJhbGc..."
}

Response 200:
{
  "valid":    true,
  "user_id":  "uuid-v4",
  "email":    "user@example.com",
  "role":     "USER",
  "expires_at": "2024-06-01T10:45:00Z"
}

Response 401:
{
  "valid":  false,
  "error":  "TOKEN_EXPIRED",   // or TOKEN_BLACKLISTED | SIGNATURE_INVALID
  "detail": "Token expired at 2024-06-01T10:30:00Z"
}
```

**`GET /auth/me`**

```
Auth: Bearer <access_token>

Response 200:
{
  "user_id":    "uuid-v4",
  "email":      "user@example.com",
  "full_name":  "Jane Doe",
  "role":       "USER",
  "created_at": "2024-05-01T08:00:00Z",
  "last_login": "2024-06-01T10:30:00Z",
  "total_jobs": 47
}
```

#### 7.8.4 Brute Force Protection

```python
# services/auth-service/app/services/login_throttle.py
# Redis-backed failed attempt counter per email

MAX_ATTEMPTS  = 5
LOCKOUT_SEC   = 900   # 15 minutes

async def check_login_throttle(redis: Redis, email: str) -> None:
    key = f"login_attempts:{email.lower()}"
    attempts = await redis.get(key)
    if attempts and int(attempts) >= MAX_ATTEMPTS:
        ttl = await redis.ttl(key)
        raise AccountLockedError(f"Too many failed attempts. Try in {ttl}s.")

async def record_failed_attempt(redis: Redis, email: str) -> None:
    key = f"login_attempts:{email.lower()}"
    await redis.incr(key)
    await redis.expire(key, LOCKOUT_SEC)

async def reset_throttle(redis: Redis, email: str) -> None:
    await redis.delete(f"login_attempts:{email.lower()}")
```

#### 7.8.5 Resource Budget & SLA

| Resource | Allocated | Note |
|---|---|---|
| CPU | 1 core | bcrypt is intentionally slow (cost=12 = ~300ms per verify) |
| RAM | 256 MB | No ML models; pure JWT + bcrypt |
| Redis | < 10KB per user | Refresh token hashes + blacklist entries |
| **P95 /login** | < 500ms | bcrypt dominates (300ms) + DB lookup (< 5ms) |
| **P95 /verify** | < 20ms | JWT decode only; no bcrypt |
| **P95 /register** | < 600ms | bcrypt + DB insert |

---

### 7.9 Cross-Service Health Check Protocol

All 8 services implement an identical health check contract:

```
GET /internal/health   → 200 OK (healthy) or 503 (degraded)

Mandatory fields in every service health response:
{
  "service":          "service-name",
  "status":           "healthy" | "degraded" | "starting",
  "version":          "1.0.0",
  "timestamp":        "ISO-8601",
  "uptime_s":         3600,
  "requests_served":  1247,
  "avg_latency_ms":   380,
  "dependencies": {
    // Each downstream dependency listed with status + latency
  }
}

Docker Compose healthcheck:
  test: curl -f http://localhost:{port}/internal/health || exit 1
  interval: 30s
  timeout: 10s
  start_period: 60s   # Allow model loading time
  retries: 3
```

---

### 7.10 Service Dependency Graph & Startup Order

```
                     [postgres]
                    /     |    \
               [redis] [minio] [rabbitmq]
                  |               |
              [auth-svc]    [text-svc]
                  |          [image-svc]
             [api-gateway]  [audio-svc]
                  |
             [frontend]
             [report-svc]
             [explain-svc]

Docker Compose `depends_on` with `condition: service_healthy`:
  api-gateway  depends_on: [postgres✓, redis✓, rabbitmq✓, minio✓]
  text-service depends_on: [postgres✓]
  image-service depends_on: [postgres✓, rabbitmq✓]
  audio-service depends_on: [postgres✓, rabbitmq✓]
  auth-service  depends_on: [postgres✓, redis✓]
  report-service depends_on: [postgres✓, minio✓]
  explain-service depends_on: [minio✓]
  frontend      depends_on: [api-gateway✓]
```

---

### 7.11 Service SLA Summary Table

| Service | P95 Latency | Throughput | Availability | Scaling Strategy |
|---|---|---|---|---|
| API Gateway | < 200ms (gateway overhead) | 50 req/s | 99.9% | Horizontal (stateless) |
| Text Service | < 2s (GPU) / < 5s (CPU) | 2 req/s | 99.5% | Vertical (more VRAM) |
| Image Service | < 3s (GPU) / < 10s (CPU) | 5 jobs/min | 99.0% | Vertical GPU + queue |
| Audio Service | < 500ms (inference) | 10 jobs/min | 99.0% | Horizontal consumer |
| Auth Service | < 500ms (/login) | 20 req/s | 99.9% | Horizontal (Redis session) |
| Explain Service | < 5s (SHAP) / < 100ms (GradCAM) | 3 req/s | 99.0% | Vertical (RAM) |
| Report Service | < 10s | 5 req/min | 99.0% | Horizontal (stateless) |
| Video Service | < 30s | 2 jobs/min | 95.0% | Vertical GPU (Phase 4) |

---

## SECTION 8 — LOW LEVEL DESIGN (LLD)

> **Scope:** This section is implementation-ready. Every code block, schema, contract, and interface defined here should translate directly to source files with minimal adaptation.

---

### 8.1 Microservice Folder Structure

Each service follows an identical internal structure. This enforces consistency across the team and makes onboarding new developers trivial.

#### 8.1.1 Repository Root

```
forensics-platform/
│
├── docker-compose.yml              ← Single-command orchestration
├── docker-compose.override.yml     ← Dev overrides (volume mounts, debug ports)
├── .env.example                    ← All required environment variables documented
├── .env                            ← Local secrets (gitignored)
├── Makefile                        ← make up / make down / make migrate / make test
├── README.md
│
├── services/
│   ├── api-gateway/
│   ├── text-service/
│   ├── image-service/
│   ├── audio-service/
│   ├── explainability-service/
│   ├── report-service/
│   └── auth-service/
│
├── frontend/                       ← Next.js application
│   ├── src/
│   │   ├── app/                    ← Next.js 14 App Router
│   │   │   ├── page.tsx            ← Landing / Dashboard
│   │   │   ├── upload/page.tsx
│   │   │   ├── jobs/[id]/page.tsx
│   │   │   └── reports/[id]/page.tsx
│   │   ├── components/
│   │   │   ├── UploadDropzone.tsx
│   │   │   ├── JobStatusCard.tsx
│   │   │   ├── ResultVisualization.tsx
│   │   │   ├── HeatmapViewer.tsx
│   │   │   └── ReportDownloadButton.tsx
│   │   ├── lib/
│   │   │   ├── api.ts              ← Typed axios API client
│   │   │   └── auth.ts             ← NextAuth configuration
│   │   └── types/
│   │       └── api.ts              ← TypeScript interfaces matching Pydantic schemas
│   ├── public/
│   ├── next.config.ts
│   └── package.json
│
├── shared/
│   ├── db/
│   │   ├── alembic.ini
│   │   ├── alembic/
│   │   │   ├── env.py
│   │   │   └── versions/
│   │   │       ├── 001_create_users.py
│   │   │       ├── 002_create_jobs.py
│   │   │       ├── 003_create_models.py
│   │   │       ├── 004_create_detection_results.py
│   │   │       ├── 005_create_explanations.py
│   │   │       ├── 006_create_fusion_results.py
│   │   │       ├── 007_create_reports.py
│   │   │       └── 008_create_audit_logs.py
│   │   └── models/                 ← Shared SQLAlchemy ORM models (pip-installed package)
│   │       ├── __init__.py
│   │       ├── base.py
│   │       ├── user.py
│   │       ├── job.py
│   │       ├── detection_result.py
│   │       ├── explanation.py
│   │       ├── fusion_result.py
│   │       ├── model_registry.py
│   │       ├── report.py
│   │       └── audit_log.py
│   └── schemas/                    ← Shared Pydantic DTOs
│       ├── __init__.py
│       ├── job_schemas.py
│       ├── detection_schemas.py
│       ├── queue_schemas.py
│       └── report_schemas.py
│
├── models/                         ← Model checkpoints (gitignored, mounted as Docker volume)
│   ├── deberta_v3_raid_v1.2/
│   ├── resnet50_cnn_detection_v2.0/
│   ├── corvi_effnet_v1.0/
│   └── aasist_l_v1.0/
│
└── .github/
    └── workflows/
        ├── ci.yml                  ← Lint + test on push
        └── cd.yml                  ← Build + push Docker images on merge to main
```

---

#### 8.1.2 Per-Service Folder Structure (Identical Pattern)

Shown for `text-service/`. All other services mirror this structure exactly.

```
services/text-service/
│
├── Dockerfile
├── requirements.txt
├── .env.example
│
├── app/
│   ├── main.py                     ← FastAPI app factory + lifespan events
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   ├── routes.py               ← Route registration
│   │   └── v1/
│   │       ├── __init__.py
│   │       └── detect.py           ← Endpoint handlers
│   │
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py               ← Pydantic BaseSettings (reads .env)
│   │   ├── logging.py              ← Structured JSON logging (structlog)
│   │   └── exceptions.py          ← Custom exception classes + handlers
│   │
│   ├── db/
│   │   ├── __init__.py
│   │   ├── session.py              ← SQLAlchemy async engine + session factory
│   │   └── repositories/
│   │       ├── __init__.py
│   │       └── job_repository.py   ← DB read/write methods (no raw SQL in routes)
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── text_detector.py        ← DeBERTa inference wrapper
│   │   ├── shap_explainer.py       ← SHAP computation
│   │   └── queue_consumer.py       ← RabbitMQ consumer (for async mode)
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   └── deberta_loader.py       ← Model load at startup, singleton pattern
│   │
│   └── schemas/
│       ├── __init__.py
│       ├── request.py              ← Pydantic request DTOs
│       └── response.py             ← Pydantic response DTOs
│
└── tests/
    ├── __init__.py
    ├── conftest.py                 ← pytest fixtures (test DB, mock model)
    ├── unit/
    │   ├── test_detector.py
    │   └── test_explainer.py
    └── integration/
        └── test_api.py
```

---

#### 8.1.3 API Gateway Specific Structure

```
services/api-gateway/
├── app/
│   ├── main.py
│   ├── api/v1/
│   │   ├── auth.py                 ← /auth/* endpoints
│   │   ├── detect.py               ← /detect/* endpoints
│   │   ├── jobs.py                 ← /jobs/* endpoints
│   │   └── reports.py              ← /reports/* endpoints
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py             ← JWT decode, API key validation
│   │   └── rate_limit.py           ← slowapi configuration
│   ├── middleware/
│   │   ├── auth_middleware.py      ← JWT extraction + user injection
│   │   ├── file_validator.py       ← MIME type + size checks
│   │   └── audit_logger.py        ← Writes to audit_logs table
│   └── services/
│       ├── storage_service.py      ← MinIO client wrapper
│       ├── queue_service.py        ← RabbitMQ publish wrapper
│       └── job_service.py          ← Job CRUD wrapper
```

---

### 8.2 PostgreSQL Database Schema (Complete DDL)

```sql
-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Trigram search (future: fuzzy match on filenames)

-- ============================================================
-- ENUM TYPES
-- ============================================================
CREATE TYPE job_status AS ENUM (
    'queued', 'processing', 'completed', 'failed', 'cancelled'
);

CREATE TYPE modality_type AS ENUM (
    'text', 'image', 'audio', 'video', 'multimodal'
);

CREATE TYPE verdict_type AS ENUM (
    'AI_GENERATED',      -- >= 0.80 probability
    'LIKELY_AI',         -- 0.60–0.79
    'INCONCLUSIVE',      -- 0.40–0.59
    'LIKELY_HUMAN',      -- 0.20–0.39
    'HUMAN_GENERATED'    -- < 0.20
);

CREATE TYPE explanation_method AS ENUM (
    'SHAP', 'GRADCAM', 'LIME', 'SPECTROGRAM', 'FRAME_VISUALIZATION', 'NARRATIVE'
);

CREATE TYPE artifact_type AS ENUM (
    'json_data', 'image_png', 'image_svg', 'html_fragment', 'text_narrative'
);

CREATE TYPE report_status AS ENUM ('pending', 'generating', 'completed', 'failed');
CREATE TYPE report_type   AS ENUM ('pdf', 'json', 'html');

-- ============================================================
-- TABLE: users
-- ============================================================
CREATE TABLE users (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    email               VARCHAR(255)    NOT NULL,
    name                VARCHAR(255)    NOT NULL,
    password_hash       VARCHAR(255)    NOT NULL,
    role                VARCHAR(20)     NOT NULL DEFAULT 'user'
                        CHECK (role IN ('user', 'admin', 'analyst')),
    api_key_hash        VARCHAR(255)    UNIQUE,
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    email_verified      BOOLEAN         NOT NULL DEFAULT FALSE,
    quota_daily_limit   INTEGER         NOT NULL DEFAULT 100,
    quota_used_today    INTEGER         NOT NULL DEFAULT 0,
    quota_reset_date    DATE            NOT NULL DEFAULT CURRENT_DATE,
    login_count         INTEGER         NOT NULL DEFAULT 0,
    last_login          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email_lower ON users (LOWER(email));
CREATE INDEX idx_users_api_key ON users (api_key_hash)
    WHERE api_key_hash IS NOT NULL;

-- ============================================================
-- TABLE: jobs
-- ============================================================
CREATE TABLE jobs (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL
                        REFERENCES users(id) ON DELETE CASCADE,
    status              job_status      NOT NULL DEFAULT 'queued',
    modality            modality_type   NOT NULL,

    -- Input storage
    input_type          VARCHAR(10)     NOT NULL
                        CHECK (input_type IN ('text', 'file')),
    input_text          TEXT,
    input_object_key    VARCHAR(1024),
    file_name           VARCHAR(512),
    file_size_bytes     BIGINT
                        CHECK (file_size_bytes > 0),
    file_mime_type      VARCHAR(128),
    file_sha256         CHAR(64),

    -- Worker coordination
    priority            SMALLINT        NOT NULL DEFAULT 5
                        CHECK (priority BETWEEN 1 AND 10),
    retry_count         SMALLINT        NOT NULL DEFAULT 0,
    max_retries         SMALLINT        NOT NULL DEFAULT 3,
    queue_name          VARCHAR(64),
    worker_id           VARCHAR(128),
    error_message       TEXT,
    error_code          VARCHAR(64),

    -- Lifecycle timestamps
    queued_at           TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,

    CONSTRAINT chk_input CHECK (
        (input_type = 'text' AND input_text IS NOT NULL AND input_object_key IS NULL) OR
        (input_type = 'file' AND input_object_key IS NOT NULL AND input_text IS NULL)
    )
);

CREATE INDEX idx_jobs_user_id         ON jobs (user_id);
CREATE INDEX idx_jobs_status          ON jobs (status)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_user_status     ON jobs (user_id, status, created_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_jobs_queue_poll      ON jobs (priority DESC, created_at ASC)
    WHERE status = 'queued' AND deleted_at IS NULL;
CREATE INDEX idx_jobs_worker          ON jobs (worker_id)
    WHERE status = 'processing';

-- ============================================================
-- TABLE: models (Model Registry)
-- ============================================================
CREATE TABLE models (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255)    NOT NULL,
    version             VARCHAR(64)     NOT NULL,
    modality            modality_type   NOT NULL,
    architecture        VARCHAR(255),
    parameter_count     BIGINT,
    framework           VARCHAR(64)     DEFAULT 'pytorch',
    framework_version   VARCHAR(32),
    training_dataset    VARCHAR(255),
    eval_accuracy       REAL            CHECK (eval_accuracy BETWEEN 0 AND 1),
    eval_f1             REAL            CHECK (eval_f1 BETWEEN 0 AND 1),
    eval_auc            REAL            CHECK (eval_auc BETWEEN 0 AND 1),
    eval_eer            REAL            CHECK (eval_eer >= 0),
    eval_dataset        VARCHAR(255),
    checkpoint_path     VARCHAR(1024),
    checkpoint_sha256   CHAR(64),
    is_active           BOOLEAN         NOT NULL DEFAULT TRUE,
    is_default          BOOLEAN         NOT NULL DEFAULT FALSE,
    loaded_at           TIMESTAMPTZ,
    deprecated_at       TIMESTAMPTZ,
    replaced_by         UUID            REFERENCES models(id),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (name, version)
);

CREATE INDEX idx_models_modality_default ON models (modality, is_active, is_default);

-- ============================================================
-- TABLE: detection_results
-- ============================================================
CREATE TABLE detection_results (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID            NOT NULL
                        REFERENCES jobs(id) ON DELETE CASCADE,
    modality            modality_type   NOT NULL,
    ai_probability      REAL            NOT NULL
                        CHECK (ai_probability BETWEEN 0.0 AND 1.0),
    confidence_score    REAL            NOT NULL
                        CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    verdict             verdict_type    NOT NULL,
    model_id            UUID            REFERENCES models(id),
    model_name          VARCHAR(255),
    model_version       VARCHAR(64),
    model_ensemble      JSONB,
    raw_logits          JSONB,
    raw_probabilities   JSONB,
    preprocessing_params JSONB,
    processing_time_ms  INTEGER         CHECK (processing_time_ms >= 0),
    device_used         VARCHAR(10)
                        CHECK (device_used IN ('cpu', 'cuda', 'mps')),
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_results_job_modality  ON detection_results (job_id, modality);
CREATE INDEX idx_results_job_id               ON detection_results (job_id);
CREATE INDEX idx_results_verdict              ON detection_results (verdict);
CREATE INDEX idx_results_created_at           ON detection_results (created_at DESC);

-- ============================================================
-- TABLE: explanations
-- ============================================================
CREATE TABLE explanations (
    id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id           UUID                NOT NULL
                        REFERENCES detection_results(id) ON DELETE CASCADE,
    method              explanation_method  NOT NULL,
    artifact_type       artifact_type       NOT NULL,
    artifact_object_key VARCHAR(1024),
    artifact_signed_url TEXT,
    artifact_url_expires TIMESTAMPTZ,
    artifact_data       JSONB,
    narrative_text      TEXT,
    token_attributions  JSONB,
    top_indicators      JSONB,
    region_highlights   JSONB,
    frame_scores        JSONB,
    created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_explanations_result_id ON explanations (result_id);
CREATE INDEX idx_explanations_method    ON explanations (method);

-- ============================================================
-- TABLE: fusion_results
-- ============================================================
CREATE TABLE fusion_results (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID            NOT NULL UNIQUE
                        REFERENCES jobs(id) ON DELETE CASCADE,
    final_score         REAL            NOT NULL
                        CHECK (final_score BETWEEN 0.0 AND 1.0),
    final_confidence    REAL            NOT NULL
                        CHECK (final_confidence BETWEEN 0.0 AND 1.0),
    final_verdict       verdict_type    NOT NULL,
    modalities_used     JSONB           NOT NULL,
    weights_applied     JSONB           NOT NULL,
    component_scores    JSONB           NOT NULL,
    fusion_method       VARCHAR(64)     NOT NULL DEFAULT 'weighted_linear',
    fusion_version      VARCHAR(32)     NOT NULL DEFAULT 'v1.0',
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fusion_job_id ON fusion_results (job_id);

-- ============================================================
-- TABLE: reports
-- ============================================================
CREATE TABLE reports (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id              UUID            NOT NULL
                        REFERENCES jobs(id) ON DELETE CASCADE,
    report_type         report_type     NOT NULL,
    status              report_status   NOT NULL DEFAULT 'pending',
    minio_object_key    VARCHAR(1024),
    file_size_bytes     BIGINT,
    file_sha256         CHAR(64),
    signed_url          TEXT,
    signed_url_expires  TIMESTAMPTZ,
    generation_time_ms  INTEGER,
    error_message       TEXT,
    generated_at        TIMESTAMPTZ,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW(),

    UNIQUE (job_id, report_type)
);

CREATE INDEX idx_reports_job_id ON reports (job_id);

-- ============================================================
-- TABLE: audit_logs  (High-volume: BIGSERIAL PK, no UUID)
-- ============================================================
CREATE TABLE audit_logs (
    id              BIGSERIAL       PRIMARY KEY,
    user_id         UUID            REFERENCES users(id) ON DELETE SET NULL,
    event_type      VARCHAR(64)     NOT NULL,
    resource_type   VARCHAR(64),
    resource_id     UUID,
    ip_address      INET            NOT NULL,
    user_agent      TEXT,
    request_method  VARCHAR(10),
    request_path    VARCHAR(2048),
    response_status SMALLINT,
    response_time_ms INTEGER,
    extra_data      JSONB,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_user_id     ON audit_logs (user_id, created_at DESC);
CREATE INDEX idx_audit_event_type  ON audit_logs (event_type, created_at DESC);
CREATE INDEX idx_audit_resource    ON audit_logs (resource_type, resource_id)
    WHERE resource_id IS NOT NULL;
CREATE INDEX idx_audit_ip          ON audit_logs (ip_address, created_at DESC);
```

---

### 8.3 ER Diagram (ASCII)

```
┌────────────────────────────────────────────────────────────────────────────────────┐
│                              ER DIAGRAM — All Entities                             │
└────────────────────────────────────────────────────────────────────────────────────┘

  ┌─────────────────┐         ┌───────────────────┐          ┌─────────────────────┐
  │    users        │         │      jobs          │          │  detection_results  │
  ├─────────────────┤         ├───────────────────┤          ├─────────────────────┤
  │ PK id           │──1───M──│ PK id             │──1────M──│ PK id               │
  │    email        │         │ FK user_id        │          │ FK job_id           │
  │    name         │         │    status (enum)  │          │    modality (enum)  │
  │    password_hash│         │    modality       │          │    ai_probability   │
  │    role         │         │    input_type     │          │    confidence_score │
  │    api_key_hash │         │    input_text     │          │    verdict (enum)   │
  │    is_active    │         │    input_obj_key  │          │ FK model_id         │
  │    quota_*      │         │    file_*         │          │    model_ensemble   │
  │    created_at   │         │    priority       │          │    raw_logits       │
  └─────────────────┘         │    retry_count    │          │    processing_ms    │
           │                  │    worker_id      │          │    device_used      │
           │1                 │    error_message  │          └──────────┬──────────┘
           │                  │    created_at     │                     │1
           │M                 └────────┬──────────┘                    │M
  ┌────────▼────────┐                  │1           ┌──────────────────▼──────────┐
  │  audit_logs     │                  │            │  explanations               │
  ├─────────────────┤       ┌──────────┼──────┐     ├─────────────────────────────┤
  │ PK id (BIGINT)  │       │1         │1     │1    │ PK id                       │
  │ FK user_id      │  ┌────▼──────┐   │  ┌───▼──┐  │ FK result_id                │
  │    event_type   │  │ fusion_   │   │  │report│  │    method (enum)            │
  │    resource_*   │  │ results   │   │  │s     │  │    artifact_type (enum)     │
  │    ip_address   │  ├───────────┤   │  ├──────┤  │    artifact_object_key      │
  │    request_*    │  │ PK id     │   │  │PK id │  │    artifact_data (JSONB)    │
  │    created_at   │  │ FK job_id │   │  │FK    │  │    token_attributions (JSON)│
  └─────────────────┘  │ final_    │   │  │job_id│  │    region_highlights (JSON) │
                       │  score    │   │  │type  │  │    narrative_text           │
                       │ weights_  │   │  │status│  └─────────────────────────────┘
                       │  applied  │   │  │minio_│
                       │ component │   │  │key   │         ┌──────────────────┐
                       │  scores   │   │  └──────┘         │  models          │
                       └───────────┘   │                   ├──────────────────┤
                                       └───────────────────│ PK id            │
                                       (detection_results  │    name          │
                                        FK model_id →)     │    version       │
                                                           │    modality      │
                                                           │    architecture  │
                                                           │    eval_auc      │
                                                           │    checkpoint_   │
                                                           │     path         │
                                                           │    is_active     │
                                                           │    is_default    │
                                                           └──────────────────┘
```

---

### 8.4 Index Strategy

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                           INDEX DECISION MATRIX                                  │
│                                                                                  │
│  QUERY PATTERN                       │ TABLE           │ INDEX TYPE  │ REASON   │
│  ────────────────────────────────────┼─────────────────┼─────────────┼───────── │
│  Login by email (case-insensitive)   │ users           │ Unique/func │ Daily    │
│  List user's jobs by status          │ jobs            │ Composite   │ Dashboard│
│  Poll next queued job (worker)       │ jobs            │ Partial     │ Queue    │
│  Find active worker jobs             │ jobs            │ Partial     │ Monitor  │
│  Result lookup by job+modality       │ detect_results  │ Unique comp.│ Prevent dup│
│  Time-series analytics               │ detect_results  │ BRIN/BTREE  │ Reporting│
│  Audit queries by event type         │ audit_logs      │ Composite   │ Admin    │
│  Audit queries by IP (security)      │ audit_logs      │ Composite   │ Security │
│  Model lookup by modality+default    │ models          │ Composite   │ Startup  │
│                                                                                  │
│  PARTIAL INDEX RATIONALE:                                                        │
│  idx_jobs_queue_poll: WHERE status='queued'                                      │
│    → Only queued jobs are polled by workers. Full index wastes 95% of rows.     │
│    → Partial index is 20× smaller and stays in shared_buffers.                  │
│                                                                                  │
│  JSONB INDEX (Phase 3 only — add when queries require):                          │
│  CREATE INDEX ON detection_results USING GIN(model_ensemble);                   │
│  CREATE INDEX ON explanations USING GIN(token_attributions);                    │
└──────────────────────────────────────────────────────────────────────────────────┘
```

---

### 8.5 SQLAlchemy ORM Models (Python)

```python
# shared/db/models/base.py
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import MetaData

NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

class Base(DeclarativeBase):
    metadata = MetaData(naming_convention=NAMING_CONVENTION)
```

```python
# shared/db/models/user.py
from __future__ import annotations
import uuid
from datetime import date, datetime
from sqlalchemy import String, Boolean, Integer, Date, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="user")
    api_key_hash: Mapped[str | None] = mapped_column(String(255), unique=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    email_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    quota_daily_limit: Mapped[int] = mapped_column(Integer, nullable=False, default=100)
    quota_used_today: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    quota_reset_date: Mapped[date] = mapped_column(Date, nullable=False)
    login_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_login: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    jobs: Mapped[list["Job"]] = relationship("Job", back_populates="user")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="user")
```

```python
# shared/db/models/job.py
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import String, Text, BigInteger, SmallInteger, DateTime, Enum, CheckConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import Base


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = (
        CheckConstraint(
            "(input_type = 'text' AND input_text IS NOT NULL) OR "
            "(input_type = 'file' AND input_object_key IS NOT NULL)",
            name="chk_input"
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        nullable=False,
    )
    status: Mapped[str] = mapped_column(
        Enum("queued", "processing", "completed", "failed", "cancelled",
             name="job_status"), nullable=False, default="queued"
    )
    modality: Mapped[str] = mapped_column(
        Enum("text", "image", "audio", "video", "multimodal",
             name="modality_type"), nullable=False
    )
    input_type: Mapped[str] = mapped_column(String(10), nullable=False)
    input_text: Mapped[str | None] = mapped_column(Text)
    input_object_key: Mapped[str | None] = mapped_column(String(1024))
    file_name: Mapped[str | None] = mapped_column(String(512))
    file_size_bytes: Mapped[int | None] = mapped_column(BigInteger)
    file_mime_type: Mapped[str | None] = mapped_column(String(128))
    file_sha256: Mapped[str | None] = mapped_column(String(64))
    priority: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=5)
    retry_count: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=0)
    max_retries: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=3)
    queue_name: Mapped[str | None] = mapped_column(String(64))
    worker_id: Mapped[str | None] = mapped_column(String(128))
    error_message: Mapped[str | None] = mapped_column(Text)
    error_code: Mapped[str | None] = mapped_column(String(64))
    queued_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="jobs")
    detection_results: Mapped[list["DetectionResult"]] = relationship(
        "DetectionResult", back_populates="job", cascade="all, delete-orphan"
    )
    fusion_result: Mapped["FusionResult | None"] = relationship(
        "FusionResult", back_populates="job", uselist=False, cascade="all, delete-orphan"
    )
    reports: Mapped[list["Report"]] = relationship(
        "Report", back_populates="job", cascade="all, delete-orphan"
    )
```

```python
# shared/db/models/detection_result.py
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import Float, String, Integer, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import Base


class DetectionResult(Base):
    __tablename__ = "detection_results"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    job_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    modality: Mapped[str] = mapped_column(
        Enum("text", "image", "audio", "video", "multimodal",
             name="modality_type"), nullable=False
    )
    ai_probability: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    verdict: Mapped[str] = mapped_column(
        Enum("AI_GENERATED", "LIKELY_AI", "INCONCLUSIVE", "LIKELY_HUMAN", "HUMAN_GENERATED",
             name="verdict_type"), nullable=False
    )
    model_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True))
    model_name: Mapped[str | None] = mapped_column(String(255))
    model_version: Mapped[str | None] = mapped_column(String(64))
    model_ensemble: Mapped[dict | None] = mapped_column(JSONB)
    raw_logits: Mapped[dict | None] = mapped_column(JSONB)
    raw_probabilities: Mapped[dict | None] = mapped_column(JSONB)
    preprocessing_params: Mapped[dict | None] = mapped_column(JSONB)
    processing_time_ms: Mapped[int | None] = mapped_column(Integer)
    device_used: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )

    # Relationships
    job: Mapped["Job"] = relationship("Job", back_populates="detection_results")
    explanations: Mapped[list["Explanation"]] = relationship(
        "Explanation", back_populates="result", cascade="all, delete-orphan"
    )
```

```python
# shared/db/models/explanation.py
from __future__ import annotations
import uuid
from datetime import datetime
from sqlalchemy import String, Text, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import Base


class Explanation(Base):
    __tablename__ = "explanations"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    result_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    method: Mapped[str] = mapped_column(
        Enum("SHAP", "GRADCAM", "LIME", "SPECTROGRAM", "FRAME_VISUALIZATION", "NARRATIVE",
             name="explanation_method"), nullable=False
    )
    artifact_type: Mapped[str] = mapped_column(
        Enum("json_data", "image_png", "image_svg", "html_fragment", "text_narrative",
             name="artifact_type"), nullable=False
    )
    artifact_object_key: Mapped[str | None] = mapped_column(String(1024))
    artifact_signed_url: Mapped[str | None] = mapped_column(Text)
    artifact_url_expires: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    artifact_data: Mapped[dict | None] = mapped_column(JSONB)
    narrative_text: Mapped[str | None] = mapped_column(Text)
    token_attributions: Mapped[list | None] = mapped_column(JSONB)
    top_indicators: Mapped[list | None] = mapped_column(JSONB)
    region_highlights: Mapped[list | None] = mapped_column(JSONB)
    frame_scores: Mapped[list | None] = mapped_column(JSONB)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=datetime.utcnow
    )

    result: Mapped["DetectionResult"] = relationship(
        "DetectionResult", back_populates="explanations"
    )
```

---

### 8.6 Pydantic DTOs (Request & Response Schemas)

```python
# shared/schemas/job_schemas.py
from __future__ import annotations
import uuid
from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field, ConfigDict


# ─── Request DTOs ───────────────────────────────────────────

class TextDetectRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=50,
        max_length=10_000,
        description="Plain text to analyse for AI generation",
        examples=["The field of machine learning has seen remarkable growth..."]
    )
    explain: bool = Field(
        default=True,
        description="Whether to compute SHAP token attributions"
    )
    language: str = Field(default="en", pattern="^[a-z]{2}$")


class MultiModalDetectRequest(BaseModel):
    """For multimodal jobs, text is submitted in body; files via separate multipart fields."""
    text: Optional[str] = Field(None, max_length=10_000)
    modalities: list[Literal["text", "image", "audio", "video"]] = Field(
        ..., min_length=1, max_length=4
    )
    explain: bool = True


# ─── Response DTOs ──────────────────────────────────────────

class JobCreatedResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    job_id: uuid.UUID
    status: Literal["queued"]
    modality: str
    estimated_completion_seconds: int
    poll_url: str


class TokenAttribution(BaseModel):
    token: str
    attribution: float = Field(ge=-1.0, le=1.0)
    position: int = Field(ge=0)


class TextExplanation(BaseModel):
    method: Literal["SHAP"]
    token_attributions: list[TokenAttribution]
    top_ai_indicator_tokens: list[str]
    html_heatmap: Optional[str] = None
    truncated: bool = False


class RegionHighlight(BaseModel):
    region: str
    intensity: float = Field(ge=0.0, le=1.0)
    bounding_box: Optional[list[int]] = None  # [x, y, w, h]


class ImageExplanation(BaseModel):
    method: Literal["GRADCAM"]
    heatmap_url: Optional[str] = None
    highlighted_regions: list[RegionHighlight]
    artifact_type: str


class AudioExplanation(BaseModel):
    method: Literal["SPECTROGRAM"]
    spectrogram_url: Optional[str] = None
    observations: str


class DetectionResultSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    modality: str
    ai_probability: float = Field(ge=0.0, le=1.0)
    confidence_score: float = Field(ge=0.0, le=1.0)
    verdict: str
    model_name: str
    model_version: str
    model_ensemble: Optional[list[dict]] = None
    processing_time_ms: Optional[int] = None
    explanation: Optional[TextExplanation | ImageExplanation | AudioExplanation] = None


class FusionResultSchema(BaseModel):
    final_score: float = Field(ge=0.0, le=1.0)
    final_confidence: float = Field(ge=0.0, le=1.0)
    final_verdict: str
    modalities_used: list[str]
    weights_applied: dict[str, float]
    component_scores: dict[str, float]


class JobResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    job_id: uuid.UUID
    status: str
    modality: str
    created_at: datetime
    completed_at: Optional[datetime] = None
    processing_time_ms: Optional[int] = None

    # Present when status == "completed"
    results: Optional[list[DetectionResultSchema]] = None
    fusion: Optional[FusionResultSchema] = None
    report_url: Optional[str] = None

    # Present when status == "failed"
    error_code: Optional[str] = None
    error_message: Optional[str] = None


class JobListResponse(BaseModel):
    jobs: list[JobResultResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
```

```python
# shared/schemas/auth_schemas.py
from __future__ import annotations
import uuid
from pydantic import BaseModel, EmailStr, Field, model_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    name: str = Field(min_length=2, max_length=100)
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: Literal["bearer"] = "bearer"
    expires_in: int  # seconds


class RefreshRequest(BaseModel):
    refresh_token: str


class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    name: str
    role: str
    quota_daily_limit: int
    quota_used_today: int
    created_at: datetime
```

---

### 8.7 RabbitMQ Message Contracts

All messages are JSON-serialized and published with `content_type: application/json`. Each queue uses `durable=True` and `delivery_mode=2` (persistent).

#### 8.7.1 Queue Definitions

```
Queue Name               │ Routing Key              │ DLX (Dead Letter)
─────────────────────────┼──────────────────────────┼────────────────────
forensics.text.detect    │ detect.text              │ forensics.dlx
forensics.image.detect   │ detect.image             │ forensics.dlx
forensics.audio.detect   │ detect.audio             │ forensics.dlx
forensics.video.detect   │ detect.video             │ forensics.dlx
forensics.report.generate│ report.generate          │ forensics.dlx
forensics.dlx            │ # (all dead letters)     │ —
```

#### 8.7.2 Detection Job Message Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "DetectionJobMessage",
  "description": "Message published to detection queues by the API Gateway",
  "type": "object",
  "required": ["job_id", "user_id", "modality", "input_type", "created_at", "correlation_id"],
  "properties": {
    "correlation_id": {
      "type": "string",
      "format": "uuid",
      "description": "Unique message ID for idempotency and tracing"
    },
    "job_id": {
      "type": "string",
      "format": "uuid"
    },
    "user_id": {
      "type": "string",
      "format": "uuid"
    },
    "modality": {
      "type": "string",
      "enum": ["text", "image", "audio", "video"]
    },
    "input_type": {
      "type": "string",
      "enum": ["text", "file"]
    },
    "input_text": {
      "type": ["string", "null"],
      "description": "Present only when input_type == 'text'"
    },
    "input_object_key": {
      "type": ["string", "null"],
      "description": "MinIO object key — present when input_type == 'file'"
    },
    "file_mime_type": {
      "type": ["string", "null"]
    },
    "priority": {
      "type": "integer",
      "minimum": 1,
      "maximum": 10,
      "default": 5
    },
    "options": {
      "type": "object",
      "properties": {
        "explain": { "type": "boolean", "default": true },
        "language": { "type": "string", "default": "en" }
      }
    },
    "created_at": {
      "type": "string",
      "format": "date-time"
    }
  }
}
```

#### 8.7.3 Python Message Producer (API Gateway)

```python
# services/api-gateway/app/services/queue_service.py
import json
import uuid
from datetime import datetime, timezone
from typing import Any

import aio_pika
from aio_pika import Message, DeliveryMode

from app.core.config import settings


class QueueService:
    QUEUE_MAP = {
        "text":  "forensics.text.detect",
        "image": "forensics.image.detect",
        "audio": "forensics.audio.detect",
        "video": "forensics.video.detect",
    }

    def __init__(self, connection: aio_pika.RobustConnection):
        self._connection = connection
        self._channel: aio_pika.Channel | None = None

    async def _get_channel(self) -> aio_pika.Channel:
        if self._channel is None or self._channel.is_closed:
            self._channel = await self._connection.channel()
            await self._channel.set_qos(prefetch_count=10)
        return self._channel

    async def publish_detection_job(
        self,
        job_id: str,
        user_id: str,
        modality: str,
        input_type: str,
        input_text: str | None = None,
        input_object_key: str | None = None,
        file_mime_type: str | None = None,
        priority: int = 5,
        options: dict[str, Any] | None = None,
    ) -> None:
        channel = await self._get_channel()
        queue_name = self.QUEUE_MAP[modality]

        payload = {
            "correlation_id": str(uuid.uuid4()),
            "job_id": job_id,
            "user_id": user_id,
            "modality": modality,
            "input_type": input_type,
            "input_text": input_text,
            "input_object_key": input_object_key,
            "file_mime_type": file_mime_type,
            "priority": priority,
            "options": options or {"explain": True},
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        message = Message(
            body=json.dumps(payload).encode(),
            content_type="application/json",
            delivery_mode=DeliveryMode.PERSISTENT,
            message_id=payload["correlation_id"],
            headers={"x-priority": priority},
        )

        await channel.default_exchange.publish(
            message, routing_key=queue_name
        )
```

#### 8.7.4 Python Message Consumer (Detection Service)

```python
# services/text-service/app/services/queue_consumer.py
import asyncio
import json
import logging
from typing import Callable, Awaitable

import aio_pika
from aio_pika import IncomingMessage

logger = logging.getLogger(__name__)


class QueueConsumer:
    def __init__(
        self,
        connection: aio_pika.RobustConnection,
        queue_name: str,
        handler: Callable[[dict], Awaitable[None]],
    ):
        self._connection = connection
        self._queue_name = queue_name
        self._handler = handler

    async def start(self) -> None:
        channel = await self._connection.channel()
        await channel.set_qos(prefetch_count=1)  # Process one job at a time

        queue = await channel.declare_queue(
            self._queue_name,
            durable=True,
            arguments={
                "x-dead-letter-exchange": "forensics.dlx",
                "x-dead-letter-routing-key": "dlx.failed",
            }
        )

        logger.info(f"Consuming from {self._queue_name}")
        async with queue.iterator() as queue_iter:
            async for message in queue_iter:
                await self._process_message(message)

    async def _process_message(self, message: IncomingMessage) -> None:
        async with message.process(requeue=False):
            try:
                payload = json.loads(message.body.decode())
                logger.info(f"Processing job {payload['job_id']}")
                await self._handler(payload)
            except Exception as exc:
                logger.error(f"Handler failed for message {message.message_id}: {exc}")
                # Message is nacked → sent to DLX after max_retries
                raise
```

---

### 8.8 OpenAPI 3.0 Specification (Key Endpoints)

```yaml
# services/api-gateway/openapi.yaml
openapi: "3.0.3"

info:
  title: "Multi-Modal AI Content Forensics Platform API"
  version: "1.0.0"
  description: |
    REST API for detecting AI-generated content across Text, Image, Audio, and Video modalities.
    All detection endpoints are asynchronous — submit a job and poll for results.
  contact:
    name: "Forensics Platform Team"
    email: "dev@forensics-platform.local"

servers:
  - url: "http://localhost:8000"
    description: "Local development"
  - url: "https://forensics.example.com"
    description: "Production"

security:
  - BearerAuth: []

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    JobCreatedResponse:
      type: object
      required: [job_id, status, modality, poll_url]
      properties:
        job_id:
          type: string
          format: uuid
          example: "550e8400-e29b-41d4-a716-446655440000"
        status:
          type: string
          enum: [queued]
        modality:
          type: string
          enum: [text, image, audio, video, multimodal]
        estimated_completion_seconds:
          type: integer
          example: 10
        poll_url:
          type: string
          example: "/api/v1/jobs/550e8400-e29b-41d4-a716-446655440000"

    JobResultResponse:
      type: object
      required: [job_id, status, modality, created_at]
      properties:
        job_id:
          type: string
          format: uuid
        status:
          type: string
          enum: [queued, processing, completed, failed, cancelled]
        modality:
          type: string
        created_at:
          type: string
          format: date-time
        completed_at:
          type: string
          format: date-time
          nullable: true
        results:
          type: array
          nullable: true
          items:
            $ref: "#/components/schemas/DetectionResult"
        fusion:
          $ref: "#/components/schemas/FusionResult"
          nullable: true
        report_url:
          type: string
          nullable: true
        error_code:
          type: string
          nullable: true
        error_message:
          type: string
          nullable: true

    DetectionResult:
      type: object
      properties:
        modality:
          type: string
        ai_probability:
          type: number
          format: float
          minimum: 0.0
          maximum: 1.0
        confidence_score:
          type: number
          format: float
          minimum: 0.0
          maximum: 1.0
        verdict:
          type: string
          enum: [AI_GENERATED, LIKELY_AI, INCONCLUSIVE, LIKELY_HUMAN, HUMAN_GENERATED]
        model_name:
          type: string
        explanation:
          oneOf:
            - $ref: "#/components/schemas/TextExplanation"
            - $ref: "#/components/schemas/ImageExplanation"
            - $ref: "#/components/schemas/AudioExplanation"
          nullable: true

    FusionResult:
      type: object
      properties:
        final_score:
          type: number
          format: float
        final_confidence:
          type: number
          format: float
        final_verdict:
          type: string
        modalities_used:
          type: array
          items:
            type: string
        weights_applied:
          type: object
          additionalProperties:
            type: number
        component_scores:
          type: object
          additionalProperties:
            type: number

    TextExplanation:
      type: object
      properties:
        method:
          type: string
          enum: [SHAP]
        token_attributions:
          type: array
          items:
            type: object
            properties:
              token: { type: string }
              attribution: { type: number }
              position: { type: integer }
        top_ai_indicator_tokens:
          type: array
          items:
            type: string
        html_heatmap:
          type: string
          nullable: true

    ImageExplanation:
      type: object
      properties:
        method:
          type: string
          enum: [GRADCAM]
        heatmap_url:
          type: string
          nullable: true
        highlighted_regions:
          type: array
          items:
            type: object
            properties:
              region: { type: string }
              intensity: { type: number }

    AudioExplanation:
      type: object
      properties:
        method:
          type: string
          enum: [SPECTROGRAM]
        spectrogram_url:
          type: string
          nullable: true
        observations:
          type: string

    ErrorResponse:
      type: object
      required: [error, detail]
      properties:
        error:
          type: string
          example: "INVALID_MIME_TYPE"
        detail:
          type: string
        allowed_types:
          type: array
          items:
            type: string

paths:
  /api/v1/detect/text:
    post:
      tags: [Detection]
      summary: "Submit text for AI detection"
      operationId: detectText
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required: [text]
              properties:
                text:
                  type: string
                  minLength: 50
                  maxLength: 10000
                explain:
                  type: boolean
                  default: true
      responses:
        "200":
          description: "Detection completed synchronously"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobResultResponse"
        "400":
          description: "Validation error"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/ErrorResponse"
        "401":
          description: "Unauthorized"
        "429":
          description: "Rate limit exceeded"
          headers:
            X-RateLimit-Reset:
              schema:
                type: integer

  /api/v1/detect/image:
    post:
      tags: [Detection]
      summary: "Submit image for AI detection (async)"
      operationId: detectImage
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              required: [file]
              properties:
                file:
                  type: string
                  format: binary
                  description: "JPEG/PNG/WebP, max 10MB"
      responses:
        "202":
          description: "Job queued"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobCreatedResponse"
        "400":
          $ref: "#/components/responses/BadRequest"
        "413":
          description: "File too large"

  /api/v1/jobs/{job_id}:
    get:
      tags: [Jobs]
      summary: "Get job status and result"
      operationId: getJob
      security:
        - BearerAuth: []
      parameters:
        - name: job_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: "Job found"
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JobResultResponse"
        "404":
          description: "Job not found"

  /api/v1/reports/{job_id}/pdf:
    get:
      tags: [Reports]
      summary: "Download PDF forensics report"
      operationId: downloadPdfReport
      security:
        - BearerAuth: []
      parameters:
        - name: job_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        "200":
          description: "PDF report"
          content:
            application/pdf:
              schema:
                type: string
                format: binary
        "202":
          description: "Report still generating"
        "404":
          description: "Job not found"

  components:
    responses:
      BadRequest:
        description: "Bad request"
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/ErrorResponse"
```

---

### 8.9 Service Interfaces (Python ABCs & Protocols)

```python
# shared/interfaces/detector.py
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Any, Optional


@dataclass
class DetectionOutput:
    """Standardised output for all detection services."""
    ai_probability: float           # 0.0 → 1.0 (1.0 = certainly AI)
    confidence_score: float         # 0.0 → 1.0 (certainty of prediction)
    verdict: str                    # AI_GENERATED | LIKELY_AI | INCONCLUSIVE | etc.
    model_name: str
    model_version: str
    processing_time_ms: int
    device_used: str                # cpu | cuda | mps
    raw_logits: Optional[dict] = None
    model_ensemble: Optional[list[dict]] = None


@dataclass
class ExplanationOutput:
    """Standardised output for explanation modules."""
    method: str                     # SHAP | GRADCAM | SPECTROGRAM
    artifact_type: str              # json_data | image_png | html_fragment
    artifact_data: Optional[dict] = None
    artifact_object_key: Optional[str] = None
    narrative_text: Optional[str] = None
    token_attributions: Optional[list[dict]] = None
    region_highlights: Optional[list[dict]] = None


class BaseDetector(ABC):
    """Abstract base class all detection services must implement."""

    @abstractmethod
    async def load_model(self) -> None:
        """Load model weights into memory. Called once at startup."""
        ...

    @abstractmethod
    async def preprocess(self, input_data: Any) -> Any:
        """Transform raw input into model-ready tensor/array."""
        ...

    @abstractmethod
    async def predict(self, preprocessed: Any) -> DetectionOutput:
        """Run inference. Must be thread-safe."""
        ...

    @abstractmethod
    async def explain(self, input_data: Any, prediction: DetectionOutput) -> ExplanationOutput:
        """Generate human-interpretable explanation for the prediction."""
        ...

    async def detect(self, input_data: Any, explain: bool = True) -> tuple[DetectionOutput, Optional[ExplanationOutput]]:
        """Full pipeline: preprocess → predict → (optionally) explain."""
        preprocessed = await self.preprocess(input_data)
        prediction = await self.predict(preprocessed)
        explanation = await self.explain(input_data, prediction) if explain else None
        return prediction, explanation


class BaseExplainer(ABC):
    @abstractmethod
    async def generate(self, input_data: Any, model: Any, prediction: DetectionOutput) -> ExplanationOutput:
        ...


class StorageServiceProtocol(ABC):
    @abstractmethod
    async def put_object(self, bucket: str, key: str, data: bytes, content_type: str) -> str:
        """Upload bytes to object storage. Returns the object key."""
        ...

    @abstractmethod
    async def get_object(self, bucket: str, key: str) -> bytes:
        """Download object bytes from storage."""
        ...

    @abstractmethod
    async def presign_get_url(self, bucket: str, key: str, expires_seconds: int) -> str:
        """Generate a time-limited presigned GET URL."""
        ...

    @abstractmethod
    async def delete_object(self, bucket: str, key: str) -> None:
        ...
```

```python
# services/text-service/app/services/text_detector.py
import time
import torch
from transformers import DebertaV2ForSequenceClassification, DebertaV2Tokenizer

from shared.interfaces.detector import BaseDetector, DetectionOutput, ExplanationOutput
from app.services.shap_explainer import SHAPTextExplainer
from app.core.config import settings


def _score_to_verdict(score: float) -> str:
    if score >= 0.80:   return "AI_GENERATED"
    if score >= 0.60:   return "LIKELY_AI"
    if score >= 0.40:   return "INCONCLUSIVE"
    if score >= 0.20:   return "LIKELY_HUMAN"
    return "HUMAN_GENERATED"


class TextDetector(BaseDetector):
    _model: DebertaV2ForSequenceClassification
    _tokenizer: DebertaV2Tokenizer
    _explainer: SHAPTextExplainer
    _device: torch.device

    async def load_model(self) -> None:
        self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._tokenizer = DebertaV2Tokenizer.from_pretrained(settings.MODEL_PATH)
        self._model = DebertaV2ForSequenceClassification.from_pretrained(
            settings.MODEL_PATH, num_labels=2
        )
        self._model.eval()
        self._model.to(self._device)
        self._explainer = SHAPTextExplainer(self._model, self._tokenizer, self._device)

    async def preprocess(self, input_data: str) -> dict:
        """Tokenize and encode text. Truncate at sentence boundary if needed."""
        return self._tokenizer(
            input_data,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding=True,
        )

    async def predict(self, preprocessed: dict) -> DetectionOutput:
        t0 = time.perf_counter()
        inputs = {k: v.to(self._device) for k, v in preprocessed.items()}

        with torch.no_grad():
            outputs = self._model(**inputs)

        logits = outputs.logits[0]
        probs = torch.softmax(logits, dim=-1)
        ai_prob = probs[1].item()  # Index 1 = AI class
        processing_ms = int((time.perf_counter() - t0) * 1000)

        return DetectionOutput(
            ai_probability=ai_prob,
            confidence_score=float(probs.max().item()),
            verdict=_score_to_verdict(ai_prob),
            model_name="DeBERTa-v3-RAID",
            model_version=settings.MODEL_VERSION,
            processing_time_ms=processing_ms,
            device_used=str(self._device),
            raw_logits={"human": logits[0].item(), "ai": logits[1].item()},
        )

    async def explain(self, input_data: str, prediction: DetectionOutput) -> ExplanationOutput:
        return await self._explainer.generate(input_data, self._model, prediction)
```

---

### 8.10 Authentication Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│               AUTHENTICATION DATA FLOW — Step by Step                           │
└─────────────────────────────────────────────────────────────────────────────────┘

─── REGISTRATION ────────────────────────────────────────────────────────────────

Client                      API Gateway                Auth Service            DB
  │                              │                          │                   │
  │─POST /auth/register──────────►                          │                   │
  │  {email, name, password}     │─forward─────────────────►                   │
  │                              │                          │─SELECT users─────►│
  │                              │                          │◄─no rows──────────│
  │                              │                          │─bcrypt.hash()     │
  │                              │                          │─INSERT user──────►│
  │                              │                          │◄─{user_id}────────│
  │◄─201 {user_id, email}────────│◄─{user}──────────────────│                   │

─── LOGIN ───────────────────────────────────────────────────────────────────────

Client                      API Gateway                Auth Service        Redis / DB
  │                              │                          │                    │
  │─POST /auth/login─────────────►                          │                    │
  │  {email, password}           │─forward─────────────────►                    │
  │                              │                          │─SELECT user by email►
  │                              │                          │◄─{user_row}──────────
  │                              │                          │─bcrypt.verify()    │
  │                              │                          │                    │
  │                              │                          │─generate_access_token()
  │                              │                          │  payload: {sub:user_id,
  │                              │                          │   exp: now+15min, jti}
  │                              │                          │─HS256_sign(secret_key)
  │                              │                          │                    │
  │                              │                          │─generate_refresh_token()
  │                              │                          │  64-byte random bytes
  │                              │                          │─SETEX refresh:{hash}────►
  │                              │                          │   value=user_id TTL=7d  │
  │◄─200 {access_token,          │◄─{tokens}────────────────│                    │
  │       refresh_token}         │                          │                    │

─── AUTHENTICATED REQUEST ───────────────────────────────────────────────────────

Client                      API Gateway (Middleware)         Redis
  │                              │                              │
  │─POST /detect/image───────────►                              │
  │  Authorization: Bearer <JWT> │                              │
  │                              │─extract Bearer token         │
  │                              │─jwt.decode(token, secret)    │
  │                              │  ✓ signature valid           │
  │                              │  ✓ exp not expired           │
  │                              │─GET jti_blacklist:{jti}─────►│
  │                              │◄─nil (not blacklisted)────────│
  │                              │─inject user_id into request context
  │                              │─proceed to route handler     │
  │◄─202 {job_id}────────────────│                              │

─── TOKEN REFRESH ───────────────────────────────────────────────────────────────

Client                      API Gateway               Auth Service        Redis
  │                              │                         │                │
  │─POST /auth/refresh───────────►                         │                │
  │  {refresh_token: "abc123"}   │─forward────────────────►                │
  │                              │                         │─hash(refresh_token)
  │                              │                         │─GET refresh:{hash}──►
  │                              │                         │◄─{user_id}──────────│
  │                              │                         │─DEL refresh:{hash}──►│ ← rotate
  │                              │                         │─new refresh token    │
  │                              │                         │─SETEX refresh:{new}─►│
  │                              │                         │─new access token     │
  │◄─200 {new_access, new_refresh│◄─{tokens}───────────────│                │

─── LOGOUT ──────────────────────────────────────────────────────────────────────

Client                      API Gateway               Auth Service        Redis
  │                              │                         │                │
  │─POST /auth/logout────────────►                         │                │
  │  Authorization: Bearer <JWT> │                         │                │
  │  {refresh_token: "abc123"}   │─forward────────────────►                │
  │                              │                         │─extract jti from JWT
  │                              │                         │─SETEX jti_blacklist:{jti}─►
  │                              │                         │   value=1 TTL=15min (access expiry)
  │                              │                         │─DEL refresh:{hash}──────────────►
  │◄─204 No Content──────────────│◄─ok─────────────────────│                │
```

```python
# services/auth-service/app/core/security.py
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: str, email: str, role: str) -> tuple[str, str]:
    """Returns (encoded_jwt, jti)."""
    jti = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        "jti": jti,
    }
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token, jti


def create_refresh_token() -> tuple[str, str]:
    """Returns (raw_token, hashed_token). Store hash in Redis, send raw to client."""
    raw = secrets.token_urlsafe(64)
    hashed = hashlib.sha256(raw.encode()).hexdigest()
    return raw, hashed


def decode_access_token(token: str) -> dict:
    """Raises JWTError if invalid or expired."""
    return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
```

---

### 8.11 Fusion Engine — Implementation Design

The Fusion Engine is the component that aggregates per-modality detection scores into a single platform-level verdict. It runs within the API Gateway after all detection results for a multimodal job are complete.

#### 8.11.1 Algorithm

```
INPUT:  component_scores = {"text": 0.91, "image": 0.84}
        weights          = {"text": 0.60, "image": 0.40}   ← calibrated on val set

STEP 1: Weighted Sum
        P_fusion = Σ(wᵢ × pᵢ) for each modality i
        P_fusion = (0.60 × 0.91) + (0.40 × 0.84)
        P_fusion = 0.546 + 0.336 = 0.882

STEP 2: Confidence Calculation
        Confidence reflects inter-modal agreement.
        score_std    = std([0.91, 0.84]) = 0.035
        raw_conf     = 1.0 - (2 × score_std)       ← std=0 → conf=1.0; std=0.5 → conf=0.0
        raw_conf     = 1.0 - 0.07 = 0.93
        # Also consider distance from 0.5 (decision boundary)
        boundary_conf = abs(P_fusion - 0.5) × 2    ← 0.0 at boundary; 1.0 at extremes
        boundary_conf = abs(0.882 - 0.5) × 2 = 0.764
        # Final confidence = geometric mean of agreement and boundary separation
        final_conf   = sqrt(raw_conf × boundary_conf) = sqrt(0.93 × 0.764) = 0.843

STEP 3: Verdict Mapping
        P_fusion = 0.882 → "AI_GENERATED" (threshold ≥ 0.80)

OUTPUT: {final_score: 0.882, final_confidence: 0.843, final_verdict: "AI_GENERATED"}
```

#### 8.11.2 Default Weight Configuration

```python
# Weights are calibrated on a held-out validation set.
# Update these after running calibration (Section 4.4 evaluation plan).
DEFAULT_WEIGHTS = {
    "text":  0.60,   # Text is most reliable; lowest FPR on RAID
    "image": 0.40,   # Image ensemble is strong but varies by generator
    "audio": 0.35,   # AASIST generalizes less well in-the-wild
    "video": 0.25,   # Frame-level aggregation is noisiest
}
# Weights are normalized to sum to 1.0 over present modalities.
```

#### 8.11.3 Implementation

```python
# services/api-gateway/app/services/fusion_engine.py
import math
import statistics
from dataclasses import dataclass
from typing import Optional


VERDICT_THRESHOLDS = [
    (0.80, "AI_GENERATED"),
    (0.60, "LIKELY_AI"),
    (0.40, "INCONCLUSIVE"),
    (0.20, "LIKELY_HUMAN"),
    (0.00, "HUMAN_GENERATED"),
]

DEFAULT_WEIGHTS = {
    "text":  0.60,
    "image": 0.40,
    "audio": 0.35,
    "video": 0.25,
}


@dataclass
class FusionResult:
    final_score: float
    final_confidence: float
    final_verdict: str
    modalities_used: list[str]
    weights_applied: dict[str, float]
    component_scores: dict[str, float]
    fusion_method: str = "weighted_linear"
    fusion_version: str = "v1.0"


class FusionEngine:
    def __init__(self, weight_overrides: Optional[dict[str, float]] = None):
        self._base_weights = {**DEFAULT_WEIGHTS, **(weight_overrides or {})}

    def fuse(self, component_scores: dict[str, float]) -> FusionResult:
        """
        Combine per-modality scores into a single platform verdict.

        Args:
            component_scores: {"text": 0.91, "image": 0.84}

        Returns:
            FusionResult with final score, confidence, and verdict.
        """
        if not component_scores:
            raise ValueError("At least one modality score required for fusion")

        # Normalize weights to sum to 1.0 over present modalities only
        present = {m: self._base_weights.get(m, 0.5) for m in component_scores}
        total_weight = sum(present.values())
        normalized = {m: w / total_weight for m, w in present.items()}

        # Weighted linear combination
        final_score = sum(normalized[m] * component_scores[m] for m in component_scores)
        final_score = max(0.0, min(1.0, final_score))

        # Confidence: agreement × boundary separation
        scores_list = list(component_scores.values())
        if len(scores_list) > 1:
            score_std = statistics.stdev(scores_list)
            agreement_conf = max(0.0, 1.0 - (2.0 * score_std))
        else:
            agreement_conf = 1.0  # Single modality: fully "agrees with itself"

        boundary_conf = abs(final_score - 0.5) * 2.0
        final_confidence = math.sqrt(agreement_conf * boundary_conf)
        final_confidence = max(0.0, min(1.0, final_confidence))

        # Verdict mapping
        verdict = "HUMAN_GENERATED"
        for threshold, label in VERDICT_THRESHOLDS:
            if final_score >= threshold:
                verdict = label
                break

        return FusionResult(
            final_score=round(final_score, 4),
            final_confidence=round(final_confidence, 4),
            final_verdict=verdict,
            modalities_used=list(component_scores.keys()),
            weights_applied=normalized,
            component_scores=component_scores,
        )
```

#### 8.11.4 Weight Calibration Script (One-Time)

```python
# scripts/calibrate_fusion_weights.py
"""
Run this once after all detection services are trained.
Requires a held-out multimodal validation set.

Usage:
    python scripts/calibrate_fusion_weights.py \
        --val-file data/multimodal_val.jsonl \
        --output config/fusion_weights.json
"""
import json
import argparse
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score


def calibrate(val_file: str, output: str) -> None:
    # Load validation data
    # Each line: {"text_score": 0.91, "image_score": 0.84, "label": 1}
    with open(val_file) as f:
        records = [json.loads(line) for line in f]

    modalities = ["text", "image", "audio"]
    X, y = [], []
    for r in records:
        row = [r.get(f"{m}_score", np.nan) for m in modalities]
        if not any(np.isnan(row)):
            X.append(row)
            y.append(r["label"])  # 1 = AI, 0 = Human

    X = np.array(X)
    y = np.array(y)

    # Logistic Regression with no intercept → weights are interpretable as fusion coefficients
    lr = LogisticRegression(fit_intercept=False, C=1.0, max_iter=1000)
    lr.fit(X, y)

    # Normalize coefficients to sum to 1
    raw_weights = lr.coef_[0]
    raw_weights = np.clip(raw_weights, 0, None)  # Non-negative only
    normalized = raw_weights / raw_weights.sum()

    weights = {m: round(float(w), 4) for m, w in zip(modalities, normalized)}
    print(f"Calibrated weights: {weights}")

    # Evaluate
    scores = lr.predict_proba(X)[:, 1]
    auc = roc_auc_score(y, scores)
    print(f"Validation AUROC after calibration: {auc:.4f}")

    with open(output, "w") as f:
        json.dump({"weights": weights, "val_auc": auc}, f, indent=2)
    print(f"Saved to {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--val-file", required=True)
    parser.add_argument("--output", default="config/fusion_weights.json")
    args = parser.parse_args()
    calibrate(args.val_file, args.output)
```

---

### 8.12 Report Generation — Implementation Design

#### 8.12.1 Report Generation Pipeline

```
JOB COMPLETED
     │
     ▼
POST /internal/report/generate/{job_id}
     │
     ├─► Fetch job from PostgreSQL
     ├─► Fetch all detection_results (with explanations)
     ├─► Fetch fusion_result
     ├─► For each explanation with artifact_object_key:
     │       getObject(MinIO) → base64-encode → embed inline
     │
     ├─► Render Jinja2 HTML template
     │     ├── report_template.html
     │     ├── page1_executive_summary.html
     │     ├── page2_modality_results.html
     │     ├── page3_text_explanation.html
     │     ├── page4_image_explanation.html
     │     └── page5_technical_appendix.html
     │
     ├─► WeasyPrint HTML → PDF bytes
     │
     ├─► Calculate SHA-256 of PDF bytes
     ├─► Upload PDF to MinIO (reports/{job_id}.pdf)
     ├─► Generate presigned URL (valid 24h)
     ├─► UPDATE reports table (status=completed, minio_key, signed_url)
     │
     └─► Return {report_url, signed_url}
```

#### 8.12.2 Report Service Implementation

```python
# services/report-service/app/services/report_generator.py
import base64
import hashlib
import io
from datetime import datetime, timedelta, timezone
from pathlib import Path

from jinja2 import Environment, FileSystemLoader, select_autoescape
from weasyprint import HTML, CSS

from shared.db.repositories.job_repository import JobRepository
from app.services.storage_service import StorageService
from app.core.config import settings


TEMPLATE_DIR = Path(__file__).parent.parent / "templates"
jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=select_autoescape(["html", "xml"]),
)


def _verdict_color(verdict: str) -> str:
    return {
        "AI_GENERATED":   "#e53e3e",
        "LIKELY_AI":      "#dd6b20",
        "INCONCLUSIVE":   "#d69e2e",
        "LIKELY_HUMAN":   "#38a169",
        "HUMAN_GENERATED":"#2f855a",
    }.get(verdict, "#718096")


def _probability_bar(score: float) -> str:
    """Returns an HTML inline progress bar."""
    pct = int(score * 100)
    color = "#e53e3e" if score >= 0.6 else "#38a169" if score < 0.4 else "#d69e2e"
    return (
        f'<div style="background:#eee;border-radius:4px;height:12px;width:200px">'
        f'<div style="width:{pct}%;background:{color};height:12px;border-radius:4px"></div>'
        f'</div>'
    )


class ReportGenerator:
    def __init__(self, job_repo: JobRepository, storage: StorageService):
        self._job_repo = job_repo
        self._storage = storage

    async def generate_pdf(self, job_id: str) -> bytes:
        # 1. Fetch all data
        job = await self._job_repo.get_job_with_results(job_id)
        if not job:
            raise ValueError(f"Job {job_id} not found")

        # 2. Fetch and embed explanation images
        embedded_images: dict[str, str] = {}
        for result in job.detection_results:
            for explanation in result.explanations:
                if explanation.artifact_object_key:
                    img_bytes = await self._storage.get_object(
                        settings.MINIO_BUCKET, explanation.artifact_object_key
                    )
                    b64 = base64.b64encode(img_bytes).decode()
                    mime = "image/png" if explanation.artifact_type == "image_png" else "image/svg+xml"
                    embedded_images[explanation.artifact_object_key] = f"data:{mime};base64,{b64}"

        # 3. Render template
        template = jinja_env.get_template("report_full.html")
        html_content = template.render(
            job=job,
            generated_at=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            embedded_images=embedded_images,
            verdict_color=_verdict_color,
            probability_bar=_probability_bar,
            platform_name="AI Content Forensics Platform",
            platform_version="v1.0",
        )

        # 4. Convert HTML → PDF
        base_url = str(TEMPLATE_DIR)
        pdf_bytes = HTML(string=html_content, base_url=base_url).write_pdf(
            stylesheets=[CSS(filename=str(TEMPLATE_DIR / "report.css"))]
        )
        return pdf_bytes

    async def save_and_register(self, job_id: str, pdf_bytes: bytes) -> str:
        # 5. Calculate checksum
        sha256 = hashlib.sha256(pdf_bytes).hexdigest()

        # 6. Upload to MinIO
        object_key = f"reports/{job_id}.pdf"
        await self._storage.put_object(
            bucket=settings.MINIO_BUCKET,
            key=object_key,
            data=pdf_bytes,
            content_type="application/pdf",
        )

        # 7. Generate presigned URL (24h)
        signed_url = await self._storage.presign_get_url(
            bucket=settings.MINIO_BUCKET,
            key=object_key,
            expires_seconds=86400,
        )

        # 8. Update report record
        await self._job_repo.update_report(
            job_id=job_id,
            report_type="pdf",
            status="completed",
            minio_key=object_key,
            file_size=len(pdf_bytes),
            sha256=sha256,
            signed_url=signed_url,
            signed_url_expires=datetime.now(timezone.utc) + timedelta(hours=24),
        )

        return signed_url
```

#### 8.12.3 Jinja2 Report Template Structure

```
services/report-service/app/templates/
├── report_full.html              ← Master template (extends base.html)
├── base.html                     ← Page layout, header/footer macros
├── report.css                    ← Print-optimized CSS (page breaks, fonts)
│
├── partials/
│   ├── executive_summary.html    ← Page 1: Verdict badge, overall score, risk level
│   ├── modality_results.html     ← Page 2: Per-modality score table + progress bars
│   ├── text_explanation.html     ← Page 3: Token heatmap + top indicators table
│   ├── image_explanation.html    ← Page 4: Side-by-side original + GradCAM
│   ├── audio_explanation.html    ← Page 4b: Mel-spectrogram + observations
│   └── technical_appendix.html  ← Page 5: Model versions, checksums, disclaimer
```

#### 8.12.4 HTML Template Snippet (Executive Summary)

```html
{# templates/partials/executive_summary.html #}
<div class="page executive-summary">
  <div class="report-header">
    <h1>AI Content Forensics Report</h1>
    <div class="meta-grid">
      <div><strong>Report ID:</strong> {{ job.id }}</div>
      <div><strong>Generated:</strong> {{ generated_at }}</div>
      <div><strong>Analyst:</strong> {{ job.user.email }}</div>
      <div><strong>Platform:</strong> {{ platform_name }} {{ platform_version }}</div>
    </div>
  </div>

  <div class="verdict-banner" style="border-left: 8px solid {{ verdict_color(job.fusion_result.final_verdict) }}">
    <div class="verdict-label">OVERALL VERDICT</div>
    <div class="verdict-value">{{ job.fusion_result.final_verdict | replace("_", " ") }}</div>
    <div class="score-row">
      <span>AI Probability: <strong>{{ (job.fusion_result.final_score * 100) | round(1) }}%</strong></span>
      <span>Confidence: <strong>{{ (job.fusion_result.final_confidence * 100) | round(1) }}%</strong></span>
    </div>
    {{ probability_bar(job.fusion_result.final_score) | safe }}
  </div>

  <div class="content-summary">
    <h2>Submitted Content</h2>
    <table>
      <tr><td>File Name</td><td>{{ job.file_name or "Text Input" }}</td></tr>
      <tr><td>Modality</td><td>{{ job.modality | title }}</td></tr>
      <tr><td>File Size</td><td>{{ (job.file_size_bytes / 1024) | round(1) }} KB</td></tr>
      <tr><td>Submitted At</td><td>{{ job.created_at.strftime("%Y-%m-%d %H:%M UTC") }}</td></tr>
    </table>
  </div>
</div>
```

---

### 8.13 Database Seed & Initial Setup

```python
# scripts/seed_models.py
"""
Run once after first alembic migrate to register model metadata.
Usage: python scripts/seed_models.py
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.dialects.postgresql import insert as pg_insert
from shared.db.models.model_registry import Model
from app.core.config import settings


MODEL_SEED_DATA = [
    {
        "name": "DeBERTa-v3-RAID",
        "version": "v1.2",
        "modality": "text",
        "architecture": "DeBERTa-v3-base",
        "parameter_count": 86_000_000,
        "framework": "pytorch",
        "training_dataset": "RAID-2024 (100K subset)",
        "eval_f1": 0.89,
        "eval_dataset": "RAID validation split",
        "checkpoint_path": "/models/deberta_v3_raid_v1.2",
        "is_active": True,
        "is_default": True,
    },
    {
        "name": "ResNet50-CNNDetection",
        "version": "v2.0",
        "modality": "image",
        "architecture": "ResNet-50",
        "parameter_count": 25_600_000,
        "framework": "pytorch",
        "training_dataset": "ProGAN-11class",
        "eval_auc": 0.97,
        "eval_dataset": "Wang et al. test set",
        "checkpoint_path": "/models/resnet50_cnn_detection_v2.0",
        "is_active": True,
        "is_default": True,
    },
    {
        "name": "Corvi-EfficientNet",
        "version": "v1.0",
        "modality": "image",
        "architecture": "EfficientNet-B0 (frequency)",
        "parameter_count": 5_288_548,
        "framework": "pytorch",
        "training_dataset": "RAISE + LDM subset",
        "eval_auc": 0.93,
        "eval_dataset": "Corvi et al. test set",
        "checkpoint_path": "/models/corvi_effnet_v1.0",
        "is_active": True,
        "is_default": False,
    },
    {
        "name": "AASIST-L",
        "version": "v1.0",
        "modality": "audio",
        "architecture": "Heterogeneous Graph Attention Network",
        "parameter_count": 297_000,
        "framework": "pytorch",
        "training_dataset": "ASVspoof2019-LA",
        "eval_eer": 0.0083,
        "eval_dataset": "ASVspoof 2019 LA eval",
        "checkpoint_path": "/models/aasist_l_v1.0",
        "is_active": True,
        "is_default": True,
    },
]


async def seed() -> None:
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async with AsyncSession(engine) as session:
        for data in MODEL_SEED_DATA:
            stmt = (
                pg_insert(Model)
                .values(**data)
                .on_conflict_do_update(
                    index_elements=["name", "version"],
                    set_={"is_active": data["is_active"]},
                )
            )
            await session.execute(stmt)
        await session.commit()
    await engine.dispose()
    print("✅ Model seed data inserted successfully")


if __name__ == "__main__":
    asyncio.run(seed())
```

---

### 8.14 Environment Variables Reference

```bash
# .env.example — Complete reference for all services

# ─── Database ───────────────────────────────────────────────
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=forensics_db
POSTGRES_USER=forensics_user
POSTGRES_PASSWORD=change_me_in_production
DATABASE_URL=postgresql+asyncpg://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}

# ─── Redis ──────────────────────────────────────────────────
REDIS_URL=redis://redis:6379/0

# ─── RabbitMQ ───────────────────────────────────────────────
RABBITMQ_HOST=rabbitmq
RABBITMQ_PORT=5672
RABBITMQ_USER=forensics
RABBITMQ_PASSWORD=change_me_in_production
RABBITMQ_VHOST=/
RABBITMQ_URL=amqp://${RABBITMQ_USER}:${RABBITMQ_PASSWORD}@${RABBITMQ_HOST}:${RABBITMQ_PORT}/${RABBITMQ_VHOST}

# ─── MinIO / S3 Object Storage ──────────────────────────────
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=change_me_in_production
MINIO_BUCKET=forensics-bucket
MINIO_USE_SSL=false

# ─── Auth Service ───────────────────────────────────────────
JWT_SECRET_KEY=super_secret_key_minimum_32_chars_change_this
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# ─── Model Paths (Mounted Docker Volume) ────────────────────
TEXT_MODEL_PATH=/models/deberta_v3_raid_v1.2
TEXT_MODEL_VERSION=v1.2
IMAGE_MODEL_GAN_PATH=/models/resnet50_cnn_detection_v2.0
IMAGE_MODEL_DIFF_PATH=/models/corvi_effnet_v1.0
AUDIO_MODEL_PATH=/models/aasist_l_v1.0

# ─── Service URLs (internal Docker network) ─────────────────
TEXT_SERVICE_URL=http://text-service:8001
IMAGE_SERVICE_URL=http://image-service:8002
AUDIO_SERVICE_URL=http://audio-service:8003
EXPLAINABILITY_SERVICE_URL=http://explainability-service:8004
REPORT_SERVICE_URL=http://report-service:8005
AUTH_SERVICE_URL=http://auth-service:8006

# ─── Rate Limiting ──────────────────────────────────────────
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_DAY=500

# ─── File Upload Limits ─────────────────────────────────────
MAX_TEXT_LENGTH=10000
MAX_IMAGE_SIZE_MB=10
MAX_AUDIO_SIZE_MB=30
MAX_AUDIO_DURATION_SECONDS=120
MAX_VIDEO_SIZE_MB=300

# ─── Fusion Weights (overrides calibrated defaults) ─────────
FUSION_WEIGHT_TEXT=0.60
FUSION_WEIGHT_IMAGE=0.40
FUSION_WEIGHT_AUDIO=0.35
FUSION_WEIGHT_VIDEO=0.25

# ─── Logging ────────────────────────────────────────────────
LOG_LEVEL=INFO
LOG_FORMAT=json       # json | text

# ─── Frontend ───────────────────────────────────────────────
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=AI Forensics Platform
```

---

*End of Sections 5–8 (Full LLD Edition)*
*Next: Sections 9–14 — Implementation Roadmap, Model Integration, Explainability Deep-Dive, Testing Strategy, DevOps, Final Recommendation*
