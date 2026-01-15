import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  ScrollText,
  Loader2,
  Download,
  Filter,
  User,
  FileText,
  Newspaper,
  Puzzle,
  Settings,
  LogIn,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ACTION_LABELS = {
  login_success: 'Logowanie',
  login_failed: 'Błędne logowanie',
  logout: 'Wylogowanie',
  token_refresh: 'Odświeżenie tokena',
  password_reset_request: 'Reset hasła (request)',
  password_reset_success: 'Reset hasła (sukces)',
  page_create: 'Utworzenie strony',
  page_update: 'Aktualizacja strony',
  page_delete: 'Usunięcie strony',
  page_publish: 'Publikacja strony',
  page_unpublish: 'Cofnięcie publikacji',
  post_create: 'Utworzenie posta',
  post_update: 'Aktualizacja posta',
  post_delete: 'Usunięcie posta',
  post_publish: 'Publikacja posta',
  post_archive: 'Archiwizacja posta',
  widget_create: 'Utworzenie widgetu',
  widget_update: 'Aktualizacja widgetu',
  widget_delete: 'Usunięcie widgetu',
  widget_activate: 'Aktywacja widgetu',
  widget_deactivate: 'Dezaktywacja widgetu',
  settings_update: 'Zmiana ustawień'
};

const ENTITY_ICONS = {
  auth: LogIn,
  page: FileText,
  post: Newspaper,
  widget: Puzzle,
  setting: Settings,
  user: User
};

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entityFilter, setEntityFilter] = useState('all');
  const [stats, setStats] = useState(null);

  const getToken = () => localStorage.getItem('accessToken');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API}/cms/audit-logs?limit=100`;
      if (entityFilter !== 'all') {
        url += `&entity_type=${entityFilter}`;
      }
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        setLogs(await response.json());
      }
    } catch (error) {
      toast.error('Błąd podczas pobierania logów');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API}/cms/audit-logs/stats`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [entityFilter]);

  const handleExport = async () => {
    try {
      const response = await fetch(`${API}/cms/audit-logs/export`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Logi wyeksportowane');
      }
    } catch (error) {
      toast.error('Błąd eksportu');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action) => {
    if (action.includes('success') || action.includes('create') || action.includes('publish') || action.includes('activate')) {
      return 'bg-[#00CC88]/20 text-[#00CC88]';
    }
    if (action.includes('failed') || action.includes('delete')) {
      return 'bg-red-500/20 text-red-400';
    }
    if (action.includes('update') || action.includes('unpublish') || action.includes('deactivate')) {
      return 'bg-orange-500/20 text-orange-400';
    }
    return 'bg-gray-700 text-gray-300';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Logi audytu</h1>
            <p className="text-gray-400 mt-1">
              Historia wszystkich akcji w panelu {stats && `(łącznie ${stats.total})`}
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <Download className="w-4 h-4 mr-2" />Eksportuj CSV
          </Button>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-[#1A1A1C] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-sm text-gray-400">Łącznie logów</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1A1A1C] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#00CC88]">{stats.by_entity?.page || 0}</div>
                <div className="text-sm text-gray-400">Akcje: Strony</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1A1A1C] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-[#0066FF]">{stats.by_entity?.post || 0}</div>
                <div className="text-sm text-gray-400">Akcje: Posty</div>
              </CardContent>
            </Card>
            <Card className="bg-[#1A1A1C] border-gray-800">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-400">{stats.by_entity?.auth || 0}</div>
                <div className="text-sm text-gray-400">Akcje: Auth</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-sm">Filtruj:</span>
          </div>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger className="w-[180px] bg-[#1A1A1C] border-gray-700 text-white">
              <SelectValue placeholder="Typ" />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1C] border-gray-700">
              <SelectItem value="all" className="text-white">Wszystkie</SelectItem>
              <SelectItem value="auth" className="text-white">Autoryzacja</SelectItem>
              <SelectItem value="page" className="text-white">Strony</SelectItem>
              <SelectItem value="post" className="text-white">Posty</SelectItem>
              <SelectItem value="widget" className="text-white">Widgety</SelectItem>
              <SelectItem value="setting" className="text-white">Ustawienia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Logs Table */}
        <Card className="bg-[#1A1A1C] border-gray-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-16">
                <ScrollText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">Brak logów</h3>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400">Użytkownik</TableHead>
                    <TableHead className="text-gray-400">Akcja</TableHead>
                    <TableHead className="text-gray-400">Typ</TableHead>
                    <TableHead className="text-gray-400">IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const EntityIcon = ENTITY_ICONS[log.entity_type] || ScrollText;
                    return (
                      <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/50">
                        <TableCell className="text-gray-400 text-sm">{formatDate(log.created_at)}</TableCell>
                        <TableCell className="text-white">{log.admin_email || '-'}</TableCell>
                        <TableCell>
                          <Badge className={getActionColor(log.action)}>
                            {ACTION_LABELS[log.action] || log.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-gray-400">
                            <EntityIcon className="w-4 h-4" />
                            <span className="capitalize">{log.entity_type}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm font-mono">{log.ip_address}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AuditLogsPage;
