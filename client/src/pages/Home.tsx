import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRecords } from "@/lib/localStorage";
import type { LocalBloodTestRecord } from "@/lib/localTypes";
import { Activity, AlertTriangle, ArrowRight, CheckCircle, Database, FileText, ShieldCheck, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function Home() {
  const [records, setRecords] = useState<LocalBloodTestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecords().then(setRecords).finally(() => setLoading(false));
  }, []);

  const abnormalCount = records.filter((record) => record.report.abnormalSummary.length > 0).length;
  const recent = records.slice(0, 5);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-primary tracking-wide">LOCAL FIRST</p>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight mt-1">ダッシュボード</h1>
            <p className="text-muted-foreground text-sm mt-1">データは端末内にのみ保存され、サーバーへ送信されません。</p>
          </div>
          <Link href="/upload"><Button className="gap-2"><Upload className="w-4 h-4" />新規解析</Button></Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border shadow-none"><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></span><span className="text-xs text-muted-foreground">端末内の解析</span></div><p className="text-2xl font-bold">{records.length}</p></CardContent></Card>
          <Card className="border-border shadow-none"><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><span className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-600" /></span><span className="text-xs text-muted-foreground">要確認の記録</span></div><p className="text-2xl font-bold">{abnormalCount}</p></CardContent></Card>
          <Card className="border-border shadow-none"><CardContent className="p-5"><div className="flex items-center justify-between mb-3"><span className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle className="w-4 h-4 text-emerald-600" /></span><span className="text-xs text-muted-foreground">オフライン対応</span></div><p className="text-base font-semibold">利用可能</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/upload"><Card className="border-border shadow-none hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"><CardContent className="p-5 flex items-center gap-4"><span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Upload className="w-5 h-5 text-primary" /></span><div className="flex-1"><p className="text-sm font-medium">採血データを解析</p><p className="text-xs text-muted-foreground mt-0.5">端末内OCRまたは手入力で解析</p></div><ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" /></CardContent></Card></Link>
          <Link href="/history"><Card className="border-border shadow-none hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group"><CardContent className="p-5 flex items-center gap-4"><span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Activity className="w-5 h-5 text-primary" /></span><div className="flex-1"><p className="text-sm font-medium">端末内の履歴を確認</p><p className="text-xs text-muted-foreground mt-0.5">このブラウザ内の保存データを閲覧</p></div><ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" /></CardContent></Card></Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 border border-emerald-200"><ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /><div><p className="text-xs font-medium text-emerald-700">端末内保存・画像は保持しません</p><p className="text-xs text-emerald-700/80 mt-1 leading-relaxed">画像は読み取り処理中のメモリ内でのみ扱い、解析完了後に保持しません。検査値とレポートだけをこの端末のブラウザ内に保存します。</p></div></div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200"><Database className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /><div><p className="text-xs font-medium text-blue-700">データ保護のお願い</p><p className="text-xs text-blue-700/80 mt-1 leading-relaxed">ブラウザのサイトデータを削除すると履歴も消えます。必要に応じて履歴画面からJSONバックアップを保存してください。</p></div></div>
        </div>

        <Card className="border-border shadow-none"><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base font-semibold">最近の解析</CardTitle><Link href="/history"><Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground">すべて表示<ArrowRight className="w-3 h-3" /></Button></Link></div></CardHeader><CardContent className="pt-0">
          {loading ? <div className="h-20 bg-muted rounded-lg animate-pulse" /> : recent.length === 0 ? <div className="text-center py-10"><FileText className="w-5 h-5 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">この端末にはまだ解析履歴がありません</p></div> : <div className="divide-y divide-border">{recent.map((record) => <div key={record.id} className="flex items-center gap-4 py-3"><span className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center"><FileText className="w-4 h-4 text-muted-foreground" /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium">採血解析</p><p className="text-xs text-muted-foreground">{formatDate(record.createdAt)}・{record.extractedItems.filter((item) => item.value !== null).length}項目</p></div>{record.report.abnormalSummary.length > 0 ? <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">要確認 {record.report.abnormalSummary.length}</Badge> : <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">基準値内</Badge>}<Link href={`/report/${record.id}`}><Button variant="ghost" size="sm" className="text-xs">レポート</Button></Link></div>)}</div>}
        </CardContent></Card>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200"><AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" /><p className="text-xs text-amber-700 leading-relaxed">本アプリは一般的な基準値によるアセスメント補助であり、医学的診断を示すものではありません。異常値は主治医の指示と看護師の専門的判断のもとで対応してください。</p></div>
      </div>
    </AppLayout>
  );
}
