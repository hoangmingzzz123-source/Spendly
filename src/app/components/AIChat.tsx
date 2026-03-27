import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { chatApi } from '../../lib/api';
import { useStore } from '../../lib/store';
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
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { accessToken } = useStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-compute data
  const { data: precomputeData } = useQuery({
    queryKey: ['ai-precompute'],
    queryFn: () => chatApi.precompute(),
    staleTime: 5 * 60 * 1000,
    enabled: !!accessToken,
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: ({ message, context }: any) => chatApi.sendMessage(message, context),
    onSuccess: (data) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.data.response,
        timestamp: new Date(),
        model: data.data.model,
        fromCache: data.data.fromCache,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    },
    onError: () => {
      toast.error('Không thể gửi tin nhắn');
      setIsTyping(false);
    },
  });

  useEffect(() => {
    if (messagesEndRef.current) {
      const el = messagesEndRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (el) el.scrollTop = el.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setInput('');

    // Send with precomputed context
    sendMutation.mutate({
      message: input,
      context: precomputeData?.data,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    { icon: DollarSign, text: 'Tôi đã chi bao nhiêu tháng này?', color: 'text-green-600' },
    { icon: TrendingUp, text: 'Top 3 danh mục chi tiêu nhiều nhất?', color: 'text-blue-600' },
    { icon: TrendingDown, text: 'So sánh chi tiêu tháng này với tháng trước', color: 'text-purple-600' },
    { icon: Sparkles, text: 'Gợi ý để tiết kiệm nhiều hơn', color: 'text-orange-600' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          AI Chat - Trợ lý tài chính
        </h1>
        <p className="text-muted-foreground mt-2">
          Hỏi bất cứ điều gì về tài chính của bạn. Được hỗ trợ bởi Google Gemini AI 🚀
        </p>
      </div>

      {/* AI Router Info Banner */}
      <Card className="border-indigo-200 dark:border-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                🎯 AI Router thông minh
                <Badge variant="secondary" className="text-xs">Miễn phí 100%</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Hệ thống tự động chọn phương pháp trả lời tối ưu cho câu hỏi của bạn:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <Database className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Cache thông minh:</span>
                    <span className="text-muted-foreground ml-1">Câu đơn giản → Trả lời tức thì từ dữ liệu có sẵn</span>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Brain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Gemini AI:</span>
                    <span className="text-muted-foreground ml-1">Câu phức tạp → Phân tích sâu với AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="h-[500px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="text-lg">Trò chuyện</CardTitle>
          <CardDescription>
            {precomputeData ? (
              <span className="text-green-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Dữ liệu đã sẵn sàng - Trả lời nhanh hơn!
              </span>
            ) : (
              'Đang tải dữ liệu...'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={messagesEndRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className={message.role === 'assistant' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}>
                      {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <span>{new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        {message.model && (
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                            {message.fromCache ? '⚡ Cache' : `🤖 ${message.model}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <Bot className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="inline-block px-4 py-3 rounded-2xl bg-muted">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-4 border-t pt-4">
              <p className="text-sm font-medium mb-3">Câu hỏi gợi ý:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInput(q.text);
                      inputRef.current?.focus();
                    }}
                    className="text-left p-3 rounded-lg border hover:bg-accent transition-colors text-sm flex items-center gap-2"
                  >
                    <q.icon className={`w-4 h-4 ${q.color} flex-shrink-0`} />
                    <span>{q.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Hỏi về tài chính của bạn..."
                disabled={isTyping || !accessToken}
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={!input.trim() || isTyping || !accessToken}>
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
            {!accessToken && (
              <p className="text-xs text-muted-foreground mt-2">Vui lòng đăng nhập để sử dụng AI Chat</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
