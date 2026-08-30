import { PriceDisplay } from '@/components/storefront/PriceDisplay';
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Shipping Policy | SHAHI',
  description: 'Learn about our shipping and delivery policies.',
}

export default function ShippingPage() {
  return (
    <div className="bg-white min-h-screen pb-20 md:pb-32">
      {/* Header Section */}
      <div className="bg-[#F8F9FA] py-16 md:py-24 px-6 text-center rounded-b-[2rem] md:rounded-b-[3rem] mb-12 md:mb-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-sans font-black tracking-tighter text-gray-900 uppercase mb-4 md:mb-6 leading-none">
          SHIPPING POLICY
        </h1>
        <p className="text-gray-500 font-medium max-w-xl mx-auto text-sm md:text-base">
          Everything you need to know about how we get your premium streetwear from our warehouse directly to your doorstep.
        </p>
      </div>

      {/* Content Section */}
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <div className="space-y-12 md:space-y-16">
          
          {/* Section 1 */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-xs shadow-sm shrink-0">01</span>
              Processing Time
            </h2>
            <div className="bg-[#F8F9FA] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 text-sm md:text-base text-gray-500 leading-relaxed font-medium">
              <p>
                Our signature product is the <strong>Potli Purse</strong>, which is meticulously designed with intricate handwork. Because of the incredible craftsmanship involved, please allow <strong>2 days</strong> for us to create and process your order before it ships. 
              </p>
              <p className="mt-4">
                You will receive a notification when your beautiful piece has been shipped. Please note that during high-volume drops or major sales events, processing times may be slightly delayed. We appreciate your patience as we ensure every detail of your order is perfect.
              </p>
            </div>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-xs shadow-sm shrink-0">02</span>
              Domestic Shipping Rates
            </h2>
            <div className="bg-[#F8F9FA] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-900">Shipping Method</th>
                      <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-900">Estimated Delivery Time</th>
                      <th className="pb-4 text-xs font-bold uppercase tracking-widest text-gray-900 text-right">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-gray-500 divide-y divide-gray-100">
                    <tr>
                      <td className="py-4 text-gray-900 font-bold">Standard Delivery</td>
                      <td className="py-4">3 - 5 Business Days</td>
                      <td className="py-4 text-right font-black tracking-wide"><PriceDisplay amount={10.00} /></td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-900 font-bold">Express Delivery</td>
                      <td className="py-4">1 - 2 Business Days</td>
                      <td className="py-4 text-right font-black tracking-wide"><PriceDisplay amount={25.00} /></td>
                    </tr>
                    <tr>
                      <td className="py-4 text-gray-900 font-bold">Free Shipping</td>
                      <td className="py-4">Orders over <PriceDisplay amount={150.00} /></td>
                      <td className="py-4 text-right font-black tracking-wide text-[#FF7A00]">FREE</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-xs shadow-sm shrink-0">03</span>
              International Shipping
            </h2>
            <div className="bg-[#F8F9FA] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 text-sm md:text-base text-gray-500 leading-relaxed font-medium">
              <p>
                We offer worldwide shipping to most countries. Shipping charges for your order will be calculated and displayed at checkout based on your destination and the weight of your package.
              </p>
              <div className="mt-6 p-4 rounded-xl bg-orange-50 border border-orange-100 text-orange-800 text-sm">
                <span className="font-bold block mb-1 uppercase tracking-widest text-[10px]">Important Notice</span>
                Your order may be subject to import duties and taxes (including VAT), which are incurred once a shipment reaches your destination country. SHAHI is not responsible for these charges if they are applied and are your responsibility as the customer.
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-gray-900 mb-6 flex items-center gap-4">
              <span className="w-8 h-8 rounded-full bg-[#1C1C1C] text-white flex items-center justify-center text-xs shadow-sm shrink-0">04</span>
              How do I check the status of my order?
            </h2>
            <div className="bg-[#F8F9FA] p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 text-sm md:text-base text-gray-500 leading-relaxed font-medium">
              <p>
                When your order has shipped, you will receive an email notification from us which will include a tracking number you can use to check its status. Please allow 48 hours for the tracking information to become available. 
              </p>
              <p className="mt-4">
                You can also visit the <a href="/account/orders" className="text-[#FF7A00] hover:text-[#1C1C1C] font-bold underline transition-colors">Orders</a> section in your account to view live updates on your delivery at any time.
              </p>
              <p className="mt-4">
                If you havenâ€™t received your order within the timeframe indicated on your shipping confirmation email, please contact us at <a href="mailto:contact.shahiboutique@gmail.com" className="font-bold text-gray-900 hover:text-[#FF7A00] transition-colors">contact.shahiboutique@gmail.com</a> with your name and order number, and we will look into it for you.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

