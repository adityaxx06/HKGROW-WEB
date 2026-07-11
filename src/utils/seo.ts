/**
 * JSON-LD structured data builders.
 *
 * Per section 9 (SEO Architecture): property detail pages get
 * RealEstateListing schema; blog posts get Article schema;
 * the homepage gets the Organisation schema from website_settings.
 */

import type { PropertyPublic, BlogPostPublic, WebsiteSettings } from '@/types/database';
import { imageUrl, getHeroImage } from '@/lib/imageUrl';

export function buildOrganisationSchema(settings: WebsiteSettings): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: settings.company_name,
    url: 'https://hkgrowinfra.com',
    telephone: settings.phone_primary,
    email: settings.email_primary,
    address: settings.address_line1
      ? {
          '@type': 'PostalAddress',
          streetAddress: [settings.address_line1, settings.address_line2].filter(Boolean).join(', '),
          addressLocality: settings.address_city,
          addressRegion: settings.address_state,
          postalCode: settings.address_pincode,
          addressCountry: 'IN',
        }
      : undefined,
    sameAs: [
      settings.facebook_url,
      settings.instagram_url,
      settings.youtube_url,
      settings.linkedin_url,
    ].filter(Boolean),
  };
}

export function buildPropertySchema(property: PropertyPublic, siteUrl: string): Record<string, unknown> {
  const hero = getHeroImage(property.images);
  return {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.excerpt ?? property.description ?? '',
    url: `${siteUrl}/properties/${property.slug}`,
    image: hero ? imageUrl(hero.path, 'detail') : undefined,
    offers: {
      '@type': 'Offer',
      price: property.price_amount,
      priceCurrency: 'INR',
      availability:
        property.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/SoldOut',
    },
    address: property.address_full
      ? {
          '@type': 'PostalAddress',
          streetAddress: property.address_full,
          addressLocality: property.location_city ?? 'Prayagraj',
          addressRegion: property.location_state ?? 'Uttar Pradesh',
          addressCountry: 'IN',
        }
      : undefined,
    floorSize: property.area_sqft
      ? { '@type': 'QuantitativeValue', value: property.area_sqft, unitCode: 'FTK' }
      : undefined,
    numberOfRooms: property.bedrooms ?? undefined,
  };
}

export function buildBlogPostSchema(
  post: BlogPostPublic,
  siteUrl: string
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt ?? '',
    url: `${siteUrl}/blog/${post.slug}`,
    image: post.og_image_path
      ? imageUrl(post.og_image_path, 'hero')
      : post.cover_image_path
        ? imageUrl(post.cover_image_path, 'hero')
        : undefined,
    datePublished: post.published_at,
    dateModified: post.created_at,
    author: post.author_name
      ? { '@type': 'Person', name: post.author_name }
      : undefined,
    publisher: {
      '@type': 'Organization',
      name: 'HK Grow Infra Pvt Ltd',
      url: siteUrl,
    },
    wordCount: undefined, // reading_time_minutes * 225 if needed
  };
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
