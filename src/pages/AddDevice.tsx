import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { api } from '@/lib/api';
import { authStorage, checkPermission } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type DiscoveredDevice = {
  id: string;
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  ip: string;
  icon: string;
};

const mockDiscoveredDevices: DiscoveredDevice[] = [
  { id: '1', name: 'Philips Hue Bridge', type: 'lighting', manufacturer: 'Philips', model: 'Hue Bridge 2.0', ip: '192.168.1.101', icon: 'Lightbulb' },
  { id: '2', name: 'Smart Thermostat', type: 'climate', manufacturer: 'Nest', model: 'Learning Thermostat', ip: '192.168.1.102', icon: 'Thermometer' },
  { id: '3', name: 'Security Camera', type: 'security', manufacturer: 'Ring', model: 'Stick Up Cam', ip: '192.168.1.103', icon: 'Camera' },
  { id: '4', name: 'Smart Plug', type: 'power', manufacturer: 'TP-Link', model: 'HS100', ip: '192.168.1.104', icon: 'Plug' },
];

const deviceTypes = [
  { value: 'lighting', label: 'Освещение', icon: 'Lightbulb' },
  { value: 'climate', label: 'Климат', icon: 'Wind' },
  { value: 'security', label: 'Безопасность', icon: 'Shield' },
  { value: 'power', label: 'Питание', icon: 'Plug' },
  { value: 'entertainment', label: 'Развлечения', icon: 'Tv' },
  { value: 'appliance', label: 'Бытовая техника', icon: 'Smartphone' },
];

const rooms = [
  'Гостиная', 'Спальня', 'Кухня', 'Ванная', 'Коридор', 'Детская', 'Гараж', 'Кабинет'
];

export default function AddDevice() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const user = authStorage.getUser();
  const canAdd = checkPermission(user?.role || 'member', 'admin');

  const [scanning, setScanning] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<DiscoveredDevice[]>([]);
  const [adding, setAdding] = useState(false);

  const [manualDevice, setManualDevice] = useState({
    name: '',
    type: '',
    room: '',
    ip: '',
    manufacturer: '',
    model: '',
  });

  const handleScan = async () => {
    if (!canAdd) {
      toast({ title: 'Нет доступа', description: 'У вас нет прав для добавления устройств', variant: 'destructive' });
      return;
    }

    setScanning(true);
    toast({ title: 'Поиск устройств...', description: 'Сканируем локальную сеть' });

    setTimeout(() => {
      setDiscoveredDevices(mockDiscoveredDevices);
      setScanning(false);
      toast({ title: 'Поиск завершён', description: `Найдено устройств: ${mockDiscoveredDevices.length}` });
    }, 3000);
  };

  const handleAddDiscovered = async (device: DiscoveredDevice) => {
    if (!canAdd) {
      toast({ title: 'Нет доступа', description: 'У вас нет прав для добавления устройств', variant: 'destructive' });
      return;
    }

    setAdding(true);

    try {
      const response = await api.devices.create({
        name: device.name,
        type: device.type,
        manufacturer: device.manufacturer,
        model: device.model,
        ip: device.ip,
        room: 'Не указана',
        icon: device.icon,
      });

      if (response.success) {
        toast({ title: 'Устройство добавлено!', description: `${device.name} успешно подключено` });
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить устройство', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleAddManual = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canAdd) {
      toast({ title: 'Нет доступа', description: 'У вас нет прав для добавления устройств', variant: 'destructive' });
      return;
    }

    setAdding(true);

    try {
      const typeInfo = deviceTypes.find(t => t.value === manualDevice.type);
      const response = await api.devices.create({
        ...manualDevice,
        icon: typeInfo?.icon || 'Smartphone',
      });

      if (response.success) {
        toast({ title: 'Устройство добавлено!', description: `${manualDevice.name} успешно создано` });
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось добавить устройство', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  if (!canAdd) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md animate-fade-in">
          <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={32} className="text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Нет доступа</h2>
          <p className="text-muted-foreground mb-6">
            Только владелец или администратор может добавлять новые устройства
          </p>
          <Button onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Вернуться назад
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <h1 className="text-xl font-semibold">Добавить устройство</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <Tabs defaultValue="scan" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="scan">Поиск в сети</TabsTrigger>
            <TabsTrigger value="manual">Вручную</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="space-y-4">
            <Card className="p-6 text-center animate-fade-in">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name={scanning ? 'Loader2' : 'Wifi'} size={40} className={cn('text-primary', scanning && 'animate-spin')} />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {scanning ? 'Поиск устройств...' : 'Автоматический поиск'}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {scanning
                  ? 'Сканируем локальную сеть на наличие умных устройств'
                  : 'Найдём все доступные устройства в вашей сети Wi-Fi'}
              </p>
              <Button onClick={handleScan} disabled={scanning} className="w-full">
                {scanning ? 'Поиск...' : 'Начать поиск'}
              </Button>
            </Card>

            {discoveredDevices.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold">Найденные устройства ({discoveredDevices.length})</h3>
                {discoveredDevices.map((device, idx) => (
                  <Card
                    key={device.id}
                    className="p-4 animate-slide-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name={device.icon as any} size={24} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm">{device.name}</h4>
                        <p className="text-xs text-muted-foreground">{device.manufacturer} • {device.model}</p>
                        <p className="text-xs text-muted-foreground font-mono">{device.ip}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddDiscovered(device)}
                        disabled={adding}
                      >
                        <Icon name="Plus" size={16} className="mr-1" />
                        Добавить
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <Card className="p-6 animate-fade-in">
              <form onSubmit={handleAddManual} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="device-name">Название устройства</Label>
                  <Input
                    id="device-name"
                    placeholder="Например: Лампа в гостиной"
                    value={manualDevice.name}
                    onChange={(e) => setManualDevice({ ...manualDevice, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device-type">Тип устройства</Label>
                  <Select value={manualDevice.type} onValueChange={(v) => setManualDevice({ ...manualDevice, type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <Icon name={type.icon as any} size={16} />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device-room">Комната</Label>
                  <Select value={manualDevice.room} onValueChange={(v) => setManualDevice({ ...manualDevice, room: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите комнату" />
                    </SelectTrigger>
                    <SelectContent>
                      {rooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="device-manufacturer">Производитель</Label>
                    <Input
                      id="device-manufacturer"
                      placeholder="Philips, Xiaomi..."
                      value={manualDevice.manufacturer}
                      onChange={(e) => setManualDevice({ ...manualDevice, manufacturer: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="device-model">Модель</Label>
                    <Input
                      id="device-model"
                      placeholder="Hue E27"
                      value={manualDevice.model}
                      onChange={(e) => setManualDevice({ ...manualDevice, model: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="device-ip">IP-адрес (опционально)</Label>
                  <Input
                    id="device-ip"
                    placeholder="192.168.1.100"
                    value={manualDevice.ip}
                    onChange={(e) => setManualDevice({ ...manualDevice, ip: e.target.value })}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={adding}>
                  {adding ? 'Добавление...' : 'Добавить устройство'}
                </Button>
              </form>
            </Card>

            <Card className="p-4 bg-blue-500/10 border-blue-500/20">
              <div className="flex items-start gap-3">
                <Icon name="Info" size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Советы по добавлению</p>
                  <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
                    <li>Убедитесь, что устройство подключено к той же Wi-Fi сети</li>
                    <li>Некоторые устройства требуют предварительной настройки через приложение производителя</li>
                    <li>IP-адрес можно найти в настройках роутера</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
