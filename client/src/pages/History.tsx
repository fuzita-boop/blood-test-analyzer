import AppLayout from "@/components/AppLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import {
  FileText,
  Upload,
  Search,
  ArrowRight,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    completed: {
      label: "完了",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle className="w-3 h-3" />,
    },
    processing: {
      label: "処理中",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      icon: <Loader2 className="w-3 h-3 animate-spin" />,
    },
    error: {
      label: "エラー",
      className: "bg-red-50 text-red-700 border-red-200",
      icon: <AlertCircle className="w-3 h-3" />,
    },
    uploading: {
      label: "アップロード中",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <Clock className="w-3 h-3" />,
    },
  };
  const c = config[status] ?? { label: status, className: "", icon: null };
  return (
    <Badge variant="outline" className={`text-xs gap-1 ${c.className}`}>
      {c.icon}
      {c.label}
    </Badge>
  );
}

export default function History() {
  const [search, setSearch] = useState("");
  const { data: records, isLoading } = trpc.bloodTest.list.useQuery({ patientId: undefined });

  const filtered = records?.filter((r) => {
    if (!search) return true;
    return String(r.id).includes(search);
  }) ?? [];

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">解析履歴</h1>
            <p className="text-muted-foreground text-sm mt-1">過去の採血データ解析結果を確認できます</p>
          </div>
          <Link href="/upload">
            <Button size="sm" className="gap-2">
              <Upload className="w-3.5 h-3.5" />
              新規解析
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="解析IDで検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Records */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">
              {search ? "検索結果がありません" : "解析履歴がありません"}
            </p>
            {!search && (
              <Link href="/upload">
                <Button variant="outline" size="sm" className="mt-4 gap-2">
                  <Upload className="w-3.5 h-3.5" />
                  最初の解析を開始
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((record) => {
              const extractedData = record.extractedData as { items?: unknown[] } | null;
              const itemCount = extractedData?.items?.length ?? 0;

              return (
                <Card key={record.id} className="border-border shadow-none hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground">
                            解析 #{record.id}
                          </span>
                          <StatusBadge status={record.status} />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(record.createdAt), "yyyy年M月d日 HH:mm", { locale: ja })}
                          </span>
                          {record.testDate && (
                            <span className="text-xs text-muted-foreground">
                              採血日: {format(new Date(record.testDate), "yyyy年M月d日", { locale: ja })}
                            </span>
                          )}
                          {itemCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {itemCount}項目抽出
                            </span>
                          )}
                        </div>
                        {record.errorMessage && (
                          <p className="text-xs text-red-600 mt-1 truncate">{record.errorMessage}</p>
                        )}
                      </div>

                      {/* Action */}
                      {record.status === "completed" && (
                        <Link href={`/report/${record.id}`}>
                          <Button variant="outline" size="sm" className="gap-1.5 text-xs shrink-0">
                            レポート
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Count */}
        {filtered.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {filtered.length}件の解析記録
          </p>
        )}
      </div>
    </AppLayout>
  );
}
