import { Link } from 'react-router';
import { Button } from './ui/button';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Trang không tồn tại
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
              <Home className="w-4 h-4 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <Button variant="outline" className="rounded-xl" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    </div>
  );
}
