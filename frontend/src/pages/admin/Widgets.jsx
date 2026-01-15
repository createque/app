import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  Puzzle,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Code,
  ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const SECTIONS = {
  hero: 'Hero',
  features: 'Funkcje',
  pricing: 'Cennik',
  testimonials: 'Opinie',
  faq: 'FAQ',
  blog: 'Blog',
  gallery: 'Galeria',
  contact: 'Kontakt',
  footer: 'Footer',
  custom: 'Niestandardowa'
};

const WidgetsPage = () => {
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [formData, setFormData] = useState({
    section_name: '',
    widget_code: '',
    widget_name: '',
    is_active: true
  });

  const getToken = () => localStorage.getItem('accessToken');

  const fetchWidgets = async () => {
    try {
      const response = await fetch(`${API}/cms/widgets?include_inactive=true`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWidgets(data);
      }
    } catch (error) {
      console.error('Error fetching widgets:', error);
      toast.error('Błąd podczas pobierania widgetów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  const handleCreate = () => {
    setSelectedWidget(null);
    setFormData({
      section_name: '',
      widget_code: '',
      widget_name: '',
      is_active: true
    });
    setShowModal(true);
  };

  const handleEdit = (widget) => {
    setSelectedWidget(widget);
    setFormData({
      section_name: widget.section_name,
      widget_code: widget.widget_code,
      widget_name: widget.widget_name || '',
      is_active: widget.is_active
    });
    setShowModal(true);
  };

  const handleDelete = (widget) => {
    setSelectedWidget(widget);
    setShowDeleteModal(true);
  };

  const handlePreview = (widget) => {
    setSelectedWidget(widget);
    setShowPreview(true);
  };

  const handleSave = async () => {
    if (!formData.section_name || !formData.widget_code) {
      toast.error('Wypełnij wymagane pola');
      return;
    }

    setSaving(true);
    
    try {
      const url = selectedWidget 
        ? `${API}/cms/widgets/${selectedWidget.id}`
        : `${API}/cms/widgets`;
      
      const method = selectedWidget ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success(selectedWidget ? 'Widget zaktualizowany' : 'Widget utworzony');
        setShowModal(false);
        fetchWidgets();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Błąd podczas zapisywania');
      }
    } catch (error) {
      console.error('Error saving widget:', error);
      toast.error('Błąd połączenia z serwerem');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedWidget) return;

    try {
      const response = await fetch(`${API}/cms/widgets/${selectedWidget.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Widget usunięty');
        setShowDeleteModal(false);
        fetchWidgets();
      } else {
        toast.error('Błąd podczas usuwania');
      }
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error('Błąd połączenia z serwerem');
    }
  };

  const handleToggleActive = async (widget) => {
    const endpoint = widget.is_active ? 'deactivate' : 'activate';
    
    try {
      const response = await fetch(`${API}/cms/widgets/${widget.id}/${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success(widget.is_active ? 'Widget dezaktywowany' : 'Widget aktywowany');
        fetchWidgets();
      }
    } catch (error) {
      console.error('Error toggling widget:', error);
      toast.error('Błąd podczas zmiany statusu');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Widgety Elfsight</h1>
            <p className="text-gray-400 mt-1">Zarządzaj widgetami na stronie głównej</p>
          </div>
          <Button
            onClick={handleCreate}
            className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
          >
            <Plus className="w-5 h-5 mr-2" />
            Dodaj widget
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-[#0066FF]/10 border-[#0066FF]/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Puzzle className="w-5 h-5 text-[#0066FF] mt-0.5" />
              <div>
                <p className="text-white font-medium">Jak dodać widget Elfsight?</p>
                <p className="text-gray-400 text-sm mt-1">
                  1. Utwórz widget na <a href="https://elfsight.com" target="_blank" rel="noopener noreferrer" className="text-[#0066FF] hover:underline">elfsight.com</a><br />
                  2. Skopiuj kod HTML widgetu<br />
                  3. Wklej kod poniżej i wybierz sekcję strony
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Widgets Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
          </div>
        ) : widgets.length === 0 ? (
          <Card className="bg-[#1A1A1C] border-gray-800">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Puzzle className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Brak widgetów</h3>
              <p className="text-gray-400 mb-6">Dodaj pierwszy widget Elfsight do strony</p>
              <Button
                onClick={handleCreate}
                className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
              >
                <Plus className="w-5 h-5 mr-2" />
                Dodaj widget
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {widgets.map((widget) => (
              <Card key={widget.id} className="bg-[#1A1A1C] border-gray-800">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">
                        {widget.widget_name || `Widget - ${SECTIONS[widget.section_name]}`}
                      </CardTitle>
                      <span className="inline-block mt-2 px-3 py-1 rounded-full bg-[#0066FF]/20 text-[#0066FF] text-xs font-medium">
                        {SECTIONS[widget.section_name] || widget.section_name}
                      </span>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${widget.is_active ? 'bg-[#00CC88]' : 'bg-gray-500'}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
                    <code className="text-xs text-gray-400 line-clamp-3">
                      {widget.widget_code.substring(0, 150)}...
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(widget)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Podgląd
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(widget)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edytuj
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(widget)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      {widget.is_active ? (
                        <><EyeOff className="w-4 h-4 mr-1" />Wyłącz</>
                      ) : (
                        <><Eye className="w-4 h-4 mr-1" />Włącz</>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(widget)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1A1A1C] border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedWidget ? 'Edytuj widget' : 'Dodaj nowy widget'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedWidget 
                ? 'Zaktualizuj kod widgetu Elfsight'
                : 'Wklej kod HTML widgetu Elfsight i wybierz sekcję'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="section" className="text-gray-300">Sekcja *</Label>
                <Select
                  value={formData.section_name}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, section_name: value }))}
                  disabled={!!selectedWidget}
                >
                  <SelectTrigger className="bg-[#0F0F10] border-gray-700 text-white">
                    <SelectValue placeholder="Wybierz sekcję" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1C] border-gray-700">
                    {Object.entries(SECTIONS).map(([value, label]) => (
                      <SelectItem key={value} value={value} className="text-white hover:bg-gray-800">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-300">Nazwa (opcjonalnie)</Label>
                <Input
                  id="name"
                  value={formData.widget_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, widget_name: e.target.value }))}
                  placeholder="np. Pricing Widget"
                  className="bg-[#0F0F10] border-gray-700 text-white"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="code" className="text-gray-300">Kod HTML widgetu *</Label>
              <Textarea
                id="code"
                value={formData.widget_code}
                onChange={(e) => setFormData(prev => ({ ...prev, widget_code: e.target.value }))}
                placeholder='<script src="https://static.elfsight.com/platform/platform.js" data-use-service-core defer></script>&#10;<div class="elfsight-app-xxx"></div>'
                rows={8}
                className="bg-[#0F0F10] border-gray-700 text-white font-mono text-sm"
              />
              <p className="text-xs text-gray-500">Max 50KB. Wklej pełny kod HTML z Elfsight.</p>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-white"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Zapisywanie...</>
              ) : (
                selectedWidget ? 'Zapisz zmiany' : 'Dodaj widget'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#1A1A1C] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Potwierdź usunięcie
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Czy na pewno chcesz usunąć widget <strong className="text-white">{selectedWidget?.widget_name || SECTIONS[selectedWidget?.section_name]}</strong>?
              Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteModal(false)}
              className="text-gray-400 hover:text-white"
            >
              Anuluj
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Usuń widget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="bg-[#1A1A1C] border-gray-800 text-white max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#0066FF]" />
              Podgląd widgetu
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedWidget?.widget_name || SECTIONS[selectedWidget?.section_name]}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="bg-white rounded-lg p-6 min-h-[300px]">
              {selectedWidget && (
                <div dangerouslySetInnerHTML={{ __html: selectedWidget.widget_code }} />
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowPreview(false)}
              className="text-gray-400 hover:text-white"
            >
              Zamknij
            </Button>
            <Button
              onClick={() => window.open('/', '_blank')}
              className="bg-[#0066FF] hover:bg-[#0052CC] text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Zobacz na stronie
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default WidgetsPage;
