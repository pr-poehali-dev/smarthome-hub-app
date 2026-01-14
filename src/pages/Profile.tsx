import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { authStorage, checkPermission } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { User, Session, Activity } from '@/types';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(authStorage.getUser());
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name || '', email: user?.email || '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sessionsRes, activitiesRes] = await Promise.all([
        api.activity.getSessions(),
        api.activity.getAll(),
      ]);

      if (sessionsRes.sessions) setSessions(sessionsRes.sessions);
      if (activitiesRes.activities) setActivities(activitiesRes.activities);
    } catch (error) {
      console.error('Failed to load profile data', error);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);

    try {
      const response = await api.users.updateProfile(editData);
      
      if (response.success) {
        const updatedUser = { ...user!, name: editData.name, email: editData.email };
        setUser(updatedUser);
        authStorage.setUser(updatedUser);
        setEditMode(false);
        toast({ title: 'Профиль обновлён', description: 'Ваши данные успешно сохранены' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить профиль', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.new !== passwordData.confirm) {
      toast({ title: 'Ошибка', description: 'Новые пароли не совпадают', variant: 'destructive' });
      return;
    }

    setLoading(true);

    try {
      const response = await api.users.changePassword(passwordData.current, passwordData.new);
      
      if (response.success) {
        toast({ title: 'Пароль изменён', description: 'Ваш мастер-код успешно обновлён' });
        setPasswordData({ current: '', new: '', confirm: '' });
      } else {
        toast({ title: 'Ошибка', description: response.error || 'Неверный текущий пароль', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось изменить пароль', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const response = await api.activity.terminateSession(sessionId);
      
      if (response.success) {
        setSessions(sessions.filter(s => s.id !== sessionId));
        toast({ title: 'Сессия завершена', description: 'Устройство отключено от аккаунта' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось завершить сессию', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    authStorage.clear();
    navigate('/auth');
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      owner: { label: 'Владелец', variant: 'default' as const },
      admin: { label: 'Администратор', variant: 'secondary' as const },
      member: { label: 'Член семьи', variant: 'outline' as const },
    };
    return badges[role as keyof typeof badges] || badges.member;
  };

  const roleInfo = user ? getRoleBadge(user.role) : null;

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-xl font-semibold">Профиль</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6 max-w-2xl">
        <Card className="p-6 animate-fade-in">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">
                  {user?.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {roleInfo && (
                  <Badge variant={roleInfo.variant} className="mt-2">
                    {roleInfo.label}
                  </Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setEditMode(!editMode)}>
              <Icon name={editMode ? 'X' : 'Edit'} size={20} />
            </Button>
          </div>

          {editMode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Имя</Label>
                <Input
                  value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleUpdateProfile} disabled={loading} className="flex-1">
                  Сохранить
                </Button>
                <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                  Отмена
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">Дата регистрации</span>
                <span className="text-sm font-medium">{new Date(user?.createdAt || '').toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground">ID дома</span>
                <span className="text-sm font-medium font-mono">{user?.householdId}</span>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="Shield" size={20} />
            Безопасность
          </h3>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label>Текущий мастер-код</Label>
              <Input
                type="password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Новый мастер-код</Label>
              <Input
                type="password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Подтвердите новый код</Label>
              <Input
                type="password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              Изменить мастер-код
            </Button>
          </form>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Двухфакторная аутентификация</p>
                <p className="text-xs text-muted-foreground">Дополнительная защита аккаунта</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Биометрия</p>
                <p className="text-xs text-muted-foreground">Вход по отпечатку пальца</p>
              </div>
              <Switch />
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="Smartphone" size={20} />
            Активные сессии
          </h3>

          <div className="space-y-3">
            {sessions.length > 0 ? (
              sessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                      <Icon name="Smartphone" size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{session.deviceName}</p>
                      <p className="text-xs text-muted-foreground">{session.location}</p>
                      <p className="text-xs text-muted-foreground">{session.lastActive}</p>
                    </div>
                  </div>
                  {!session.current && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                    >
                      <Icon name="LogOut" size={16} />
                    </Button>
                  )}
                  {session.current && (
                    <Badge variant="secondary" className="text-xs">Текущая</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Нет активных сессий</p>
            )}
          </div>
        </Card>

        {checkPermission(user?.role || 'member', 'admin') && (
          <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <h3 className="font-semibold flex items-center gap-2">
              <Icon name="FileText" size={20} />
              Последняя активность
            </h3>

            <div className="space-y-3">
              {activities.slice(0, 5).map((activity) => (
                <div key={activity.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <Icon name={activity.icon as any} size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.deviceName}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <h3 className="font-semibold flex items-center gap-2">
            <Icon name="Settings" size={20} />
            Настройки приложения
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Уведомления о событиях</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Push-уведомления</span>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Темная тема</span>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        <Button variant="destructive" className="w-full" onClick={handleLogout}>
          <Icon name="LogOut" size={20} className="mr-2" />
          Выйти из аккаунта
        </Button>
      </div>
    </div>
  );
}
