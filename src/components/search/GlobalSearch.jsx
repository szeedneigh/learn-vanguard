/**
 * GLOBAL SEARCH COMPONENT (Cmd+K)
 * Command palette for quick navigation and search
 * Implements modern UX pattern for keyboard-first navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  Search,
  Home,
  CheckSquare,
  BookOpen,
  Calendar,
  Archive,
  Users,
  Settings,
  FileText,
  Clock,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import './global-search.css';

const GlobalSearch = () => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  // Keyboard shortcut handler
  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  // Close on escape
  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const handleSelect = useCallback(
    (callback) => {
      setOpen(false);
      callback();
    },
    []
  );

  // Navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      {
        group: 'Navigation',
        items: [
          {
            icon: Home,
            label: 'Home',
            shortcut: 'H',
            action: () => navigate('/dashboard/home'),
          },
          {
            icon: CheckSquare,
            label: 'Tasks',
            shortcut: 'T',
            action: () => navigate('/dashboard/tasks'),
          },
          {
            icon: BookOpen,
            label: 'Resources',
            shortcut: 'R',
            action: () => navigate('/dashboard/resources'),
          },
          {
            icon: Calendar,
            label: 'Events',
            shortcut: 'E',
            action: () => navigate('/dashboard/events'),
          },
          {
            icon: Archive,
            label: 'Archive',
            shortcut: 'A',
            action: () => navigate('/dashboard/archive'),
          },
        ],
      },
    ];

    // Add role-specific items
    if (user?.role === 'PIO' || user?.role === 'ADMIN') {
      baseItems.push({
        group: 'Management',
        items: [
          {
            icon: Users,
            label: 'Students',
            shortcut: 'S',
            action: () => navigate('/dashboard/students'),
          },
        ],
      });
    }

    if (user?.role === 'ADMIN') {
      baseItems[baseItems.length - 1].items.push({
        icon: Users,
        label: 'All Users',
        shortcut: 'U',
        action: () => navigate('/dashboard/users'),
      });
    }

    // Quick actions
    baseItems.push({
      group: 'Quick Actions',
      items: [
        {
          icon: Star,
          label: 'View Favorites',
          action: () => {
            // TODO: Implement favorites view
            console.log('Favorites feature coming soon');
          },
        },
        {
          icon: Clock,
          label: 'Recently Viewed',
          action: () => {
            // TODO: Implement recent items
            console.log('Recent items feature coming soon');
          },
        },
      ],
    });

    return baseItems;
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted rounded-lg hover:bg-muted/80 transition-colors"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="hidden sm:inline-block px-2 py-0.5 text-xs font-medium bg-background border rounded">
          {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}K
        </kbd>
      </button>
    );
  }

  return (
    <div className="global-search-overlay">
      <div className="global-search-backdrop" onClick={() => setOpen(false)} />
      <Command className="global-search-dialog" shouldFilter={true}>
        <div className="flex items-center border-b px-4 py-3">
          <Search className="mr-2 h-5 w-5 shrink-0 text-muted-foreground" />
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Type a command or search..."
            className="flex-1 bg-transparent outline-none text-body placeholder:text-muted-foreground"
          />
          <kbd className="ml-2 px-2 py-1 text-xs font-medium bg-muted text-muted-foreground border rounded">
            ESC
          </kbd>
        </div>
        <Command.List className="max-h-[400px] overflow-y-auto p-2">
          <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
            No results found.
          </Command.Empty>

          {getNavigationItems().map((group) => (
            <Command.Group
              key={group.group}
              heading={group.group}
              className="mb-2"
            >
              {group.items.map((item) => (
                <Command.Item
                  key={item.label}
                  onSelect={() => handleSelect(item.action)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-muted transition-colors data-[selected=true]:bg-muted"
                >
                  {item.icon && (
                    <item.icon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="flex-1 text-body-sm">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="px-2 py-0.5 text-xs font-medium bg-background border rounded">
                      {item.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
          ))}
        </Command.List>
      </Command>
    </div>
  );
};

export default GlobalSearch;
