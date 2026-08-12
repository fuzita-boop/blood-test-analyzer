import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buildAssessmentReport, runScreening } from "@/lib/analysis";
import { extractFromImage, parseBloodTestText } from "@/lib/localOcr";
import { saveRecord, saveSettings } from "@/lib/localStorage";
import type { ExtractedItem, Gender } from "@/lib/localTypes";
import { AlertTriangle, CheckCircle, ClipboardPaste, FileText, FlaskConical, Loader2, Plus, ScanLine, ShieldCheck, Trash2, Upload as UploadIcon, User, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const EMPTY_ITEM: ExtractedItem = { item: "", value: null, unit: "" };

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function Upload() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [testDate, setTestDate] = useState("");
  const [gender, setGender] = useState<Gender>("unknown");
  const [items, setItems] = useState<ExtractedItem[]>([]);
  const [rawText, setRawText] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");

  const discardImage = () => {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview(null);
  };

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("画像ファイルを選択してください");
    if (file.size > 10 * 1024 * 1024) return toast.error("ファイルサイズは10MB以下にしてください");
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setItems([]);
    setRawText("");
  }, [preview]);

  const runOcr = async () => {
    if (!selectedFile) return;
    setIsReading(true);
    setProgressLabel("端末内OCRを準備中...");
    try {
      const result = await extractFromImage(selectedFile, ({ status, progress }) => {
        setProgressLabel(`${status} ${Math.round(progress * 100)}%`);
      });
      setRawText(result.rawText);
      setItems(result.items.length > 0 ? result.items : [EMPTY_ITEM]);
      await saveSettings({ version: 1, ocrLanguageReady: true });
      toast.success(`${result.items.length}項目の候補を抽出しました。必ず画像と照合して修正してください。`);
    } catch (error) {
      console.error(error);
      toast.error("端末内OCRに失敗しました。数値を手入力してください。");
      setItems((current) => current.length ? current : [EMPTY_ITEM]);
    } finally {
      setIsReading(false);
      setProgressLabel("");
    }
  };

  const updateItem = (index: number, field: keyof ExtractedItem, value: string) => {
    setItems((current) => current.map((item, itemIndex) => {
      if (itemIndex !== index) return item;
      if (field === "value") return { ...item, value: value.trim() === "" ? null : Number(value) };
      return { ...item, [field]: value };
    }));
  };

  const applyText = () => {
    const parsed = parseBloodTestText(rawText);
    setItems(parsed.length ? parsed : [EMPTY_ITEM]);
    toast.message(parsed.length ? `${parsed.length}項目の候補を反映しました` : "項目を自動抽出できませんでした。表に直接入力してください。");
  };

  const saveAnalysis = async () => {
    const validItems = items.filter((item) => item.item.trim() && typeof item.value === "number" && Number.isFinite(item.value));
    if (validItems.length === 0) return toast.error("少なくとも1つの検査項目名と数値を入力してください");
    const screeningResults = runScreening(validItems, gender);
    const report = buildAssessmentReport(screeningResults);
    const record = {
      id: createId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      testDate: testDate || undefined,
      gender,
      extractedItems: validItems,
      screeningResults,
      report,
      source: selectedFile ? "local-ocr" as const : "manual" as const,
    };
    await saveRecord(record);
    discardImage();
    setRawText("");
    toast.success("端末内に解析結果を保存しました。画像は保存されていません。");
    navigate(`/report/${record.id}`);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        <div><p className="text-xs font-medium text-primary tracking-wide">LOCAL ANALYSIS</p><h1 className="text-2xl font-semibold tracking-tight mt-1">新規解析</h1><p className="text-muted-foreground text-sm mt-1">画像は端末内で読み取り、サーバーへ送信しません。</p></div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><div><p className="text-xs font-medium text-emerald-700">画像の取り扱い</p><p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">画像は解析中のブラウザメモリでのみ使用します。解析結果の保存時に画像は破棄され、端末内データベースにも保存しません。</p></div></div>

        <Card className="border-border shadow-none"><CardContent className="p-6">
          {!selectedFile ? <div onDragOver={(event) => { event.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={(event) => { event.preventDefault(); setDragOver(false); const file = event.dataTransfer.files[0]; if (file) handleFile(file); }} onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}`}><div className="flex flex-col items-center gap-4"><span className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center"><UploadIcon className="w-6 h-6 text-primary" /></span><div><p className="text-sm font-medium">クリックまたはドラッグ&amp;ドロップ</p><p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG, WEBP（最大10MB）</p></div></div><input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleFile(file); }} /></div> : <div className="space-y-4"><div className="relative rounded-xl overflow-hidden border border-border bg-muted/20"><img src={preview ?? ""} alt="採血データのプレビュー" className="w-full max-h-80 object-contain" /><button aria-label="画像を破棄" onClick={discardImage} className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"><X className="w-4 h-4 text-white" /></button></div><div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 border border-emerald-200"><CheckCircle className="w-4 h-4 text-emerald-600" /><div className="flex-1 min-w-0"><p className="text-sm font-medium text-emerald-700 truncate">{selectedFile.name}</p><p className="text-xs text-emerald-700/80">{(selectedFile.size / 1024).toFixed(0)} KB・端末内だけで処理</p></div><Button type="button" size="sm" disabled={isReading} onClick={runOcr} className="gap-2">{isReading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScanLine className="w-3.5 h-3.5" />}{isReading ? "読み取り中" : "端末内OCR"}</Button></div></div>}
        </CardContent></Card>

        <Card className="border-border shadow-none"><CardContent className="p-6 space-y-5"><h2 className="text-sm font-semibold">判定設定</h2><div className="space-y-2"><Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5" />性別（男女別基準値に使用）</Label><div className="flex flex-wrap gap-2">{([ ["male", "男性"], ["female", "女性"], ["unknown", "不明"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setGender(value)} className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${gender === value ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/50"}`}>{label}</button>)}</div><p className="text-xs text-muted-foreground">RBC・Hb・Ht・尿酸・γ-GTPなどは性別により基準値が異なります。</p></div><div className="space-y-2"><Label htmlFor="test-date" className="text-xs font-medium text-muted-foreground">採血日（任意）</Label><Input id="test-date" type="date" value={testDate} onChange={(event) => setTestDate(event.target.value)} className="h-9 text-sm max-w-xs" /></div></CardContent></Card>

        {(isReading || items.length > 0) && <Card className="border-border shadow-none"><CardContent className="p-6 space-y-4"><div className="flex items-center justify-between gap-4"><div><h2 className="text-sm font-semibold">抽出結果の確認</h2><p className="text-xs text-muted-foreground mt-1">OCR結果は必ず検査票と照合し、誤り・未検査項目を修正または削除してください。</p></div>{isReading && <span className="text-xs text-primary flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" />{progressLabel}</span>}</div><div className="overflow-x-auto border border-border rounded-lg"><table className="w-full min-w-[560px] text-sm"><thead className="bg-muted/50"><tr><th className="text-left p-3 font-medium text-muted-foreground">検査項目</th><th className="text-left p-3 font-medium text-muted-foreground">数値</th><th className="text-left p-3 font-medium text-muted-foreground">単位</th><th className="w-12" /></tr></thead><tbody>{items.map((item, index) => <tr key={index} className="border-t border-border"><td className="p-2"><Input aria-label="検査項目" value={item.item} onChange={(event) => updateItem(index, "item", event.target.value)} placeholder="例：WBC" className="h-8" /></td><td className="p-2"><Input aria-label="検査値" type="number" step="any" value={item.value ?? ""} onChange={(event) => updateItem(index, "value", event.target.value)} placeholder="未検査は空欄" className="h-8" /></td><td className="p-2"><Input aria-label="単位" value={item.unit} onChange={(event) => updateItem(index, "unit", event.target.value)} placeholder="例：mg/dL" className="h-8" /></td><td className="p-2"><button aria-label="項目を削除" type="button" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button></td></tr>)}</tbody></table></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" size="sm" onClick={() => setItems((current) => [...current, { ...EMPTY_ITEM }])} className="gap-1.5"><Plus className="w-3.5 h-3.5" />項目を追加</Button><Button type="button" variant="outline" size="sm" onClick={() => setItems((current) => current.length ? current : [{ ...EMPTY_ITEM }])} className="gap-1.5"><FileText className="w-3.5 h-3.5" />手入力する</Button></div></CardContent></Card>}

        <Card className="border-border shadow-none"><CardContent className="p-6 space-y-3"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">OCRテキスト（任意）</h2><p className="text-xs text-muted-foreground mt-1">読み取り文字を直接修正して、候補を再抽出できます。</p></div><Button type="button" variant="outline" size="sm" onClick={applyText} disabled={!rawText.trim()} className="gap-1.5"><ClipboardPaste className="w-3.5 h-3.5" />候補へ反映</Button></div><textarea value={rawText} onChange={(event) => setRawText(event.target.value)} placeholder="OCR結果がここに表示されます。画像を使用せず、検査項目と数値を貼り付けて候補化することもできます。" className="w-full min-h-28 rounded-lg border border-input bg-background px-3 py-2 text-xs leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" /></CardContent></Card>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><p className="text-xs text-amber-700 leading-relaxed">本アプリは参考情報を提供するものであり、医学的診断を示すものではありません。異常値は主治医の指示と看護師の専門的判断のもとで確認してください。</p></div>
        <Button className="w-full h-11 gap-2" disabled={isReading} onClick={saveAnalysis}><FlaskConical className="w-4 h-4" />確認済みの数値でレポートを作成・端末内に保存</Button>
      </div>
    </AppLayout>
  );
}
