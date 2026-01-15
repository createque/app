import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  FileText,
  Newspaper,
  Puzzle,
  ScrollText,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [stats, setStats] = useState({
    pages: 0,
    posts: 0,
    widgets: 0,
    auditLogs: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, use mock data since we haven't built the dashboard API yet
    setStats({
      pages: 3,
      posts: 12,
      widgets: 5,
      auditLogs: 47
    });
    
    setRecentLogs([
      { id: 1, action: 'login_success', admin_email: 'admin@timelov.pl', created_at: new Date().toISOString() },
      { id: 2, action: 'widget_update', admin_email: 'admin@timelov.pl', created_at: new Date(Date.now() - 3600000).toISOString() },
      { id: 3, action: 'page_publish', admin_email: 'admin@timelov.pl', created_at: new Date(Date.now() - 7200000).toISOString() },
    ]);
    
    setLoading(false);
  }, []);

  const statCards = [
    { label: 'Strony', value: stats.pages, icon: FileText, color: '#0066FF' },
    { label: 'Posty', value: stats.posts, icon: Newspaper, color: '#00CC88' },
    { label: 'Widgety', value: stats.widgets, icon: Puzzle, color: '#FF6B35' },
    { label: 'Logi audytu', value: stats.auditLogs, icon: ScrollText, color: '#8B5CF6' },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionLabel = (action) => {
    const labels = {
      login_success: 'Logowanie',
      login_failed: 'Błędne logowanie',
      logout: 'Wylogowanie',
      page_create: 'Utworzenie strony',
      page_update: 'Aktualizacja strony',
      page_publish: 'Publikacja strony',
      post_create: 'Utworzenie posta',
      widget_update: 'Aktualizacja widgetu'
    };
    return labels[action] || action;
  };

  const getActionIcon = (action) => {
    if (action.includes('success') || action.includes('publish')) {
      return <CheckCircle2 className="w-4 h-4 text-[#00CC88]" />;
    }
    if (action.includes('failed')) {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    return <Clock className="w-4 h-4 text-gray-400" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
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
                      <p className="text-3xl font-bold text-white mt-1">
                        {loading ? '-' : stat.value}
                      </p>
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

        {/* Content Grid */}
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
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="flex items-center gap-4 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors"
                  >
                    {getActionIcon(log.action)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">
                        {getActionLabel(log.action)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.admin_email}
                      </p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(log.created_at)}
                    </span>
                  </div>
                ))}
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
                      <p className="text-sm text-gray-400">5 aktywnych widgętów na stronie</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-[#00CC88]/10 border border-[#00CC88]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#00CC88]/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-[#00CC88]" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Status strony</p>
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
                      <p className="text-white font-medium">Ostatnia aktualizacja</p>
                      <p className="text-sm text-gray-400">{formatDate(new Date().toISOString())}</p>
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

export default Dashboard;
