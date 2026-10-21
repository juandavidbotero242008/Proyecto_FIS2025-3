import {
  Award,
  Baby,
  Banknote,
  BookOpen,
  Briefcase,
  Bus,
  Calendar,
  Car,
  CircleHelp,
  Coffee,
  Coins,
  Dumbbell,
  Film,
  Fuel,
  Gamepad2,
  Gauge,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  Laptop,
  Music,
  PawPrint,
  PiggyBank,
  Plane,
  Receipt,
  Repeat,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  TriangleAlert,
  Utensils,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";

export const ICONS: Record<string, LucideIcon> = {
  utensils: Utensils,
  coffee: Coffee,
  "shopping-cart": ShoppingCart,
  bus: Bus,
  car: Car,
  fuel: Fuel,
  home: House,
  zap: Zap,
  smartphone: Smartphone,
  "shopping-bag": ShoppingBag,
  shirt: Shirt,
  gamepad: Gamepad2,
  film: Film,
  music: Music,
  "graduation-cap": GraduationCap,
  book: BookOpen,
  "heart-pulse": HeartPulse,
  dumbbell: Dumbbell,
  repeat: Repeat,
  plane: Plane,
  gift: Gift,
  paw: PawPrint,
  baby: Baby,
  receipt: Receipt,
  landmark: Landmark,
  briefcase: Briefcase,
  laptop: Laptop,
  wallet: Wallet,
  banknote: Banknote,
  coins: Coins,
  "piggy-bank": PiggyBank,
  // Iconos usados por los consejos
  "trending-up": TrendingUp,
  "trending-down": TrendingDown,
  award: Award,
  target: Target,
  calendar: Calendar,
  gauge: Gauge,
  "alert-triangle": TriangleAlert,
  sparkles: Sparkles,
};

/** Iconos que el usuario puede elegir al crear categorías */
export const CATEGORY_ICON_CHOICES = Object.keys(ICONS).slice(0, 31);

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  const Cmp = ICONS[name] ?? CircleHelp;
  return <Cmp size={size} strokeWidth={2} aria-hidden />;
}

export function CategoryIcon({
  icon,
  color,
  size = "md",
}: {
  icon: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <span className={`cat-icon ${size === "sm" ? "sm" : ""}`} style={{ "--c": color } as React.CSSProperties}>
      <Icon name={icon} size={size === "sm" ? 15 : 18} />
    </span>
  );
}
