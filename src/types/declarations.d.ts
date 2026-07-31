// Type declarations for modules without built-in types
declare module 'lucide-react' {
  import { FC, SVGAttributes } from 'react';
  
  interface IconProps extends SVGAttributes<SVGElement> {
    size?: number | string;
    color?: string;
    strokeWidth?: number | string;
    className?: string;
  }

  type Icon = FC<IconProps>;

  // All icons used across the project
  export const AlertCircle: Icon;
  export const AlertTriangle: Icon;
  export const ArrowDownRight: Icon;
  export const ArrowLeft: Icon;
  export const ArrowRight: Icon;
  export const ArrowUpRight: Icon;
  export const BarChart3: Icon;
  export const Bell: Icon;
  export const Building2: Icon;
  export const Calculator: Icon;
  export const Calendar: Icon;
  export const CheckCircle2: Icon;
  export const ChevronDown: Icon;
  export const ChevronLeft: Icon;
  export const ChevronRight: Icon;
  export const CircleCheck: Icon;
  export const Clock: Icon;
  export const Construction: Icon;
  export const CreditCard: Icon;
  export const Download: Icon;
  export const Edit: Icon;
  export const ExternalLink: Icon;
  export const Eye: Icon;
  export const FilePen: Icon;
  export const FileText: Icon;
  export const Filter: Icon;
  export const Globe: Icon;
  export const HelpCircle: Icon;
  export const LayoutDashboard: Icon;
  export const LifeBuoy: Icon;
  export const Loader2: Icon;
  export const Lock: Icon;
  export const LogOut: Icon;
  export const Mail: Icon;
  export const MapPin: Icon;
  export const Menu: Icon;
  export const MessageSquare: Icon;
  export const MoreVertical: Icon;
  export const Pencil: Icon;
  export const Percent: Icon;
  export const Phone: Icon;
  export const Plus: Icon;
  export const Receipt: Icon;
  export const Save: Icon;
  export const Search: Icon;
  export const Send: Icon;
  export const Settings: Icon;
  export const ShieldCheck: Icon;
  export const Sparkles: Icon;
  export const Trash2: Icon;
  export const TrendingUp: Icon;
  export const Upload: Icon;
  export const User: Icon;
  export const UserPlus: Icon;
  export const Users: Icon;
  export const X: Icon;
  export const Zap: Icon;
}

declare module '@supabase/ssr' {
  export function createBrowserClient(url: string, key: string): any;
  export function createServerClient(url: string, key: string, options?: any): any;
}

declare module 'recharts' {
  import { FC, ReactNode } from 'react';

  interface CommonProps {
    className?: string;
    children?: ReactNode;
  }

  interface ResponsiveContainerProps extends CommonProps {
    width?: number | string;
    height?: number | string;
  }

  interface BarChartProps extends CommonProps {
    data?: any[];
    margin?: { top?: number; right?: number; bottom?: number; left?: number };
  }

  interface BarProps {
    dataKey: string;
    fill?: string;
    radius?: number | [number, number, number, number];
    className?: string;
  }

  export const ResponsiveContainer: FC<ResponsiveContainerProps>;
  export const BarChart: FC<BarChartProps>;
  export const Bar: FC<BarProps>;
}
