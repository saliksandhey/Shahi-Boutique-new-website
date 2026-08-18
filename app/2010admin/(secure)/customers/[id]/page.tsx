import { createAdminClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function AdminCustomerDetailsPage({ params }: { params: { id: string } }) {
  const id = await params.id;
  const supabase = createAdminClient()
  
  const { data: customer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()

  if (!customer) notFound()

  const { data: addresses } = await supabase.from('addresses').select('*').eq('user_id', id)
  const { data: orders } = await supabase.from('orders').select('*').eq('user_id', id).order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href="/2010admin/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">{customer.full_name || 'Customer Profile'}</h1>
          <p className="mt-1 text-sm text-gray-500">Joined {new Date(customer.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-gray-900">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-gray-900">{customer.phone || 'Not provided'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {addresses?.map(addr => (
                <div key={addr.id} className="text-sm p-3 border rounded-md">
                  {addr.is_default && <Badge className="mb-2 text-[10px]">Default</Badge>}
                  <p className="font-medium">{addr.full_name}</p>
                  <p className="text-gray-500">{addr.address_line1}</p>
                  {addr.address_line2 && <p className="text-gray-500">{addr.address_line2}</p>}
                  <p className="text-gray-500">{addr.city}, {addr.state} {addr.postal_code}</p>
                  <p className="text-gray-500">{addr.country}</p>
                  <p className="text-gray-500 mt-1">{addr.phone}</p>
                </div>
              ))}
              {!addresses?.length && (
                <p className="text-sm text-gray-500">No saved addresses.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders?.map(order => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-md">
                    <div>
                      <Link href={`/2010admin/orders/${order.id}`} className="font-medium hover:underline">
                        #{order.order_number}
                      </Link>
                      <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-medium">₹{order.total_amount}</p>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {order.order_status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
                {!orders?.length && (
                  <p className="text-sm text-gray-500 text-center py-4">No orders placed yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
