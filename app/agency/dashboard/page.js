'use client'

import { useState, useEffect } from 'react'
import { FaUsers, FaDollarSign, FaChartLine, FaUserPlus, FaExternalLinkAlt, FaSpinner, FaRocket } from 'react-icons/fa'
import { useAgencyAuth } from '../../../lib/AgencyAuthContext'
import { useAgency } from '../../../lib/AgencyContext'
import { createClient } from '@supabase/supabase-js'
import Link from 'next/link'

const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

export default function AgencyDashboardPage() {
  const { agency, isLoading: authLoading } = useAgencyAuth()
  const { agency: brandingAgency } = useAgency()
  
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    mrr: 0,
    thisMonth: 0
  })

  const primaryColor = agency?.primary_color || brandingAgency?.primary_color || '#fa8820'

  useEffect(() => {
    const fetchData = async () => {
      if (authLoading) return
      if (!agency?.id) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = getSupabase()
        const { data, error } = await supabase
          .from('junk_companies')
          .select('*')
          .eq('agency_id', agency.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        const allCustomers = data || []
        setCustomers(allCustomers)

        // Calculate stats
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

        const activeCustomers = allCustomers.filter(c => c.status === 'active')
        const thisMonthCustomers = allCustomers.filter(c => 
          new Date(c.created_at) >= startOfMonth
        )

        // Calculate MRR based on plans
        const mrr = activeCustomers.reduce((sum, c) => {
          const planPrices = {
            starter: agency.price_starter || 4900,
            pro: agency.price_pro || 9900,
            growth: agency.price_growth || 19900
          }
          return sum + (planPrices[c.plan] || planPrices.starter)
        }, 0)

        setStats({
          total: allCustomers.length,
          active: activeCustomers.length,
          mrr: mrr,
          thisMonth: thisMonthCustomers.length
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [agency?.id, authLoading])

  const formatCurrency = (cents) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(cents / 100)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getCustomerSiteUrl = (customer) => {
    if (customer.custom_domain) {
      return `https://${customer.custom_domain}`
    }
    const subdomainBase = agency?.customer_subdomain_base || 'gorocketsites.com'
    return `https://${customer.subdomain}.${subdomainBase}`
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      case 'paused': return 'bg-gray-100 text-gray-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl" style={{ color: primaryColor }} />
      </div>
    )
  }

  const recentCustomers = customers.slice(0, 5)

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm">Welcome back, {agency?.owner_name || 'Agency Owner'}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FaUsers style={{ color: primaryColor }} />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Total Customers</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <FaChartLine className="text-green-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Active</p>
          <p className="text-3xl font-bold text-green-600">{stats.active}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FaDollarSign className="text-blue-600" />
            </div>
          </div>
          <p className="text-gray-600 text-sm">Monthly Revenue</p>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(stats.mrr)}</p>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border-l-4" style={{ borderLeftColor: primaryColor }}>
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <FaUserPlus style={{ color: primaryColor }} />
            </div>
          </div>
          <p className="text-gray-600 text-sm">This Month</p>
          <p className="text-3xl font-bold" style={{ color: primaryColor }}>{stats.thisMonth}</p>
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Customers</h2>
            <p className="text-sm text-gray-500">Latest signups</p>
          </div>
          <Link
            href="/agency/customers"
            className="text-sm font-medium hover:underline"
            style={{ color: primaryColor }}
          >
            View All →
          </Link>
        </div>

        {recentCustomers.length > 0 ? (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Business</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Owner</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Plan</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Joined</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                            style={{ backgroundColor: customer.primary_color || primaryColor }}
                          >
                            {customer.company_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.company_name}</p>
                            <p className="text-sm text-gray-500">{customer.city}, {customer.state}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">{customer.owner_name}</p>
                        <p className="text-sm text-gray-500">{customer.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize font-medium text-gray-900">{customer.plan || 'starter'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                          {customer.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        {customer.subdomain && (
                          <a
                            href={getCustomerSiteUrl(customer)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 transition-colors"
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

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {recentCustomers.map((customer) => (
                <div key={customer.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                        style={{ backgroundColor: customer.primary_color || primaryColor }}
                      >
                        {customer.company_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.company_name}</p>
                        <p className="text-sm text-gray-500">{customer.owner_name}</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(customer.status)}`}>
                      {customer.status || 'pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span className="capitalize">{customer.plan || 'starter'} plan</span>
                    <span>{formatDate(customer.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="p-12 text-center">
            <FaRocket className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">No customers yet</p>
            <p className="text-sm text-gray-400 mt-1">Share your marketing site to get started</p>
            {agency?.marketing_domain && (
              <a
                href={`https://${agency.marketing_domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm font-medium"
                style={{ color: primaryColor }}
              >
                <FaExternalLinkAlt /> {agency.marketing_domain}
              </a>
            )}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link
          href="/agency/settings"
          className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}20` }}
          >
            <span className="text-2xl">🎨</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Customize Branding</h3>
            <p className="text-sm text-gray-500">Update logo, colors, and pricing</p>
          </div>
        </Link>

        {agency?.marketing_domain && (
          <a
            href={`https://${agency.marketing_domain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${primaryColor}20` }}
            >
              <span className="text-2xl">🌐</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Marketing Site</h3>
              <p className="text-sm text-gray-500">{agency.marketing_domain}</p>
            </div>
          </a>
        )}
      </div>
    </div>
  )
}