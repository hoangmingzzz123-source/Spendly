import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { Camera, Upload, Scan, Loader2, Check, X, AlertCircle, Receipt, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { transactionsApi, accountsApi, categoriesApi, ocrApi } from '../../lib/api';
import { useStore } from '../../lib/store';

interface OCRResult {
  amount?: number;
  date?: string;
  merchantName?: string;
  category?: string;
  confidence: number;
}

export function OCRScanner() {
  const queryClient = useQueryClient();
  const { accessToken } = useStore();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    categoryId: '',
    accountId: '',
    date: new Date().toISOString().split('T')[0],
    note: '',
  });

  // Fetch accounts and categories for selection
  const { data: accountsData } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => accountsApi.getAll(),
    enabled: !!accessToken,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    enabled: !!accessToken,
  });

  const accounts = accountsData?.data || [];
  const categories = (categoriesData?.data || []).filter((c: any) => c.type === 'EXPENSE');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File quá lớn. Tối đa 10MB');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const scanBill = async () => {
    if (!selectedFile) return;
    setIsScanning(true);
    try {
      const base64 = await fileToBase64(selectedFile);

      // Call server OCR endpoint
      const response = await ocrApi.scan(base64);
      const result = response.data;

      setOcrResult(result);

      // Auto-match category
      const matchedCategory = categories.find((c: any) =>
        c.name.toLowerCase().includes((result.category || '').toLowerCase())
      );

      setTransactionData({
        amount: String(result.amount || ''),
        date: result.date || new Date().toISOString().split('T')[0],
        note: `Quét hóa đơn: ${result.merchantName || 'Unknown'}`,
        categoryId: matchedCategory?.id || (categories[0]?.id || ''),
        accountId: accounts[0]?.id || '',
      });

      setError(null);
    } catch (error: any) {
      setError(error.message || 'Lỗi quét hóa đơn');
      console.error('OCR error:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const createTransaction = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Đã tạo giao dịch từ hóa đơn!');
      reset();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Lỗi tạo giao dịch');
    },
  });

  const handleConfirm = () => {
    if (!transactionData.categoryId || !transactionData.accountId) {
      toast.error('Vui lòng chọn danh mục và tài khoản');
      return;
    }

    createTransaction.mutate({
      amount: parseFloat(transactionData.amount) || 0,
      type: 'EXPENSE',
      categoryId: transactionData.categoryId,
      accountId: transactionData.accountId,
      date: transactionData.date || new Date().toISOString().split('T')[0],
      note: transactionData.note,
    });
  };

  const reset = () => {
    setSelectedFile(null);
    setPreview(null);
    setOcrResult(null);
    setError(null);
    setTransactionData({ amount: '', categoryId: '', accountId: '', date: new Date().toISOString().split('T')[0], note: '' });
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-24 lg:pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <Receipt className="w-7 h-7" />
          Quét Hóa đơn
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Chụp ảnh hóa đơn - AI tự động trích xuất thông tin và tạo giao dịch
        </p>
      </div>

      {/* Upload Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Tải lên hóa đơn</CardTitle>
          <CardDescription>
            Chụp hoặc chọn ảnh hóa đơn để tự động trích xuất
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Bill preview"
                className="w-full max-h-80 object-contain rounded-lg border bg-gray-50 dark:bg-gray-900"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={reset}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}

          {!preview && (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
              <Scan className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500 mb-4">Chụp ảnh hoặc chọn hóa đơn từ thư viện</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <div>
                  <Input
                    id="file-camera"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label htmlFor="file-camera">
                    <Button variant="default" asChild>
                      <span><Camera className="w-4 h-4 mr-2" />Chụp ảnh</span>
                    </Button>
                  </Label>
                </div>
                <div>
                  <Input
                    id="file-gallery"
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Label htmlFor="file-gallery">
                    <Button variant="outline" asChild>
                      <span><Upload className="w-4 h-4 mr-2" />Chọn ảnh</span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>
          )}

          {selectedFile && !ocrResult && (
            <Button onClick={scanBill} disabled={isScanning} className="w-full" size="lg">
              {isScanning ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang quét bằng AI...</>
              ) : (
                <><Zap className="w-4 h-4 mr-2" />Quét hóa đơn</>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { icon: Check, title: 'AI Vision OCR', desc: 'Trích xuất số tiền, ngày, cửa hàng' },
          { icon: Check, title: 'Auto phân loại', desc: 'Tự động gợi ý danh mục phù hợp' },
          { icon: Check, title: 'Chọn tài khoản', desc: 'Gắn giao dịch vào đúng nguồn tiền' },
        ].map((f, i) => (
          <Card key={i}>
            <CardContent className="flex items-center gap-3 p-4">
              <f.icon className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-medium">{f.title}</p>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Confirm Dialog */}
      <Dialog open={!!ocrResult} onOpenChange={setOcrResult}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận & chỉnh sửa</DialogTitle>
          </DialogHeader>
          {ocrResult && (
            <div className="space-y-4">
              {/* Confidence */}
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Độ chính xác AI</span>
                <Badge variant={ocrResult.confidence >= 0.9 ? 'default' : 'secondary'}>
                  {(ocrResult.confidence * 100).toFixed(0)}%
                </Badge>
              </div>

              {ocrResult.confidence < 0.9 && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    Độ chính xác thấp. Vui lòng kiểm tra kỹ.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Số tiền (VNĐ)</Label>
                  <Input
                    type="number"
                    value={transactionData.amount}
                    onChange={(e) => setTransactionData({ ...transactionData, amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs">Ngày</Label>
                  <Input
                    type="date"
                    value={transactionData.date}
                    onChange={(e) => setTransactionData({ ...transactionData, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs">Cửa hàng</Label>
                  <Input
                    value={transactionData.note}
                    onChange={(e) => setTransactionData({ ...transactionData, note: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="text-xs">Danh mục *</Label>
                  <Select
                    value={transactionData.categoryId}
                    onValueChange={(v) => setTransactionData({ ...transactionData, categoryId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Tài khoản thanh toán *</Label>
                  <Select
                    value={transactionData.accountId}
                    onValueChange={(v) => setTransactionData({ ...transactionData, accountId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tài khoản" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((acc: any) => (
                        <SelectItem key={acc.id} value={acc.id}>
                          {acc.name} ({formatCurrency(acc.balance || 0)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleConfirm}
                  className="flex-1"
                  disabled={createTransaction.isPending}
                >
                  {createTransaction.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  Lưu giao dịch
                </Button>
                <Button variant="outline" onClick={() => setOcrResult(null)}>
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Tips */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30">
        <CardContent className="pt-5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Tips quét tốt:</p>
              <ul className="list-disc list-inside text-blue-800 dark:text-blue-200 space-y-0.5 text-xs">
                <li>Chụp ánh sáng tốt, chữ rõ ràng</li>
                <li>Tránh bóng đổ và phản quang</li>
                <li>Hóa đơn chiếm đầy khung hình</li>
                <li>Hỗ trợ JPG, PNG - Tối đa 10MB</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}