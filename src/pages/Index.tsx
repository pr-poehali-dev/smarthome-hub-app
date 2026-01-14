import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { authStorage } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';

type Device = {
  id: string;
  name: string;
  type: string;
  status: 'online' | 'offline';
  active: boolean;
  value?: number;
  room: string;
  icon: string;
  power?: number;
};

const mockDevices: Device[] = [
  { id: '1', name: 'Гостиная', type: 'Освещение', status: 'online', active: true, value: 75, room: 'Гостиная', icon: 'Lightbulb', power: 45 },
  { id: '2', name: 'Кондиционер', type: 'Климат', status: 'online', active: true, value: 22, room: 'Спальня', icon: 'Wind', power: 1200 },
  { id: '3', name: 'Умная розетка', type: 'Питание', status: 'online', active: false, room: 'Кухня', icon: 'Plug', power: 0 },
  { id: '4', name: 'Камера безопасности', type: 'Безопасность', status: 'online', active: true, room: 'Входная дверь', icon: 'Camera', power: 8 },
  { id: '5', name: 'Дверной замок', type: 'Безопасность', status: 'online', active: false, room: 'Входная дверь', icon: 'Lock', power: 2 },
  { id: '6', name: 'Термостат', type: 'Климат', status: 'offline', active: false, value: 18, room: 'Коридор', icon: 'Thermometer', power: 0 },
];

const activities = [
  { id: '1', device: 'Гостиная', action: 'Включено освещение', time: '2 мин назад', icon: 'Lightbulb' },
  { id: '2', device: 'Кондиционер', action: 'Температура изменена на 22°C', time: '15 мин назад', icon: 'Wind' },
  { id: '3', device: 'Камера безопасности', action: 'Обнаружено движение', time: '1 час назад', icon: 'Camera' },
  { id: '4', device: 'Дверной замок', action: 'Дверь закрыта', time: '2 часа назад', icon: 'Lock' },
];

export default function Index() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [currentView, setCurrentView] = useState<'home' | 'dashboard' | 'device'>('home');

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      navigate('/auth');
      return;
    }
    loadDevices();
  }, [navigate]);

  const loadDevices = async () => {
    try {
      const response = await api.devices.getAll();
      if (response.devices) {
        setDevices(response.devices);
      }
    } catch (error) {
      console.error('Failed to load devices', error);
    }
  };

  const toggleDevice = async (id: string) => {
    const device = devices.find(d => d.id === id);
    if (!device) return;

    const newState = !device.active;
    
    setDevices(devices.map(d => 
      d.id === id ? { ...d, active: newState, power: newState ? (d.power || 50) : 0 } : d
    ));

    try {
      await api.devices.sendAction(id, newState ? 'turn_on' : 'turn_off');
      toast({ title: newState ? 'Устройство включено' : 'Устройство выключено' });
    } catch (error) {
      setDevices(devices.map(d => 
        d.id === id ? { ...d, active: device.active } : d
      ));
      toast({ title: 'Ошибка', description: 'Не удалось изменить состояние', variant: 'destructive' });
    }
  };

  const updateDeviceValue = async (id: string, value: number) => {
    setDevices(devices.map(d => 
      d.id === id ? { ...d, value } : d
    ));

    try {
      await api.devices.sendAction(id, 'set_value', value);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось обновить значение', variant: 'destructive' });
    }
  };

  const activeDevices = devices.filter(d => d.active).length;
  const totalPower = devices.reduce((sum, d) => sum + (d.power || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {currentView === 'device' && selectedDevice ? (
        <div className="animate-fade-in">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 py-4 flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setCurrentView('home')}
              >
                <Icon name="ArrowLeft" size={20} />
              </Button>
              <h1 className="text-xl font-semibold">{selectedDevice.name}</h1>
              <Badge className={cn(
                "ml-auto",
                selectedDevice.status === 'online' ? 'bg-secondary text-secondary-foreground' : 'bg-muted'
              )}>
                {selectedDevice.status === 'online' ? 'Онлайн' : 'Оффлайн'}
              </Badge>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6 space-y-6">
            <Card className="p-6 space-y-6 animate-slide-up">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center",
                    selectedDevice.active ? 'bg-primary/20' : 'bg-muted'
                  )}>
                    <Icon 
                      name={selectedDevice.icon as any} 
                      size={32} 
                      className={cn(
                        selectedDevice.active ? 'text-primary' : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedDevice.type}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDevice.room}</p>
                  </div>
                </div>
                <Switch 
                  checked={selectedDevice.active}
                  onCheckedChange={() => toggleDevice(selectedDevice.id)}
                  disabled={selectedDevice.status === 'offline'}
                />
              </div>

              {selectedDevice.value !== undefined && selectedDevice.active && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {selectedDevice.type === 'Освещение' ? 'Яркость' : 'Температура'}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {selectedDevice.value}{selectedDevice.type === 'Климат' ? '°C' : '%'}
                    </span>
                  </div>
                  <Slider 
                    value={[selectedDevice.value]} 
                    onValueChange={(v) => updateDeviceValue(selectedDevice.id, v[0])}
                    max={selectedDevice.type === 'Климат' ? 30 : 100}
                    min={selectedDevice.type === 'Климат' ? 16 : 0}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Энергопотребление</p>
                  <p className="text-lg font-semibold">{selectedDevice.power || 0} Вт</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Время работы</p>
                  <p className="text-lg font-semibold">24 ч 15 м</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <h3 className="font-semibold">История активности</h3>
              <div className="space-y-3">
                {[
                  { action: 'Устройство включено', time: '14:32', date: 'Сегодня' },
                  { action: 'Изменены настройки', time: '12:15', date: 'Сегодня' },
                  { action: 'Устройство выключено', time: '23:45', date: 'Вчера' },
                  { action: 'Обнаружена ошибка', time: '18:20', date: 'Вчера' },
                ].map((event, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{event.action}</p>
                      <p className="text-xs text-muted-foreground">{event.date}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{event.time}</span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-semibold">Настройки</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Автоматизация</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Уведомления</span>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Голосовое управление</span>
                  <Switch />
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <Tabs value={currentView} onValueChange={(v) => setCurrentView(v as any)} className="w-full">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">SmartHome Hub</h1>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => navigate('/security')}>
                    <Icon name="Shield" size={20} />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                    <Icon name="User" size={20} />
                  </Button>
                </div>
              </div>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="home" className="gap-2">
                  <Icon name="Home" size={16} />
                  Устройства
                </TabsTrigger>
                <TabsTrigger value="dashboard" className="gap-2">
                  <Icon name="LayoutDashboard" size={16} />
                  Дашборд
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6">
            <TabsContent value="home" className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                {devices.map((device, idx) => (
                  <Card 
                    key={device.id}
                    className={cn(
                      "p-4 cursor-pointer transition-all hover:scale-[1.02] animate-slide-up",
                      device.active && device.status === 'online' && "ring-2 ring-primary/50"
                    )}
                    style={{ animationDelay: `${idx * 0.05}s` }}
                    onClick={() => {
                      setSelectedDevice(device);
                      setCurrentView('device');
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        device.active && device.status === 'online' ? 'bg-primary/20' : 'bg-muted'
                      )}>
                        <Icon 
                          name={device.icon as any} 
                          size={24} 
                          className={cn(
                            device.active && device.status === 'online' ? 'text-primary' : 'text-muted-foreground',
                            device.active && device.status === 'online' && 'animate-pulse-slow'
                          )}
                        />
                      </div>
                      <Badge 
                        variant={device.status === 'online' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {device.status === 'online' ? 'ON' : 'OFF'}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{device.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{device.room}</p>
                    {device.value !== undefined && device.active && (
                      <p className="text-lg font-bold text-primary">
                        {device.value}{device.type === 'Климат' ? '°C' : '%'}
                      </p>
                    )}
                  </Card>
                ))}
              </div>

              <Button 
                className="w-full gap-2 animate-scale-in" 
                style={{ animationDelay: '0.3s' }}
                onClick={() => navigate('/add-device')}
              >
                <Icon name="Plus" size={20} />
                Добавить устройство
              </Button>
            </TabsContent>

            <TabsContent value="dashboard" className="mt-0 space-y-4">
              <div className="grid grid-cols-2 gap-3 animate-fade-in">
                <Card className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Power" size={16} />
                    <span className="text-xs">Активных</span>
                  </div>
                  <p className="text-3xl font-bold text-primary">{activeDevices}</p>
                  <p className="text-xs text-muted-foreground">из {devices.length} устройств</p>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Zap" size={16} />
                    <span className="text-xs">Энергия</span>
                  </div>
                  <p className="text-3xl font-bold text-secondary">{totalPower}</p>
                  <p className="text-xs text-muted-foreground">Ватт/час</p>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Users" size={16} />
                    <span className="text-xs">Участники</span>
                  </div>
                  <p className="text-3xl font-bold">4</p>
                  <p className="text-xs text-muted-foreground">в вашем доме</p>
                </Card>

                <Card className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon name="Activity" size={16} />
                    <span className="text-xs">События</span>
                  </div>
                  <p className="text-3xl font-bold">47</p>
                  <p className="text-xs text-muted-foreground">сегодня</p>
                </Card>
              </div>

              <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Потребление энергии</h3>
                  <Button variant="ghost" size="sm">
                    <Icon name="TrendingUp" size={16} />
                  </Button>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Сегодня</span>
                      <span className="text-sm font-medium">12.4 кВт⋅ч</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Вчера</span>
                      <span className="text-sm font-medium">15.2 кВт⋅ч</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Неделя</span>
                      <span className="text-sm font-medium">89.6 кВт⋅ч</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                </div>
              </Card>

              <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="font-semibold">Последние события</h3>
                <div className="space-y-3">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <Icon name={activity.icon as any} size={18} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{activity.device}</p>
                        <p className="text-xs text-muted-foreground truncate">{activity.action}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 space-y-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <h3 className="font-semibold">Быстрые сценарии</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Icon name="Moon" size={24} />
                    <span className="text-xs">Спокойной ночи</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Icon name="Sun" size={24} />
                    <span className="text-xs">Доброе утро</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Icon name="Home" size={24} />
                    <span className="text-xs">Я дома</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2">
                    <Icon name="DoorOpen" size={24} />
                    <span className="text-xs">Ухожу</span>
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      )}
    </div>
  );
}