import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, CardContent } from '../../components/ui/card';
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
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertCircle,
  Globe,
  Archive
} from 'lucide-react';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CATEGORIES = [
  { value: 'muzyka', label: 'Muzyka' },
  { value: 'technologia', label: 'Technologia' },
  { value: 'news', label: 'News' },
  { value: 'poradnik', label: 'Poradnik' },
  { value: 'inne', label: 'Inne' }
];

const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    featured_image_url: '',
    category: 'inne',
    tags: '',
    status: 'draft'
  });

  const getToken = () => localStorage.getItem('accessToken');

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API}/cms/posts`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      if (response.ok) setPosts(await response.json());
    } catch (error) {
      toast.error('Błąd podczas pobierania postów');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleCreate = () => {
    setSelectedPost(null);
    setFormData({ title: '', slug: '', excerpt: '', content: '', featured_image_url: '', category: 'inne', tags: '', status: 'draft' });
    setShowModal(true);
  };

  const handleEdit = (post) => {
    setSelectedPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      featured_image_url: post.featured_image_url || '',
      category: post.category,
      tags: (post.tags || []).join(', '),
      status: post.status
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.title) { toast.error('Podaj tytuł'); return; }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      };
      const url = selectedPost ? `${API}/cms/posts/${selectedPost.id}` : `${API}/cms/posts`;
      const response = await fetch(url, {
        method: selectedPost ? 'PATCH' : 'POST',
        headers: { 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        toast.success(selectedPost ? 'Post zaktualizowany' : 'Post utworzony');
        setShowModal(false);
        fetchPosts();
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
    if (!selectedPost) return;
    try {
      await fetch(`${API}/cms/posts/${selectedPost.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      toast.success('Post usunięty');
      setShowDeleteModal(false);
      fetchPosts();
    } catch (error) {
      toast.error('Błąd');
    }
  };

  const handleStatusChange = async (post, action) => {
    try {
      await fetch(`${API}/cms/posts/${post.id}/${action}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${getToken()}` }
      });
      toast.success(action === 'publish' ? 'Opublikowano' : 'Zarchiwizowano');
      fetchPosts();
    } catch (error) {
      toast.error('Błąd');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      published: 'bg-[#00CC88]/20 text-[#00CC88]',
      draft: 'bg-gray-700 text-gray-300',
      archived: 'bg-orange-500/20 text-orange-400'
    };
    const labels = { published: 'Opublikowany', draft: 'Wersja robocza', archived: 'Zarchiwizowany' };
    return <Badge className={styles[status]}>{labels[status]}</Badge>;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Posty</h1>
            <p className="text-gray-400 mt-1">Zarządzaj postami na blogu</p>
          </div>
          <Button onClick={handleCreate} className="bg-[#0066FF] hover:bg-[#0052CC] text-white">
            <Plus className="w-5 h-5 mr-2" />Dodaj post
          </Button>
        </div>

        <Card className="bg-[#1A1A1C] border-gray-800">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#0066FF] animate-spin" />
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-16">
                <Newspaper className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Brak postów</h3>
                <Button onClick={handleCreate} className="bg-[#0066FF] hover:bg-[#0052CC]">
                  <Plus className="w-4 h-4 mr-2" />Dodaj post
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800 hover:bg-transparent">
                    <TableHead className="text-gray-400">Tytuł</TableHead>
                    <TableHead className="text-gray-400">Kategoria</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Data</TableHead>
                    <TableHead className="text-gray-400 text-right">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow key={post.id} className="border-gray-800 hover:bg-gray-800/50">
                      <TableCell className="text-white font-medium">{post.title}</TableCell>
                      <TableCell className="text-gray-400 capitalize">{post.category}</TableCell>
                      <TableCell>{getStatusBadge(post.status)}</TableCell>
                      <TableCell className="text-gray-400">{new Date(post.created_at).toLocaleDateString('pl-PL')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {post.status !== 'published' && (
                            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(post, 'publish')}
                              className="text-gray-400 hover:text-[#00CC88]">
                              <Globe className="w-4 h-4" />
                            </Button>
                          )}
                          {post.status !== 'archived' && (
                            <Button variant="ghost" size="sm" onClick={() => handleStatusChange(post, 'archive')}
                              className="text-gray-400 hover:text-orange-400">
                              <Archive className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}
                            className="text-gray-400 hover:text-white">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => { setSelectedPost(post); setShowDeleteModal(true); }}
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
        <DialogContent className="bg-[#1A1A1C] border-gray-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost ? 'Edytuj post' : 'Nowy post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Tytuł *</Label>
                <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                  className="bg-[#0F0F10] border-gray-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Kategoria</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData(p => ({ ...p, category: v }))}>
                  <SelectTrigger className="bg-[#0F0F10] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1C] border-gray-700">
                    {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value} className="text-white">{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-300">Slug (auto)</Label>
                <Input value={formData.slug} onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                  placeholder="auto-generated" className="bg-[#0F0F10] border-gray-700 text-white" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300">Status</Label>
                <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                  <SelectTrigger className="bg-[#0F0F10] border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1A1A1C] border-gray-700">
                    <SelectItem value="draft" className="text-white">Wersja robocza</SelectItem>
                    <SelectItem value="published" className="text-white">Opublikowany</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Excerpt (krótki opis)</Label>
              <Input value={formData.excerpt} onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                maxLength={255} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">URL obrazka</Label>
              <Input value={formData.featured_image_url} onChange={(e) => setFormData(p => ({ ...p, featured_image_url: e.target.value }))}
                placeholder="https://..." className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Tagi (oddzielone przecinkami)</Label>
              <Input value={formData.tags} onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                placeholder="tag1, tag2, tag3" className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-300">Treść</Label>
              <Textarea value={formData.content} onChange={(e) => setFormData(p => ({ ...p, content: e.target.value }))}
                rows={12} className="bg-[#0F0F10] border-gray-700 text-white" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowModal(false)} className="text-gray-400">Anuluj</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-[#0066FF] hover:bg-[#0052CC]">
              {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              {selectedPost ? 'Zapisz' : 'Utwórz'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-[#1A1A1C] border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-red-400 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />Usuń post
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Czy na pewno chcesz usunąć post "{selectedPost?.title}"?
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

export default PostsPage;
