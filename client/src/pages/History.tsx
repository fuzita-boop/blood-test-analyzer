import AppLayout from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearRecords, deleteRecord, exportLocalData, getRecords, importLocalData } from "@/lib/localStorage";
import type { LocalBloodTestRecord } from "@/lib/localTypes";
import { AlertTriangle, Download, FileText, FolderOpen, Search, Trash2, Upload, UploadCloud } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function History() {
  const [records, setRecords] = useState<LocalBloodTestRecord[]>([]);
  const [query, setQuery] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => getRecords().then(setRecords);
  useEffect(() => { refresh(); }, []);
  const filtered = records.filter((record) => `${record.testDate ?? ""} ${record.report.recordSummary}`.toLowerCase().includes(query.toLowerCase()));

  const downloadBackup = async () => {
    const backup = await exportLocalData();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `採血解析バックアップ-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success(`${backup.records.length}件の端末内データをバックアップしました`);
  };

  const uploadBackup = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      const count = await importLocalData(data);
      await refresh();
      toast.success(`${count}件の履歴を端末内に取り込みました`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "バックアップの読み込みに失敗しました");
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm("この解析履歴を端末内から削除しますか？この操作は取り消せません。")) return;
    await deleteRecord(id);
    await refresh();
    toast.success("端末内の解析履歴を削除しました");
  };

  const clearAll = async () => {
    if (!window.confirm("端末内の解析履歴をすべて削除しますか？必要であれば先にJSONバックアップを保存してください。")) return;
    await clearRecords();
    await refresh();
    toast.success("端末内の解析履歴をすべて削除しました");
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div><p className="text-xs font-medium text-primary tracking-wide">ON-DEVICE HISTORY</p><h1 className="text-2xl font-semibold tracking-tight mt-1">端末内の解析履歴</h1><p className="text-sm text-muted-foreground mt-1">保存先はこのブラウザのIndexedDBです。別の端末・ブラウザからは閲覧できません。</p></div>
          <div className="flex flex-wrap gap-2"><Button variant="outline" size="sm" className="gap-1.5" onClick={downloadBackup}><Download className="w-3.5 h-3.5" />JSONバックアップ</Button><Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()}><UploadCloud className="w-3.5 h-3.5" />復元</Button><input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadBackup(file); event.target.value = ""; }} /></div>
        </div>
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200"><FolderOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" /><p className="text-xs text-blue-700 leading-relaxed">ブラウザのキャッシュ・サイトデータを消去すると履歴も削除されます。端末の変更やブラウザの初期化前に、必ずJSONバックアップを保存してください。バックアップには画像は含まれません。</p></div>
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="採血日・記録内容で検索" className="w-full h-10 pl-9 pr-3 rounded-lg border border-input bg-background text-sm" /></div>
        <Card className="border-border shadow-none"><CardHeader className="pb-3"><div className="flex items-center justify-between"><CardTitle className="text-base">解析履歴</CardTitle><span className="text-xs text-muted-foreground">{filtered.length}件</span></div></CardHeader><CardContent className="pt-0">
          {filtered.length === 0 ? <div className="text-center py-12"><FileText className="w-6 h-6 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-muted-foreground">{records.length ? "条件に一致する履歴がありません" : "端末内の解析履歴がありません"}</p>{!records.length && <Link href="/upload"><Button variant="outline" size="sm" className="mt-4 gap-1.5"><Upload className="w-3.5 h-3.5" />最初の解析を開始</Button></Link>}</div> : <div className="divide-y divide-border">{filtered.map((record) => <div key={record.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center"><span className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0"><FileText className="w-4 h-4 text-muted-foreground" /></span><div className="flex-1 min-w-0"><p className="text-sm font-medium">採血解析 {record.testDate ? `（採血日：${record.testDate}）` : ""}</p><p className="text-xs text-muted-foreground mt-1">保存日時：{formatDate(record.createdAt)}・測定値 {record.extractedItems.filter((item) => item.value !== null).length}項目・性別：{record.gender === "male" ? "男性" : record.gender === "female" ? "女性" : "不明"}</p></div>{record.report.abnormalSummary.length > 0 ? <Badge variant="outline" className="w-fit bg-amber-50 text-amber-700 border-amber-200">要確認 {record.report.abnormalSummary.length}</Badge> : <Badge variant="outline" className="w-fit bg-emerald-50 text-emerald-700 border-emerald-200">基準値内</Badge>}<div className="flex gap-1"><Link href={`/report/${record.id}`}><Button variant="outline" size="sm">レポート</Button></Link><Button aria-label="削除" variant="ghost" size="icon" onClick={() => remove(record.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></Button></div></div>)}</div>}
        </CardContent></Card>
        {records.length > 0 && <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={clearAll} className="gap-1.5 text-muted-foreground hover:text-destructive"><AlertTriangle className="w-3.5 h-3.5" />端末内の履歴をすべて削除</Button></div>}
      </div>
    </AppLayout>
  );
}
