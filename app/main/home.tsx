import CharacterFullPreview from '@/components/character/CharacterFullPreview';
import { usePlayerStore } from '@/store/playerStore';
import React, { useMemo, useState } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";

// ---------- Tiny UI helpers ----------
const Chip: React.FC<{ label: string }> = ({ label }) => (
	<View className="px-2 py-0.5 rounded-full border-2 border-stone-900 bg-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,.6)]">
		<Text className="text-[11px] font-semibold">{label}</Text>
	</View>
);

const Card: React.FC<{ title: string; children?: React.ReactNode; className?: string }> = ({ title, children, className='' }) => (
	<View className={`rounded-3xl border-2 border-stone-900 bg-transparent shadow-[inset_0_2px_0_rgba(255,255,255,.5),0_3px_0_rgba(0,0,0,.25)] ${className}`}>
		<View className="px-4 pt-3 pb-2 border-b-2 border-stone-900/70 bg-gradient-to-b from-white/50 to-transparent rounded-t-3xl">
			<Text className="text-stone-900 font-extrabold tracking-wide">{title}</Text>
		</View>
		<View className="p-4">
			{children}
		</View>
	</View>
);

const ActionPill: React.FC<{ label: string; onClick?: () => void }> = ({ label, onClick }) => (
	<Pressable onPress={onClick} className="rounded-2xl border-2 border-stone-900 px-4 py-2 bg-gradient-to-b from-amber-200 to-amber-400 shadow-[0_3px_0_rgba(0,0,0,.3)] active:scale-95">
		<Text className="font-extrabold">{label}</Text>
	</Pressable>
);

const IconBox: React.FC<{ title?: string; className?: string }> = ({ title, className='' }) => (
	<View accessibilityLabel={title} className={`h-7 w-7 rounded-lg border-2 border-stone-900 bg-stone-200 ${className}`}/>
);

export default function StyledHomeMockup(){
  const [claimed, setClaimed] = useState(false);
  const isWeb = Platform.OS === 'web';
  const { player } = usePlayerStore();
  const displayName = player?.character?.name || '—';
  const displayTitle = player?.character?.title || '';

  const equipment = useMemo(() => {
    const eq: Record<string, string> = {};
    const items = (player?.character as any)?.items as any[] | undefined;
    if (!items) return eq;
    console.log('[Home] Processing items:', items.length);
    for (const it of items) {
      const code = it?.template?.code as string | undefined;
      const slot = it?.slot as string | undefined;
      if (!code || !slot) continue;
      console.log('[Home] Processing item:', { code, slot, equippedHand: it.equippedHand, isTwoHanded: it.template?.isTwoHanded });
      switch (slot) {
        case 'chest':
          eq.chest = code;
          break;
        case 'helmet':
          eq.helmet = code;
          break;
        case 'cape':
          eq.cape = code;
          break;
        case 'glove':
          eq.glove_left = code;
          eq.glove_right = code;
          break;
        case 'feet':
          eq.feet_left = code;
          eq.feet_right = code;
          break;
        case 'weapon':
          // Check if two-handed first (from template.isTwoHanded)
          // Two-handed weapons are always main-hand
          if (it.template?.isTwoHanded === true) {
            eq.weapon_twohanded = code;
          } else {
            // Handle single-handed weapons
            const equippedHand = String(it.equippedHand || '').toLowerCase();
            if (equippedHand === 'left') {
              // API left (off-hand) maps to weapon_right slot (right UI slot)
              eq.weapon_right = code;
              console.log('[Home] ✅ Off-hand weapon assigned to weapon_right:', code, 'equippedHand:', it.equippedHand);
            } else if (equippedHand === 'right') {
              // API right (main-hand) maps to weapon_left slot (left UI slot)
              eq.weapon_left = code;
              console.log('[Home] ✅ Main-hand weapon assigned to weapon_left:', code, 'equippedHand:', it.equippedHand);
            } else {
              // equippedHand is undefined/null - need to determine which slot
              // If weapon_left is already taken, assign to weapon_right (off-hand)
              // Otherwise, assign to weapon_left (main-hand)
              if (eq.weapon_left) {
                eq.weapon_right = code;
                console.log('[Home] ✅ Weapon with undefined equippedHand assigned to weapon_right (off-hand) - weapon_left already taken:', code);
              } else {
                eq.weapon_left = code;
                console.log('[Home] ✅ Weapon with undefined equippedHand assigned to weapon_left (main-hand):', code);
              }
            }
          }
          break;
        case 'shield':
          eq.shield = code;
          break;
        case 'legs':
          eq.legs = code;
          break;
        case 'ring':
          if (it.equippedHand === 'left') {
            eq.ring_left = code;
          } else if (it.equippedHand === 'right') {
            eq.ring_right = code;
          }
          break;
        // Note: 'neck' is not used in equipmentCodes for character rendering
      }
    }
    return eq;
  }, [player]);

	return (
		<View style={{ flex: 1 }}>
			{/* Phone frame (kept only on web to simulate a device) */}
			<View className={isWeb ? "w-[390px] h-[844px] rounded-[36px] border-[12px] border-stone-900 bg-transparent overflow-hidden shadow-2xl relative self-center" : "flex-1 bg-transparent"}>
          {/* HOME-ONLY floating buttons: Inbox + Settings */}
				<Pressable className="absolute top-[70px] right-5 z-30 h-10 w-10 rounded-xl border-2 border-stone-900 bg-stone-200 items-center justify-center shadow" accessibilityLabel="Inbox">
					<Text className="text-[10px] font-bold">IN</Text>
				</Pressable>
				<Pressable className="absolute top-[120px] right-5 z-30 h-10 w-10 rounded-xl border-2 border-stone-900 bg-stone-200 items-center justify-center shadow" accessibilityLabel="Settings">
					<Text className="text-[10px] font-bold">⚙</Text>
				</Pressable>

				{/* Scrollable content */}
				<View className="flex-1">
					<ScrollView className="px-3 pb-28">
            {/* Character Showcase with Name & Title ABOVE character */}
						<View className="mt-3 items-center">
							<Text className="text-base font-black">{displayName}</Text>
							{!!displayTitle && (<Text className="text-[12px] opacity-70 -mt-0.5">{displayTitle}</Text>)}
						</View>
				<View className="mt-2 h-[300px] items-center justify-center" collapsable={false}>
					<CharacterFullPreview
						appearance={player?.character?.appearance || null}
						containerHeight={300}
						equipment={equipment}
						headScale={0.9}
						headOffsetX={-10}
						headOffsetY={-5}
					/>
				</View>

            {/* Event Banner */}
						<View className="mt-3 rounded-3xl border-2 border-stone-900 bg-transparent px-4 py-3 flex flex-row items-center justify-between">
							<View>
								<Text className="text-sm font-extrabold">Harvest Festival</Text>
								<Text className="text-[12px] opacity-70">Ends in 06:23:12</Text>
							</View>
							<ActionPill label="VIEW"/>
						</View>

            {/* Quick Actions */}
						<View className="mt-3 flex flex-row flex-wrap gap-3">
							<Pressable onPress={()=>setClaimed(true)} className={`rounded-2xl border-2 border-stone-900 bg-transparent p-3 ${claimed? 'opacity-60':'active:scale-95 transition-transform'}`}>
								<Text className="text-center font-black">Daily</Text>
							</Pressable>
							<Pressable className="rounded-2xl border-2 border-stone-900 bg-transparent p-3">
								<Text className="text-center font-black">Quests</Text>
							</Pressable>
							<Pressable className="rounded-2xl border-2 border-stone-900 bg-transparent p-3">
								<Text className="text-center font-black">Season</Text>
							</Pressable>
                            <Pressable className="rounded-2xl border-2 border-stone-900 bg-transparent p-3">
								<Text className="text-center font-black">Shop</Text>
							</Pressable>
						</View>

            {/* Condensed Cards (3 max) */}
						<View className="mt-3 gap-3">
						  <Card title="Quests">
								<View className="text-[12px]">
									<View className="flex flex-row items-center justify-between"><Text>Upgrade an item</Text><Text className="font-bold">3/6</Text></View>
									<View className="h-2 rounded bg-white/70 mt-1"><View className="h-2 bg-emerald-500 rounded" style={{ width:'50%' }}/></View>
									<View className="flex flex-row gap-2 pt-1"><Chip label="Daily"/><Chip label="+50 XP"/></View>
								</View>
						  </Card>
						  <Card title="Guild">
								<View className="text-[12px]">
									<View className="flex flex-row items-center justify-between"><Text>Ravens of Galeș</Text><Chip label="2 unread"/></View>
									<Text className="mt-2 opacity-70">Next raid: Fri 20:00</Text>
								</View>
						  </Card>
							<Card title="Crafting" className="">
								<View className="text-[12px] flex flex-row items-center justify-between">
									<Text>Iron Dagger • <Text className="font-semibold">00:12:34</Text></Text>
									<ActionPill label="FORGE"/>
								</View>
						  </Card>
						</View>

            {/* Footer tiny info */}
						<Text className="mt-4 mb-24 text-center text-[10px] opacity-60">v0.1.5 • EU Server</Text>
					</ScrollView>
				</View>
			</View>
		</View>
  );
}
