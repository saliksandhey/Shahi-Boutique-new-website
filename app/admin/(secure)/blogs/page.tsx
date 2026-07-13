import Link from 'next/link'
import { Plus, PenSquare, Trash2, Eye, EyeOff } from 'lucide-react'
import { getAdminBlogs } from '@/lib/actions/blog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { DeleteBlogButton } from './DeleteBlogButton'
import { Button } from '@/components/ui/button'

export default async function AdminBlogsPage() {
  const { data: blogs } = await getAdminBlogs()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-5xl font-heading font-black tracking-widest text-gray-900 uppercase">Feed CMS</h1>
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-gray-500 font-bold uppercase tracking-widest">Manage your premium fashion social feed.</p>
        </div>
        <Link href="/admin/blogs/create">
          <button className="flex items-center px-6 py-3 rounded-full bg-[#111111] text-white text-sm font-black uppercase tracking-widest hover:bg-[#FF7A00] transition-colors shadow-xl">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </button>
        </Link>
      </div>

      <div className="rounded-[2rem] border border-gray-100 bg-white shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow className="border-gray-100 hover:bg-transparent">
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Post</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Category & Tags</TableHead>
              <TableHead className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Date & Status</TableHead>
              <TableHead className="text-right text-gray-400 font-black uppercase tracking-widest text-[10px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs?.map((blog) => (
              <TableRow key={blog.id} className="border-gray-100 hover:bg-gray-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-4">
                    {blog.cover_image ? (
                      blog.cover_image.match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={blog.cover_image} className="w-16 h-16 object-cover rounded-xl shadow-sm" muted playsInline />
                      ) : (
                        <img src={blog.cover_image} alt={blog.title} className="w-16 h-16 object-cover rounded-xl shadow-sm" />
                      )
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="text-gray-400 text-xs font-bold uppercase">No Img</span>
                      </div>
                    )}
                    <div>
                      <div className="font-black text-gray-900 text-sm tracking-wide">{blog.title}</div>
                      <div className="text-gray-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 mt-1">
                        {blog.is_featured && <span className="text-[#FF7A00]">★ Featured</span>}
                        <span>{blog.reading_time} min read</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 rounded text-[9px] font-black uppercase tracking-widest mb-1">
                    {blog.category || 'Uncategorized'}
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {blog.tags?.map((tag: string, i: number) => (
                      <span key={i} className="text-[9px] text-gray-400 uppercase tracking-widest">#{tag}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-gray-900 text-xs tracking-widest uppercase mb-1">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {blog.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {blog.status === 'PUBLISHED' && (
                      <a href={`/feed/${blog.slug}`} target="_blank" rel="noreferrer">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500 rounded-full">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </a>
                    )}
                    <Link href={`/admin/blogs/${blog.id}/edit`}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#FF7A00] rounded-full">
                        <PenSquare className="w-4 h-4" />
                      </Button>
                    </Link>
                    <DeleteBlogButton id={blog.id} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!blogs?.length && (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                  No posts found. Start building your feed!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {blogs?.map((blog) => (
          <div key={blog.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="flex gap-4">
              {blog.cover_image ? (
                blog.cover_image.match(/\.(mp4|webm|mov)$/i) ? (
                  <video src={blog.cover_image} className="w-20 h-20 object-cover rounded-xl shadow-sm" muted playsInline />
                ) : (
                  <img src={blog.cover_image} alt={blog.title} className="w-20 h-20 object-cover rounded-xl shadow-sm" />
                )
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center">
                  <span className="text-gray-400 text-[10px] font-bold uppercase text-center leading-tight">No Image</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                    blog.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {blog.status}
                  </span>
                  {blog.is_featured && <span className="text-[#FF7A00] text-[10px] font-black uppercase tracking-widest">★ Featured</span>}
                </div>
                <h3 className="font-black text-gray-900 text-sm tracking-wide leading-tight line-clamp-2">{blog.title}</h3>
                <div className="text-gray-400 font-bold text-[9px] uppercase tracking-widest mt-1">
                  {new Date(blog.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-50 pt-3">
              <span className="text-[10px] text-gray-500 uppercase font-black tracking-widest bg-gray-50 px-2 py-1 rounded">
                {blog.category || 'Uncategorized'}
              </span>
              <div className="flex items-center gap-1">
                {blog.status === 'PUBLISHED' && (
                  <a href={`/feed/${blog.slug}`} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-blue-500 rounded-full">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </a>
                )}
                <Link href={`/admin/blogs/${blog.id}/edit`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#FF7A00] rounded-full">
                    <PenSquare className="w-4 h-4" />
                  </Button>
                </Link>
                <DeleteBlogButton id={blog.id} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
