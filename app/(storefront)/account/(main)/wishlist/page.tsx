import { requireAuth } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Heart, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toggleWishlist } from '@/lib/actions/wishlist'
import { revalidatePath } from 'next/cache'

export default async function WishlistPage() {
  const user = await requireAuth()
  const supabase = createAdminClient()

  const { data: wishlist } = await supabase
    .from('wishlist')
    .select(`
      id,
      products (
        id, name, slug, price, short_description,
        image:product_images(image_url)
      )
    `)
    .eq('user_email', user.email)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Wishlist</h1>
        <p className="mt-1 text-sm text-gray-500">
          Save items you love and buy them later.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {wishlist && wishlist.length > 0 ? (
          wishlist.map((item: any) => {
            const product = item.products
            const image = product?.image?.[0]?.image_url || 'https://via.placeholder.com/300'
            
            // Bind the id to the server action
            const removeItem = async () => {
              'use server'
              await toggleWishlist(product.id)
            }

            return (
              <div key={item.id} className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none sm:h-64">
                  <img
                    src={image}
                    alt={product?.name}
                    className="h-full w-full object-cover object-center sm:h-full sm:w-full"
                  />
                </div>
                <div className="flex flex-1 flex-col space-y-2 p-4">
                  <h3 className="text-sm font-medium text-gray-900">
                    <Link href={`/product/${product?.slug}`}>
                      <span aria-hidden="true" className="absolute inset-0" />
                      {product?.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">{product?.short_description}</p>
                  <div className="flex flex-1 flex-col justify-end">
                    <p className="text-base font-medium text-gray-900">₹{product?.price}</p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 z-10">
                  <form action={removeItem}>
                    <Button type="submit" variant="secondary" size="icon" className="rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors z-20 relative">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )
          })
        ) : (
          <div className="col-span-full rounded-md border border-gray-200 bg-white p-8 text-center">
            <Heart className="mx-auto h-8 w-8 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Your wishlist is empty</h3>
            <p className="mt-1 text-sm text-gray-500">Explore our collections and save your favorite items.</p>
            <div className="mt-6">
              <Link href="/" className="inline-flex items-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                Continue shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
