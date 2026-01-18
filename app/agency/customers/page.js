'use client'

import { useState, useEffect } from 'react'
import { FaSearch, FaExternalLinkAlt, FaRocket } from 'react-icons/fa'
import { useAgencyAuth } from '../../../lib/AgencyAuthContext'
import { useAgency } from '../../../lib/AgencyContext'
import { createClient } from '@supabase/supabase-js'

const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export default function AgencyCustomersPage() {
  const { agency: authAgency, isLoading: authLoading } = useAgencyAuth()
  const { agency: brandingAgency } = useAgency()
  
  // Use auth agency for data, branding agency for colors
  const agency = authAgency
  const primaryColor = brandingAgency?.primary_color || '#fa8820'
  
  const [customers, setCustomers] = useState([])
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCustomers = async () => {
      // Wait for auth context to finish loading
      if (authLoading) return
      
      // If no agency after loading, show empty state
      if (!agency?.id) {
        setIsLoading(false)
        return
      }

      try {
        setError(null)
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('junk_companies')
          .select('*')
          .eq('agency_id', agency.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setCustomers(data || [])
        setFilteredCustomers(data || [])
      } catch (error) {
        console.error('Error fetching customers:', error)
        setError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [agency?.id, authLoading])

  // Filter customers when search or status changes
  useEffect(() => {
    let filtered = customers

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.company_name?.toLowerCase().includes(query) ||
        c.owner_name?.toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.city?.toLowerCase().includes(query)
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(c => c.status === statusFilter)
    }

    setFilteredCustomers(filtered)
  }, [searchQuery, statusFilter, customers])

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cents / 100)
  }

  const getPlanPrice = (plan) => {
    const prices = {
      starter: agency?.price_starter || 4900,
      pro: agency?.price_pro || 9900,
      growth: agency?.price_growth || 19900
    }
    return prices[plan] || 0
  }

  // Get customer subdomain base from agency or fall back to default
  const getCustomerSiteUrl = (customer) => {
    if (customer.custom_domain) {
      return `https://${customer.custom_domain}`
    }
    const subdomainBase = agency?.customer_subdomain_base || 'gorocketsites.com'
    return `https://${customer.subdomain}.${subdomainBase}`
  }

  if (isLoading || authLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          <p className="font-medium">Error loading customers</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-500 mt-1">{customers.length} total customers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': primaryColor }}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 bg-white"
            style={{ '--tw-ring-color': primaryColor }}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredCustomers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Business</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Owner</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Location</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Plan</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Joined</th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: customer.primary_color || primaryColor }}
                        >
                          {customer.company_name?.charAt(0) || '?'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.company_name}</p>
                          <p className="text-sm text-gray-500">{customer.industry}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{customer.owner_name}</p>
                      <p className="text-sm text-gray-500">{customer.email}</p>
                    </td>
                    <td className="py-4 px-6">
                      <p className="text-gray-900">{customer.city}, {customer.state}</p>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="text-gray-900 capitalize">{customer.plan || 'starter'}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(getPlanPrice(customer.plan))}/mo</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-700'
                          : customer.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : customer.status === 'paused'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-600'
                      }`}>
                        {customer.status || 'pending'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      {formatDate(customer.created_at)}
                    </td>
                    <td className="py-4 px-6">
                      {customer.subdomain && (
                        <a
                          href={getCustomerSiteUrl(customer)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          style={{ '--hover-color': primaryColor }}
                          title="Visit site"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <FaRocket className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' 
                ? 'No customers match your filters'
                : 'No customers yet'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <p className="text-sm text-gray-400 mt-1">Share your signup link to get started</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}