// Structured Data (JSON-LD) component for SEO
import { APP_URL, siteConfig } from "@/configs/site";

interface StructuredDataProps {
  type:
    | "Organization"
    | "WebSite"
    | "Article"
    | "JobPosting"
    | "BreadcrumbList";
  data?: ArticleStructuredData | JobPostingStructuredData | BreadcrumbStructuredData;
}

type ArticleStructuredData = {
  title?: string;
  excerpt?: string;
  description?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
};

type JobPostingStructuredData = {
  title?: string;
  description?: string;
  created_at?: string;
  deadline?: string;
  job_type?: string;
  salary_min?: number;
  salary_max?: number;
  location?: string;
  employer?: { name?: string };
};

type BreadcrumbStructuredData = {
  items?: Array<{ name?: string; url?: string }>;
};

export function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    const baseData = {
      "@context": "https://schema.org",
    };

    switch (type) {
      case "Organization":
        return {
          ...baseData,
          "@type": "Organization",
          name: siteConfig.name,
          url: APP_URL,
          logo: `${APP_URL}/images/LearnKing-logo.png`,
          sameAs: [
            siteConfig.facebook,
            siteConfig.twitter,
            siteConfig.linkedin,
            siteConfig.telegram,
          ].filter(Boolean),
          contactPoint: {
            "@type": "ContactPoint",
            email: siteConfig.email,
            contactType: "customer service",
          },
        };

      case "WebSite":
        return {
          ...baseData,
          "@type": "WebSite",
          name: siteConfig.name,
          url: APP_URL,
        };

      case "Article": {
        const article = data as ArticleStructuredData | undefined;
        if (!article) return null;
        return {
          ...baseData,
          "@type": "Article",
          headline: article.title,
          description: article.excerpt || article.description,
          image: article.imageUrl || siteConfig.ogImage,
          datePublished: article.createdAt
            ? new Date(article.createdAt).toISOString()
            : undefined,
          dateModified: article.updatedAt
            ? new Date(article.updatedAt).toISOString()
            : undefined,
          author: {
            "@type": "Organization",
            name: siteConfig.name,
          },
          publisher: {
            "@type": "Organization",
            name: siteConfig.name,
            logo: {
              "@type": "ImageObject",
              url: `${APP_URL}/images/LearnKing-logo.png`,
            },
          },
        };
      }

      case "JobPosting": {
        const job = data as JobPostingStructuredData | undefined;
        if (!job) return null;
        return {
          ...baseData,
          "@type": "JobPosting",
          title: job.title,
          description: job.description,
          datePosted: job.created_at
            ? new Date(job.created_at).toISOString()
            : undefined,
          validThrough: job.deadline
            ? new Date(job.deadline).toISOString()
            : undefined,
          employmentType: job.job_type || "FULL_TIME",
          baseSalary: {
            "@type": "MonetaryAmount",
            currency: "VND",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salary_min,
              maxValue: job.salary_max,
            },
          },
          jobLocation: {
            "@type": "Place",
            address: {
              "@type": "PostalAddress",
              addressLocality: job.location,
              addressCountry: "VN",
            },
          },
          hiringOrganization: {
            "@type": "Organization",
            name: job.employer?.name || "Unknown",
          },
        };
      }

      case "BreadcrumbList": {
        const breadcrumb = data as BreadcrumbStructuredData | undefined;
        if (!breadcrumb?.items?.length) return null;
        return {
          ...baseData,
          "@type": "BreadcrumbList",
          itemListElement: breadcrumb.items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
          })),
        };
      }

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
