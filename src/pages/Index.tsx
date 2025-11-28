import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import Game3D from '@/components/Game3D';
import MobileJoystick from '@/components/MobileJoystick';

interface Block {
  x: number;
  y: number;
  z: number;
  color: string;
  type: string;
}

interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
}

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
}

const BLOCK_TYPES = [
  { name: 'Чеддер', color: '#F59E0B', icon: 'Sparkles' },
  { name: 'Пармезан', color: '#FDE047', icon: 'Star' },
  { name: 'Моцарелла', color: '#FEFCE8', icon: 'Cloud' },
  { name: 'Голубой сыр', color: '#93C5FD', icon: 'Snowflake' },
  { name: 'Гауда', color: '#FB923C', icon: 'Circle' },
  { name: 'Швейцарский', color: '#FEF3C7', icon: 'Disc' },
];

export default function Index() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlock, setSelectedBlock] = useState(0);
  const [rotation, setRotation] = useState({ x: 30, y: 45 });
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 5, z: 0 });
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'Система', message: 'Добро пожаловать в сырный мир!', timestamp: new Date() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [rooms, setRooms] = useState<Room[]>([
    { id: '1', name: 'Сырная Долина', players: 3, maxPlayers: 8 },
    { id: '2', name: 'Замок из Чеддера', players: 5, maxPlayers: 10 },
    { id: '3', name: 'Пармезановый Рай', players: 2, maxPlayers: 6 },
  ]);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [showUI, setShowUI] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [joystickMove, setJoystickMove] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    
    const initialBlocks: Block[] = [];
    for (let x = -5; x <= 5; x++) {
      for (let z = -5; z <= 5; z++) {
        initialBlocks.push({
          x,
          y: 0,
          z,
          color: '#F59E0B',
          type: 'Чеддер',
        });
      }
    }
    setBlocks(initialBlocks);
  }, []);

  const handleAddBlock = (x: number, y: number, z: number) => {
    const newBlock = {
      x,
      y,
      z,
      color: BLOCK_TYPES[selectedBlock].color,
      type: BLOCK_TYPES[selectedBlock].name,
    };
    setBlocks([...blocks, newBlock]);
  };

  const handleRemoveBlock = (x: number, y: number, z: number) => {
    setBlocks(blocks.filter(b => !(b.x === x && b.y === y && b.z === z)));
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        user: 'Игрок',
        message: chatInput,
        timestamp: new Date(),
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatInput('');
    }
  };

  const handleJoinRoom = (roomId: string) => {
    setCurrentRoom(roomId);
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-200 via-yellow-100 to-amber-50 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-6xl font-bold text-amber-900 drop-shadow-lg">🧀 CheeseWorld</h1>
            <p className="text-2xl text-amber-800 font-semibold">Строй сырные миры вместе с друзьями!</p>
          </div>

          <Card className="p-8 block-shadow bg-white">
            <h2 className="text-3xl font-bold mb-6 text-primary">Игровые комнаты</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {rooms.map(room => (
                <Card
                  key={room.id}
                  className="p-6 hover:scale-105 transition-transform cursor-pointer block-shadow-sm bg-gradient-to-br from-amber-50 to-yellow-50"
                  onClick={() => handleJoinRoom(room.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Icon name="Gamepad2" size={24} className="text-primary" />
                      <h3 className="text-xl font-bold text-foreground">{room.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Icon name="Users" size={18} />
                      <span className="font-semibold">
                        {room.players}/{room.maxPlayers} игроков
                      </span>
                    </div>
                    <Button className="w-full font-bold block-shadow">Присоединиться</Button>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-8">
              <Button className="w-full font-bold text-lg block-shadow bg-secondary hover:bg-secondary/90">
                <Icon name="Plus" size={20} className="mr-2" />
                Создать свою комнату
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-gradient-to-b from-amber-200 to-yellow-100 relative">
      <div className="absolute inset-0">
        <Game3D
          blocks={blocks}
          selectedBlock={selectedBlock}
          blockTypes={BLOCK_TYPES}
          onAddBlock={handleAddBlock}
          onRemoveBlock={handleRemoveBlock}
        />
      </div>

      {showUI && (
        <>
          <div className="absolute top-4 left-4 right-4 flex items-start gap-4 z-50">
            <Card className="px-6 py-3 block-shadow bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <Icon name="Gamepad2" size={24} className="text-primary" />
                <span className="font-bold text-lg">{rooms.find(r => r.id === currentRoom)?.name}</span>
              </div>
            </Card>

            <Card className="px-6 py-3 block-shadow bg-white/95 backdrop-blur">
              <div className="flex items-center gap-3">
                <Icon name="Users" size={24} className="text-secondary" />
                <span className="font-bold text-lg">5 игроков онлайн</span>
              </div>
            </Card>

            <Button
              size="lg"
              variant="destructive"
              className="ml-auto font-bold block-shadow"
              onClick={() => setCurrentRoom(null)}
            >
              Выйти из комнаты
            </Button>
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50">
            <Card className="p-4 block-shadow bg-white/95 backdrop-blur">
              <div className="flex gap-2">
                {BLOCK_TYPES.map((block, index) => (
                  <Button
                    key={index}
                    variant={selectedBlock === index ? 'default' : 'outline'}
                    size="lg"
                    className={`w-20 h-20 flex flex-col items-center gap-1 font-bold block-shadow ${
                      selectedBlock === index ? 'ring-4 ring-primary' : ''
                    }`}
                    style={{
                      backgroundColor: selectedBlock === index ? block.color : 'transparent',
                      color: selectedBlock === index ? 'white' : block.color,
                    }}
                    onClick={() => setSelectedBlock(index)}
                  >
                    <Icon name={block.icon as any} size={28} />
                    <span className="text-xs">{block.name}</span>
                  </Button>
                ))}
              </div>
            </Card>
          </div>

          <div className="absolute bottom-4 right-4 w-96 z-50">
            <Card className="block-shadow bg-white/95 backdrop-blur">
              <Tabs defaultValue="chat" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="chat" className="flex-1 font-bold">
                    <Icon name="MessageCircle" size={18} className="mr-2" />
                    Чат
                  </TabsTrigger>
                  <TabsTrigger value="players" className="flex-1 font-bold">
                    <Icon name="Users" size={18} className="mr-2" />
                    Игроки
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="p-0">
                  <ScrollArea className="h-64 p-4">
                    <div className="space-y-2">
                      {chatMessages.map(msg => (
                        <div key={msg.id} className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{msg.user}</span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      placeholder="Написать сообщение..."
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                      className="font-medium"
                    />
                    <Button onClick={handleSendMessage} className="font-bold block-shadow">
                      <Icon name="Send" size={18} />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="players" className="p-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {['Игрок1', 'Игрок2', 'Игрок3', 'Игрок4', 'Игрок5'].map((player, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white block-shadow"
                            style={{
                              backgroundColor: BLOCK_TYPES[index % BLOCK_TYPES.length].color,
                            }}
                          >
                            {player[0]}
                          </div>
                          <span className="font-bold">{player}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="absolute top-4 right-4 z-50">
            <Card className="p-3 block-shadow bg-white/95 backdrop-blur">
              <div className="space-y-2 text-sm font-medium">
                {!isMobile ? (
                  <>
                    <div className="flex items-center gap-2">
                      <Icon name="MousePointer" size={16} className="text-primary" />
                      <span>Клик - захват мыши</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Keyboard" size={16} className="text-secondary" />
                      <span>WASD - движение</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Mouse" size={16} className="text-accent" />
                      <span>Мышь - обзор</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Icon name="Gamepad2" size={16} className="text-primary" />
                      <span>Джойстик - движение</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Hand" size={16} className="text-secondary" />
                      <span>Свайп - обзор</span>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          {isMobile && (
            <MobileJoystick onMove={(x, y) => setJoystickMove({ x, y })} />
          )}
        </>
      )}
    </div>
  );
}