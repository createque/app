import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { 
  Settings as SettingsIcon, 
  Loader2, 
  Save, 
  AlertTriangle,
  Palette,
  Search,
  Navigation,
  Puzzle,
  Globe,
  Upload,
  Trash2,
  Plus,
  ExternalLink,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Code,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const FONT_OPTIONS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins', 
  'Source Sans Pro', 'Nunito', 'Raleway', 'Work Sans'
];

const INJECTION_POSITIONS = [
  { value: 'header', label: 'Header (przed </head>)' },
  { value: 'footer', label: 'Footer' },
  { value: 'before_body_close', label: 'Przed </body>' },
  { value: 'after_body_open', label: 'Po <body>' },
  { value: 'custom', label: 'Niestandardowa' },
];

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [activeTab, setActiveTab] = useState('branding');

  const getToken = () => localStorage.getItem('accessToken');

  const fetchSettings = useCallback(async () => {
    try {
      const response = await fetch(`${API}/cms/settings`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      toast.error('Błąd podczas pobierania ustawień');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSection = async (section, data) => {
    setSaving(prev => ({ ...prev, [section]: true }));
    try {
      const response = await fetch(`${API}/cms/settings/${section}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const result = await response.json();
        setSettings(prev => ({ ...prev, [section]: result[section] || data }));
        toast.success('Ustawienia zapisane');
      } else {
        toast.error('Błąd podczas zapisywania');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    } finally {
      setSaving(prev => ({ ...prev, [section]: false }));
    }
  };

  const updateIntegration = async (integrationId, data) => {
    setSaving(prev => ({ ...prev, [`int_${integrationId}`]: true }));
    try {
      const response = await fetch(`${API}/cms/settings/integrations/${integrationId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        await fetchSettings();
        toast.success('Integracja zaktualizowana');
      } else {
        toast.error('Błąd podczas aktualizacji');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    } finally {
      setSaving(prev => ({ ...prev, [`int_${integrationId}`]: false }));
    }
  };

  const toggleIntegration = async (integrationId) => {
    try {
      const response = await fetch(`${API}/cms/settings/integrations/${integrationId}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        await fetchSettings();
        toast.success('Status integracji zmieniony');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const updateNavSection = async (sectionId, data) => {
    try {
      const response = await fetch(`${API}/cms/settings/navigation/sections/${sectionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        await fetchSettings();
        toast.success('Sekcja zaktualizowana');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const resetToDefaults = async () => {
    if (!window.confirm('Czy na pewno chcesz przywrócić domyślne ustawienia? Ta akcja jest nieodwracalna.')) return;
    
    try {
      const response = await fetch(`${API}/cms/settings/reset`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        await fetchSettings();
        toast.success('Ustawienia przywrócone do domyślnych');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  const uploadFile = async (file, onSuccess) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API}/cms/settings/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}` },
        body: formData
      });
      if (response.ok) {
        const result = await response.json();
        onSuccess(result.url);
        toast.success('Plik przesłany');
      } else {
        toast.error('Błąd przesyłania pliku');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    }
  };

  if (loading || !settings) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const { branding = {}, seo = {}, navigation = {}, integrations = {}, general = {} } = settings;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Ustawienia CMS</h1>
            <p className="text-gray-400 mt-1">Pełna konfiguracja strony i integracji</p>
          </div>
          <Button
            variant="outline"
            onClick={resetToDefaults}
            className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Przywróć domyślne
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-[#1A1A1C] border border-gray-800 p-1 mb-6">
            <TabsTrigger value="branding" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white">
              <Palette className="w-4 h-4 mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="navigation" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white">
              <Navigation className="w-4 h-4 mr-2" />
              Nawigacja
            </TabsTrigger>
            <TabsTrigger value="integrations" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white">
              <Puzzle className="w-4 h-4 mr-2" />
              Integracje
            </TabsTrigger>
            <TabsTrigger value="general" className="data-[state=active]:bg-[#0066FF] data-[state=active]:text-white">
              <Globe className="w-4 h-4 mr-2" />
              Ogólne
            </TabsTrigger>
          </TabsList>

          {/* BRANDING TAB */}
          <TabsContent value="branding">
            <BrandingSection 
              branding={branding} 
              onSave={(data) => saveSection('branding', data)}
              saving={saving.branding}
              uploadFile={uploadFile}
            />
          </TabsContent>

          {/* SEO TAB */}
          <TabsContent value="seo">
            <SEOSection 
              seo={seo} 
              onSave={(data) => saveSection('seo', data)}
              saving={saving.seo}
              uploadFile={uploadFile}
            />
          </TabsContent>

          {/* NAVIGATION TAB */}
          <TabsContent value="navigation">
            <NavigationSection 
              navigation={navigation}
              onUpdate={updateNavSection}
              onRefresh={fetchSettings}
            />
          </TabsContent>

          {/* INTEGRATIONS TAB */}
          <TabsContent value="integrations">
            <IntegrationsSection 
              integrations={integrations}
              onUpdate={updateIntegration}
              onToggle={toggleIntegration}
              saving={saving}
              onRefresh={fetchSettings}
            />
          </TabsContent>

          {/* GENERAL TAB */}
          <TabsContent value="general">
            <GeneralSection 
              general={general}
              onSave={(data) => saveSection('general', data)}
              saving={saving.general}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

// ═══════════════════════════════════════
// BRANDING SECTION COMPONENT
// ═══════════════════════════════════════
const BrandingSection = ({ branding, onSave, saving, uploadFile }) => {
  const [data, setData] = useState(branding);

  useEffect(() => setData(branding), [branding]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, (url) => setData(d => ({ ...d, logo_url: url })));
    }
  };

  const handleFaviconUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file, (url) => setData(d => ({ ...d, favicon_url: url })));
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#0066FF]" />
            Logo i Favicon
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Logo */}
            <div className="space-y-3">
              <Label className="text-gray-300">Logo</Label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-lg bg-[#0F0F10] border border-gray-700 flex items-center justify-center overflow-hidden">
                  {data.logo_url ? (
                    <img src={data.logo_url.startsWith('/') ? `${BACKEND_URL}${data.logo_url}` : data.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" id="logo-upload" />
                  <label htmlFor="logo-upload">
                    <Button type="button" variant="outline" size="sm" className="border-gray-700 text-gray-300" asChild>
                      <span><Upload className="w-4 h-4 mr-2" />Prześlij logo</span>
                    </Button>
                  </label>
                </div>
              </div>
              <Input
                value={data.logo_alt || ''}
                onChange={(e) => setData(d => ({ ...d, logo_alt: e.target.value }))}
                placeholder="Alt tekst logo"
                className="bg-[#0F0F10] border-gray-700 text-white"
              />
            </div>

            {/* Favicon */}
            <div className="space-y-3">
              <Label className="text-gray-300">Favicon</Label>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#0F0F10] border border-gray-700 flex items-center justify-center overflow-hidden">
                  {data.favicon_url ? (
                    <img src={data.favicon_url.startsWith('/') ? `${BACKEND_URL}${data.favicon_url}` : data.favicon_url} alt="Favicon" className="w-8 h-8 object-contain" />
                  ) : (
                    <Globe className="w-6 h-6 text-gray-600" />
                  )}
                </div>
                <div>
                  <input type="file" accept="image/*,.ico" onChange={handleFaviconUpload} className="hidden" id="favicon-upload" />
                  <label htmlFor="favicon-upload">
                    <Button type="button" variant="outline" size="sm" className="border-gray-700 text-gray-300" asChild>
                      <span><Upload className="w-4 h-4 mr-2" />Prześlij favicon</span>
                    </Button>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Kolory marki</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.primary_color || '#0066FF'}
                  onChange={(e) => setData(d => ({ ...d, primary_color: e.target.value }))}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent"
                />
                <Input
                  value={data.primary_color || '#0066FF'}
                  onChange={(e) => setData(d => ({ ...d, primary_color: e.target.value }))}
                  className="bg-[#0F0F10] border-gray-700 text-white flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Secondary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.secondary_color || '#00CC88'}
                  onChange={(e) => setData(d => ({ ...d, secondary_color: e.target.value }))}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent"
                />
                <Input
                  value={data.secondary_color || '#00CC88'}
                  onChange={(e) => setData(d => ({ ...d, secondary_color: e.target.value }))}
                  className="bg-[#0F0F10] border-gray-700 text-white flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Accent Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={data.accent_color || '#1A1A1A'}
                  onChange={(e) => setData(d => ({ ...d, accent_color: e.target.value }))}
                  className="w-12 h-10 rounded cursor-pointer bg-transparent"
                />
                <Input
                  value={data.accent_color || '#1A1A1A'}
                  onChange={(e) => setData(d => ({ ...d, accent_color: e.target.value }))}
                  className="bg-[#0F0F10] border-gray-700 text-white flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Typografia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-300">Czcionka</Label>
              <Select value={data.font_family || 'Inter'} onValueChange={(v) => setData(d => ({ ...d, font_family: v }))}>
                <SelectTrigger className="bg-[#0F0F10] border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1A1C] border-gray-700">
                  {FONT_OPTIONS.map(font => (
                    <SelectItem key={font} value={font} className="text-white hover:bg-[#0066FF]/20">
                      <span style={{ fontFamily: font }}>{font}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Bazowy rozmiar czcionki</Label>
              <Input
                value={data.base_font_size || '16px'}
                onChange={(e) => setData(d => ({ ...d, base_font_size: e.target.value }))}
                className="bg-[#0F0F10] border-gray-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Teksty podstawowe</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Tagline strony</Label>
            <Input
              value={data.site_tagline || ''}
              onChange={(e) => setData(d => ({ ...d, site_tagline: e.target.value }))}
              placeholder="Centralna kontrola zasobami, ludźmi i procesami"
              className="bg-[#0F0F10] border-gray-700 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Meta Description (domyślny)</Label>
            <Textarea
              value={data.meta_description || ''}
              onChange={(e) => setData(d => ({ ...d, meta_description: e.target.value }))}
              rows={3}
              className="bg-[#0F0F10] border-gray-700 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => onSave(data)} disabled={saving} className="bg-[#0066FF] hover:bg-[#0052CC]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Zapisz branding
        </Button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// SEO SECTION COMPONENT
// ═══════════════════════════════════════
const SEOSection = ({ seo, onSave, saving, uploadFile }) => {
  const [data, setData] = useState(seo);

  useEffect(() => setData(seo), [seo]);

  const handleOGImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, (url) => setData(d => ({ ...d, og_image_url: url })));
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5 text-[#0066FF]" />
            Meta tagi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-gray-300">Meta Title</Label>
            <Input value={data.meta_title || ''} onChange={(e) => setData(d => ({ ...d, meta_title: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Meta Description</Label>
            <Textarea value={data.meta_description || ''} onChange={(e) => setData(d => ({ ...d, meta_description: e.target.value }))} rows={3} className="bg-[#0F0F10] border-gray-700 text-white" />
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Meta Keywords</Label>
            <Input value={data.meta_keywords || ''} onChange={(e) => setData(d => ({ ...d, meta_keywords: e.target.value }))} placeholder="słowo1, słowo2, słowo3" className="bg-[#0F0F10] border-gray-700 text-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Open Graph</CardTitle>
          <CardDescription className="text-gray-500">Ustawienia dla udostępniania na Facebooku i LinkedIn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">OG Title</Label>
              <Input value={data.og_title || ''} onChange={(e) => setData(d => ({ ...d, og_title: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">OG Image</Label>
              <div className="flex gap-2">
                <Input value={data.og_image_url || ''} onChange={(e) => setData(d => ({ ...d, og_image_url: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white flex-1" />
                <input type="file" accept="image/*" onChange={handleOGImageUpload} className="hidden" id="og-image-upload" />
                <label htmlFor="og-image-upload">
                  <Button type="button" variant="outline" size="icon" className="border-gray-700" asChild>
                    <span><Upload className="w-4 h-4" /></span>
                  </Button>
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">OG Description</Label>
            <Textarea value={data.og_description || ''} onChange={(e) => setData(d => ({ ...d, og_description: e.target.value }))} rows={2} className="bg-[#0F0F10] border-gray-700 text-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Twitter Cards</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Twitter Title</Label>
              <Input value={data.twitter_title || ''} onChange={(e) => setData(d => ({ ...d, twitter_title: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Twitter Image URL</Label>
              <Input value={data.twitter_image_url || ''} onChange={(e) => setData(d => ({ ...d, twitter_image_url: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Twitter Description</Label>
            <Textarea value={data.twitter_description || ''} onChange={(e) => setData(d => ({ ...d, twitter_description: e.target.value }))} rows={2} className="bg-[#0F0F10] border-gray-700 text-white" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Analytics i Tracking</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Google Analytics ID</Label>
              <Input value={data.google_analytics_id || ''} onChange={(e) => setData(d => ({ ...d, google_analytics_id: e.target.value }))} placeholder="G-XXXXXXXXXX" className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Google Tag Manager ID</Label>
              <Input value={data.gtm_id || ''} onChange={(e) => setData(d => ({ ...d, gtm_id: e.target.value }))} placeholder="GTM-XXXXXXX" className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-gray-300">Custom Head Code</Label>
            <Textarea value={data.custom_head_code || ''} onChange={(e) => setData(d => ({ ...d, custom_head_code: e.target.value }))} rows={4} placeholder="<!-- Dodatkowe skrypty w <head> -->" className="bg-[#0F0F10] border-gray-700 text-white font-mono text-sm" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => onSave(data)} disabled={saving} className="bg-[#0066FF] hover:bg-[#0052CC]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Zapisz SEO
        </Button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// NAVIGATION SECTION COMPONENT
// ═══════════════════════════════════════
const NavigationSection = ({ navigation, onUpdate, onRefresh }) => {
  const sections = navigation?.sections || [];

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Navigation className="w-5 h-5 text-[#0066FF]" />
            Sekcje nawigacji
          </CardTitle>
          <CardDescription className="text-gray-500">
            Zarządzaj linkami w nawigacji i stopce
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="flex items-center gap-4 p-4 rounded-lg bg-[#0F0F10] border border-gray-800">
                <GripVertical className="w-5 h-5 text-gray-600 cursor-move" />
                
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <div>
                    <Label className="text-xs text-gray-500">Nazwa</Label>
                    <Input
                      value={section.display_name}
                      onChange={(e) => onUpdate(section.id, { display_name: e.target.value })}
                      className="bg-[#1A1A1C] border-gray-700 text-white h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">URL</Label>
                    <Input
                      value={section.url}
                      onChange={(e) => onUpdate(section.id, { url: e.target.value })}
                      className="bg-[#1A1A1C] border-gray-700 text-white h-9"
                    />
                  </div>
                  <div className="flex items-end gap-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={section.is_external}
                        onCheckedChange={(v) => onUpdate(section.id, { is_external: v })}
                      />
                      <span className="text-xs text-gray-400">Zewnętrzny</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={section.show_in_navbar}
                        onCheckedChange={(v) => onUpdate(section.id, { show_in_navbar: v })}
                      />
                      <span className="text-xs text-gray-400">Navbar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={section.show_in_footer}
                        onCheckedChange={(v) => onUpdate(section.id, { show_in_footer: v })}
                      />
                      <span className="text-xs text-gray-400">Footer</span>
                    </div>
                  </div>
                  <div className="flex items-end justify-end">
                    <Switch
                      checked={section.is_enabled}
                      onCheckedChange={(v) => onUpdate(section.id, { is_enabled: v })}
                    />
                    <span className={`ml-2 text-sm ${section.is_enabled ? 'text-green-400' : 'text-gray-500'}`}>
                      {section.is_enabled ? 'Aktywna' : 'Wyłączona'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ═══════════════════════════════════════
// INTEGRATIONS SECTION COMPONENT
// ═══════════════════════════════════════
const IntegrationsSection = ({ integrations, onUpdate, onToggle, saving, onRefresh }) => {
  const items = integrations?.integrations || [];
  const [expandedId, setExpandedId] = useState(null);

  const getTypeColor = (type) => {
    const colors = {
      frill: 'bg-purple-500/20 text-purple-400',
      malcolm: 'bg-blue-500/20 text-blue-400',
      tacu: 'bg-pink-500/20 text-pink-400',
      live_agent: 'bg-green-500/20 text-green-400',
      elfsight: 'bg-orange-500/20 text-orange-400',
      google_analytics: 'bg-yellow-500/20 text-yellow-400',
      gtm: 'bg-indigo-500/20 text-indigo-400',
      custom: 'bg-gray-500/20 text-gray-400',
    };
    return colors[type] || colors.custom;
  };

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-[#0066FF]" />
            Integracje 3rd Party
          </CardTitle>
          <CardDescription className="text-gray-500">
            Zarządzaj widgetami i integracjami zewnętrznymi
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-lg border border-gray-800 overflow-hidden">
                {/* Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-[#0F0F10] cursor-pointer hover:bg-[#151517]"
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(item.type)}`}>
                      {item.type?.toUpperCase()}
                    </span>
                    <span className="text-white font-medium">{item.name}</span>
                    {item.url && (
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-[#0066FF]" onClick={e => e.stopPropagation()}>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-gray-500">
                      Pozycja: {item.injection_position}
                    </span>
                    <Switch
                      checked={item.is_enabled}
                      onCheckedChange={() => onToggle(item.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <span className={`text-sm ${item.is_enabled ? 'text-green-400' : 'text-gray-500'}`}>
                      {item.is_enabled ? 'ON' : 'OFF'}
                    </span>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedId === item.id && (
                  <IntegrationForm 
                    integration={item} 
                    onSave={(data) => onUpdate(item.id, data)}
                    saving={saving[`int_${item.id}`]}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Integration Form Component
const IntegrationForm = ({ integration, onSave, saving }) => {
  const [data, setData] = useState(integration);

  return (
    <div className="p-4 bg-[#1A1A1C] border-t border-gray-800 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-gray-300">URL (dla iframe/link)</Label>
          <Input
            value={data.url || ''}
            onChange={(e) => setData(d => ({ ...d, url: e.target.value }))}
            className="bg-[#0F0F10] border-gray-700 text-white"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-gray-300">Pozycja wstrzykiwania</Label>
          <Select value={data.injection_position} onValueChange={(v) => setData(d => ({ ...d, injection_position: v }))}>
            <SelectTrigger className="bg-[#0F0F10] border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1A1A1C] border-gray-700">
              {INJECTION_POSITIONS.map(pos => (
                <SelectItem key={pos.value} value={pos.value} className="text-white hover:bg-[#0066FF]/20">
                  {pos.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-gray-300 flex items-center gap-2">
          <Code className="w-4 h-4" />
          Code Snippet (HTML/JS)
        </Label>
        <Textarea
          value={data.code_snippet || ''}
          onChange={(e) => setData(d => ({ ...d, code_snippet: e.target.value }))}
          rows={6}
          placeholder='<script src="..."></script>'
          className="bg-[#0F0F10] border-gray-700 text-white font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-gray-300">Custom CSS (WhiteLabel)</Label>
          <div className="flex items-center gap-2">
            <Switch
              checked={data.whitelabel_enabled}
              onCheckedChange={(v) => setData(d => ({ ...d, whitelabel_enabled: v }))}
            />
            <span className="text-xs text-gray-400">WhiteLabel aktywny</span>
          </div>
        </div>
        <Textarea
          value={data.custom_css || ''}
          onChange={(e) => setData(d => ({ ...d, custom_css: e.target.value }))}
          rows={4}
          placeholder="/* Custom CSS dla integracji */"
          className="bg-[#0F0F10] border-gray-700 text-white font-mono text-sm"
        />
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-800">
        <div className="flex items-center gap-4">
          <Label className="text-gray-300">Priorytet ładowania</Label>
          <Input
            type="number"
            value={data.priority || 10}
            onChange={(e) => setData(d => ({ ...d, priority: parseInt(e.target.value) || 10 }))}
            className="bg-[#0F0F10] border-gray-700 text-white w-20"
          />
          <span className="text-xs text-gray-500">(niższy = ładuje wcześniej)</span>
        </div>
        <Button onClick={() => onSave(data)} disabled={saving} className="bg-[#0066FF] hover:bg-[#0052CC]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Zapisz integrację
        </Button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════
// GENERAL SECTION COMPONENT
// ═══════════════════════════════════════
const GeneralSection = ({ general, onSave, saving }) => {
  const [data, setData] = useState(general);

  useEffect(() => setData(general), [general]);

  return (
    <div className="space-y-6">
      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#0066FF]" />
            Ustawienia strony
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Nazwa strony</Label>
              <Input value={data.site_name || ''} onChange={(e) => setData(d => ({ ...d, site_name: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">URL strony</Label>
              <Input value={data.site_url || ''} onChange={(e) => setData(d => ({ ...d, site_url: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Email administratora</Label>
              <Input type="email" value={data.admin_email || ''} onChange={(e) => setData(d => ({ ...d, admin_email: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Email supportu</Label>
              <Input type="email" value={data.support_email || ''} onChange={(e) => setData(d => ({ ...d, support_email: e.target.value }))} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            Tryb konserwacji
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Włącz tryb konserwacji</p>
              <p className="text-sm text-gray-500">Strona będzie niedostępna dla użytkowników</p>
            </div>
            <Switch
              checked={data.maintenance_mode}
              onCheckedChange={(v) => setData(d => ({ ...d, maintenance_mode: v }))}
            />
          </div>
          {data.maintenance_mode && (
            <div className="space-y-2">
              <Label className="text-gray-300">Wiadomość konserwacji</Label>
              <Textarea
                value={data.maintenance_message || ''}
                onChange={(e) => setData(d => ({ ...d, maintenance_message: e.target.value }))}
                rows={2}
                className="bg-[#0F0F10] border-gray-700 text-white"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-[#1A1A1C] border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Cookie Consent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Włącz baner cookies</p>
              <p className="text-sm text-gray-500">Wyświetl informację o plikach cookies</p>
            </div>
            <Switch
              checked={data.cookie_consent?.is_enabled}
              onCheckedChange={(v) => setData(d => ({ 
                ...d, 
                cookie_consent: { ...d.cookie_consent, is_enabled: v }
              }))}
            />
          </div>
          {data.cookie_consent?.is_enabled && (
            <>
              <div className="space-y-2">
                <Label className="text-gray-300">Wiadomość</Label>
                <Textarea
                  value={data.cookie_consent?.message || ''}
                  onChange={(e) => setData(d => ({ 
                    ...d, 
                    cookie_consent: { ...d.cookie_consent, message: e.target.value }
                  }))}
                  rows={2}
                  className="bg-[#0F0F10] border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Link do polityki prywatności</Label>
                <Input
                  value={data.cookie_consent?.privacy_policy_url || ''}
                  onChange={(e) => setData(d => ({ 
                    ...d, 
                    cookie_consent: { ...d.cookie_consent, privacy_policy_url: e.target.value }
                  }))}
                  className="bg-[#0F0F10] border-gray-700 text-white"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => onSave(data)} disabled={saving} className="bg-[#0066FF] hover:bg-[#0052CC]">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Zapisz ustawienia
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
