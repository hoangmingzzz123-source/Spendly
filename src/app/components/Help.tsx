import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Badge } from './ui/badge';
import { 
  BookOpen, 
  Wallet, 
  TrendingUp, 
  Target, 
  Bell, 
  Users, 
  Bot,
  BarChart3,
  Settings,
  HelpCircle
} from 'lucide-react';

export function Help() {
  const sections = [
    {
      id: 'getting-started',
      icon: BookOpen,
      title: 'Bắt đầu với Spendly',
      badge: 'Cơ bản',
      items: [
        {
          question: 'Làm thế nào để tạo tài khoản?',
          answer: 'Click vào nút "Đăng ký" trên trang chủ, điền email, mật khẩu và tên của bạn. Sau khi đăng ký thành công, bạn có thể đăng nhập ngay lập tức.',
        },
        {
          question: 'Cách thêm giao dịch đầu tiên?',
          answer: 'Sau khi đăng nhập, vào trang "Giao dịch" và click nút "Thêm giao dịch". Chọn loại (Thu/Chi), số tiền, danh mục, tài khoản và ngày giao dịch. Bạn cũng có thể thêm ghi chú nếu muốn.',
        },
        {
          question: 'Làm thế nào để tạo tài khoản ngân hàng?',
          answer: 'Vào trang "Tài khoản", click "Thêm tài khoản", chọn loại (Ngân hàng/Tiền mặt/Thẻ tín dụng), nhập tên, số dư ban đầu và chọn màu sắc để dễ phân biệt.',
        },
      ],
    },
    {
      id: 'budgets',
      icon: TrendingUp,
      title: 'Quản lý Ngân sách',
      badge: 'Quan trọng',
      items: [
        {
          question: 'Ngân sách là gì và tại sao cần thiết?',
          answer: 'Ngân sách giúp bạn đặt giới hạn chi tiêu cho từng danh mục (ví dụ: ăn uống, đi lại). Điều này giúp bạn kiểm soát chi tiêu tốt hơn và tránh vượt quá khả năng tài chính.',
        },
        {
          question: 'Cách tạo ngân sách cho danh mục?',
          answer: 'Vào trang "Ngân sách", click "Tạo ngân sách", chọn danh mục chi tiêu, nhập số tiền giới hạn và tháng áp dụng. Hệ thống sẽ tự động theo dõi và cảnh báo khi bạn sắp vượt ngân sách.',
        },
        {
          question: 'Ý nghĩa các màu sắc trong ngân sách?',
          answer: 'Xanh lá: Còn nhiều (dưới 80%). Vàng: Sắp đạt (80-100%). Đỏ: Đã vượt (trên 100%). Hệ thống sẽ gửi thông báo khi bạn đạt 90% ngân sách.',
        },
      ],
    },
    {
      id: 'goals',
      icon: Target,
      title: 'Mục tiêu Tiết kiệm',
      badge: 'Tiết kiệm',
      items: [
        {
          question: 'Làm thế nào để đặt mục tiêu tiết kiệm?',
          answer: 'Vào trang "Mục tiêu", click "Tạo mục tiêu", nhập tên (VD: Mua nhà), số tiền mục tiêu, deadline (tùy chọn), chọn icon và màu sắc. Sau đó bạn có thể cộng tiền dần dần vào mục tiêu.',
        },
        {
          question: 'Cách cộng tiền vào mục tiêu?',
          answer: 'Mở mục tiêu bạn muốn cộng tiền, click "Cộng tiền", nhập số tiền và xác nhận. Tiến độ sẽ được cập nhật tự động và hiển thị bằng thanh progress bar.',
        },
        {
          question: 'Nhận thông báo khi nào?',
          answer: 'Bạn sẽ nhận thông báo khi: (1) Đạt 75% mục tiêu (2) Hoàn thành 100% mục tiêu (3) Còn 7 ngày đến deadline. Kiểm tra trang "Thông báo" để xem chi tiết.',
        },
      ],
    },
    {
      id: 'reminders',
      icon: Bell,
      title: 'Nhắc nhở & Tự động hóa',
      badge: 'Thông minh',
      items: [
        {
          question: 'Các loại nhắc nhở có gì?',
          answer: '3 loại: (1) Ghi thu chi hàng ngày (21h mỗi ngày) (2) Thanh toán hóa đơn định kỳ (hàng tháng/tuần) (3) Ghi thu nhập định kỳ (lương, tiền thuê nhà...). Bạn có thể bật/tắt từng nhắc nhở.',
        },
        {
          question: 'Cách tạo nhắc nhở thanh toán hàng tháng?',
          answer: 'Vào "Nhắc nhở", chọn loại "Thanh toán hóa đơn", nhập tiêu đề, số tiền, chọn danh mục, chọn tần suất "Hàng tháng", chọn ngày trong tháng (VD: ngày 5) và thời gian nhắc.',
        },
        {
          question: 'Có thể tắt nhắc nhở tạm thời không?',
          answer: 'Có! Click vào switch bên cạnh mỗi nhắc nhở để bật/tắt. Nhắc nhở bị tắt sẽ không gửi thông báo nhưng vẫn được lưu trong hệ thống.',
        },
      ],
    },
    {
      id: 'analytics',
      icon: BarChart3,
      title: 'Phân tích & Insights',
      badge: 'Nâng cao',
      items: [
        {
          question: 'Financial Health Score là gì?',
          answer: 'Điểm số từ 0-100 đánh giá sức khỏe tài chính của bạn dựa trên 3 yếu tố: Tỷ lệ tiết kiệm (30đ), tuân thủ ngân sách (20đ), và tiến độ mục tiêu (20đ). Score >= 80 là xuất sắc!',
        },
        {
          question: 'Làm thế nào để cải thiện điểm số?',
          answer: 'Tăng tỷ lệ tiết kiệm lên trên 20%, tuân thủ ngân sách (không vượt quá), và đặt + hoàn thành mục tiêu tiết kiệm. AI sẽ gợi ý cách cải thiện cụ thể cho từng trường hợp.',
        },
        {
          question: 'Biểu đồ xu hướng hiển thị gì?',
          answer: 'Biểu đồ area chart hiển thị thu nhập vs chi tiêu trong 6 tháng gần nhất, giúp bạn nhìn thấy xu hướng tăng/giảm và so sánh các tháng.',
        },
      ],
    },
    {
      id: 'ai-chat',
      icon: Bot,
      title: 'AI Chatbot',
      badge: 'Beta',
      items: [
        {
          question: 'AI Chatbot có thể làm gì?',
          answer: 'AI có thể: Phân tích chi tiêu tháng này, so sánh thu nhập, đưa ra gợi ý tiết kiệm, giải thích số liệu tài chính, và trả lời câu hỏi về giao dịch, ngân sách, mục tiêu.',
        },
        {
          question: 'Cách hỏi AI hiệu quả?',
          answer: 'Hỏi cụ thể: "Chi tiêu tháng này như thế nào?", "Tôi nên cắt giảm ở đâu?", "Số dư hiện tại?". Hoặc dùng các câu hỏi gợi ý sẵn có khi bắt đầu chat.',
        },
        {
          question: 'AI có truy cập được dữ liệu gì?',
          answer: 'AI chỉ truy cập: 50 giao dịch gần nhất, tổng kết tháng hiện tại, 5 ngân sách, và 3 mục tiêu của bạn. Dữ liệu này chỉ được sử dụng để trả lời câu hỏi, không được lưu trữ.',
        },
      ],
    },
    {
      id: 'family',
      icon: Users,
      title: 'Chia sẻ Gia đình',
      badge: 'Chia sẻ',
      items: [
        {
          question: 'Nhóm gia đình hoạt động như thế nào?',
          answer: 'Tạo nhóm gia đình để chia sẻ thông tin tài chính với người thân. Hiện tại (Beta), bạn có thể tạo nhóm và mời thành viên. Tính năng chia sẻ giao dịch sẽ được cập nhật sau.',
        },
        {
          question: 'Cách mời thành viên vào nhóm?',
          answer: 'Chỉ chủ nhóm (người tạo) mới có thể mời thành viên. Vào "Gia đình", click "Mời thành viên", nhập email người muốn mời. Họ sẽ nhận được lời mời qua email.',
        },
        {
          question: 'Có thể rời nhóm không?',
          answer: 'Có! Các thành viên (không phải chủ nhóm) có thể rời nhóm bất cứ lúc nào bằng cách click "Rời nhóm". Chủ nhóm không thể rời - cần xóa nhóm.',
        },
      ],
    },
    {
      id: 'settings',
      icon: Settings,
      title: 'Cài đặt & Tùy chỉnh',
      badge: 'Tùy chỉnh',
      items: [
        {
          question: 'Cách bật Dark Mode?',
          answer: 'Vào "Cài đặt", chọn "Giao diện", chọn 1 trong 3 chế độ: Sáng, Tối, hoặc Theo hệ thống (tự động đổi theo thiết bị). Dark mode giúp giảm mỏi mắt khi dùng ban đêm.',
        },
        {
          question: 'Làm thế nào để xuất dữ liệu?',
          answer: 'Vào "Cài đặt", mục "Xuất dữ liệu", chọn loại xuất (Tất cả giao dịch hoặc Báo cáo thuế), chọn năm. Dữ liệu sẽ được xuất dưới dạng Excel.',
        },
        {
          question: 'Có thể thay đổi ngôn ngữ không?',
          answer: 'Có! Hiện tại hỗ trợ Tiếng Việt và English. Vào "Cài đặt" > "Ngôn ngữ" để thay đổi. Toàn bộ interface sẽ được cập nhật theo ngôn ngữ bạn chọn.',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <HelpCircle className="w-8 h-8" />
          Trung tâm Trợ giúp
        </h1>
        <p className="text-muted-foreground mt-1">
          Hướng dẫn sử dụng chi tiết và câu hỏi thường gặp
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sections.slice(0, 4).map((section) => {
          const Icon = section.icon;
          return (
            <a 
              key={section.id} 
              href={`#${section.id}`}
              className="flex flex-col items-center p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <Icon className="w-8 h-8 mb-2 text-primary" />
              <span className="text-sm font-medium text-center">{section.title}</span>
            </a>
          );
        })}
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.id} id={section.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Icon className="w-6 h-6" />
                  {section.title}
                  <Badge variant="secondary">{section.badge}</Badge>
                </CardTitle>
                <CardDescription>
                  {section.items.length} câu hỏi
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {section.items.map((item, index) => (
                    <AccordionItem key={index} value={`${section.id}-${index}`}>
                      <AccordionTrigger className="text-left">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Contact Support */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Không tìm thấy câu trả lời?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Liên hệ với đội ngũ hỗ trợ của chúng tôi để được giúp đỡ
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="mailto:support@spendly.com" className="text-primary hover:underline">
                📧 support@spendly.com
              </a>
              <span className="hidden sm:inline">•</span>
              <a href="tel:+84123456789" className="text-primary hover:underline">
                📞 +84 123 456 789
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
