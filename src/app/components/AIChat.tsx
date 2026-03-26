import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chatApi } from '../../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Bot, User, Send, Loader2, Sparkles, TrendingUp, TrendingDown, DollarSign, Zap, Database, Brain } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model?: string;
  fromCache?: boolean;
}

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là trợ lý tài chính AI Spendly. Tôi sử dụng AI Router thông minh - câu hỏi đơn giản sẽ trả lời ngay từ dữ liệu, câu hỏi phức tạp sẽ dùng AI phân tích sâu. Bạn muốn biết gì?',
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-compute data
  const { data: precomputeData } = useQuery({
    queryKey: ['ai-precompute'],
    queryFn: () => chatApi.precompute(),
    staleTime: 5 * 60 * 1000,
  });

  const chatMutation = useMutation({
    mutationFn: (message: string) => chatApi.sendMessage(message),
    onSuccess: (data) => {
      const aiResponse: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        model: data.data.model,
        fromCache: data.data.fromCache,
      };
      setMessages((prev) => [...prev, aiResponse]);
    },
    onError: () => {
      toast.error('Không thể gửi tin nhắn');
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      const el = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(inputMessage);
    setInputMessage('');
    inputRef.current?.focus();
  };

  const quickQuestions = [
    { icon: TrendingDown, text: 'Chi tiêu tháng này của tôi?', color: 'text-red-500' },
    { icon: TrendingUp, text: 'Thu nhập tháng này bao nhiêu?', color: 'text-green-500' },
    { icon: DollarSign, text: 'Số dư và tỷ lệ tiết kiệm?', color: 'text-blue-500' },
    { icon: Sparkles, text: 'Tư vấn tiết kiệm chi tiết', color: 'text-purple-500' },
    { icon: Database, text: 'Top danh mục chi tiêu nhiều nhất', color: 'text-orange-500' },
    { icon: Brain, text: 'Phân tích xu hướng chi tiêu', color: 'text-pink-500' },
  ];

  const getModelBadge = (model?: string, fromCache?: boolean) => {
    if (fromCache) return <Badge variant="outline" className="text-[10px] gap-1"><Zap className="w-2.5 h-2.5" />Cache</Badge>;
    if (model === 'precompute') return <Badge variant="outline" className="text-[10px] gap-1 text-green-600"><Database className="w-2.5 h-2.5" />Instant</Badge>;
    if (model?.includes('flash')) return <Badge variant="outline" className="text-[10px] gap-1 text-blue-600"><Zap className="w-2.5 h-2.5" />Gemini Flash</Badge>;
    if (model?.includes('pro') || model?.includes('gemini')) return <Badge variant="outline" className="text-[10px] gap-1 text-purple-600"><Brain className="w-2.5 h-2.5" />Gemini Pro</Badge>;
    if (model === 'fallback') return <Badge variant="outline" className="text-[10px] gap-1 text-amber-600"><Database className="w-2.5 h-2.5" />Local</Badge>;
    return null;
  };

  const precomputed = precomputeData?.data;
  const fmt = (n: number) => new Intl.NumberFormat('vi-VN').format(n);

  return (
    <div className="container mx-auto p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col gap-4">
      {/* Pre-computed Quick Stats */}
      {precomputed && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Card className="border-green-200 dark:border-green-900">
            <CardContent className="p-3">
              <p className="text-[10px] text-gray-500 uppercase">Thu nhập</p>
              <p className="text-sm font-bold text-green-600">{fmt(precomputed.totalIncome || 0)}đ</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 dark:border-red-900">
            <CardContent className="p-3">
              <p className="text-[10px] text-gray-500 uppercase">Chi tiêu</p>
              <p className="text-sm font-bold text-red-600">{fmt(precomputed.totalExpense || 0)}đ</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 dark:border-blue-900">
            <CardContent className="p-3">
              <p className="text-[10px] text-gray-500 uppercase">Tiết kiệm</p>
              <p className="text-sm font-bold text-blue-600">{precomputed.savingsRate || 0}%</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 dark:border-purple-900">
            <CardContent className="p-3">
              <p className="text-[10px] text-gray-500 uppercase">Dự kiến chi</p>
              <p className="text-sm font-bold text-purple-600">{fmt(precomputed.projectedExpense || 0)}đ</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base flex items-center gap-2">
                AI Tài chính
                <Badge variant="secondary" className="text-[10px]">Router</Badge>
              </CardTitle>
              <CardDescription className="text-xs">
                Simple → Instant | Medium → Fast AI | Complex → Smart AI
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className={message.role === 'assistant' ? 'bg-gradient-to-br from-purple-500 to-blue-500' : 'bg-primary'}>
                      {message.role === 'assistant' ? <Bot className="w-3.5 h-3.5 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
                    <div className={`inline-block px-3 py-2 rounded-2xl ${
                      message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-2">
                      <p className="text-[10px] text-muted-foreground">
                        {message.timestamp.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {message.role === 'assistant' && getModelBadge(message.model, message.fromCache)}
                    </div>
                  </div>
                </div>
              ))}
              {chatMutation.isPending && (
                <div className="flex gap-3">
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500">
                      <Bot className="w-3.5 h-3.5 text-white" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted px-3 py-2 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span className="text-sm">Đang xử lý...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {messages.length <= 2 && (
            <div className="p-3 border-t bg-muted/30">
              <p className="text-xs font-medium mb-2">Câu hỏi gợi ý:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                {quickQuestions.map((q, index) => {
                  const Icon = q.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => { setInputMessage(q.text); inputRef.current?.focus(); }}
                      className="flex items-center gap-2 p-2 rounded-lg border bg-background hover:bg-accent transition-colors text-left"
                    >
                      <Icon className={`w-3.5 h-3.5 ${q.color}`} />
                      <span className="text-xs">{q.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-3 border-t">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Hỏi về tài chính của bạn..."
                disabled={chatMutation.isPending}
                className="flex-1 text-sm"
              />
              <Button type="submit" disabled={!inputMessage.trim() || chatMutation.isPending} size="icon">
                {chatMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </form>
            <p className="text-[10px] text-muted-foreground mt-1 text-center">
              AI Router: câu đ��n giản → trả lời tức thì, câu phức tạp → AI phân tích
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}