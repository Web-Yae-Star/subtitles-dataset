# Contributing to Subtitles Dataset

Thank you for your interest in contributing to this dataset! This repository collects curated, uncensored subtitle files in **Latin American Spanish** to support NLP training, LLM fine-tuning, and localization research.

---

## Contribution Guidelines

### 1. Translation Quality & Register
* **Language & Dialect**: Natural Latin American Spanish.
* **Localization Approach**: Use adaptive translation that captures nuance and context rather than literal word-for-word translation.
* **Register Balance**: Avoid extreme regionalisms/slang that reduce universality across Spanish speakers, but maintain an authentic, fluent, and conversational tone.
* **Uncensored Content**: Do not sanitize, soften, or censor dialogue; retain the original tone, intensity, and meaning accurately.

### 2. File Format & Technical Standards
* **Format**: Advanced SubStation Alpha (`.ass`).
* **Encoding**: UTF-8.
* **Timing & Styles**: Ensure subtitle events (Dialogue lines, styles, and timing) remain synchronized and correctly structured.

### 3. File Naming Conventions
Follow the established naming standard in this repository:
```text
ANI][<Title_With_Underscores>_<Episode_Number>.ass
```
*Example:* `ANI][Toshoshitsu_no_Kanojo_01.ass`

---

## How to Submit Changes

1. **Fork** this repository.
2. **Create a branch** for your addition or correction:
   ```bash
   git checkout -b add/new-subtitles-title
   ```
3. **Commit your changes** with descriptive messages:
   ```bash
   git commit -m "feat: add subtitle dataset for Title Episode 01"
   ```
4. **Push** your branch and open a **Pull Request**.
5. Use the provided Pull Request template to detail your contribution.
