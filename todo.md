# 採血データ解析アシスタント - TODO

## Phase 1: DB・プロジェクト初期設定
- [x] todo.md作成
- [x] DBスキーマ設計（patients, blood_test_records, assessment_reports）
- [x] pnpm db:push でマイグレーション実行

## Phase 2: バックエンド実装
- [x] S3画像アップロードAPI（tRPC mutation）
- [x] LLM OCRによる検査項目・数値抽出
- [x] 異常値スクリーニングロジック（基準値テーブル）
- [x] アセスメントレポート自動生成（LLM）
- [x] 患者管理CRUD API
- [x] 採血記録保存・取得API
- [x] レポート取得API
- [x] Vitestテスト作成（11テスト全通過）

## Phase 3: フロントエンドUI実装
- [x] グローバルスタイル・テーマ設定（エレガントスタイル）
- [x] AppLayout（サイドバーナビゲーション・認証ガード）
- [x] ホーム画面（ダッシュボード）
- [x] 画像アップロードページ（ドラッグ&ドロップ対応）
- [x] 解析中ローディング表示
- [x] アセスメントレポート表示ページ
- [x] 印刷・コピー機能
- [x] 患者管理ページ
- [x] 履歴一覧・詳細ページ
- [x] 経時変化グラフ（recharts）

## Phase 4: テスト・最終調整
- [x] 動作確認（TypeScriptエラー0）
- [x] テスト全通過（11/11）
- [x] チェックポイント保存（初回リリース時に実施）

## Phase 5: プライバシー強化対応
- [x] アップロード画像をOCR読み取り後にS3から自動削除
- [x] DBのimageUrl・imageKeyカラムを削除（画像URLを保存しない）
- [x] 患者管理機能（patientsテーブル・API・ページ）を削除
- [x] アップロードUI・履歴UIから患者選択・患者表示を除去
- [x] サイドバーから患者管理ナビを除去
- [x] App.tsxから患者関連ルートを削除
- [x] テスト更新・全通過確認（11/11）

## Phase 6: PWAアイコン実装
- [x] PWAアイコン画像をAIで生成（192x192, 512x512）
- [x] CDNにアップロード
- [x] manifest.jsonを作成
- [x] index.htmlにメタタグ・manifest linkを追加
- [x] apple-touch-icon対応

## Phase 7: 基準値テーブル修正
- [x] WBC（白血球数）の基準値・単位を修正
- [x] RBC（赤血球数）の基準値・単位を修正
- [x] 全検査項目の基準値・単位を日本の検査標準に合わせて見直し
- [x] OCR抽出プロンプトの単位認識精度を改善
- [x] テスト更新・全通過確認（35/35）

## Phase 8: HbA1c・ALT・AST・γ-GTP・LDL 見過ごし問題修正
- [x] 項目名正規化テーブルのHbA1c・ALT・AST・γ-GTP・LDLのエイリアスを調査・修正
- [x] 基準値テーブルの各項目の登録状況を確認
- [x] OCRが出力する項目名バリエーション（γ-GTP, γGTP, GGT等）を網羅的に対応
- [x] LDL（LDL-C, LDLコレステロール等）のエイリアスを追加
- [x] テスト追加・全通過確認（46/46）

## Phase 9: 単位変換堅牢化・男女別基準値対応
- [x] 単位文字列の正規化（大文字小文字統一・スペース除去・全角→半角変換）
- [x] CRP mg/L → mg/dL 変換対応（÷10）
- [x] 基準値テーブルに男女別値を追加（RBC・Hb・Ht・UA・γ-GTP等）
- [x] screenAbnormalValues に gender パラメータを追加
- [x] バックエンドAPI（analyze）に gender パラメータを追加
- [x] アップロードUIに性別選択ボタンを追加（男性/女性/不明）
- [x] テスト更新・全通過確認（66/66）

## Phase 10: 未検査項目の0誤認識問題修正
- [x] OCRプロンプトを修正（数値が記載されていない項目はnullを返すよう明示指示）
- [x] JSONスキーマのvalue型をnumber | nullに変更
- [x] screenAbnormalValuesでnull・undefined・NaNをスキップ
- [x] routers.tsのOCR結果フィルタリングでnull値を除外
- [x] テスト追加（71/71）・全通過確認・TypeScriptエラー0

## Phase 11: 完全ローカルPWA・GitHub Pages移行
- [x] 既存クラウドDBの保存件数・移行可否を監査（採血記録17件・レポート17件。ユーザー指定により履歴は移行せず新規開始）
- [x] ログイン・tRPC・Express・クラウドDB・S3・外部LLMへの必須依存を削除
- [x] IndexedDBに採血記録・レポート・設定を保存するクライアント側ストレージを実装
- [x] 画像を端末内でOCRし、検査値抽出・未検査項目の除外・異常値スクリーニングをオフライン実行（キャッシュ済み資産利用時）
- [x] ローカル履歴のJSONエクスポート・インポート機能を実装
- [x] Service Worker・Web App Manifest・OCR資産を含むアセットの事前キャッシュを実装
- [x] GitHub Pagesのサブパスに対応するビルド設定を実装
- [x] GitHub ActionsによるGitHub Pages自動デプロイを追加
- [x] 静的ビルド・基準値判定・Service Worker/OCR資産出力をテスト（3/3・TypeScriptエラー0）

## Phase 12: PWAアイコン軽量化
- [x] 192px・512pxアイコンを1MB未満に圧縮（31KB・286KB）
- [x] 静的ビルドとService Workerキャッシュを再検証
- [x] チェックポイントを保存（d0026c39）
- [x] Service WorkerのprecacheにHTML・JavaScript・CSS・manifest・PWAアイコン・OCR資産が含まれることを検証
- [x] Service Workerのprecacheに生成済みJavaScript・CSSアセットが含まれることを明示検証

## Phase 13: GitHub Pages公開状態確認
- [x] GitHub Pages設定・Actions実行状況を確認（Pages APIは権限不足で参照不可、最新2回のDeploy Pagesワークフローは失敗）
- [x] Deploy Pagesワークフロー失敗の原因を特定（pnpmキャッシュ指定より前にpnpmが未セットアップ）・順序を修正
- [x] 再実行時のpnpmセットアップ失敗を修正（Node.jsを先にセットアップしpnpmキャッシュ指定を廃止）
- [x] pnpmセットアップのバージョン重複を修正（package.jsonのpackageManager指定を使用）
- [x] GitHub Pages標準のconfigure-pagesステップと自動サブパス取得を追加
- [x] GitHub PagesのSource設定・公開URLの有効化をユーザーに案内
- [x] GitHub Pages設定後に公開URLを実アクセスで確認（https://fuzita-boop.github.io/blood-test-analyzer/）

## Phase 14: GitHub Pages利用制約の案内
- [x] 非公開リポジトリのGitHub Pages利用制約と、公開・アップグレードの選択肢を案内

## Phase 15: GitHubリポジトリ公開・Pages有効化
- [x] ユーザー承認に基づきGitHubリポジトリを公開設定へ変更
- [x] GitHub PagesをGitHub Actionsソースで有効化
- [x] GitHub Pagesデプロイ成功と公開URLを確認

## Phase 16: 画像破棄動作確認
- [x] アップロード画像のIndexedDB非保存を確認
- [x] OCR完了直後に画像をブラウザメモリから自動破棄
- [x] OCR成功・失敗後に画像のFile/プレビュー参照が残らないことを検証（finallyでURL.revokeObjectURL・File/preview stateをクリア）

## Phase 17: 画像データの通信経路確認
- [x] 画像が公開サイト・サーバー・ネットワーク上に送信または保存されないことを確認し、残存可能性の範囲を説明（公開バンドルの実使用画面に画像送信・外部API呼び出しなし）
- [x] 画像データが送信されない範囲と、サイト資産取得・ブラウザ拡張・OS同期等の例外をユーザーへ明示説明

## Phase 18: ナビゲーション表示不具合修正
- [x] 上部メニューが隠れる原因（レイアウト・スクロール・安全領域）を特定
- [x] モバイル・PCでナビゲーションを常時操作可能に修正
- [x] 画面遷移と静的PWAビルドを検証し公開
- [x] ナビゲーション修正をGitHub Pagesへ再デプロイし、公開URL上で確認
- [x] PWA更新を待機させず自動適用するService Worker設定を追加・ビルド検証

## Phase 19: OCR結果からの自動レポート作成
- [x] OCRで抽出した数値を手入力なしで解析・保存できるようにする
- [x] OCRテキストの表形式・改行分割に対応する抽出処理を強化する
- [x] 抽出失敗時の案内を、入力要求ではなく再読み取り・OCR結果確認の導線へ改善する
- [x] 自動抽出・型検査・静的ビルドを検証する
- [x] OCR自動レポート修正をGitHub Pagesへデプロイし、公開URLで確認する（Actions run 38332229359成功、公開バンドルに修正文言を確認）
