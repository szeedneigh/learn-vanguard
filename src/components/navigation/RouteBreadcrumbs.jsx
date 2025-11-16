import React, { useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { navigationConfig } from '@/lib/navigation';
import { cn } from '@/lib/utils';

/**
 * RouteBreadcrumbs Component
 *
 * Automatically generates breadcrumbs based on the current route path.
 * Integrates with the navigation config for icons and labels.
 *
 * Features:
 * - Auto-generates breadcrumbs from URL path
 * - Icons for each segment (from navigationConfig)
 * - Clickable path segments for navigation
 * - Responsive design (collapses on mobile)
 * - WCAG 2.1 AA compliant
 * - Supports dynamic route params (converts to title case)
 *
 * @example
 * // Current path: /dashboard/resources
 * // Renders: Home / Resources
 *
 * @example
 * // Current path: /dashboard/resources/topics/12345
 * // Renders: Home / Resources / Topics / 12345
 */
const RouteBreadcrumbs = ({ className }) => {
  const location = useLocation();

  // Generate breadcrumb segments from current path
  const breadcrumbs = useMemo(() => {
    // Remove empty segments and filter out 'dashboard' as it's implicit
    const pathSegments = location.pathname
      .split('/')
      .filter((segment) => segment && segment !== 'dashboard');

    // Always start with home
    const crumbs = [
      {
        label: 'Home',
        path: '/dashboard/home',
        icon: Home,
        isHome: true,
      },
    ];

    // Build cumulative path for each segment
    let cumulativePath = '/dashboard';

    pathSegments.forEach((segment, index) => {
      cumulativePath += `/${segment}`;

      // Try to find this route in navigation config
      const navItem = navigationConfig.find(
        (item) => item.href === cumulativePath
      );

      // Check if segment is a dynamic parameter (numeric or UUID-like)
      const isDynamic = /^[0-9a-f-]+$/i.test(segment) || !isNaN(segment);

      // If it's the current page (last segment) and not in nav, skip it
      // unless it's a dynamic parameter
      const isLastSegment = index === pathSegments.length - 1;

      if (navItem) {
        // Found in nav config - use its data
        crumbs.push({
          label: navItem.name,
          path: cumulativePath,
          icon: navItem.icon,
          isLast: isLastSegment,
        });
      } else if (isDynamic && isLastSegment) {
        // Dynamic parameter as last segment - show truncated
        crumbs.push({
          label: segment.length > 8 ? `${segment.slice(0, 8)}...` : segment,
          path: cumulativePath,
          icon: null,
          isLast: true,
          isDynamic: true,
        });
      } else if (!isDynamic) {
        // Static segment not in nav - title case it
        crumbs.push({
          label: toTitleCase(segment),
          path: cumulativePath,
          icon: null,
          isLast: isLastSegment,
        });
      }
    });

    return crumbs;
  }, [location.pathname]);

  // Don't render if only home (we're on the home page)
  if (breadcrumbs.length === 1) {
    return null;
  }

  return (
    <div
      className={cn(
        'bg-white/50 backdrop-blur-sm px-4 py-3 rounded-lg shadow-sm',
        'border border-gray-200/50',
        className
      )}
    >
      <Breadcrumb>
        <BreadcrumbList className="flex-wrap">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            const Icon = crumb.icon;

            return (
              <React.Fragment key={crumb.path}>
                <BreadcrumbItem
                  className={cn(
                    'inline-flex items-center gap-1.5',
                    // Hide middle breadcrumbs on mobile, show only first and last 2
                    index > 0 &&
                      index < breadcrumbs.length - 2 &&
                      'hidden md:inline-flex'
                  )}
                >
                  {isLast ? (
                    <BreadcrumbPage
                      className={cn(
                        'inline-flex items-center gap-1.5 font-medium',
                        'text-foreground'
                      )}
                    >
                      {Icon && (
                        <Icon
                          className="w-4 h-4"
                          aria-hidden="true"
                        />
                      )}
                      <span className="max-w-[200px] truncate">
                        {crumb.label}
                      </span>
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link
                        to={crumb.path}
                        className={cn(
                          'inline-flex items-center gap-1.5',
                          'text-muted-foreground hover:text-foreground',
                          'transition-colors duration-200',
                          'focus-visible:outline-none focus-visible:ring-2',
                          'focus-visible:ring-primary focus-visible:ring-offset-2',
                          'rounded-sm px-1 -mx-1'
                        )}
                        aria-label={
                          crumb.isHome
                            ? 'Go to home'
                            : `Go to ${crumb.label}`
                        }
                      >
                        {Icon && (
                          <Icon
                            className={cn(
                              'w-4 h-4',
                              crumb.isHome && 'text-primary'
                            )}
                            aria-hidden="true"
                          />
                        )}
                        {/* Hide home text, show only icon */}
                        {!crumb.isHome && (
                          <span className="max-w-[150px] truncate">
                            {crumb.label}
                          </span>
                        )}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <BreadcrumbSeparator
                    className={cn(
                      // Hide separators when middle crumbs are hidden on mobile
                      index > 0 &&
                        index < breadcrumbs.length - 2 &&
                        'hidden md:block'
                    )}
                  >
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                  </BreadcrumbSeparator>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

/**
 * Convert kebab-case or snake_case to Title Case
 * @param {string} str - String to convert
 * @returns {string} - Title cased string
 */
function toTitleCase(str) {
  return str
    .replace(/[-_]/g, ' ') // Replace hyphens and underscores with spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

export default RouteBreadcrumbs;
