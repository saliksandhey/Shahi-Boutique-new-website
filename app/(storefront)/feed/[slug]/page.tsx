import { Metadata } from 'next'
import { getBlogBySlug } from '@/lib/actions/blog'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Heart, MessageCircle, Share2, ArrowLeft, MoreHorizontal, Bookmark } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { data: blog } = await getBlogBySlug(slug)
  
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
  const { slug } = await params
  const { data: blog } = await getBlogBySlug(slug)

  if (!blog || blog.status !== 'PUBLISHED') {
    notFound()
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://shahiboutique.com/feed/${blog.slug}`

  // Check if content has video links to simulate a video player at top
  const isVideoPost = blog.content?.includes('youtube.com') || blog.content?.includes('vimeo.com') || blog.content?.includes('.mp4')

  return (
    <main className="bg-[#F8F9FA] min-h-screen pt-24 pb-20">
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 sm:mb-8">
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
        <div className="relative w-full bg-black/5 flex items-center justify-center overflow-hidden">
          {blog.cover_image?.match(/\.(mp4|webm|mov)$/i) ? (
            <video 
              src={blog.cover_image}
              className="w-full h-auto max-h-[70vh] md:max-h-[80vh] object-contain"
              autoPlay loop playsInline controls
            />
          ) : (
            <img 
              src={blog.cover_image || '/placeholder-image.jpg'} 
              alt={blog.title}
              className="w-full h-auto max-h-[70vh] md:max-h-[80vh] object-contain"
            />
          )}
        </div>

        {/* INTERACTION BAR */}
        <div className="p-6 sm:px-8 border-b border-gray-50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-5">
              <button className="text-gray-900 hover:text-red-500 transition-transform hover:scale-110">
                <Heart className="w-7 h-7" />
              </button>
              <button className="text-gray-900 hover:text-blue-500 transition-transform hover:scale-110">
                <MessageCircle className="w-7 h-7" />
              </button>
              <button className="text-gray-900 hover:text-green-500 transition-transform hover:scale-110">
                <Share2 className="w-7 h-7" />
              </button>
            </div>
            <button className="text-gray-900 hover:text-[#FF7A00] transition-transform hover:scale-110">
              <Bookmark className="w-7 h-7" />
            </button>
          </div>
          
          <div className="text-sm font-bold text-gray-900 mb-1">
            Liked by thousands of fashion lovers
          </div>
        </div>

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
    </main>
  )
}
