'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, Save, MapPin } from 'lucide-react'

type ShippingZone = {
  id: string
  country_code: string
  country_name: string
  shipping_fee_inr: number
  estimated_days: string
  is_active: boolean
}

export default function ShippingSettingsPage() {
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchZones()
  }, [])

  async function fetchZones() {
    try {
      const { data, error } = await supabase
        .from('shipping_zones')
        .select('*')
        .order('country_name')
      
      if (error) {
        // Table might not exist yet, set dummy data for UI testing if so
        console.warn('Fallback: no shipping zones table yet')
        toast.error('Shipping zones table not found or empty. Using default fallback.')
        setZones([
          { id: '1', country_code: 'IN', country_name: 'India', shipping_fee_inr: 0, estimated_days: '4-7 days', is_active: true },
          { id: '2', country_code: 'US', country_name: 'United States', shipping_fee_inr: 3000, estimated_days: '7-10 days', is_active: true },
          { id: '3', country_code: 'GB', country_name: 'United Kingdom', shipping_fee_inr: 2500, estimated_days: '6-8 days', is_active: true },
          { id: '4', country_code: 'CA', country_name: 'Canada', shipping_fee_inr: 3200, estimated_days: '8-12 days', is_active: true },
          { id: '5', country_code: 'AE', country_name: 'United Arab Emirates', shipping_fee_inr: 1500, estimated_days: '4-6 days', is_active: true }
        ])
      } else {
        setZones(data || [])
      }
    } catch (error) {
      console.warn(error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateZone = (index: number, field: keyof ShippingZone, value: any) => {
    const updated = [...zones]
    updated[index] = { ...updated[index], [field]: value }
    setZones(updated)
  }

  const handleAddZone = () => {
    setZones([
      ...zones,
      {
        id: `new-${Date.now()}`,
        country_code: '',
        country_name: '',
        shipping_fee_inr: 0,
        estimated_days: '7-10 days',
        is_active: true
      }
    ])
  }

  const handleRemoveZone = async (index: number) => {
    const zone = zones[index]
    if (!zone.id.startsWith('new-')) {
      const { error } = await supabase.from('shipping_zones').delete().eq('id', zone.id)
      if (error) {
        toast.error('Failed to delete zone')
        return
      }
    }
    const updated = [...zones]
    updated.splice(index, 1)
    setZones(updated)
    toast.success('Zone removed')
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      const newZones = zones.filter(z => z.id.startsWith('new-'))
      const existingZones = zones.filter(z => !z.id.startsWith('new-'))

      // Update existing
      for (const zone of existingZones) {
        const { error } = await supabase
          .from('shipping_zones')
          .update({
            country_code: zone.country_code,
            country_name: zone.country_name,
            shipping_fee_inr: zone.shipping_fee_inr,
            estimated_days: zone.estimated_days,
            is_active: zone.is_active
          })
          .eq('id', zone.id)
        if (error) throw error
      }

      // Insert new
      if (newZones.length > 0) {
        const inserts = newZones.map(z => ({
          country_code: z.country_code,
          country_name: z.country_name,
          shipping_fee_inr: z.shipping_fee_inr,
          estimated_days: z.estimated_days,
          is_active: z.is_active
        }))
        const { error } = await supabase.from('shipping_zones').insert(inserts)
        if (error) throw error
      }

      toast.success('Shipping zones saved successfully!')
      fetchZones()
    } catch (error: any) {
      console.warn(error)
      toast.error('Failed to save shipping zones. Ensure Supabase table exists.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading shipping zones...</div>
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/2010admin/settings" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Shipping Zones & Rates</h1>
          <p className="text-gray-500 mt-1">Manage delivery countries, shipping costs (in INR), and estimated times.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-500" />
            International Shipping Rates
          </h2>
          <div className="flex gap-3">
            <button
              onClick={handleAddZone}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" /> Add Country
            </button>
            <button
              onClick={handleSaveAll}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-black rounded-lg hover:bg-gray-900 disabled:opacity-50"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500 font-semibold tracking-wider">
              <tr>
                <th className="px-6 py-4">Country Code (e.g. US)</th>
                <th className="px-6 py-4">Country Name</th>
                <th className="px-6 py-4">Shipping Cost (₹)</th>
                <th className="px-6 py-4">Estimated Days</th>
                <th className="px-6 py-4">Active</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {zones.map((zone, idx) => (
                <tr key={zone.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={zone.country_code}
                      onChange={(e) => handleUpdateZone(idx, 'country_code', e.target.value.toUpperCase())}
                      placeholder="US"
                      className="w-24 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={zone.country_name}
                      onChange={(e) => handleUpdateZone(idx, 'country_name', e.target.value)}
                      placeholder="United States"
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">₹</span>
                      <input
                        type="number"
                        value={zone.shipping_fee_inr}
                        onChange={(e) => handleUpdateZone(idx, 'shipping_fee_inr', Number(e.target.value))}
                        className="w-32 pl-7 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={zone.estimated_days}
                      onChange={(e) => handleUpdateZone(idx, 'estimated_days', e.target.value)}
                      placeholder="7-10 days"
                      className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-black outline-none"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={zone.is_active}
                        onChange={(e) => handleUpdateZone(idx, 'is_active', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                    </label>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleRemoveZone(idx)}
                      className="text-red-500 hover:text-red-700 p-2"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {zones.length === 0 && (
          <div className="p-12 text-center text-gray-500">
            No shipping zones found. Click "Add Country" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
