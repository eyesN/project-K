# project-K
 Project-K is  for hate Speech detection and Filter.

## Dataflow Architecture

```text
[User opens social media]
        ↓
[Content Script extracts comments]
        ↓
[Layer 1: Fast filter]
        ↓
 ┌───────────────┬────────────────┐
 │ obvious spam  │ unclear cases  │
 │ → hide        │ → send to ML   │
 └───────────────┴────────────────┘
                        ↓
        [Background ML model]
                        ↓
              [Return score]
                        ↓
        [Content script updates UI]
```