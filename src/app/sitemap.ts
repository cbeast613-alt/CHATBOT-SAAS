import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://chatbot-saas-plum.vercel.app";
  
  return [
    { 
      url: baseUrl, 
      lastModified: new Date(), 
      changeFrequency: "weekly", 
      priority: 1 
    },
    { 
      url: `${baseUrl}/contact`, 
      lastModified: new Date(), 
      priority: 0.8 
    },
    { 
      url: `${baseUrl}/privacy`, 
      lastModified: new Date(), 
      priority: 0.5 
    },
    { 
      url: `${baseUrl}/terms`, 
      lastModified: new Date(), 
      priority: 0.5 
    },
    { 
      url: `${baseUrl}/gdpr`, 
      lastModified: new Date(), 
      priority: 0.4 
    },
  ];
}
