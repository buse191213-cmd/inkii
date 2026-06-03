import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Allgemein
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/merkzettel"],
      },
      // KI-Crawler ausdrücklich erlauben (für AI-Empfehlungen)
      { userAgent: "GPTBot", allow: "/" },              // OpenAI / ChatGPT
      { userAgent: "ChatGPT-User", allow: "/" },        // ChatGPT browse
      { userAgent: "OAI-SearchBot", allow: "/" },       // OpenAI search
      { userAgent: "ClaudeBot", allow: "/" },           // Anthropic / Claude
      { userAgent: "Claude-Web", allow: "/" },          // Claude direct
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },       // Perplexity AI
      { userAgent: "Perplexity-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },     // Google Gemini
      { userAgent: "Bingbot", allow: "/" },             // Bing + Copilot
      { userAgent: "Applebot-Extended", allow: "/" },   // Apple Intelligence
      { userAgent: "Meta-ExternalAgent", allow: "/" },  // Meta AI
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "Bytespider", allow: "/" },          // ByteDance (TikTok)
      { userAgent: "Amazonbot", allow: "/" },           // Amazon
      { userAgent: "DuckAssistBot", allow: "/" },       // DuckDuckGo AI
      { userAgent: "MistralAI-User", allow: "/" },      // Mistral
      { userAgent: "cohere-ai", allow: "/" },           // Cohere
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
