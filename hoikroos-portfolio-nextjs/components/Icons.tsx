import { CalendarDays, ChartNoAxesCombined, CloudSun, DoorOpen, Map, Package, ReceiptText, Search, Smartphone, Star, Users, Warehouse, Wind } from "lucide-react";

const icons = {
  door: DoorOpen,
  calendar: CalendarDays,
  package: Package,
  receipt: ReceiptText,
  warehouse: Warehouse,
  chart: ChartNoAxesCombined,
  cloud: CloudSun,
  map: Map,
  wind: Wind,
  search: Search,
  phone: Smartphone,
  users: Users,
  star: Star,
  user: Users,
  field: Map,
};

export function FeatureIcon({ name }: { name: string }) {
  const Icon = icons[name as keyof typeof icons] ?? Package;
  return <Icon size={22} strokeWidth={2} />;
}
