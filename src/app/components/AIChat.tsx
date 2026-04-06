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
import { Bot, User, Send, Loader2, Sparkles, TrendingUp, TrendingDown, DollarSign, Zap, Database, Brain, MessageCircle } from 'lucide-react';

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
      content: 'Xin chào! 👋 Tôi là trợ lý tài chính AI của Spendly. Tôi sử dụng công nghệ AI Router thông minh - câu hỏi đơn giản sẽ được trả lời ngay lập tức từ dữ liệu, còn câu hỏi phức tạp sẽ được phân tích sâu bằng Google Gemini AI. Bạn muốn hỏi gì về tài chính của mình?',
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
    { icon: DollarSign, text: 'Tôi đã chi bao nhiêu tháng này?', color: 'from-emerald-500 to-green-500', iconColor: 'text-emerald-600' },
    { icon: TrendingUp, text: 'Top 3 danh mục chi nhiều nhất?', color: 'from-blue-500 to-indigo-500', iconColor: 'text-blue-600' },
    { icon: TrendingDown, text: 'So sánh chi tiêu với tháng trước', color: 'from-purple-500 to-violet-500', iconColor: 'text-purple-600' },
    { icon: Sparkles, text: 'Gợi ý để tiết kiệm nhiều hơn', color: 'from-orange-500 to-amber-500', iconColor: 'text-orange-600' },
  ];

  return (
    <div className="container mx-auto p-4 md:p-6 pb-24 md:pb-6 space-y-6 max-w-5xl">
      {/* Header with Gradient */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-10" />
        <div className="relative">
          <h1 className="text-3xl lg:text-4xl font-bold flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-pulse">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Chat Assistant
            </span>
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">FREE</Badge>
          </h1>
          <p className="text-muted-foreground mt-2 ml-1">
            💬 Trò chuyện với AI để hiểu rõ hơn về tài chính của bạn • Powered by Google Gemini
          </p>
        </div>
      </div>

      {/* AI Router Info Banner */}
      <Card className="border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:to-indigo-950 shadow-lg">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30 flex-shrink-0">
              <Zap className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                ⚡ AI Router - Công nghệ thông minh
                <Badge variant="secondary" className="text-xs">100% Miễn phí</Badge>
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Hệ thống tự động chọn phương pháp tối ưu nhất để trả lời câu hỏi của bạn:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                    <Database className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block mb-1">⚡ Cache thông minh</span>
                    <span className="text-xs text-muted-foreground">Câu hỏi đơn giản trả lời tức thì từ dữ liệu</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <span className="font-semibold text-sm block mb-1">🧠 Gemini AI</span>
                    <span className="text-xs text-muted-foreground">Câu phức tạp phân tích sâu với AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 ml-1">💡 Gợi ý câu hỏi</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => setInput(q.text)}
              className="group relative overflow-hidden p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-transparent hover:shadow-xl transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${q.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="relative flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${q.color} opacity-10 group-hover:opacity-20 flex items-center justify-center transition-opacity duration-300`}>
                  <q.icon className={`w-5 h-5 ${q.iconColor}`} />
                </div>
                <span className="text-sm font-medium text-left flex-1 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {q.text}
                </span>
                <Send className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <Card className="border-0 shadow-xl overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-indigo-600" />
                Trò chuyện
              </CardTitle>
              <CardDescription className="mt-1">
                {precomputeData ? (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    Dữ liệu sẵn sàng - Trả lời cực nhanh!
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Đang tải dữ liệu...
                  </span>
                )}
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              {messages.length - 1} tin nhắn
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <ScrollArea ref={messagesEndRef} className="h-[450px] p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                >
                  <Avatar className={`w-9 h-9 flex-shrink-0 ${message.role === 'assistant' ? 'ring-2 ring-indigo-100 dark:ring-indigo-900' : ''}`}>
                    <AvatarFallback className={message.role === 'assistant' 
                      ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white' 
                      : 'bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800'}>
                      {message.role === 'assistant' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div
                      className={`inline-block px-4 py-3 rounded-2xl max-w-[85%] shadow-sm ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs opacity-70">
                        <span>{new Date(message.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        {message.model && (
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] py-0 px-2 ${
                              message.fromCache 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700' 
                                : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700'
                            }`}
                          >
                            {message.fromCache ? '⚡ Cache' : `🧠 ${message.model}`}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Avatar className="w-9 h-9 flex-shrink-0 ring-2 ring-indigo-100 dark:ring-indigo-900">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                      <Bot className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="inline-block px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t bg-gray-50/80 dark:bg-gray-900/80 p-4 backdrop-blur-sm">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Hỏi về tài chính của bạn..."
                  disabled={isTyping}
                  className="rounded-xl pr-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 shadow-sm"
                />
                {input && (
                  <button
                    onClick={() => setInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ✕
                  </button>
                )}
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="rounded-xl px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isTyping ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              💡 Tip: Hỏi về "tổng chi tiêu", "top danh mục", "so sánh tháng" hoặc "gợi ý tiết kiệm"
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: 'Trả lời nhanh', desc: 'Phản hồi trong vài giây', color: 'from-yellow-500 to-orange-500' },
          { icon: Brain, title: 'AI thông minh', desc: 'Phân tích sâu với Gemini', color: 'from-purple-500 to-pink-500' },
          { icon: Sparkles, title: 'Hoàn toàn miễn phí', desc: 'Không giới hạn câu hỏi', color: 'from-green-500 to-emerald-500' },
        ].map((feature, index) => (
          <div key={index} className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} opacity-10 flex items-center justify-center mb-3`}>
              <feature.icon className={`w-6 h-6 bg-gradient-to-br ${feature.color} bg-clip-text text-transparent`} style={{ WebkitTextFillColor: 'transparent' }} />
            </div>
            <h4 className="font-semibold mb-1">{feature.title}</h4>
            <p className="text-sm text-muted-foreground">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
