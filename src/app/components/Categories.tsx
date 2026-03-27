import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { toast } from 'sonner';
import { Plus, Tag, Loader2 } from 'lucide-react';

const COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6B7280'
];

export function Categories() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    parentId: '',
    color: '#3B82F6',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
  });

  const createMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Tạo danh mục thành công!');
      setDialogOpen(false);
      setFormData({ name: '', type: 'EXPENSE', parentId: '', color: '#3B82F6' });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Có lỗi xảy ra');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      parentId: formData.parentId && formData.parentId !== '__none__' ? formData.parentId : null,
    });
  };

  const categories = data?.data || [];
  const incomeCategories = categories.filter((c: any) => c.type === 'INCOME');
  const expenseCategories = categories.filter((c: any) => c.type === 'EXPENSE');

  // Organize into parent-child structure
  const organizeCategories = (cats: any[]) => {
    const parents = cats.filter(c => !c.parentId);
    return parents.map(parent => ({
      ...parent,
      children: cats.filter(c => c.parentId === parent.id)
    }));
  };

  const organizedIncome = organizeCategories(incomeCategories);
  const organizedExpense = organizeCategories(expenseCategories);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const CategoryCard = ({ category, children }: any) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
            style={{ backgroundColor: category.color }}
          >
            <Tag className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {category.name}
            </h3>
            {children && children.length > 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {children.length} danh mục con
              </p>
            )}
          </div>
        </div>
        
        {children && children.length > 0 && (
          <div className="mt-3 pl-4 space-y-2 border-l-2 border-gray-200 dark:border-gray-700">
            {children.map((child: any) => (
              <div key={child.id} className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: child.color }}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {child.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Danh mục
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Phân loại thu nhập và chi tiêu
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm danh mục
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo danh mục mới</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên danh mục *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="VD: Ăn uống"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Loại *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value, parentId: '' })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="INCOME">Thu nhập</SelectItem>
                    <SelectItem value="EXPENSE">Chi tiêu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent">Danh mục cha (tùy chọn)</Label>
                <Select
                  value={formData.parentId}
                  onValueChange={(value) => setFormData({ ...formData, parentId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Không có" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Không có</SelectItem>
                    {categories
                      .filter((c: any) => c.type === formData.type && !c.parentId)
                      .map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Màu sắc</Label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-10 h-10 rounded-full border-2 ${
                        formData.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    'Tạo danh mục'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expense" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expense">Chi tiêu</TabsTrigger>
          <TabsTrigger value="income">Thu nhập</TabsTrigger>
        </TabsList>

        <TabsContent value="expense" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizedExpense.map((category: any) => (
              <CategoryCard
                key={category.id}
                category={category}
                children={category.children}
              />
            ))}
          </div>
          {organizedExpense.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Chưa có danh mục chi tiêu
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="income" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizedIncome.map((category: any) => (
              <CategoryCard
                key={category.id}
                category={category}
                children={category.children}
              />
            ))}
          </div>
          {organizedIncome.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Tag className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Chưa có danh mục thu nhập
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}