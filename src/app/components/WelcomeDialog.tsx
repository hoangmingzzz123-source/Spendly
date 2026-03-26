import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Wallet, Tags, ArrowLeftRight, CheckCircle } from 'lucide-react';

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen welcome dialog
    try {
      if (typeof window !== 'undefined') {
        const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
        if (!hasSeenWelcome) {
          // Delay opening dialog slightly to let everything else load first
          setTimeout(() => setOpen(true), 500);
        }
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
  }, []);

  const handleClose = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('hasSeenWelcome', 'true');
      }
    } catch (error) {
      console.error('Failed to access localStorage:', error);
    }
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) handleClose();
    }}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            🎉 Chào mừng đến với Spendly!
          </DialogTitle>
          <DialogDescription>
            Bắt đầu hành trình quản lý tài chính thông minh của bạn
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Chúng tôi đã tự động tạo sẵn cho bạn:
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  3 Tài khoản mặc định
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Tiền mặt, Tài khoản ngân hàng, và Thẻ tín dụng - sẵn sàng để sử dụng
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Tags className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  12+ Danh mục phân loại
                </h4>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Thu nhập: Lương, Thưởng, Đầu tư... • Chi tiêu: Ăn uống, Di chuyển, Giải trí...
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-1">
                  Sẵn sàng để bắt đầu
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Hãy thêm giao dịch đầu tiên của bạn ngay bây giờ!
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Bắt đầu nhanh:
            </h4>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[20px]">1.</span>
                <span>Vào tab <strong>Giao dịch</strong> và thêm thu nhập/chi tiêu đầu tiên</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[20px]">2.</span>
                <span>Xem <strong>Dashboard</strong> để theo dõi tổng quan tài chính</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400 min-w-[20px]">3.</span>
                <span>Khám phá <strong>Timeline</strong> để xem chi tiêu theo thời gian</span>
              </li>
            </ol>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleClose} className="w-full sm:w-auto">
            Bắt đầu ngay! 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}