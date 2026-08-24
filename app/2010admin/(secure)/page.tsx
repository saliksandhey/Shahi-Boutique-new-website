import { createAdminClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, Package, ShoppingCart } from 'lucide-react'
import { RecentOrdersTable } from '@/components/admin/RecentOrdersTable'

export default async function AdminDashboard() {
  const supabase = createAdminClient()

  // Fetch counts
  const { count: customersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'CUSTOMER')
  const { count: productsCount } = await supabase.from('products').select('*', { count: 'exact', head: true })
  const { count: ordersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true })
  const { count: pendingOrdersCount } = await supabase.from('orders').select('*', { count: 'exact', head: true }).eq('order_status', 'PENDING')
  
  // Calculate total revenue
  const { data: revenueData } = await supabase.from('orders').select('total_amount').in('payment_status', ['paid', 'PAID', 'Paid'])
  const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0

  // Fetch top products (by quantity sold)
  const { data: topProductsData } = await supabase.rpc('get_top_products', { limit_num: 5 })


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#09090B]">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">
            Overview of your store's performance.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-[#FF7A00]" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-[#09090B]">â‚¹{totalRevenue.toFixed(0)}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-[#09090B]">{ordersCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-[#09090B]">{customersCount || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-5">
            <CardTitle className="text-sm font-medium text-gray-500">Total Products</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
              <Package className="h-4 w-4 text-gray-600" />
            </div>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <div className="text-2xl font-bold text-[#09090B]">{productsCount || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 pb-12">
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-[#09090B]">
            Recent Orders
          </h2>
          <RecentOrdersTable />
        </div>
        <div className="flex flex-col space-y-4">
          <h2 className="text-lg font-bold text-[#09090B]">
            Top Selling Products
          </h2>
          <Card className="bg-white border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <CardContent className="p-0">
               <ul className="divide-y divide-gray-100">
                 {topProductsData && topProductsData.length > 0 ? (
                   topProductsData.map((prod: any, i: number) => (
                     <li key={i} className="flex gap-4 items-center p-4 hover:bg-gray-50 transition-colors group">
                       <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center font-bold text-sm text-gray-500">
                         {i + 1}
                       </div>
                       <div className="flex-1 min-w-0">
                         <p className="font-semibold text-[#09090B] text-sm truncate">{prod.product_name}</p>
                       </div>
                       <div className="shrink-0">
                         <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-gray-100 text-gray-700">{prod.total_sold} sold</span>
                       </div>
                     </li>
                   ))
                 ) : (
                   <li className="p-8 text-center text-sm font-medium text-gray-500">Not enough data available.</li>
                 )}
               </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

