# 花札こいこい 内部設計書

## 1. システム概要
- 技術スタック：Vue 3 + TypeScript + Vite + Pinia（状態管理）+ Vitest（単体テスト）を想定。
- 対象プラットフォーム：モダンブラウザ（Chromium, Firefox, Safari 最新2世代）。
- 目的：対人プレイ（ローカル／オンライン）を行える花札「こいこい」ゲームの実装。

## 2. 全体アーキテクチャ
- プレゼンテーション層：Vue コンポーネントで UI を構築。
- アプリケーション層：ゲーム進行を司るサービス（`GameService`）、イベントバス、タイマー管理。
- ドメイン層：カード、デッキ、プレイヤー、役判定などの純粋ロジックを TypeScript クラス／関数で実装。
- インフラ層：ローカルストレージ永続化、オンライン対戦時の通信アダプタ（WebSocket 予定）。

## 3. ディレクトリ構成案
- `src/domain`: ドメインモデル（`card.ts`, `deck.ts`, `player.ts`, `yaku.ts`, `score.ts`）。
- `src/application`: `GameService`, `MatchCoordinator`, `RuleConfig`。
- `src/presentation`: Vue コンポーネント (`BoardView.vue`, `HandView.vue`, `KoikoiDialog.vue` など)。
- `src/store`: Pinia ストア定義（`useMatchStore.ts`, `useSettingsStore.ts`）。
- `src/infrastructure`: API クライアント、永続化アダプタ。
- `src/utils`: 共通ユーティリティ（シャッフル、ID 生成、日付処理）。

## 4. ドメインモデル概要
| モデル | 役割 | 主なプロパティ | 主なメソッド |
| --- | --- | --- | --- |
| `Card` | 花札1枚の表現 | `id`, `month`, `type`, `points`, `isSpecial` | - |
| `Deck` | 山札の管理 | `cards: Card[]`, `seed` | `shuffle()`, `draw()` |
| `Player` | プレイヤー状態 | `id`, `name`, `hand`, `captured`, `score`, `koikoiCount` | `playCard()`, `capture()` |
| `Field` | 場札の管理 | `slots: Map<month, Card[]>` | `placeCard()`, `matchCard()` |
| `RoundState` | 局単位の状態 | `currentPlayerId`, `phase`, `history` | `applyMove()`, `checkYaku()` |
| `YakuEvaluator` | 役判定ロジック | `ruleSet` | `evaluate(capturedCards)` |
| `ScoreCalculator` | 得点計算 | `ruleSet` | `calculate(yakuResults)` |
| `MatchState` | 12局セットの状態 | `rounds`, `totalScores`, `monthIndex` | `advance()`, `isFinished()` |

- クラス間の関係は `spec/class_diagram.md` (PlantUML) を参照。

### カード定数
- `MONTH_LABELS`: `1`〜`12`をキーに月札のテーマ名（英語表記）を格納。
- `CARD_CATEGORIES`: 札の大別（`light`, `animal`, `ribbon`, `chaff`）。
- `RIBBON_COLORS`: 短冊の色区分（`red`, `blue`, `plain`）。
- `DEFAULT_POINTS_BY_CATEGORY`: 上記カテゴリごとの基礎点（光20／タネ10／短冊5／カス1）。
- `CARD_BLUEPRINTS`: 48枚すべてのメタデータ。`className`, `id`, `month`, `name`, `category`, `ribbonColor`, `isSpecial`, `tags` を保持。
- `cardClassRegistry` / `cardClassesById`: `CardBase` を継承した個別カードクラスの参照（`src/domain/cards/index.js`）。
- `cardInstances`: 全カードの不変インスタンス配列。テスト・初期化での使い回しを想定。

## 5. 状態管理（Pinia）
- `useMatchStore`
  - 保持：`matchState`, `uiState`, `messageQueue`。
  - アクション：`startMatch(config)`, `startRound()`, `playCard(cardId)`, `resolveKoikoi(choice)`。
- `useSettingsStore`
  - 保持：サウンドON/OFF、持ち時間、ルールバリエーション。

## 6. ゲームフロー
1. `GameService.startMatch()` が呼ばれ、デッキ生成・シャッフルを行う。
2. `MatchCoordinator` が初期配布を行い、`RoundState` を初期化。
3. プレイヤー入力（クリック／タップ）→ `playCard` アクション。
4. `GameService` が手番ロジックを処理し、`YakuEvaluator` で役判定。
5. 上がり／コイコイ選択を `MatchStore` に dispatch。
6. 局終了時に `ScoreCalculator` が得点を更新し、`MatchState` を進行。
7. 12局終了でゲーム終了ダイアログを表示。
   - 詳細なイベント遷移は `spec/game_flow.md` の PlantUML シーケンス図を参照。

## 7. イベントとログ
- `GameEvent` 型でイベント名と payload を定義 (`CardPlayed`, `CardCaptured`, `YakuCompleted`, `RoundEnded` など)。
- `history` にイベントを蓄積し、UI のアニメーション再生やリプレイ機能に用いる。
- デバッグ用途にコンソールログと保存可能な JSON 出力を提供。

## 8. ルール設定
- `RuleConfig` で以下を管理
  - 使用役一覧と点数テーブル
  - コイコイ倍率の上限
  - 特殊ルール（早上がり、完全勝利、流局条件など）
- 将来のバリアント対応のため JSON 形式で設定保存可能にする。

## 9. エラーハンドリング
- 不正な手番（存在しないカードなど）は `InvalidMoveError` を throw。
- UI ではモーダル／トーストでユーザーに通知し、状態復旧を試みる。
- オンライン対戦時はサーバー側と整合性チェックを行い、差異があればロールバック。

## 10. テスト戦略
- 単体テスト：ドメイン層（役判定、得点計算、シャッフル再現性）。
- 結合テスト：`GameService` と `YakuEvaluator` の組み合わせ。
- E2E：`@vue/test-utils` + `vitest`、必要に応じて `Playwright` を導入。
- プロパティベーステスト：山札シャッフルや役成立確率の検証に fast-check を検討。

## 11. パフォーマンス・アクセシビリティ
- 描画最適化：大きなアニメーションは requestAnimationFrame に委譲。
- コンポーネントの再レンダリングを抑えるため、非リアクティブデータは `shallowRef` を活用。
- アクセシビリティ：キーボード操作、スクリーンリーダー対応の aria 属性設計。

## 12. 今後の拡張ポイント
- AI プレイヤー導入のための `BotStrategy` インターフェース。
- マルチプレイヤー同期用のサーバーレイヤ（Node.js + ws）とクライアントアダプタ。
- スキン／アセット切り替え機能、ユーザープロフィール保存。

## 13. UIレイアウト仕様
- `CapturedArea.vue` を左右に2分割し、左をローカルプレイヤー、右を対戦相手専用にする。
- 各エリアはカテゴリ別タブ／セクションを横並びにし、札カードコンポーネント（`CardToken`）を種類順で整列する。
- エリア下部にポイント表示バーを配置し、左側はローカルプレイヤーの局内得点、右側は相手の局内得点をリアルタイム更新する。
- 12局通算スコアはボード下中央の `ScoreSummary` で左右にプレイヤー名＋総得点を表示し、差分をアイコン表示する。
- `CardToken` はホバー時に直下へ通称ラベル（`CardTooltip`）をフェードイン表示し、タッチ環境ではロングタップで同様のラベルを表示する。
- ホバー／タップ時のラベル表示はアクセシビリティ対応として `aria-live="polite"` のリージョンに反映する。
