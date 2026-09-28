# 🧠 OneHelp — AI & Edge Intelligence Module

> **Assigned Lead:** Ashish  
> **Repository:** [OneHelp](https://github.com/lokeshdokwa/OneHelp)

This folder contains on-device AI/ML models, audio classification pipelines, stress detection algorithms, and offline triaging systems for OneHelp.

---

## 🎯 Scope & Responsibilities

1. **Acoustic Emergency Detection (On-Device):**
   - Lightweight audio classification (YAMNet / quantized Edge TFLite models).
   - Real-time detection of critical sounds: Gunshots, screams, glass breaking, sirens, vehicle crash impacts.
2. **Voice Stress & Duress Analysis:**
   - Real-time pitch, jitter, and shimmer frequency analysis from microphone input.
   - Computes a Stress Score (0-100%) to automatically verify distress calls without user confirmation.
3. **Voice Wake-Word & Hands-Free SOS:**
   - On-device offline wake-word detector (e.g. "Help OneHelp", "Emergency Emergency").
   - Triggers SOS background actions even when phone is locked or screen is off.
4. **Offline First-Aid Triaging Assistant:**
   - Quantized rule-based / offline decision tree models for fast medical guidance (CPR rhythm, snake bite, heatstroke, burn care).

---

## 📁 Recommended Structure
```
ai/
├── models/                  # Quantized .tflite, .onnx, or label files
│   ├── gunshot_detector.tflite
│   ├── voice_stress.tflite
│   └── labels.txt
├── scripts/                 # Training, conversion, and quantization scripts
│   ├── train_audio_model.py
│   └── quantize_model.py
├── pipelines/               # Pre-processing & Feature extraction
│   ├── audio_features.py    # Mel-spectrogram, MFCC, Pitch extraction
│   └── stress_scorer.py     # Heuristic and ML scoring
├── tests/                   # Model benchmark & accuracy tests
└── README.md
```

---

## ⚡ Git Workflow for AI
1. Branch from `develop`:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feat/ai-<feature-name>
   ```
2. Commit with conventional commit messages: `feat(ai): add quantized TFLite model for acoustic gunshot detection`
3. Test inference speed locally (<50ms on mobile CPU) and open PR to `develop`.
