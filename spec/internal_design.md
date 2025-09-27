# 花札こいこい 内部設計書

## 1. システム概要
- 技術スタック: Vue 3 + Vite + JavaScript (ES Modules) + Pinia + Vitest。
- 対応ブラウザ: Chromium / Firefox / Safari の最新世代。
- 目的: シングルプレイヤーで CPU と対戦する花札「こいこい」の Web クライアントを提供する。

## 2. レイヤ構成
- **プレゼンテーション層**: Vue コンポーネント群 (`src/components/**`) が UI を描画。Phaser コンポーネントは背景のみ担当。
- **アプリケーション層**: `GameState` がドメイン層を包み込み、UI 用スナップショット・ログメッセージ・API 風インターフェースを提供。
- **ドメイン層**: `RoundState`, `GameService`, `Field`, `PlayerState`, `Deck`, `YakuEvaluator`, `ScoreCalculator` など純粋ロジック。外部依存なし。
- **バックエンドモック**: `src/backend/gameBackend.js` が Pinia からの呼び出しを `GameState` に橋渡しする擬似 API。
- **状態管理**: Pinia の `useMatchStore` がスナップショットと UI 状態 (選択中の札・ログ等) を保持。

## 3. ディレクトリ概要
- `src/domain/cards/`: カード定義・生成ユーティリティ。
- `src/domain/game/`: ラウンド・マッチ進行ロジック (`RoundState.js`, `GameService.js`, `YakuEvaluator.js`, `ScoreCalculator.js` 等)。
- `src/application/GameState.js`: UI から利用するファサード。スナップショット生成とログ整形を担当。
- `src/backend/gameBackend.js`: Pinia ストアから呼ばれる非同期ラッパー。
- `src/stores/matchStore.js`: Pinia ストア本体。選択状態・アクション表示・ログ管理。
- `src/components/**`: Vue コンポーネント (GameBoardView, ActionPanel, StatusBar など)。
- `tests/**`: Vitest によるユニット/統合テスト。

## 4. ドメインモデル
| モデル | 役割 | 主な状態 | 主な操作 |
| --- | --- | --- | --- |
| `Deck` | 山札管理 | `_cards`, `_rng` | `draw()`、`remaining` |
| `Field` | 場札管理 | `cards`, `discard` | `addCard()`, `placeOrCapture()` |
| `PlayerState` | プレイヤー | `hand`, `captured` | `receiveCard()`, `removeHandCard()`, `captureCards()` |
| `RoundState` | 局進行 | `currentPlayerId`, `playerStatus`, `pendingKoikoi`, `roundResult` | `availableMoves()`, `applyMove()`, `handleKoikoiDecision()`, `snapshot()` |
| `YakuEvaluator` | 役判定 | - | `evaluate(capturedCards)` |
| `ScoreCalculator` | 得点計算 | - | `computePlayerScore()`, `buildRoundPoints()` |
| `GameService` | マッチ統括 | `matchState`, `round` | `startMatch()`, `playCard()`, `resolveKoikoi()`, `startNextRound()`, `getSnapshot()` |

## 5. Pinia ストア
- ストア ID: `useMatchStore`。
- 保持する代表的な状態: `match` (現在スナップショット), `matchInfo` (累計スコア等), `pendingKoikoi`, `roundResult`, 選択中の札 ID、ログ一覧。
- 主なアクション: `loadInitialState()`, `selectHandCard()`, `selectFieldCard()`, `playSelectedCards()`, `resolveKoikoi()`, `startNextRound()`。
- `match.actions.primary/secondary` に UI ボタンを構築し、Koikoi 選択・次局開始・カード出し等を制御する。

## 6. ゲームフロー
1. `GameService.startMatch()` でマッチ初期化。ラウンドを生成し、初期配札・再配札チェックを実行。
2. `RoundState.availableMoves()` が手番ごとの合法手を列挙。CPU 手番と Koikoi 判定は `GameService._autoPlayIfNeeded()` が自動進行。
3. プレイヤーは Pinia を通じて `playCards()` を呼び出し、`GameService.playCard()` が `RoundState.applyMove()` を実行。
4. 役成立時は `RoundState.pendingKoikoi` をセットし、プレイヤー／CPU が `handleKoikoiDecision()` で「コイコイ」「上がり」を選択。
5. ラウンド終了後 `ScoreCalculator` が得点を確定。`GameService` が累計スコア、次局先手、再開イベントを管理。
6. 規定局数に到達すると `matchState.isFinished` が真となり、スナップショットに最終結果が含まれる。

## 7. ログとイベント
- `GameState` が `GameService` から得たイベント配列 (turn, koikoi-prompt, koikoi-decision, round-start/end, match-end) をメッセージへ整形。
- ストアはログを最大 50 件保持し、`ActionPanel` で表示。重要イベントは success/warning 等のバリアントを付与。

## 8. UI コンポーネント構成
- `GameBoardView` が全 UI を統括。`StatusBar`, `FieldArea`, `CapturedArea`, `HandArea`, `ActionPanel` を配置。
- `ActionPanel` は Pinia の `actions.primary/secondary` 配列に従ってボタンを描画し、ユーザー操作をストアへ emit。
- `StatusBar` は手番 / コイコイ回数 / 山札残 / 総合スコアを表示。

## 9. CPU 仕様概要
- 対戦相手: 「CPU 花子」。手番ロジックはヒューリスティックで最初に獲得できる手を優先。
- Koikoi 判定: 役成立時、基礎点が 7 点以上なら上がり、それ未満はコイコイ継続。(暫定ロジック)
- CPU 手番は `GameService.advanceCpuTurn()` で進行し、`DEFAULT_CPU_THINK_DELAY`（1,000ms）だけ待機したあとにまとめて処理する。
- `useMatchStore` は human アクション後に `cpuDelay`（スナップショットの `meta.cpuThinkDelay`）を参照し、タイマー経由で `advanceCpuTurn` を呼び出して「考える時間」を再現する。
- Koikoi 判定は `advanceCpuTurn()` 内のループで自動的に解決され、決着後は即座にラウンド集計・次局開始が行われる。

## 10. サウンドアセット
- `src/assets/sound/agari.mp3` : 上がり宣言演出。
- `src/assets/sound/click_fuda.mp3` : 手札・場札クリック時のフィードバック。
- `src/assets/sound/fuda_select.mp3` : 札を選択状態へ切り替える際のハイライト音。
- `src/assets/sound/start_button.mp3` : タイトル画面等で対局開始ボタンを押したときの効果音。
