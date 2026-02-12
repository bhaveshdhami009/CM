import { Routes } from '@angular/router';
import { RouteGroup, AppRouteConfig } from '../config/menu.config';
import { authGuard } from '../guards/auth.guard';

export function generateRoutes(groups: RouteGroup[]): Routes {
  const routes: Routes = [];

  groups.forEach(group => {
    // Flatten the groups into a single list of routes
    const groupRoutes = group.items.map(config => mapConfigToRoute(config, group.groupRole));
    routes.push(...groupRoutes);
  });

  return routes;
}

// Recursive helper
function mapConfigToRoute(config: AppRouteConfig, parentRole: number): any {
  // Determine the effective role: Config override > Parent Group Role
  const effectiveRole = config.minRole !== undefined ? config.minRole : parentRole;

  const route: any = {
    path: config.path,
    canActivate: [authGuard],
    data: { minRole: effectiveRole } // (Optional) Useful if you want to check roles in the Guard later
  };

  if (config.loadComponent) {
    route.loadComponent = config.loadComponent;
  }

  if (config.children) {
    // Pass the current effective role down, unless the child has its own override
    route.children = config.children.map(child => mapConfigToRoute(child, effectiveRole));
  }

  return route;
}