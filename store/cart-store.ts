import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createClient } from '@/lib/supabase/client'

export type CartItem = {
  id: string // composite: productId or productId-variantId
  productId: string
  variantId?: string | null
  name: string
  color?: string | null
  size?: string | null
  price: number
  salePrice?: number | null
  image: string
  quantity: number
}

interface CartState {
  items: CartItem[]
  isSynced: boolean
  addItem: (item: CartItem) => Promise<void>
  removeItem: (id: string) => Promise<void>
  updateQuantity: (id: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getTotal: () => number
  getSubtotal: () => number
  syncCart: () => Promise<void>
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSynced: false,
      isOpen: false,
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      
      addItem: async (newItem) => {
        const { items } = get()
        const productId = newItem.productId || newItem.id
        const newItemFixed = { ...newItem, productId }
        
        // Find existing item matching both productId and variantId
        const existingItem = items.find(
          (item) => (item.productId || item.id) === productId && item.variantId === newItem.variantId
        )

        let updatedItems
        if (existingItem) {
          updatedItems = items.map((item) =>
            (item.productId || item.id) === productId && item.variantId === newItem.variantId
              ? { ...item, quantity: item.quantity + newItem.quantity }
              : item
          )
        } else {
          updatedItems = [...items, newItemFixed]
        }

        set({ items: updatedItems })

        // Sync to Supabase if authenticated
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const { data: existingDb } = await supabase
            .from('cart_items')
            .select('id, quantity')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .maybeSingle()

          if (existingDb) {
            await supabase.from('cart_items').update({
              quantity: existingDb.quantity + newItem.quantity
            }).eq('id', existingDb.id)
          } else {
            await supabase.from('cart_items').insert({
              user_id: session.user.id,
              product_id: productId,
              quantity: newItem.quantity,
            })
          }
        }
      },
      
      removeItem: async (id) => {
        const itemToRemove = get().items.find(item => item.id === id)
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }))

        // Sync to Supabase if authenticated
        if (itemToRemove) {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const query = supabase.from('cart_items').delete().eq('user_id', session.user.id).eq('product_id', itemToRemove.productId || itemToRemove.id)
            await query
          }
        }
      },
      
      updateQuantity: async (id, quantity) => {
        const itemToUpdate = get().items.find(item => item.id === id)
        set((state) => ({
          items: state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
        }))

        // Sync to Supabase if authenticated
        if (itemToUpdate) {
          const supabase = createClient()
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const query = supabase.from('cart_items').update({ quantity }).eq('user_id', session.user.id).eq('product_id', itemToUpdate.productId || itemToUpdate.id)
            await query
          }
        }
      },
      
      clearCart: async () => {
        set({ items: [] })
        
        // Sync to Supabase if authenticated
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await supabase.from('cart_items').delete().eq('user_id', session.user.id)
        }
      },
      
      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.salePrice ? item.salePrice : item.price
          return total + price * item.quantity
        }, 0)
      },
      
      getTotal: () => {
        return get().getSubtotal()
      },
      
      syncCart: async () => {
        // Fetch from Supabase and merge with local
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
           set({ isSynced: true })
           return
        }

        const { data: dbItems, error } = await supabase
          .from('cart_items')
          .select('*, products(*, product_images(url, is_primary))')
          .eq('user_id', session.user.id)

        if (error || !dbItems) {
          console.error('Failed to sync cart:', error)
          return
        }

        const localItems = get().items
        
        // Push local items to DB if they don't exist in DB
        for (const localItem of localItems) {
          const actualProductId = localItem.productId || localItem.id
          const existsInDb = dbItems.find(dbI => dbI.product_id === actualProductId)
          if (!existsInDb) {
            await supabase.from('cart_items').insert({
              user_id: session.user.id,
              product_id: actualProductId,
              quantity: localItem.quantity,
            })
          }
        }

        // Refetch after merge
        const { data: finalDbItems } = await supabase
          .from('cart_items')
          .select('*, products(*, product_images(url, is_primary))')
          .eq('user_id', session.user.id)

        if (finalDbItems) {
          const mergedItems: CartItem[] = finalDbItems.map((dbItem: any) => {
            const product = dbItem.products
            const image = product.product_images?.find((img: any) => img.is_primary)?.url || product.product_images?.[0]?.url || '/placeholder.png'

            return {
              id: dbItem.id, // Use unique DB row ID instead of product ID to prevent React duplicate key warnings
              productId: product.id,
              name: product.name,
              price: product.price,
              salePrice: product.sale_price,
              image: image,
              quantity: dbItem.quantity
            }
          })

          set({ items: mergedItems, isSynced: true })
        }
      }
    }),
    {
      name: 'boutique-cart-storage',
    }
  )
)
