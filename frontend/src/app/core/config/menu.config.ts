import { ROLES } from './roles';

// 1. The Route Definition
export interface AppRouteConfig {
  path: string;
  label?: string;     // Required if visible is true
  icon?: string;
  visible?: boolean;  // Defaults to TRUE if undefined
  
  minRole?: number;   // Optional override. If missing, inherits from Group.
  
  loadComponent?: () => Promise<any>;
  children?: AppRouteConfig[];
}

// 2. The Group Definition
export interface RouteGroup {
  groupRole: number; // The base role for all items in this group
  items: AppRouteConfig[];
}

// 3. The Configuration grouped by Role
export const MENU_CONFIG: RouteGroup[] = [
  
  // --- VIEWER SECTION ---
  {
    groupRole: ROLES.VIEWER,
    items: [
      { 
        path: 'dashboard', 
        label: 'Dashboard', 
        icon: 'dashboard', 
        // visible: true (implied)
        loadComponent: () => import('../../features/dashboard/dashboard').then(m => m.DashboardComponent)
      },
      { 
        path: 'cases', 
        label: 'Cases', 
        icon: 'gavel',
        children: [
          { 
            path: '', 
            label: 'All Cases', 
            visible: false,
            icon: 'list',
            loadComponent: () => import('../../features/dashboard/dashboard').then(m => m.DashboardComponent) 
          },
          { 
            path: 'create', 
            label: 'New Case', 
            icon: 'add', 
            // Override: This specific child requires EDITOR role
            minRole: ROLES.EDITOR, 
            loadComponent: () => import('../../features/cases/create-case/create-case').then(m => m.CreateCaseComponent)
          },
          {
            path: ':id',
            visible: false, // Hidden from sidebar
            // Update this loadComponent:
            loadComponent: () => import('../../features/cases/case-detail/case-detail').then(m => m.CaseDetailComponent)
           },
           {
              path: 'edit/:id', // <--- New Route
              visible: false,
              minRole: ROLES.EDITOR,
              loadComponent: () => import('../../features/cases/create-case/create-case').then(m => m.CreateCaseComponent)
            }
        ]
      },
      { 
        path: 'calendar', 
        label: 'Calendar', 
        icon: 'calendar_today', // Material Icon
        loadComponent: () => import('../../features/calendar/calendar').then(m => m.CalendarComponent)
      },
      { 
        path: 'explorer', 
        label: 'Explorer', 
        icon: 'travel_explore', 
        loadComponent: () => import('../../features/universal-list/universal-list').then(m => m.UniversalListComponent)
      },
      { 
        path: 'chat', 
        label: 'Messages', 
        icon: 'chat', 
        loadComponent: () => import('../../features/chat/chat').then(m => m.ChatComponent)
      },
      { 
        path: 'settings', 
        label: 'Settings', 
        icon: 'settings', // Material Icon
        loadComponent: () => import('../../features/settings/settings').then(m => m.SettingsComponent)
      }
    ]
  },

  // --- ADMIN SECTION ---
  {
    groupRole: ROLES.ORG_ADMIN,
    items: [
      { 
        path: 'team', 
        label: 'My Team', 
        icon: 'people', // Material Icon
        loadComponent: () => import('../../features/admin/team-list/team-list').then(m => m.TeamListComponent)
      },
      { 
        path: 'parties', 
        label: 'Parties Directory', 
        icon: 'groups', 
        loadComponent: () => import('../../features/parties/party-list/party-list').then(m => m.PartyListComponent)
      },
      { 
        path: 'announcements', 
        label: 'Announcements', 
        icon: 'campaign', 
        loadComponent: () => import('../../features/admin/announcement-manager/announcement-manager').then(m => m.AnnouncementManagerComponent)
      }
    ]
  },
  
  {
    groupRole: ROLES.PLATFORM_ADMIN, // Restrict to Super Admin (Role 9)
    items: [
      { 
        path: 'settings-manager', 
        label: 'System Config', 
        icon: 'settings_applications', 
        loadComponent: () => import('../../features/admin/settings-manager/settings-manager').then(m => m.SettingsManagerComponent)
      },
      { 
        path: 'org-manager', 
        label: 'Organizations', 
        icon: 'domain', 
        loadComponent: () => import('../../features/admin/org-manager/org-manager').then(m => m.OrgManagerComponent)
      },
      { 
        path: 'db-viewer', 
        label: 'Database Viewer', 
        icon: 'storage',
        loadComponent: () => import('../../features/db-viewer/db-viewer').then(m => m.DbViewerComponent)
      },
      { 
        path: 'master-data', 
        label: 'Master Data', 
        icon: 'dns', 
        loadComponent: () => import('../../features/admin/master-data/master-data').then(m => m.MasterDataComponent)
      },
      // ... db viewer, team ...
    ]
  }
];