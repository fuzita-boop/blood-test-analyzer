import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { referenceRange, statusLabel } from "@/lib/analysis";
import { getRecord } from "@/lib/localStorage";
import type { LocalBloodTestRecord, ScreeningResult } from "@/lib/localTypes";
import { AlertTriangle, ArrowLeft, CheckCircle, Clipboard, FileText, Loader2, Printer, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link, useRoute } from "wouter";

function ValueStatus({ result }: { result: ScreeningResult }) {
  const critical = result.status.startsWith("critical");
  const high = result.status.endsWith("high");
  const color = critical ? "bg-red-50 text-red-700 border-red-200" : high ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200";
  return <Badge variant="outline" className={`text-xs ${color}`}>{statusLabel(result.status)}</Badge>;
}

export default function Report() {
  const [, params] = useRoute("/report/:id");
  const [record, setRecord] = useState<LocalBloodTestRecord | undefined>();
  const [loading, setLoading] = useState(true);
  useEffect(() => { if (params?.id) getRecord(params.id).then(setRecord).finally(() => setLoading(false)); }, [params?.id]);

  const copySummary = async () => {
    if (!record) return;
    await navigator.clipboard.writeText(record.report.recordSummary);
    toast.success("記録用サマリーをコピーしました");
  };

  if (loading) return <AppLayout><div className="min-h-[50vh] flex items-center justify-center"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div></AppLayout>;
  if (!record) return <AppLayout><div className="p-6 lg:p-8 max-w-3xl mx-auto"><Card><CardContent className="p-10 text-center"><FileText className="w-6 h-6 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">この端末に該当する解析履歴がありません。</p><Link href="/history"><Button variant="outline" className="mt-4">履歴へ戻る</Button></Link></CardContent></Card></div></AppLayout>;

  const { report } = record;
  return <AppLayout><div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6 print:p-0"><div className="flex items-start justify-between gap-4 print:hidden"><div><Link href="/history" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ArrowLeft className="w-3.5 h-3.5" />端末内の履歴へ</Link><h1 className="text-2xl font-semibold tracking-tight mt-2">アセスメントレポート</h1><p className="text-sm text-muted-foreground mt-1">端末内保存・性別：{record.gender === "male" ? "男性基準値" : record.gender === "female" ? "女性基準値" : "不明（共通範囲）"}{record.testDate ? `・採血日：${record.testDate}` : ""}</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={copySummary} className="gap-1.5"><Clipboard className="w-3.5 h-3.5" />記録用をコピー</Button><Button variant="outline" size="sm" onClick={() => window.print()} className="gap-1.5"><Printer className="w-3.5 h-3.5" />印刷</Button></div></div>
    <div className="hidden print:block mb-6"><h1 className="text-xl font-semibold">採血データ アセスメントレポート</h1><p className="text-sm mt-1">端末内保存データ・作成日時：{new Date(record.createdAt).toLocaleString("ja-JP")}</p></div>
    <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200 print:border-emerald-300"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><p className="text-xs text-emerald-700 leading-relaxed">本レポートの検査値・レポート本文はこの端末のブラウザ内に保存されています。元の検査票画像は保存していません。</p></div>
    <Card className="border-border shadow-none"><CardHeader><CardTitle className="text-base">■ 1. スクリーニング結果（異常値のサマリー）</CardTitle></CardHeader><CardContent>{report.abnormalSummary.length ? <div className="overflow-x-auto border border-border rounded-lg"><table className="w-full min-w-[620px] text-sm"><thead className="bg-muted/50"><tr><th className="p-3 text-left font-medium text-muted-foreground">検査項目</th><th className="p-3 text-left font-medium text-muted-foreground">実測値</th><th className="p-3 text-left font-medium text-muted-foreground">一般的な基準値</th><th className="p-3 text-left font-medium text-muted-foreground">判定</th></tr></thead><tbody>{report.abnormalSummary.map((result, index) => <tr key={`${result.item}-${index}`} className="border-t border-border"><td className="p-3">{result.fullName}</td><td className="p-3 font-medium">{result.displayValue} {result.unit}</td><td className="p-3 text-muted-foreground">{referenceRange(result)}</td><td className="p-3"><ValueStatus result={result} /></td></tr>)}</tbody></table></div> : <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 text-sm text-emerald-700"><CheckCircle className="w-4 h-4" />基準値テーブルに照合できた項目に、一般的な基準値からの逸脱はありません。</div>}<p className="text-xs text-muted-foreground mt-3">未検査・数値未記載の項目は判定対象から除外しています。</p></CardContent></Card>
    <Card className="border-border shadow-none"><CardHeader><CardTitle className="text-base">■ 2. 予測される状態・疑われる疾患の可能性（※参考情報）</CardTitle></CardHeader><CardContent>{report.predictedConditions.length ? <ul className="space-y-3">{report.predictedConditions.map((condition, index) => <li key={index} className="text-sm leading-relaxed"><span className="font-medium">{condition.condition}</span><span className="text-muted-foreground">（関連項目：{condition.relatedItems.join("、")}）</span></li>)}</ul> : <p className="text-sm text-muted-foreground">異常値に基づく特記すべき状態の推測は行いません。</p>}</CardContent></Card>
    <Card className="border-border shadow-none"><CardHeader><CardTitle className="text-base">■ 3. 現場での観察・アセスメントポイント</CardTitle></CardHeader><CardContent><ul className="space-y-2">{report.observationPoints.map((point, index) => <li key={index} className="text-sm leading-relaxed flex gap-2"><span className="text-primary">•</span>{point}</li>)}</ul></CardContent></Card>
    <Card className="border-border shadow-none"><CardHeader><CardTitle className="text-base">■ 4. 記録用サマリー</CardTitle></CardHeader><CardContent><p className="text-sm leading-7 whitespace-pre-wrap">{report.recordSummary}</p></CardContent></Card>
    <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><p className="text-xs text-amber-700 leading-relaxed">本データは一般的な基準値による参考情報であり、医学的診断を示すものではありません。異常値については必ず主治医の指示を仰ぎ、看護師の専門的判断のもと対応してください。</p></div>
  </div></AppLayout>;
}
