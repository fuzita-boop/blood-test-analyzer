import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useCallback, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import {
  Upload as UploadIcon,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FlaskConical,
  ShieldCheck,
} from "lucide-react";

export default function Upload() {
  const [, navigate] = useLocation();
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [testDate, setTestDate] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analyzeMutation = trpc.bloodTest.uploadAndAnalyze.useMutation({
    onSuccess: (data) => {
      toast.success("解析が完了しました");
      navigate(`/report/${data.recordId}`);
    },
    onError: (error) => {
      toast.error(`解析に失敗しました: ${error.message}`);
      setIsAnalyzing(false);
      setAnalysisStep("");
    },
  });

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("画像ファイルを選択してください");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("ファイルサイズは10MB以下にしてください");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!selectedFile || !preview) return;

    setIsAnalyzing(true);
    setAnalysisStep("画像を一時アップロード中...");

    const base64 = preview.split(",")[1];
    if (!base64) {
      toast.error("画像の読み込みに失敗しました");
      setIsAnalyzing(false);
      return;
    }

    setTimeout(() => setAnalysisStep("AIが検査値を解析中..."), 1500);
    setTimeout(() => setAnalysisStep("異常値をスクリーニング中..."), 4000);
    setTimeout(() => setAnalysisStep("アセスメントレポートを生成中..."), 7000);
    setTimeout(() => setAnalysisStep("画像を削除中（プライバシー保護）..."), 10000);

    analyzeMutation.mutate({
      imageBase64: base64,
      mimeType: selectedFile.type,
      testDate: testDate || undefined,
    });
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">新規解析</h1>
          <p className="text-muted-foreground text-sm mt-1">採血データの画像をアップロードしてAI解析を開始します</p>
        </div>

        {/* Privacy Notice */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-medium text-emerald-700">プライバシー保護について</p>
            <p className="text-xs text-emerald-600 mt-0.5 leading-relaxed">
              アップロードされた画像はAI解析のみに使用し、<strong>読み取り完了後に自動削除</strong>されます。
              氏名・生年月日・ID番号などの個人情報は抽出・保存しません。
            </p>
          </div>
        </div>

        {/* Upload Area */}
        <Card className="border-border shadow-none">
          <CardContent className="p-6">
            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                  dragOver
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      クリックまたはドラッグ&ドロップ
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, JPEG, WEBP（最大10MB）
                    </p>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl overflow-hidden border border-border bg-muted/20">
                  <img
                    src={preview!}
                    alt="採血データ"
                    className="w-full max-h-72 object-contain"
                  />
                  <button
                    onClick={() => { setSelectedFile(null); setPreview(null); }}
                    className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-emerald-700 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-600">
                      {(selectedFile.size / 1024).toFixed(0)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => { setSelectedFile(null); setPreview(null); }}
                    className="text-xs text-emerald-600 hover:text-emerald-800"
                  >
                    変更
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options */}
        <Card className="border-border shadow-none">
          <CardContent className="p-6">
            <h2 className="text-sm font-semibold text-foreground mb-4">オプション設定</h2>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">採血日（任意）</Label>
              <Input
                type="date"
                value={testDate}
                onChange={(e) => setTestDate(e.target.value)}
                className="h-9 text-sm max-w-xs"
              />
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            本システムはAIによる参考情報の提供を目的としており、医学的診断を示すものではありません。
            異常値については必ず主治医の指示を仰いでください。
          </p>
        </div>

        {/* Analyze Button */}
        <Button
          className="w-full h-11 gap-2 text-sm font-medium"
          disabled={!selectedFile || isAnalyzing}
          onClick={handleAnalyze}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {analysisStep}
            </>
          ) : (
            <>
              <FlaskConical className="w-4 h-4" />
              AI解析を開始
            </>
          )}
        </Button>

        {/* Analysis Progress */}
        {isAnalyzing && (
          <Card className="border-primary/20 bg-primary/5 shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">解析中</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{analysisStep}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {[
                  "画像をS3に一時アップロード",
                  "LLMで検査値を抽出（個人情報は除外）",
                  "異常値をスクリーニング",
                  "アセスメントレポートを生成",
                  "S3から画像を自動削除",
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                    <span className="text-xs text-muted-foreground">{step}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
