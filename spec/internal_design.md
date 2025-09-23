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

### 単体テスト対象リスト
1. `CardBase` と個別カードクラス：コンストラクタバリデーション、`toJSON`/`clone` の動作確認。
2. `cardDefinitionsById` / `cardClassesById`：全48枚の定義整合性、重複 ID 検知、月別フィルタリング (`listCardsByMonth`)。
3. `Deck`：初期化時のカード枚数、`shuffle()` の乱択性（シード固定時の再現性）、`draw()` の例外処理。
4. `Player`：`playCard()` のハンド減算、副作用の検証、`capture()` の挙動。
5. `Field`：`placeCard()`／`matchCard()` の結果整合性、同月札複数時の選択処理。
6. `YakuEvaluator`：役ごとの成立条件と加点ロジック、複合役の優先順位。
7. `ScoreCalculator`：コイコイ倍率・追加点処理、異常入力防止。
8. `RoundState`：`applyMove()` の状態遷移、履歴 (`history`) の整合確認。
9. `MatchCoordinator`：初期配布、先攻決定のルール、局遷移。
10. CPU 思考モジュール：候補抽出・期待値計算・コイコイ判定の分岐、モックデータによる最適手の選択確認。

## 11. パフォーマンス・アクセシビリティ
- 描画最適化：大きなアニメーションは requestAnimationFrame に委譲。
- コンポーネントの再レンダリングを抑えるため、非リアクティブデータは `shallowRef` を活用。
- アクセシビリティ：キーボード操作、スクリーンリーダー対応の aria 属性設計。

## 12. 今後の拡張ポイント
- AI プレイヤー導入のための `BotStrategy` インターフェース。
- マルチプレイヤー同期用のサーバーレイヤ（Node.js + ws）とクライアントアダプタ。
- スキン／アセット切り替え機能、ユーザープロフィール保存。

## 13. UIレイアウト仕様
- 画面解像度は 1230x922（4:3 比率、従来の約1.2倍）を基準値とし、ブラウザ表示時は中央寄せで余白を確保する。
- `CapturedArea.vue` を左右に2分割し、左をローカルプレイヤー、右を対戦相手専用にする。
- 各エリアはカテゴリ別タブ／セクションを横並びにし、札カードコンポーネント（`CardToken`）を種類順で整列する。
- エリア下部にポイント表示バーを配置し、左側はローカルプレイヤーの局内得点、右側は相手の局内得点をリアルタイム更新する。
- 12局通算スコアはボード下中央の `ScoreSummary` で左右にプレイヤー名＋総得点を表示し、差分をアイコン表示する。
- `CardToken` はホバー時に直下へ通称ラベル（`CardTooltip`）をフェードイン表示し、タッチ環境ではロングタップで同様のラベルを表示する。
- ホバー／タップ時のラベル表示はアクセシビリティ対応として `aria-live="polite"` のリージョンに反映する。

## 14. CPU 対戦相手仕様
- デフォルト対戦相手は「CPU 花子」とし、難易度は `normal`（平均的な強さ）を初期値とする。将来的には `easy`／`hard`／`expert` などの拡張を想定する。
- 思考ロジックは以下の段階で構成する。
  1. **候補抽出**：手札から出せる札と、場札とのマッチ候補を列挙し、成立役・役候補数・相手への妨害度を評価指標としてスコアリングする。
  2. **期待値計算**：役成立確率、獲得点数、山札残りに基づくリスク評価を行い、期待得点の高い手を優先する。
  3. **コイコイ判断**：直近の獲得点、役の伸びしろ、相手の役候補状況を基に閾値（例：期待点>=7、差分>=5）を超えた場合のみコイコイを選択する。
- CPU の手番処理には 400〜600ms の疑似思考遅延を入れ、プレイヤーが挙動を追いやすくする。遅延時間は難易度によって調整する。
- UI には CPU のアクションを以下のイベントで反映する。
  - 手番開始時にステータスバーへ「CPU 花子の手番」を表示し、手札エリアを半透明化。
  - 札を出す／役を成立させる／コイコイ宣言をするたびにログへ記録し、必要に応じてトースト通知を表示する。
  - ゲームオーバー画面では CPU の戦績（役数・コイコイ回数）を併記する。
- 評価関数は「1手先を読む全探索」を基本とし、各候補手をプレーした後の盤面評価値（役成立数、得点差、山札残枚数）を比較して最良手を選ぶ。
- AI ロジックは `src/domain/cpu` 配下に配置し、純粋関数として実装してテスト可能性を確保する。
