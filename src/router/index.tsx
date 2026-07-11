import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout }        from '@/components/layout/PublicLayout';
import { AdminLayout }         from '@/components/layout/AdminLayout';
import { AdminGuard }          from './AdminGuard';
import { PlaceholderPage }     from '@/components/ui/PlaceholderPage';

// Public pages
import { HomePage }             from '@/pages/public/HomePage';
import { PropertiesListPage as PublicPropertiesListPage } from '@/pages/public/PropertiesListPage';
import { PropertyDetailPage }   from '@/pages/public/PropertyDetailPage';
import { ProjectsListPage as PublicProjectsListPage } from '@/pages/public/ProjectsListPage';
import { ProjectDetailPage }    from '@/pages/public/ProjectDetailPage';
import { AboutPage }            from '@/pages/public/AboutPage';
import { EventsListPage as PublicEventsListPage } from '@/pages/public/EventsListPage';
import { EventDetailPage }      from '@/pages/public/EventDetailPage';
import { BlogListPage as PublicBlogListPage } from '@/pages/public/BlogListPage';
import { BlogPostPage }         from '@/pages/public/BlogPostPage';
import { ContactPage }          from '@/pages/public/ContactPage';
import { LegalPage }            from '@/pages/public/LegalPage';

// Admin pages
import { LoginPage }            from '@/pages/admin/LoginPage';
import { DashboardPage }        from '@/pages/admin/DashboardPage';
import { PropertiesListPage }   from '@/pages/admin/PropertiesListPage';
import { PropertyFormPage }     from '@/pages/admin/PropertyFormPage';
import { ProjectsListPage }     from '@/pages/admin/ProjectsListPage';
import { ProjectFormPage }      from '@/pages/admin/ProjectFormPage';
import { TeamListPage }         from '@/pages/admin/TeamListPage';
import { TeamMemberFormPage }   from '@/pages/admin/TeamMemberFormPage';
import { EventsListPage }       from '@/pages/admin/EventsListPage';
import { EventFormPage }        from '@/pages/admin/EventFormPage';
import { BlogListPage }         from '@/pages/admin/BlogListPage';
import { BlogFormPage }         from '@/pages/admin/BlogFormPage';
import { LeadsListPage }        from '@/pages/admin/LeadsListPage';
import { LeadDetailPage }       from '@/pages/admin/LeadDetailPage';
import { TestimonialsPage }     from '@/pages/admin/TestimonialsPage';
import { LegalPagesPage }       from '@/pages/admin/LegalPagesPage';
import { SettingsPage }         from '@/pages/admin/SettingsPage';
import { ContentEditorPage }    from '@/pages/admin/ContentEditorPage';

export const router = createBrowserRouter([
  // ── Public ──────────────────────────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { path: '/',                 element: <HomePage /> },
      { path: '/properties',       element: <PublicPropertiesListPage /> },
      { path: '/properties/:slug', element: <PropertyDetailPage /> },
      { path: '/projects',         element: <PublicProjectsListPage /> },
      { path: '/projects/:slug',   element: <ProjectDetailPage /> },
      { path: '/about',            element: <AboutPage /> },
      { path: '/events',           element: <PublicEventsListPage /> },
      { path: '/events/:slug',     element: <EventDetailPage /> },
      { path: '/blog',             element: <PublicBlogListPage /> },
      { path: '/blog/:slug',       element: <BlogPostPage /> },
      { path: '/contact',          element: <ContactPage /> },
      { path: '/terms',            element: <LegalPage pageKey="terms" /> },
      { path: '/privacy',          element: <LegalPage pageKey="privacy" /> },
      { path: '/disclaimer',       element: <LegalPage pageKey="disclaimer" /> },
      { path: '*',                 element: <PlaceholderPage title="Page Not Found" note="The page you're looking for doesn't exist." /> },
    ],
  },

  // ── Admin login ──────────────────────────────────────────────────────────
  { path: '/admin/login', element: <LoginPage /> },

  // ── Admin (authenticated) ────────────────────────────────────────────────
  {
    path: '/admin',
    element: <AdminGuard />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true,                   element: <DashboardPage /> },

          // Properties
          { path: 'properties',            element: <PropertiesListPage /> },
          { path: 'properties/new',        element: <PropertyFormPage /> },
          { path: 'properties/:id',        element: <PropertyFormPage /> },

          // Projects
          { path: 'projects',              element: <ProjectsListPage /> },
          { path: 'projects/new',          element: <ProjectFormPage /> },
          { path: 'projects/:id',          element: <ProjectFormPage /> },

          // Team
          { path: 'team',                  element: <TeamListPage /> },
          { path: 'team/new',              element: <TeamMemberFormPage /> },
          { path: 'team/:id',              element: <TeamMemberFormPage /> },

          // Events
          { path: 'events',                element: <EventsListPage /> },
          { path: 'events/new',            element: <EventFormPage /> },
          { path: 'events/:id',            element: <EventFormPage /> },

          // Blog
          { path: 'blog',                  element: <BlogListPage /> },
          { path: 'blog/new',              element: <BlogFormPage /> },
          { path: 'blog/:id',              element: <BlogFormPage /> },

          // Leads
          { path: 'leads',                 element: <LeadsListPage /> },
          { path: 'leads/:id',             element: <LeadDetailPage /> },

          // Testimonials
          { path: 'testimonials',          element: <TestimonialsPage /> },

          // Legal
          { path: 'legal',                 element: <LegalPagesPage /> },
          { path: 'legal/:key',            element: <LegalPagesPage /> },

          // Settings
          { path: 'settings',              element: <SettingsPage /> },
          { path: 'settings/content',      element: <ContentEditorPage /> },
        ],
      },
    ],
  },
]);
