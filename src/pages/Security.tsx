import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { authStorage, checkPermission } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Camera } from '@/types';
import { cn } from '@/lib/utils';

const mockCameras: Camera[] = [
  { id: '1', name: 'Входная дверь', location: 'Главный вход', status: 'online', recording: true, thumbnailUrl: '/placeholder.svg' },
  { id: '2', name: 'Гараж', location: 'Гараж', status: 'online', recording: false, thumbnailUrl: '/placeholder.svg' },
  { id: '3', name: 'Задний двор', location: 'Задний двор', status: 'offline', recording: false, thumbnailUrl: '/placeholder.svg' },
  { id: '4', name: 'Детская комната', location: '2 этаж', status: 'online', recording: true, thumbnailUrl: '/placeholder.svg' },
];

export default function Security() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authStorage.getUser();
  const canControl = checkPermission(user?.role || 'member', 'admin');

  const [cameras, setCameras] = useState<Camera[]>(mockCameras);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [armedMode, setArmedMode] = useState(false);
  const [motionDetection, setMotionDetection] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);

  useEffect(() => {
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const response = await api.cameras.getAll();
      if (response.cameras) {
        setCameras(response.cameras);
      }
    } catch (error) {
      console.error('Failed to load cameras', error);
    }
  };

  const toggleRecording = async (cameraId: string, currentState: boolean) => {
    if (!canControl) {
      toast({ title: 'Нет доступа', description: 'У вас нет прав для управления камерами', variant: 'destructive' });
      return;
    }

    try {
      const response = currentState
        ? await api.cameras.stopRecording(cameraId)
        : await api.cameras.startRecording(cameraId);

      if (response.success) {
        setCameras(cameras.map(c =>
          c.id === cameraId ? { ...c, recording: !currentState } : c
        ));
        toast({ title: currentState ? 'Запись остановлена' : 'Запись началась' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось изменить состояние камеры', variant: 'destructive' });
    }
  };

  const handleArmedModeToggle = (checked: boolean) => {
    if (!canControl) {
      toast({ title: 'Нет доступа', description: 'Только владелец или администратор может изменить режим охраны', variant: 'destructive' });
      return;
    }
    setArmedMode(checked);
    toast({
      title: checked ? 'Режим охраны активирован' : 'Режим охраны отключён',
      description: checked ? 'Система готова к обнаружению угроз' : 'Режим наблюдения',
    });
  };

  const events = [
    { id: '1', type: 'motion', camera: 'Входная дверь', time: '5 мин назад', severity: 'medium' },
    { id: '2', type: 'sound', camera: 'Гараж', time: '15 мин назад', severity: 'low' },
    { id: '3', type: 'motion', camera: 'Задний двор', time: '1 час назад', severity: 'high' },
    { id: '4', type: 'recording', camera: 'Детская комната', time: '2 часа назад', severity: 'low' },
  ];

  const getEventIcon = (type: string) => {
    const icons = { motion: 'PersonStanding', sound: 'Volume2', recording: 'Video' };
    return icons[type as keyof typeof icons] || 'AlertTriangle';
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-blue-500',
    };
    return colors[severity as keyof typeof colors];
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <h1 className="text-xl font-semibold">Безопасность</h1>
            </div>
            <Badge className={cn(armedMode ? 'bg-red-500' : 'bg-secondary')}>
              {armedMode ? 'Охрана' : 'Наблюдение'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        <Card className="p-6 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                armedMode ? 'bg-red-500/20' : 'bg-secondary/20'
              )}>
                <Icon name="Shield" size={24} className={cn(armedMode ? 'text-red-500' : 'text-secondary')} />
              </div>
              <div>
                <h3 className="font-semibold">Режим охраны</h3>
                <p className="text-xs text-muted-foreground">
                  {armedMode ? 'Активное обнаружение угроз' : 'Пассивное наблюдение'}
                </p>
              </div>
            </div>
            <Switch
              checked={armedMode}
              onCheckedChange={handleArmedModeToggle}
              disabled={!canControl}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{cameras.filter(c => c.status === 'online').length}</p>
              <p className="text-xs text-muted-foreground">Онлайн</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-secondary">{cameras.filter(c => c.recording).length}</p>
              <p className="text-xs text-muted-foreground">Запись</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground">События</p>
            </div>
          </div>
        </Card>

        <Tabs defaultValue="cameras" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cameras">Камеры</TabsTrigger>
            <TabsTrigger value="events">События</TabsTrigger>
          </TabsList>

          <TabsContent value="cameras" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              {cameras.map((camera, idx) => (
                <Card
                  key={camera.id}
                  className={cn(
                    "p-4 cursor-pointer transition-all hover:scale-[1.02] animate-slide-up",
                    camera.recording && "ring-2 ring-red-500/50"
                  )}
                  style={{ animationDelay: `${idx * 0.05}s` }}
                  onClick={() => setSelectedCamera(camera)}
                >
                  <div className="aspect-video bg-muted rounded-lg mb-3 relative overflow-hidden">
                    <img src={camera.thumbnailUrl} alt={camera.name} className="w-full h-full object-cover" />
                    {camera.recording && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        REC
                      </div>
                    )}
                    {camera.status === 'offline' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Icon name="WifiOff" size={24} className="text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-sm mb-1">{camera.name}</h3>
                      <p className="text-xs text-muted-foreground">{camera.location}</p>
                    </div>
                    <Badge variant={camera.status === 'online' ? 'default' : 'secondary'} className="text-xs">
                      {camera.status === 'online' ? 'ON' : 'OFF'}
                    </Badge>
                  </div>

                  {camera.status === 'online' && canControl && (
                    <Button
                      size="sm"
                      variant={camera.recording ? 'destructive' : 'outline'}
                      className="w-full mt-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRecording(camera.id, camera.recording);
                      }}
                    >
                      <Icon name={camera.recording ? 'StopCircle' : 'Video'} size={16} className="mr-1" />
                      {camera.recording ? 'Остановить' : 'Записать'}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-4">
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Настройки уведомлений</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Обнаружение движения</p>
                    <p className="text-xs text-muted-foreground">Уведомления при движении</p>
                  </div>
                  <Switch checked={motionDetection} onCheckedChange={setMotionDetection} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Звуковые оповещения</p>
                    <p className="text-xs text-muted-foreground">Тревога при обнаружении звука</p>
                  </div>
                  <Switch checked={soundAlerts} onCheckedChange={setSoundAlerts} />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="font-semibold">Последние события</h3>

              <div className="space-y-3">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      "bg-muted"
                    )}>
                      <Icon
                        name={getEventIcon(event.type) as any}
                        size={18}
                        className={getSeverityColor(event.severity)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{event.camera}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.type === 'motion' && 'Обнаружено движение'}
                        {event.type === 'sound' && 'Зафиксирован звук'}
                        {event.type === 'recording' && 'Запись начата'}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{event.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {!canControl && (
          <Card className="p-4 bg-yellow-500/10 border-yellow-500/20">
            <div className="flex items-start gap-3">
              <Icon name="Lock" size={20} className="text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Ограниченный доступ</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Вы можете только просматривать камеры. Управление доступно владельцу и администратору.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
