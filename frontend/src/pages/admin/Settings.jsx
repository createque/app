import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Settings as SettingsIcon, Loader2, Save, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SettingsPage = () => {
  const [settings, setSettings] = useState({
    site_name: '',
    site_description: '',
    admin_email: '',
    maintenance_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getToken = () => localStorage.getItem('accessToken');

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API}/cms/settings`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        setSettings(await response.json());
      }
    } catch (error) {
      toast.error('Błąd podczas pobierania ustawień');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API}/cms/settings`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      if (response.ok) {
        toast.success('Ustawienia zapisane');
      } else {
        toast.error('Błąd podczas zapisywania');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    } finally {
      setSaving(false);
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-white">Ustawienia</h1>
          <p className="text-gray-400 mt-1">Konfiguracja strony</p>
        </div>

        <Card className="bg-[#1A1A1C] border-gray-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-[#0066FF]" />
              Ustawienia ogólne
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="site_name" className="text-gray-300">Nazwa strony</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) => setSettings(s => ({ ...s, site_name: e.target.value }))}
                className="bg-[#0F0F10] border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site_description" className="text-gray-300">Opis strony</Label>
              <Input
                id="site_description"
                value={settings.site_description}
                onChange={(e) => setSettings(s => ({ ...s, site_description: e.target.value }))}
                className="bg-[#0F0F10] border-gray-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin_email" className="text-gray-300">Email administratora</Label>
              <Input
                id="admin_email"
                type="email"
                value={settings.admin_email}
                onChange={(e) => setSettings(s => ({ ...s, admin_email: e.target.value }))}
                className="bg-[#0F0F10] border-gray-700 text-white"
              />
            </div>

            <div className="pt-4 border-t border-gray-800">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="maintenance" className="text-gray-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    Tryb konserwacji
                  </Label>
                  <p className="text-sm text-gray-500">
                    Włącz, aby wyświetlać stronę konserwacji dla użytkowników
                  </p>
                </div>
                <Switch
                  id="maintenance"
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => setSettings(s => ({ ...s, maintenance_mode: checked }))}
                />
              </div>
              
              {settings.maintenance_mode && (
                <div className="mt-4 p-4 rounded-lg bg-orange-500/10 border border-orange-500/30">
                  <p className="text-orange-400 text-sm">
                    Uwaga: Tryb konserwacji jest włączony. Strona publiczna może być niedostępna.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Zapisywanie...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" />Zapisz ustawienia</>
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
