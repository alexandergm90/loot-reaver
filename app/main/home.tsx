import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <View className="px-2 py-0.5 rounded-full border border-zinc-800 bg-zinc-100">
    <Text className="text-[11px] font-medium text-zinc-900">{label}</Text>
  </View>
);

const Card: React.FC<{ title: string; className?: string; children?: React.ReactNode }> = ({ title, className = '', children }) => (
  <View className={`rounded-2xl border-2 border-zinc-900 bg-[#F3E8D1] ${className}`}>
    <View className="px-4 pt-3 pb-2 border-b-2 border-zinc-900/70">
      <Text className="text-zinc-900 font-extrabold tracking-wide">{title}</Text>
    </View>
    <View className="p-4">{children}</View>
  </View>
);

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 3600);
  const m = Math.floor((left % 3600) / 60);
  const s = left % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const IconBox: React.FC<{ label: string }> = ({ label }) => (
  <View className="h-6 w-6 rounded-md border-2 border-zinc-900 bg-zinc-200 mr-2" accessibilityLabel={label} />
);

const ButtonBox: React.FC<React.PropsWithChildren<{ onPress?: () => void; className?: string }>> = ({ children, onPress, className = '' }) => (
  <Pressable onPress={onPress} className={`rounded-xl border-2 border-zinc-900 px-3 py-2 ${className}`}>
    {typeof children === 'string' ? <Text className="font-bold text-zinc-900">{children}</Text> : children}
  </Pressable>
);

export default function Home() {
  const [claimed, setClaimed] = useState(false);
  const countdown = useCountdown(6 * 60 * 60 + 23 * 60 + 12);
  const [tab, setTab] = useState<'home' | 'character' | 'inventory' | 'map' | 'shop'>('home');
  const xp = 62;

  const Content = (
    <ScrollView className="flex-1 px-3 pb-28" contentContainerStyle={{ paddingBottom: 28 }}>
      <Card title="Enter Adventure" className="mt-3">
        <View className="flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <View className="flex-row items-center gap-2">
            <IconBox label="dungeon" />
            <View>
              <Text className="font-bold text-zinc-900">Dungeon: Ember Crypts</Text>
              <Text className="text-xs text-zinc-700">Recommended Power 120</Text>
            </View>
          </View>
          <View className="flex-row items-center gap-2">
            <ButtonBox onPress={() => {}}>Enter Dungeon</ButtonBox>
            <ButtonBox>Arena</ButtonBox>
            <ButtonBox>Town</ButtonBox>
          </View>
        </View>
        <View className="mt-4 h-24 rounded-xl border-2 border-zinc-900 bg-zinc-200 items-center justify-center">
          <Text className="text-sm font-semibold text-zinc-900">Event Banner (carousel)</Text>
        </View>
      </Card>

      <View className="mt-3 grid grid-cols-2 gap-3">
        <ButtonBox onPress={() => setClaimed(true)} className={`bg-[#F3E8D1] ${claimed ? 'opacity-60' : ''}`}>
          {claimed ? 'Claimed' : 'Daily Login'}
        </ButtonBox>
        <ButtonBox className="bg-[#F3E8D1]">Quests 2/5</ButtonBox>
        <ButtonBox className="bg-[#F3E8D1]">Season 3</ButtonBox>
        <ButtonBox className="bg-[#F3E8D1]">Cosmetics</ButtonBox>
      </View>

      <View className="mt-3 grid grid-cols-2 gap-3">
        <Card title="Quests">
          <View className="space-y-2">
            <View className="flex-row items-center justify-between">
              <Text>Defeat 10 skeletons</Text>
              <Text className="font-bold">6/10</Text>
            </View>
            <View className="h-2 rounded bg-white/70">
              <View style={{ width: '60%' }} className="h-2 bg-emerald-500 rounded" />
            </View>
            <View className="flex-row gap-2 pt-1">
              <Chip label="Daily" />
              <Chip label="+50 XP" />
            </View>
          </View>
        </Card>
        <Card title="Events">
          <Text className="font-bold">Harvest Festival</Text>
          <Text className="opacity-70">Ends in {countdown}</Text>
          <View className="mt-3 h-16 rounded-lg border-2 border-zinc-900 bg-zinc-200 items-center justify-center">
            <Text className="text-xs">Event Art</Text>
          </View>
        </Card>
        <Card title="Guild">
          <View className="flex-row items-center justify-between">
            <Text>Ravens of Galeș</Text>
            <Chip label="3 unread" />
          </View>
          <Text className="mt-2 opacity-70">Next Raid: Tomorrow 20:00</Text>
        </Card>
        <Card title="Crafting">
          <Text>Iron Dagger • <Text className="font-semibold">00:12:34</Text></Text>
          <ButtonBox className="mt-2 bg-white/70">Go to Forge</ButtonBox>
        </Card>
        <Card title="Achievements">
          <Text>Unlocked: <Text className="font-semibold">First Blood</Text></Text>
          <Text className="opacity-70">Next: Explorer (2/10)</Text>
        </Card>
        <Card title="Announcements">
          <View className="space-y-1">
            <Text>• Patch 0.1.5 released</Text>
            <Text>• New cosmetic bundle</Text>
          </View>
        </Card>
      </View>
    </ScrollView>
  );

  return (
    <View className="w-full flex-1 items-center justify-center bg-zinc-100">
      <View className="w-[390px] h-[844px] rounded-[36px] border-[12px] border-zinc-900 bg-[#F6F0E6] overflow-hidden">
        <View className="px-3 pt-3">
          <View className="rounded-2xl border-2 border-zinc-900 bg-[#F3E8D1] px-3 py-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 rounded-xl border-2 border-zinc-900 bg-zinc-200" />
              <View>
                <Text className="font-extrabold leading-4">Sir Bogdan</Text>
                <Text className="text-xs opacity-70">Lv 7 • Reaver</Text>
              </View>
            </View>
            <View className="flex-row items-center gap-1">
              <Chip label="Gold 1,245" />
              <Chip label="Shards 18" />
              <Chip label="Energy 12/20" />
              <View className="h-7 w-7 rounded-md border-2 border-zinc-900 bg-zinc-200 ml-1" />
              <View className="h-7 w-7 rounded-md border-2 border-zinc-900 bg-zinc-200" />
            </View>
          </View>
          <View className="mt-2 h-3 rounded-full border-2 border-zinc-900 bg-white/70 overflow-hidden">
            <View style={{ width: `${xp}%` }} className="h-full bg-emerald-500" />
          </View>
        </View>

        <View className="mt-2 px-3 flex-row justify-between">
          {[
            { k: 'home', label: 'Home' },
            { k: 'character', label: 'Character' },
            { k: 'inventory', label: 'Inventory' },
            { k: 'map', label: 'Map' },
            { k: 'shop', label: 'Shop' },
          ].map((t: any) => (
            <Pressable key={t.k} onPress={() => setTab(t.k)} className={`rounded-xl border-2 border-zinc-900 px-2 py-1 ${tab === t.k ? 'bg-amber-300' : 'bg-white/60'}`}>
              <Text className="text-xs font-bold">{t.label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'home' ? (
          Content
        ) : (
          <View className="flex-1 items-center justify-center p-6">
            <Text className="text-2xl font-black mb-2 capitalize">{tab}</Text>
            <Text className="text-sm opacity-70 text-center">
              This screen is out of scope for the wireframe. Use the tab buttons to switch back to Home.
            </Text>
          </View>
        )}

        <View className="px-3 pb-4">
          <View className="rounded-2xl border-2 border-zinc-900 bg-[#F3E8D1] px-4 py-2 flex-row items-center justify-between">
            {['Home', 'Character', 'Inventory', 'Map', 'Shop'].map((label) => (
              <View key={label} className="items-center">
                <View className="h-6 w-6 rounded-md border-2 border-zinc-900 bg-zinc-200 mb-1" />
                <Text className="text-[11px] font-semibold">{label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}
