import { SymbolView, SymbolViewProps } from 'expo-symbols';

type ShopIconProps = {
  name: SymbolViewProps['name'];
  color?: string;
  size?: number;
};

export function ShopIcon({ name, color = '#111111', size = 22 }: ShopIconProps) {
  return <SymbolView name={name} tintColor={color} size={size} />;
}
