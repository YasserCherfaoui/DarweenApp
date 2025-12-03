import { createRoute, Link } from '@tanstack/react-router'
import { rootRoute } from '@/main'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useRef, useState } from 'react'
import {
  Building2,
  Package,
  Warehouse,
  Store,
  ShoppingCart,
  FileText,
  Truck,
  ShoppingBag,
  Mail,
  Webhook,
  CheckCircle2,
  ArrowRight,
  XCircle,
  TrendingUp,
  Clock,
  Zap,
} from 'lucide-react'

// Reusable icon components from SourceIcon
const ShopifyIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 256 292"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="xMidYMid"
    className={className}
  >
    <path
      d="M223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-1.703-1.703-5.029-1.185-6.32-.805-.19.056-3.388 1.043-8.678 2.68-5.18-14.906-14.322-28.604-30.405-28.604-.444 0-.901.018-1.358.044C129.31 3.407 123.644.779 118.75.779c-37.465 0-55.364 46.835-60.976 70.635-14.558 4.511-24.9 7.718-26.221 8.133-8.126 2.549-8.383 2.805-9.45 10.462C21.3 95.806.038 260.235.038 260.235l165.678 31.042 89.77-19.42S223.973 58.8 223.775 57.34zM156.49 40.848l-14.019 4.339c.005-.988.01-1.96.01-3.023 0-9.264-1.286-16.723-3.349-22.636 8.287 1.04 13.806 10.469 17.358 21.32zm-27.638-19.483c2.304 5.773 3.802 14.058 3.802 25.238 0 .572-.005 1.095-.01 1.624-9.117 2.824-19.024 5.89-28.953 8.966 5.575-21.516 16.025-31.908 25.161-35.828zm-11.131-10.537c1.617 0 3.246.549 4.805 1.622-12.007 5.65-24.877 19.88-30.312 48.297l-22.886 7.088C75.694 46.16 90.81 10.828 117.72 10.828z"
      fill="#95BF46"
    />
    <path
      d="M221.237 54.983c-1.055-.088-23.383-1.743-23.383-1.743s-15.507-15.395-17.209-17.099c-.637-.634-1.496-.959-2.394-1.099l-12.527 256.233 89.762-19.418S223.972 58.8 223.774 57.34c-.201-1.46-1.48-2.268-2.537-2.357"
      fill="#5E8E3E"
    />
    <path
      d="M135.242 104.585l-11.069 32.926s-9.698-5.176-21.586-5.176c-17.428 0-18.305 10.937-18.305 13.693 0 15.038 39.2 20.8 39.2 56.024 0 27.713-17.577 45.558-41.277 45.558-28.44 0-42.984-17.7-42.984-17.7l7.615-25.16s14.95 12.835 27.565 12.835c8.243 0 11.596-6.49 11.596-11.232 0-19.616-32.16-20.491-32.16-52.724 0-27.129 19.472-53.382 58.778-53.382 15.145 0 22.627 4.338 22.627 4.338"
      fill="#FFF"
    />
  </svg>
)

const WooCommerceIcon = ({ className }: { className?: string }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
      fill="#96588A"
    />
    <path
      d="M7 7l2.5 8 1.5-5 1.5 5L15 7"
      stroke="#FFF"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
)

export const HomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/home',
  component: HomePage,
})

function HomePage() {
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    Object.keys(sectionRefs.current).forEach((key) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [key]: true }))
            observer.disconnect()
          }
        },
        { threshold: 0.1 }
      )

      const element = sectionRefs.current[key]
      if (element) {
        observer.observe(element)
        observers.push(observer)
      }
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [])

  const useCases = [
    {
      title: 'E-commerce Retailer',
      description: 'Manage online orders from Shopify and WooCommerce, sync inventory across multiple warehouses, and automate fulfillment.',
      icon: ShoppingBag,
      steps: [
        'Connect your Shopify/WooCommerce stores',
        'Orders automatically sync to your dashboard',
        'Inventory updates in real-time',
        'Fulfill orders with one click',
      ],
    },
    {
      title: 'Multi-Location Franchise',
      description: 'Manage inventory, sales, and operations across multiple franchise locations with centralized control.',
      icon: Store,
      steps: [
        'Create franchise locations',
        'Track inventory per location',
        'Monitor sales and performance',
        'Centralized reporting and analytics',
      ],
    },
    {
      title: 'Wholesale Distributor',
      description: 'Manage suppliers, warehouse operations, and customer orders all in one integrated platform.',
      icon: Truck,
      steps: [
        'Manage supplier relationships',
        'Track warehouse bills and inventory',
        'Process customer orders efficiently',
        'Generate comprehensive reports',
      ],
    },
  ]

  const featureStories = [
    {
      id: 'companies',
      userStory: 'As a business owner, I want to manage multiple companies in one place so that I can oversee all my operations efficiently.',
      title: 'Companies Management',
      description: 'Create and manage multiple companies with complete control. Add team members, assign roles, and track performance across all your businesses from a single dashboard.',
      icon: Building2,
      benefits: [
        'Manage unlimited companies from one account',
        'Assign team members with role-based permissions',
        'Track company performance and analytics',
        'Centralized billing and subscription management',
      ],
    },
    {
      id: 'products',
      userStory: 'As a product manager, I want to create products with multiple variants and SKUs so that I can manage my entire catalog efficiently.',
      title: 'Products & Variants',
      description: 'Build a comprehensive product catalog with variants, SKUs, pricing, and descriptions. Organize your inventory with custom attributes and bulk import capabilities.',
      icon: Package,
      benefits: [
        'Create products with unlimited variants',
        'Manage SKUs and pricing per variant',
        'Bulk import products from CSV',
        'Organize with custom attributes and categories',
      ],
    },
    {
      id: 'inventory',
      userStory: 'As a warehouse manager, I want real-time inventory tracking so that I always know stock levels and can prevent stockouts.',
      title: 'Inventory Tracking',
      description: 'Monitor inventory levels in real-time across all locations. Track movements, adjustments, and reservations with complete audit trails.',
      icon: Warehouse,
      benefits: [
        'Real-time stock level monitoring',
        'Track inventory movements and history',
        'Stock adjustments and reservations',
        'Low stock alerts and notifications',
      ],
    },
    {
      id: 'pos',
      userStory: 'As a store manager, I want a complete POS system so that I can process sales, manage customers, and track cash flow efficiently.',
      title: 'Point of Sale (POS)',
      description: 'Complete POS solution for in-store sales. Process transactions, manage customers, track cash drawer, and generate sales reports.',
      icon: ShoppingCart,
      benefits: [
        'Fast and intuitive checkout process',
        'Customer management and history',
        'Cash drawer tracking and reconciliation',
        'Sales reports and analytics',
      ],
    },
    {
      id: 'warehouse-bills',
      userStory: 'As a warehouse operator, I want to manage warehouse bills so that I can track all incoming and outgoing inventory accurately.',
      title: 'Warehouse Bills',
      description: 'Comprehensive warehouse bill management. Track all inventory movements, generate bills, and maintain complete audit trails.',
      icon: FileText,
      benefits: [
        'Create and manage warehouse bills',
        'Track inventory entries and exits',
        'Complete bill history and audit trail',
        'Export bills for accounting',
      ],
    },
    {
      id: 'suppliers',
      userStory: 'As a procurement manager, I want to manage suppliers and their bills so that I can streamline purchasing and track costs.',
      title: 'Supplier Management',
      description: 'Manage your supplier relationships efficiently. Track supplier bills, monitor payment status, and streamline procurement processes.',
      icon: Truck,
      benefits: [
        'Maintain supplier database',
        'Track supplier bills and payments',
        'Monitor supplier performance',
        'Streamline procurement workflows',
      ],
    },
    {
      id: 'franchises',
      userStory: 'As a franchise owner, I want to manage multiple franchise locations so that I can monitor operations and inventory across all stores.',
      title: 'Franchise Management',
      description: 'Manage multiple franchise locations with independent inventory, sales tracking, and operations. Centralized reporting with location-specific insights.',
      icon: Store,
      benefits: [
        'Create and manage franchise locations',
        'Independent inventory per location',
        'Track sales and performance by location',
        'Centralized reporting and analytics',
      ],
    },
    {
      id: 'orders',
      userStory: 'As an e-commerce manager, I want automated order processing from Shopify and WooCommerce so that I can fulfill orders without manual data entry.',
      title: 'Orders Management',
      description: 'Seamlessly integrate with Shopify and WooCommerce. Orders automatically sync to your dashboard, inventory updates in real-time, and fulfillment is just one click away.',
      icon: ShoppingBag,
      benefits: [
        'Connect Shopify and WooCommerce stores',
        'Automatic order synchronization',
        'Real-time inventory updates',
        'One-click order fulfillment',
      ],
    },
    {
      id: 'mailing',
      userStory: 'As a business owner, I want an integrated email system so that I can send notifications, alerts, and communications automatically.',
      title: 'Mailing System',
      description: 'Built-in email system for all your communication needs. Send order confirmations, inventory alerts, and custom notifications automatically.',
      icon: Mail,
      benefits: [
        'Automated email notifications',
        'Order confirmations and updates',
        'Inventory alerts and warnings',
        'Custom email templates',
      ],
    },
    {
      id: 'webhooks',
      userStory: 'As a developer, I want automated webhooks so that my Shopify and WooCommerce data stays in sync without manual intervention.',
      title: 'Webhooks',
      description: 'Automated webhook integration with Shopify and WooCommerce. Keep your data synchronized in real-time with reliable, secure webhook processing.',
      icon: Webhook,
      benefits: [
        'Automated webhook processing',
        'Real-time data synchronization',
        'Shopify and WooCommerce integration',
        'Reliable and secure webhook handling',
      ],
    },
  ]

  const benefits = [
    'Modern, intuitive interface',
    'Real-time inventory tracking',
    'Multi-company and franchise support',
    'E-commerce integration (Shopify & WooCommerce)',
    'Automated order management',
    'Email system integration',
    'Webhook automation for seamless workflows',
    'Role-based access control',
    'Comprehensive reporting',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-in fade-in slide-in-from-top duration-500">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/home" className="flex items-center gap-2 transition-transform hover:scale-105">
            <img
              src="/SVG/Darween.svg"
              alt="Darween Logo"
              className="h-8 w-8 dark:invert"
            />
            <span className="text-xl font-bold">Darween ERP</span>
          </Link>
          
          {/* Navigation Items */}
          <nav className="hidden md:flex items-center gap-6">
            <a 
              href="#features" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Features
            </a>
            <a 
              href="#use-cases" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Use Cases
            </a>
            <a 
              href="#benefits" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Benefits
            </a>
            <a 
              href="#pricing" 
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary transition-colors"
            >
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative overflow-hidden">
        {/* Floating Logos Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float opacity-10 dark:opacity-5"
              style={{
                left: `${(i * 15) % 90}%`,
                top: `${(i * 20) % 80}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${6 + (i % 3)}s`,
              }}
            >
              <img
                src="/SVG/Darween.svg"
                alt="Darween Logo"
                className="h-16 w-16 md:h-24 md:w-24 dark:invert"
                style={{
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            </div>
          ))}
        </div>

        <div
          ref={(el) => {
            sectionRefs.current['hero'] = el
          }}
          className={`mx-auto max-w-5xl text-center transition-all duration-1000 relative z-10 ${
            isVisible['hero'] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
          }`}
        >
          <div className="mb-8 flex justify-center">
            <div className="animate-in fade-in zoom-in-95 duration-1000 delay-300">
              <img
                src="/SVG/Darween.svg"
                alt="Darween Logo"
                className="h-24 w-24 dark:invert transition-transform hover:scale-110"
              />
            </div>
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Streamline Your Business Operations
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600 dark:text-gray-300 sm:text-2xl">
            Comprehensive ERP solution for managing companies, products, inventory, franchises, and e-commerce integrations
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" className="animate-in fade-in slide-in-from-left duration-700 delay-500" asChild>
              <Link to="/register">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="animate-in fade-in slide-in-from-right duration-700 delay-500" asChild>
              <Link to="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Supported Stores Section */}
      <section className="bg-white dark:bg-gray-950 border-y">
        <div className="container mx-auto px-4 py-12">
          <div
            ref={(el) => {
              sectionRefs.current['supported-stores'] = el
            }}
            className={`mx-auto max-w-5xl text-center transition-all duration-1000 ${
              isVisible['supported-stores'] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
            }`}
          >
            <p className="mb-8 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Seamlessly Integrates With
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
              {/* Shopify Logo */}
              <div className="group flex items-center gap-4 transition-all duration-300 hover:scale-110">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white dark:bg-gray-800 p-3 shadow-md">
                  <ShopifyIcon className="h-full w-full" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-[#95BF46]">Shopify</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">E-commerce Platform</div>
                </div>
              </div>

              {/* WooCommerce Logo */}
              <div className="group flex items-center gap-4 transition-all duration-300 hover:scale-110">
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white dark:bg-gray-800 p-3 shadow-md">
                  <WooCommerceIcon className="h-full w-full" />
                </div>
                <div className="text-left">
                  <div className="text-2xl font-bold text-[#96588A]">WooCommerce</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">WordPress E-commerce</div>
                </div>
              </div>
            </div>
            <p className="mt-8 text-sm text-gray-600 dark:text-gray-400">
              Automatic order synchronization, real-time inventory updates, and one-click fulfillment
            </p>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="bg-white dark:bg-gray-950">
        <div className="container mx-auto px-4 py-20">
          <div
            ref={(el) => {
              sectionRefs.current['usecases'] = el
            }}
            className={`mx-auto max-w-7xl transition-all duration-1000 ${
              isVisible['usecases'] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
            }`}
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Real-World Use Cases
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                See how Darween ERP helps businesses like yours streamline operations and grow
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {useCases.map((useCase, index) => {
                const Icon = useCase.icon
                return (
                  <Card
                    key={useCase.title}
                    className={`group transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                      isVisible['usecases']
                        ? `animate-in fade-in slide-in-from-bottom-4`
                        : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    <CardHeader>
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                        <Icon className="h-7 w-7 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{useCase.title}</CardTitle>
                      <CardDescription className="text-base">{useCase.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {useCase.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-20 md:py-32">
          <div
            ref={(el) => {
              sectionRefs.current['before-after'] = el
            }}
            className={`mx-auto max-w-7xl transition-all duration-1000 ${
              isVisible['before-after'] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
            }`}
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                The Transformation
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                See the dramatic difference Darween ERP makes in your daily operations
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {/* Before Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                    <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Before Darween ERP</h3>
                </div>

                <Card className="border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/20">
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Manual Data Entry</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Hours spent manually entering orders from Shopify and WooCommerce
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Inventory Chaos</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Stock levels out of sync across multiple systems and locations
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Multiple Spreadsheets</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Juggling Excel files for inventory, orders, and suppliers
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">No Real-Time Visibility</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Can't see what's happening across your business in real-time
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Time-Consuming Reports</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Spending hours compiling reports from multiple sources
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Error-Prone Processes</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Human errors causing stockouts, overstocking, and order mistakes
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="rounded-lg bg-gray-200 dark:bg-gray-800 p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Average Time Wasted</span>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">15+ hours/week</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">on manual tasks</p>
                </div>
              </div>

              {/* After Column */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">After Darween ERP</h3>
                </div>

                <Card className="border-green-200 dark:border-green-900/50 bg-green-50/50 dark:bg-green-950/20">
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Automated Order Processing</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Orders from Shopify and WooCommerce sync automatically - zero manual entry
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Real-Time Inventory Sync</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Stock levels update instantly across all locations and platforms
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Single Source of Truth</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            All your data in one place - no more switching between systems
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Live Dashboard</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Monitor everything happening in your business in real-time
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Instant Reports</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Generate comprehensive reports with one click
                          </p>
                        </div>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">Error-Free Operations</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Automated workflows eliminate human errors and prevent costly mistakes
                          </p>
                        </div>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 p-6 text-center text-white">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Zap className="h-5 w-5" />
                    <span className="text-sm font-semibold">Time Saved</span>
                  </div>
                  <p className="text-3xl font-bold">15+ hours/week</p>
                  <p className="text-sm opacity-90 mt-1">freed up for growth</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Focus on what matters most</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transformation Summary */}
            <div className="mt-12 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 p-8 border border-primary/20">
              <div className="text-center">
                <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                  The Result: Transform Your Business Operations
                </h3>
                <div className="grid gap-6 md:grid-cols-3 mt-8">
                  <div className="text-center">
                    <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Zap className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">90% Faster</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Order processing time</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <TrendingUp className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">100% Accurate</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Inventory tracking</p>
                  </div>
                  <div className="text-center">
                    <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-8 w-8 text-primary" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">15+ Hours</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Saved per week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Stories Sections */}
      {featureStories.map((feature, index) => {
        const Icon = feature.icon
        const isEven = index % 2 === 0
        const sectionId = `feature-${feature.id}`
        
        return (
          <section
            key={feature.id}
            id={index === 0 ? 'features' : undefined}
            className={isEven ? 'bg-white dark:bg-gray-950' : 'bg-gray-50 dark:bg-gray-900'}
          >
            <div className="container mx-auto px-4 py-20 md:py-32">
              <div
                ref={(el) => {
                  sectionRefs.current[sectionId] = el
                }}
                className={`mx-auto max-w-6xl transition-all duration-1000 ${
                  isVisible[sectionId] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
                }`}
              >
                <div className={`grid gap-12 items-center md:grid-cols-2 ${!isEven ? 'md:grid-flow-dense' : ''}`}>
                  {/* Icon and Visual */}
                  <div className={`flex justify-center ${!isEven ? 'md:col-start-2' : ''}`}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-3xl transform scale-150 opacity-50 animate-pulse" />
                      <div className="relative flex h-64 w-64 items-center justify-center rounded-3xl bg-primary/5 p-8 transition-transform hover:scale-105">
                        <Icon className="h-32 w-32 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`${!isEven ? 'md:col-start-1 md:row-start-1' : ''}`}>
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-semibold text-primary">{feature.title}</span>
                    </div>
                    <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                      {feature.title}
                    </h2>
                    <div className="mb-6 rounded-lg bg-primary/5 p-4 border-l-4 border-primary">
                      <p className="text-base italic text-gray-700 dark:text-gray-300">
                        "{feature.userStory}"
                      </p>
                    </div>
                    <p className="mb-6 text-lg text-gray-600 dark:text-gray-400">
                      {feature.description}
                    </p>
                    <ul className="space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <li
                          key={benefitIndex}
                          className="flex items-start gap-3"
                        >
                          <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                          <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      })}

      {/* Benefits Section */}
      <section id="benefits" className="bg-gray-100 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-20">
          <div
            ref={(el) => {
              sectionRefs.current['benefits'] = el
            }}
            className={`mx-auto max-w-5xl transition-all duration-1000 ${
              isVisible['benefits'] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
            }`}
          >
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
                Why Choose Darween ERP?
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                Built for modern businesses that need powerful, flexible solutions
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit}
                  className={`flex items-start gap-3 rounded-lg bg-white p-4 dark:bg-gray-800 transition-all duration-500 hover:shadow-md hover:scale-105 ${
                    isVisible['benefits']
                      ? `animate-in fade-in slide-in-from-left-4`
                      : 'opacity-0'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                  }}
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-primary" />
                  <p className="text-gray-700 dark:text-gray-300">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section (Placeholder) */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div
          ref={(el) => {
            sectionRefs.current['pricing'] = el
          }}
          className={`mx-auto max-w-7xl transition-all duration-1000 ${
            isVisible['pricing'] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
          }`}
        >
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
              Simple Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Choose the plan that works best for your business
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card
              className={`group transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                isVisible['pricing']
                  ? `animate-in fade-in slide-in-from-bottom-4`
                  : 'opacity-0'
              }`}
              style={{ animationDelay: '0ms' }}
            >
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>Perfect for small businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Up to 1 company</li>
                  <li>Basic inventory management</li>
                  <li>Email support</li>
                </ul>
                <Button className="mt-6 w-full" variant="outline" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card
              className={`group border-primary transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                isVisible['pricing']
                  ? `animate-in fade-in slide-in-from-bottom-4`
                  : 'opacity-0'
              }`}
              style={{ animationDelay: '150ms' }}
            >
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>For growing businesses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">$79</span>
                  <span className="text-gray-600 dark:text-gray-400">/month</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Up to 5 companies</li>
                  <li>Full feature access</li>
                  <li>E-commerce integrations</li>
                  <li>Priority support</li>
                </ul>
                <Button className="mt-6 w-full" asChild>
                  <Link to="/register">Get Started</Link>
                </Button>
              </CardContent>
            </Card>
            <Card
              className={`group transition-all duration-500 hover:shadow-xl hover:scale-105 ${
                isVisible['pricing']
                  ? `animate-in fade-in slide-in-from-bottom-4`
                  : 'opacity-0'
              }`}
              style={{ animationDelay: '300ms' }}
            >
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large organizations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>Unlimited companies</li>
                  <li>Custom integrations</li>
                  <li>Dedicated support</li>
                  <li>SLA guarantee</li>
                </ul>
                <Button className="mt-6 w-full" variant="outline" asChild>
                  <Link to="/register">Contact Sales</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div
            ref={(el) => {
              sectionRefs.current['cta'] = el
            }}
            className={`mx-auto max-w-4xl text-center transition-all duration-1000 ${
              isVisible['cta'] ? 'animate-in fade-in slide-in-from-bottom-4' : 'opacity-0'
            }`}
          >
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg opacity-90">
              Join thousands of businesses using Darween ERP to streamline their operations
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" variant="secondary" className="transition-transform hover:scale-105" asChild>
                <Link to="/register">
                  Create Free Account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-primary-foreground transition-transform hover:scale-105 hover:bg-primary-foreground/10" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <img
                  src="/SVG/Darween.svg"
                  alt="Darween Logo"
                  className="h-8 w-8 dark:invert"
                />
                <span className="text-lg font-bold">Darween ERP</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Comprehensive ERP solution for modern businesses
              </p>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Product</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link to="/home" className="hover:underline">Features</Link>
                </li>
                <li>
                  <Link to="/home" className="hover:underline">Pricing</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Company</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link to="/home" className="hover:underline">About</Link>
                </li>
                <li>
                  <Link to="/home" className="hover:underline">Contact</Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 font-semibold">Account</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>
                  <Link to="/login" className="hover:underline">Sign In</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:underline">Sign Up</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} Darween ERP. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

