# ゲームフロー図

現状の実装が辿る 1 手番分のイベントフローを PlantUML のシーケンス図として整理した。ソースは `spec/game_flow.puml` にも保存している。

```plantuml
@startuml CurrentPlayFlow
skinparam backgroundColor #ffffff
skinparam shadowing false
skinparam ParticipantPadding 18
skinparam sequence {
  ArrowThickness 1.1
  LifeLineBorderColor #777777
  LifeLineBackgroundColor #f9f9f9
}

actor Player
participant "Vue UI\n(Hand / Field)" as UI
participant "Pinia Store\nuseMatchStore" as Store
participant "Backend Adapter\n(gameBackend.js)" as Backend
participant GameState as GS
participant GameService as Service
participant RoundState as Round
participant Field
participant Deck
participant "PlayerState\n(各プレイヤー)" as PState

== 手札選択 ==
Player -> UI : カードをクリック
UI -> Store : selectHandCard(card)
Store -> Backend : fetchSelectableFieldCards(card.id)
Backend -> GS : getSelectableFieldCards(card.id)
GS -> Service : getSnapshot()
Service -> Round : snapshot()
Round --> Service : RoundSnapshot
Service --> GS : MatchSnapshot
GS --> Backend : 場札候補一覧
Backend --> Store : selectableFieldIds
Store --> UI : 候補ハイライト

== 手札プレイ ==
Player -> UI : 「手札を出す」を実行
UI -> Store : handleAction('play-card')
Store -> Backend : playCards(handId, fieldId)
Backend -> GS : playCards(handId, fieldId)
GS -> Service : getAvailableMoves(playerId)
Service -> Round : availableMoves(playerId)
Round --> Service : Move[]
GS -> Service : playCard(move)
Service -> Round : applyMove(move)
Round -> PState : removeHandCard()
Round -> Field : placeOrCapture()
Field --> Round : captureResult
Round -> Deck : draw()
Deck --> Round : deckCard / null
Round -> Field : placeOrCapture(deckCard)
Field --> Round : captureResult
Round -> PState : captureCards(...)
Round --> Service : 更新された状態
Service --> GS : MatchSnapshot
GS --> Backend : { state, log }
Backend --> Store : state/log
Store --> UI : 画面更新
@enduml
```

手札選択からプレイ完了までを 2 つのフェーズに分け、現行コードが直接利用しているコンポーネント（GameState → GameService → RoundState）とストア経由の UI 更新がどのように連携するかを明示した。
