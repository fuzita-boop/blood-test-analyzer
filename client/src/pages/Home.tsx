import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Upload,
  FileText,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { label: "完了", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    processing: { label: "処理中", className: "bg-blue-50 text-blue-700 border-blue-200" },
    error: { label: "エラー", className: "bg-red-50 text-red-700 border-red-200" },
    uploading: { label: "アップロード中", className: "bg-amber-50 text-amber-700 border-amber-200" },
  }[status] ?? { label: status, className: "" };

  return (
    <Badge variant="outline" className={`text-xs ${config.className}`}>
      {config.label}
    </Badge>
  );
}

export default function Home() {
  const { data: records, isLoading: recordsLoading } = trpc.bloodTest.list.useQuery({ patientId: undefined });
  const { data: patients, isLoading: patientsLoading } = trpc.patient.list.useQuery();
  const { data: reports } = trpc.report.list.useQuery({ patientId: undefined });

  const completedCount = records?.filter((r) => r.status === "completed").length ?? 0;
  const processingCount = records?.filter((r) => r.status === "processing").length ?? 0;
  const recentRecords = records?.slice(0, 5) ?? [];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">ダッシュボード</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {format(new Date(), "yyyy年M月d日（E）", { locale: ja })}
            </p>
          </div>
          <Link href="/upload">
            <Button className="gap-2">
              <Upload className="w-4 h-4" />
              新規解析
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">総解析数</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{records?.length ?? 0}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-xs text-muted-foreground">完了</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-xs text-muted-foreground">処理中</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{processingCount}</p>
            </CardContent>
          </Card>

          <Card className="border-border shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center">
                  <Users className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-xs text-muted-foreground">患者数</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{patients?.length ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/upload">
            <Card className="border-border shadow-none hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">採血データを解析</p>
                  <p className="text-xs text-muted-foreground mt-0.5">画像をアップロードして自動解析</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/history">
            <Card className="border-border shadow-none hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">解析履歴を確認</p>
                  <p className="text-xs text-muted-foreground mt-0.5">過去のレポートを閲覧</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/patients">
            <Card className="border-border shadow-none hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer group">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">患者を管理</p>
                  <p className="text-xs text-muted-foreground mt-0.5">患者情報と経時変化を追跡</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Recent Records */}
        <Card className="border-border shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">最近の解析</CardTitle>
              <Link href="/history">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-muted-foreground hover:text-foreground">
                  すべて表示
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {recordsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : recentRecords.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">解析履歴がありません</p>
                <Link href="/upload">
                  <Button variant="outline" size="sm" className="mt-3 gap-2">
                    <Upload className="w-3 h-3" />
                    最初の解析を開始
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-center gap-4 py-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        採血記録 #{record.id}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(record.createdAt), "M月d日 HH:mm", { locale: ja })}
                      </p>
                    </div>
                    <StatusBadge status={record.status} />
                    {record.status === "completed" && (
                      <Link href={`/report/${record.id}`}>
                        <Button variant="ghost" size="sm" className="text-xs h-7 px-2">
                          レポート
                        </Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 leading-relaxed">
            本システムはAIによる参考情報を提供するものであり、医学的診断を示すものではありません。
            異常値については必ず主治医の指示を仰ぎ、看護師の専門的判断のもと対応してください。
          </p>
        </div>
      </div>
    </AppLayout>
  );
}
