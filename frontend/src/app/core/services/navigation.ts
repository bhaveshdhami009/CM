import { Injectable, computed, inject } from '@angular/core';
import { AuthService } from './auth';
import { MENU_CONFIG, AppRouteConfig, RouteGroup } from '../config/menu.config';
import { ROLES } from '../config/roles'; // Make sure ROLES is imported

// This interface remains the same
export interface UiMenuItem {
  label: string;
  route: string;
  icon: string;
  children?: UiMenuItem[];
}

@Injectable({ providedIn: 'root' })
export class NavigationService {
  private authService = inject(AuthService);

  menuItems = computed(() => {
    const user = this.authService.currentUser();
    const userRole = user ? user.role : 0;
    
    // THE FIX IS HERE:
    // We now pass the original MENU_CONFIG and let processItems handle the groups.
    return this.processGroups(MENU_CONFIG, userRole);
  });

  private processGroups(groups: RouteGroup[], userRole: number): UiMenuItem[] {
    const allVisibleItems: UiMenuItem[] = [];
    
    groups.forEach(group => {
      const groupItems = this.processItems(group.items, userRole, group.groupRole, '');
      allVisibleItems.push(...groupItems);
    });

    return allVisibleItems;
  }

  private processItems(
    configItems: AppRouteConfig[], 
    userRole: number, 
    fallbackRole: number, // The role inherited from the group
    parentPath: string
  ): UiMenuItem[] {
    
    const uiMenu: UiMenuItem[] = [];

    configItems.forEach(config => {
      // Determine the final role needed for this item. Item's role overrides the group's.
      const requiredRole = config.minRole !== undefined ? config.minRole : fallbackRole;

      // 1. Role Check: Does the user meet the requirement?
      if (userRole < requiredRole) {
        return; // Skip this item entirely.
      }

      // 2. Process Children Recursively FIRST
      let visibleChildren: UiMenuItem[] = [];
      const fullPath = parentPath ? `${parentPath}/${config.path}` : `/${config.path}`;
      
      if (config.children && config.children.length > 0) {
        // Children inherit the PARENT'S required role as their fallback
        visibleChildren = this.processItems(config.children, userRole, requiredRole, fullPath);
      }

      // 3. Visibility Check: Should this item appear in the sidebar?
      if (config.visible === false) {
        return; // Don't add it to the UI, but its children might still be processed for routing.
      }
      
      // 4. Empty Group Check: If this is a parent but has NO visible children, hide it.
      if (config.children && visibleChildren.length === 0) {
        return; // This solves the "empty Cases group" problem.
      }

      // 5. Build the final UI item
      const route = (visibleChildren.length > 0) ? visibleChildren[0].route : fullPath;

      const uiItem: UiMenuItem = {
        label: config.label || '',
        icon: config.icon || 'circle',
        route: route,
        children: visibleChildren
      };

      uiMenu.push(uiItem);
    });

    return uiMenu;
  }
}