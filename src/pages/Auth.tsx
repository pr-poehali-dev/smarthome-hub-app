import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', masterCode: '' });
  const [registerData, setRegisterData] = useState({ email: '', name: '', masterCode: '', confirmCode: '' });
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.auth.login(loginData.email, loginData.masterCode);
      
      if (response.token) {
        authStorage.setToken(response.token);
        authStorage.setUser(response.user);
        toast({ title: 'Вход выполнен!', description: 'Добро пожаловать в SmartHome Hub' });
        navigate('/');
      } else {
        toast({ title: 'Ошибка', description: response.error || 'Неверные данные', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось выполнить вход', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.masterCode !== registerData.confirmCode) {
      toast({ title: 'Ошибка', description: 'Мастер-коды не совпадают', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const response = await api.auth.register(registerData.email, registerData.name, registerData.masterCode);
      
      if (response.token) {
        authStorage.setToken(response.token);
        authStorage.setUser(response.user);
        toast({ title: 'Регистрация успешна!', description: 'Ваш аккаунт создан' });
        navigate('/');
      } else {
        toast({ title: 'Ошибка', description: response.error || 'Не удалось создать аккаунт', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось зарегистрироваться', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.auth.forgotPassword(forgotEmail);
      
      if (response.success) {
        toast({ title: 'Письмо отправлено', description: 'Проверьте вашу почту для восстановления доступа' });
        setForgotEmail('');
      } else {
        toast({ title: 'Ошибка', description: response.error || 'Не удалось отправить письмо', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить запрос', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 animate-fade-in">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Icon name="Home" size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold">SmartHome Hub</h1>
          <p className="text-muted-foreground">Управление умным домом</p>
        </div>

        <Card className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
              <TabsTrigger value="forgot">Восстановление</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="your@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-code">Мастер-код</Label>
                  <Input
                    id="login-code"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.masterCode}
                    onChange={(e) => setLoginData({ ...loginData, masterCode: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Вход...' : 'Войти'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Имя</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Ваше имя"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-code">Мастер-код</Label>
                  <Input
                    id="register-code"
                    type="password"
                    placeholder="Создайте мастер-код"
                    value={registerData.masterCode}
                    onChange={(e) => setRegisterData({ ...registerData, masterCode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm">Подтвердите код</Label>
                  <Input
                    id="register-confirm"
                    type="password"
                    placeholder="Повторите мастер-код"
                    value={registerData.confirmCode}
                    onChange={(e) => setRegisterData({ ...registerData, confirmCode: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Создание аккаунта...' : 'Создать аккаунт'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="forgot" className="space-y-4">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Мы отправим инструкции для восстановления доступа
                  </p>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Отправка...' : 'Отправить инструкции'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>© 2026 SmartHome Hub. Безопасное управление домом.</p>
        </div>
      </div>
    </div>
  );
}
