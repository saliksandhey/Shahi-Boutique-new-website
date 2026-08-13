import { Metadata } from 'next'
import { getBlogBySlug, getPublicBlogs } from '@/lib/actions/blog'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heart, MessageCircle, Share2, ArrowLeft, MoreHorizontal, Bookmark, Play, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { PostInteractions } from './PostInteractions'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const decodedSlug = decodeURIComponent((await params).slug)
  const { data: blog } = await getBlogBySlug(decodedSlug)
  
  if (!blog) return { title: 'Not Found' }

  return {
    title: blog.seo_title || `${blog.title} | Shahi Fashion Journal`,
    description: blog.seo_description || blog.summary,
    keywords: blog.meta_keywords || blog.tags?.join(', '),
    openGraph: {
      title: blog.seo_title || blog.title,
      description: blog.seo_description || blog.summary,
      type: 'article',
      publishedTime: blog.published_at,
      authors: [blog.author],
      tags: blog.tags,
      images: blog.cover_image ? [{ url: blog.cover_image }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.seo_title || blog.title,
      description: blog.seo_description || blog.summary,
      images: blog.cover_image ? [blog.cover_image] : [],
    }
  }
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const decodedSlug = decodeURIComponent((await params).slug)
  const { data: blog } = await getBlogBySlug(decodedSlug)

  if (!blog || blog.status !== 'PUBLISHED') {
    notFound()
  }

  const { data: allBlogs } = await getPublicBlogs(undefined, 5)
  const relatedBlogs = (allBlogs || []).filter(b => b.id !== blog.id).slice(0, 4)

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://shahiboutique.com/feed/${blog.slug}`

  // Check if content has video links to simulate a video player at top
  const isVideoPost = blog.content?.includes('youtube.com') || blog.content?.includes('vimeo.com') || blog.content?.includes('.mp4')

  return (
    <div className="bg-white sm:bg-[#F8F9FA] w-full pb-20">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Article JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BlogPosting",
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": `${process.env.NEXT_PUBLIC_SITE_URL}/feed/${blog.slug}`
              },
              "headline": blog.seo_title || blog.title,
              "image": blog.cover_image ? [blog.cover_image] : [],
              "datePublished": new Date(blog.published_at).toISOString(),
              "dateModified": new Date(blog.updated_at || blog.published_at).toISOString(),
              "author": {
                "@type": "Person",
                "name": blog.author || "Shahi Boutique"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Shahi Boutique",
                "logo": {
                  "@type": "ImageObject",
                  "url": `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
                }
              },
              "description": blog.seo_description || blog.summary
            })
          }}
        />
        <Link href="/feed" className="inline-flex items-center text-xs font-black uppercase tracking-widest text-gray-500 hover:text-[#FF7A00] transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Feed
        </Link>
      </div>

      <article className="max-w-4xl mx-auto bg-white sm:rounded-[3rem] shadow-none sm:shadow-sm sm:border border-gray-100 overflow-hidden">
        
        {/* POST HEADER (Instagram Style) */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-gray-50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF7A00] to-orange-400 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-black text-lg font-heading">S</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">Shahi Boutique</h2>
                <span className="text-blue-500 text-xs">✓</span>
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {new Date(blog.published_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button className="w-10 h-10 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* MEDIA SECTION */}
        <div className="relative w-full bg-[#111111] flex items-center justify-center overflow-hidden">
          {blog.instagram_url ? (
            <a href={blog.instagram_url} target="_blank" rel="noopener noreferrer" className="relative block w-full flex items-center justify-center group cursor-pointer">
              {blog.cover_image?.match(/\.(mp4|webm|mov)$/i) ? (
                <video 
                  src={blog.cover_image}
                  className="w-full h-auto max-h-[85vh] object-contain"
                  autoPlay loop playsInline
                  // Removed 'muted' to allow sound, though browser policies might require a user interaction first to hear it.
                  // We remove 'controls' so that clicking the video clicks the link instead of pausing.
                />
              ) : (
                <img 
                  src={blog.cover_image || '/placeholder-image.jpg'} 
                  alt={blog.title}
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
              )}
              {/* Overlay icon on hover to show it's clickable */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                 <div className="bg-white/90 rounded-full px-6 py-3 flex items-center gap-2 shadow-xl transform scale-95 group-hover:scale-100 transition-transform">
                   <ExternalLink className="w-5 h-5 text-gray-900" />
                   <span className="text-gray-900 font-black uppercase tracking-widest text-xs">View on Instagram</span>
                 </div>
              </div>
            </a>
          ) : (
            <>
              {blog.cover_image?.match(/\.(mp4|webm|mov)$/i) ? (
                <video 
                  src={blog.cover_image}
                  className="w-full h-auto max-h-[85vh] object-contain"
                  autoPlay loop playsInline controls
                />
              ) : (
                <img 
                  src={blog.cover_image || '/placeholder-image.jpg'} 
                  alt={blog.title}
                  className="w-full h-auto max-h-[85vh] object-contain"
                />
              )}
            </>
          )}
        </div>

        {/* INSTAGRAM BUTTON (If Applicable) */}
        {blog.instagram_url && (
          <div className="w-full flex justify-center py-4 bg-gray-50 border-b border-gray-100">
            <a 
              href={blog.instagram_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#111111] hover:bg-[#FF7A00] text-white rounded-full text-xs font-black uppercase tracking-widest transition-colors shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              View Original on Instagram
            </a>
          </div>
        )}

        {/* INTERACTION BAR */}
        <PostInteractions title={blog.title} url={shareUrl} />

        {/* CAPTION & HASHTAGS */}
        <div className="p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-widest text-gray-900 uppercase mb-4 leading-snug">
            {blog.title}
          </h1>

          {blog.summary && (
            <p className="text-base text-gray-700 font-medium leading-relaxed mb-6">
              <span className="font-bold text-gray-900 mr-2">shahiboutique</span>
              {blog.summary}
            </p>
          )}

          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {blog.tags.map((tag: string, i: number) => (
                <span key={i} className="text-[#FF7A00] text-sm font-bold hover:underline cursor-pointer">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* MARKDOWN CONTENT (The rest of the blog body, links, galleries) */}
          <div className="prose prose-base md:prose-lg prose-gray max-w-none prose-headings:font-heading prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-a:text-[#FF7A00] prose-img:rounded-2xl prose-img:shadow-sm">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {blog.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* SHARE BOTTOM SECTION */}
        <div className="bg-gray-50 p-6 sm:p-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black uppercase tracking-widest text-gray-900 mb-1">Share this post</h4>
            <p className="text-xs text-gray-500 font-medium">Spread the fashion inspiration.</p>
          </div>
          <div className="flex items-center gap-3">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-[#1877F2] hover:shadow-lg transition-all border border-gray-200">
              Facebook
            </a>
            <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${blog.title}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-[#1DA1F2] hover:shadow-lg transition-all border border-gray-200">
              X (Twitter)
            </a>
            <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${blog.title}`} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white rounded-full text-[10px] font-black uppercase tracking-widest text-gray-600 hover:text-[#0A66C2] hover:shadow-lg transition-all border border-gray-200">
              LinkedIn
            </a>
          </div>
        </div>

      </article>

      {/* Related Posts */}
      {relatedBlogs.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-heading font-black tracking-widest text-gray-900 uppercase">
              More From Shahi
            </h2>
            <div className="w-12 h-1 bg-[#FF7A00] mx-auto mt-4 rounded-full" />
          </div>

          <div className="columns-2 lg:columns-4 gap-3 sm:gap-6 space-y-3 sm:space-y-6">
            {relatedBlogs.map((b) => {
              const hasVid = b.cover_image?.match(/\.(mp4|webm|mov)$/i)
              return (
                <div key={b.id} className="break-inside-avoid border-b sm:border-none border-gray-100 pb-4 sm:pb-0 mb-4 sm:mb-0">
                  <Link 
                    href={`/feed/${b.slug}`}
                    className="group block bg-white md:bg-transparent sm:rounded-3xl md:rounded-none overflow-hidden shadow-none sm:shadow-sm md:shadow-none hover:shadow-xl md:hover:shadow-none transition-all duration-500 sm:border border-gray-100 md:border-none cursor-pointer"
                  >
                    <div className="relative overflow-hidden bg-gray-100">
                      {hasVid ? (
                        <video 
                          src={b.cover_image}
                          className="w-full h-auto min-h-[200px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
                          muted playsInline
                        />
                      ) : (
                        <img 
                          src={b.cover_image || '/placeholder-image.jpg'} 
                          alt={b.title}
                          className="w-full h-auto min-h-[200px] object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/5 md:bg-transparent group-hover:bg-transparent transition-colors duration-500" />
                      
                      {hasVid && (
                        <div className="absolute top-4 right-4 w-8 h-8 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                          <Play className="w-4 h-4 ml-0.5" />
                        </div>
                      )}

                      <div className="absolute top-4 left-4 md:hidden">
                        <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md text-gray-900 text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg">
                          {b.category}
                        </span>
                      </div>

                      <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md text-gray-900 text-xs font-black uppercase tracking-widest rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                          Quick View
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              )
            })}
          </div>
        </section>
      )}

    </div>
  )
}
