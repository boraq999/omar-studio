
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookMarked, Archive, Building2, FileLock2, Cog, UsersRound } from 'lucide-react'; // Added UsersRound
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

const navItemsBase = [
  { href: '/dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
  { href: '/theses', label: 'الرسائل', icon: BookMarked },
  { href: '/archive', label: 'الأرشيف', icon: Archive },
  { href: '/universities', label: 'الجامعات والتخصصات', icon: Building2 },
  { href: '/reserved-titles', label: 'العناوين المحجوزة', icon: FileLock2 },
];

const adminNavItems = [
  { href: '/users', label: 'إدارة المستخدمين', icon: UsersRound, adminOnly: true },
];

// { href: '/settings', label: 'الإعدادات', icon: Cog }, // Future enhancement

export function SidebarNav() {
  const pathname = usePathname();
  const { currentUser } = useAuth();

  let navItems = [...navItemsBase];
  if (currentUser?.role === 'admin') {
    navItems = [...navItems, ...adminNavItems];
  }


  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href}>
            <SidebarMenuButton
              variant="default"
              className={cn(
                pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                'w-full justify-start'
              )}
              tooltip={item.label}
              isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate font-headline">{item.label}</span>
            </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
