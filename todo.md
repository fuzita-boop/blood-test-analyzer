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
- [ ] チェックポイント保存

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
