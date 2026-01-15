import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import {
  FileText,
  Newspaper,
  Puzzle,
  ScrollText,
  Loader2,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ACTION_LABELS = {
  login_success: 'Logowanie',
  login_failed: 'Błędne logowanie',
  logout: 'Wylogowanie',
  page_create: 'Utworzenie strony',
  page_update: 'Aktualizacja strony',
  page_publish: 'Publikacja strony',
  post_create: 'Utworzenie posta',
  post_publish: 'Publikacja posta',
  widget_create: 'Utworzenie widgetu',
  widget_update: 'Aktualizacja widgetu',
  settings_update: 'Zmiana ustawień'
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => localStorage.getItem('accessToken');

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API}/cms/dashboard`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        setStats(await response.json());
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { 
      label: 'Strony', 
      total: stats?.pages?.total || 0, 
      sub: `${stats?.pages?.published || 0} opublikowanych`,
      icon: FileText, 
      color: '#0066FF' 
    },
    { 
      label: 'Posty', 
      total: stats?.posts?.total || 0, 
      sub: `${stats?.posts?.published || 0} opublikowanych`,
      icon: Newspaper, 
      color: '#00CC88' 
    },
    { 
      label: 'Widgety', 
      total: stats?.widgets?.total || 0, 
      sub: `${stats?.widgets?.active || 0} aktywnych`,
      icon: Puzzle, 
      color: '#FF6B35' 
    },
    { 
      label: 'Logi audytu', 
      total: stats?.audit_logs || 0, 
      sub: 'wszystkich akcji',
      icon: ScrollText, 
      color: '#8B5CF6' 
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Przegląd panelu administracyjnego TimeLov</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="bg-[#1A1A1C] border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">{stat.label}</p>
                      <p className="text-3xl font-bold text-white mt-1">{stat.total}</p>
                      <p className="text-xs text-gray-500 mt-1">{stat.sub}</p>
                    </div>
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${stat.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: stat.color }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <Card className="bg-[#1A1A1C] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-[#0066FF]" />
                Ostatnia aktywność
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(stats?.recent_activity || []).slice(0, 8).map((log, idx) => (
                  <div 
                    key={log.id || idx} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      log.action?.includes('success') || log.action?.includes('publish') 
                        ? 'bg-[#00CC88]' 
                        : log.action?.includes('failed') || log.action?.includes('delete')
                        ? 'bg-red-400'
                        : 'bg-gray-400'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {ACTION_LABELS[log.action] || log.action}
                      </p>
                      <p className="text-xs text-gray-500">{log.admin_email}</p>
                    </div>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                ))}
                {(!stats?.recent_activity || stats.recent_activity.length === 0) && (
                  <p className="text-gray-500 text-center py-4">Brak ostatniej aktywności</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-[#1A1A1C] border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#00CC88]" />
                Szybki przegląd
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#0066FF]/10 border border-[#0066FF]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#0066FF]/20 flex items-center justify-center">
                      <Puzzle className="w-5 h-5 text-[#0066FF]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Widgety Elfsight</p>
                      <p className="text-sm text-gray-400">{stats?.widgets?.active || 0} aktywnych widgetów na stronie</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-[#00CC88]/10 border border-[#00CC88]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00CC88]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[#00CC88]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Status CMS</p>
                      <p className="text-sm text-gray-400">Wszystkie systemy działają prawidłowo</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-gray-800/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Treści</p>
                      <p className="text-sm text-gray-400">
                        {stats?.pages?.draft || 0} stron i {stats?.posts?.draft || 0} postów w wersjach roboczych
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
