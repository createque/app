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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  ExternalLink,
  Globe,
  FileEdit
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PagesPage = () => {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    meta_description: '',
    content: '',
    status: 'draft'
  });

  const getToken = () => localStorage.getItem('accessToken');

  const fetchPages = async () => {
    try {
      const response = await fetch(`${API}/cms/pages`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`
        }
      });
      if (response.ok) {
        setPages(await response.json());
      }
    } catch (error) {
      toast.error('Błąd podczas pobierania stron');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleCreate = () => {
    setSelectedPage(null);
    setFormData({ slug: '', title: '', meta_description: '', content: '', status: 'draft' });
    setShowModal(true);
  };

  const handleEdit = (page) => {
    setSelectedPage(page);
    setFormData({
      slug: page.slug,
      title: page.title,
      meta_description: page.meta_description || '',
      content: page.content,
      status: page.status
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.slug || !formData.title) {
      toast.error('Wypełnij wymagane pola');
      return;
    }
    setSaving(true);
    try {
      const url = selectedPage ? `${API}/cms/pages/${selectedPage.id}` : `${API}/cms/pages`;
      const method = selectedPage ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast.success(selectedPage ? 'Strona zaktualizowana' : 'Strona utworzona');
        setShowModal(false);
        fetchPages();
      } else {
        const data = await response.json();
        toast.error(data.detail || 'Błąd');
      }
    } catch (error) {
      toast.error('Błąd połączenia');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPage) return;
    try {
      const response = await fetch(`${API}/cms/pages/${selectedPage.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast.success('Strona usunięta');
        setShowDeleteModal(false);
        fetchPages();
      }
    } catch (error) {
      toast.error('Błąd');
    }
  };

  const handlePublish = async (page) => {
    const endpoint = page.status === 'published' ? 'unpublish' : 'publish';
    try {
      const response = await fetch(`${API}/cms/pages/${page.id}/${endpoint}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) {
        toast.success(page.status === 'published' ? 'Strona cofnięta' : 'Strona opublikowana');
        fetchPages();
      }
    } catch (error) {
      toast.error('Błąd');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('pl-PL');

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Strony</h1>
            <p className="text-gray-400 mt-1">Zarządzaj stronami CMS</p>
          </div>
          <Button onClick={handleCreate} className="bg-[#0066FF] hover:bg-[#0052CC] text-white">
            <Plus className="w-5 h-5 mr-2" />Dodaj stronę
          </Button>
        </div>

        <Card className="bg-[#1A1A1C] border-gray-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
              </div>
            ) : pages.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Brak stron</h3>
                <p className="text-gray-400 mb-4">Utwórz pierwszą stronę</p>
                <Button onClick={handleCreate} className="bg-[#0066FF] hover:bg-[#0052CC]">
                  <Plus className="w-4 h-4 mr-2" />Dodaj stronę
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Slug</TableHead>
                    <TableHead className="text-gray-400">Tytuł</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400 text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="text-white font-mono text-sm">{page.slug}</TableCell>
                      <TableCell className="text-white">{page.title}</TableCell>
                      <TableCell>
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'}
                          className={page.status === 'published' ? 'bg-[#00CC88]/20 text-[#00CC88]' : 'bg-gray-700 text-gray-300'}>
                          {page.status === 'published' ? 'Opublikowana' : 'Wersja robocza'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400">{formatDate(page.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handlePublish(page)}
                            className="text-gray-400 hover:text-white">
                            <Globe className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}
                            className="text-gray-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedPage(page); setShowDeleteModal(true); }}
                            className="text-red-400 hover:text-red-300">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-[#1A1A1C] border-gray-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPage ? 'Edytuj stronę' : 'Nowa strona'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Slug *</Label>
                <Input value={formData.slug} onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                  placeholder="/o-nas" className="bg-[#0F0F10] border-gray-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-[#0F0F10] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1C] border-gray-700">
                    <SelectItem value="draft" className="text-white">Wersja robocza</SelectItem>
                    <SelectItem value="published" className="text-white">Opublikowana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Tytuł *</Label>
              <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                placeholder="O nas" className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Meta description (max 160)</Label>
              <Input value={formData.meta_description} onChange={(e) => setFormData(p => ({ ...p, meta_description: e.target.value }))}
                maxLength={160} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Treść</Label>
              <Textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                rows={10} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)} className="text-gray-400">Anuluj</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#0066FF] hover:bg-[#0052CC]">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {selectedPage ? 'Zapisz' : 'Utwórz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#1A1A1C] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />Usuń stronę
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Czy na pewno chcesz usunąć stronę "{selectedPage?.title}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowDeleteModal(false)} className="text-gray-400">Anuluj</Button>
            <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              <Trash2 className="w-4 h-4 mr-2" />Usuń
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PagesPage;
