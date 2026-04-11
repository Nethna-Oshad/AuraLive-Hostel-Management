import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminNavbar from './AdminNavbar';
import { 
  ChefHat, 
  Store, 
  ArrowRight, 
  Clock, 
  Users, 
  RefreshCw, 
  Loader2, 
  Package,
  AlertCircle,
  TrendingUp,
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';

const API = 'http://localhost:5000/api';

// Custom hook for count-up animation
const useCountUp = (targetValue, duration = 1000, shouldAnimate = true) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!shouldAnimate || targetValue === null || targetValue === undefined) {
      setCount(targetValue);
      return;
    }
    
    let startTime;
    let animationFrame;
    const startValue = 0;
    
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function: easeOutQuart
      const easeProgress = 1 - Math.pow(1 - progress, 4);
      const currentCount = Math.floor(startValue + (targetValue - startValue) * easeProgress);
      
      setCount(currentCount);
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [targetValue, duration, shouldAnimate]);
  
  return count;
};

const ManageMealsHub = () => {
  const [hubStats, setHubStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadStats = useCallback(async () => {
    setError(null);
    setIsRefreshing(true);
    setLoading(true);
    
    try {
      const res = await fetch(`${API}/meals/admin/hub-stats`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Unable to retrieve operational metrics');
      }
      const data = await res.json();
      setHubStats(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e.message || 'Failed to load statistics');
      setHubStats(null);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 300);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatLastUpdated = () => {
    if (!lastUpdated) return null;
    return lastUpdated.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getStatValue = (key, fallback = 0) => {
    if (!hubStats) return fallback;
    const value = hubStats[key];
    return typeof value === 'number' ? value : fallback;
  };

  const StatCard = ({ label, value, icon: Icon, loading: isLoading, accent, delay = 0 }) => {
    const animatedValue = useCountUp(value, 1200, !isLoading && mounted);
    
    return (
      <div 
        className={`
          relative overflow-hidden rounded-2xl border border-gray-200/60 
          bg-white/90 backdrop-blur-sm px-5 py-4 shadow-sm 
          transition-all duration-500 hover:shadow-lg hover:scale-[1.02]
          ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}
        style={{ transitionDelay: `${delay}ms` }}
      >
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-gray-50 to-transparent rounded-full blur-2xl -mr-10 -mt-10" />
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-2">
            <div className={`p-1.5 rounded-lg ${accent} transition-colors duration-300`}>
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
              {label}
            </span>
          </div>
          <div className="text-3xl font-bold tabular-nums tracking-tight text-gray-900 min-h-[2.5rem] flex items-center">
            {isLoading ? (
              <div className="h-8 w-16 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
            ) : (
              <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                {animatedValue.toLocaleString()}
              </span>
            )}
          </div>
          {!isLoading && value > 0 && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3 animate-pulse" />
              <span>Active</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const cards = [
    {
      to: '/admin/meals/kitchen',
      title: 'Kitchen Operations',
      subtitle: 'Slot Management',
      description: 'Configure preparation slots, manage kitchen capacity, and monitor real-time booking activity across all kitchen facilities.',
      icon: ChefHat,
      stats: [
        { 
          label: 'Active Slots', 
          statKey: 'activeSlots', 
          icon: Clock,
          accent: 'bg-emerald-50 text-emerald-700'
        },
        { 
          label: 'Today\'s Bookings', 
          statKey: 'todayKitchenBookings', 
          icon: Users,
          accent: 'bg-emerald-50 text-emerald-700'
        },
      ],
      theme: {
        gradient: 'from-emerald-50/95 via-white to-teal-50/60',
        border: 'border-emerald-200/80',
        iconBg: 'bg-gradient-to-br from-emerald-600 to-teal-700',
        accentColor: 'emerald',
        ringHover: 'group-hover:ring-4 group-hover:ring-emerald-100/60',
        buttonGradient: 'from-emerald-700 to-teal-800',
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        glowColor: 'emerald',
      },
      delay: 100,
    },
    {
      to: '/admin/meals/third-party',
      title: 'Partner Ecosystem',
      subtitle: 'Third-Party Management',
      description: 'Oversee supplier relationships, curate partner storefronts, coordinate menus, and track external order fulfillment across all integrated platforms.',
      icon: Store,
      stats: [
        { 
          label: 'Active Partners', 
          statKey: 'activePartners', 
          icon: Store,
          accent: 'bg-indigo-50 text-indigo-700'
        },
        { 
          label: 'Orders in Pipeline', 
          statKey: 'pendingExternalOrders', 
          icon: Package,
          accent: 'bg-indigo-50 text-indigo-700'
        },
      ],
      theme: {
        gradient: 'from-indigo-50/95 via-white to-blue-50/60',
        border: 'border-indigo-200/80',
        iconBg: 'bg-gradient-to-br from-indigo-600 to-blue-700',
        accentColor: 'indigo',
        ringHover: 'group-hover:ring-4 group-hover:ring-indigo-100/60',
        buttonGradient: 'from-indigo-700 to-blue-800',
        dot: 'bg-indigo-500',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        glowColor: 'indigo',
      },
      delay: 200,
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes glow {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite linear;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
        .animate-slide-in {
          animation: slideIn 0.6s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AdminNavbar />
        <main className="flex-1 overflow-y-auto">
          {/* Enterprise Header */}
          <div className={`
            relative border-b border-gray-200/60 bg-white/95 backdrop-blur-xl 
            supports-[backdrop-filter]:bg-white/80
            transition-all duration-700
            ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
          `}>
            <div className="absolute inset-0 bg-gradient-to-r from-[#2872A1]/[0.08] via-transparent to-indigo-500/[0.06] pointer-events-none" />
            
            {/* Animated background particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '0s' }} />
              <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-200/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
            </div>
            
            <div className="relative max-w-7xl mx-auto px-8 py-8">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#2872A1]/10 border border-[#2872A1]/20 backdrop-blur-sm">
                      <Sparkles className="h-3 w-3 text-[#2872A1] mr-1.5 animate-pulse" />
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#2872A1]">
                        Administration
                      </span>
                    </span>
                    {hubStats?.date && !loading && (
                      <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 animate-slide-in">
                        <Calendar className="h-3.5 w-3.5" />
                        <span className="font-mono font-medium">{hubStats.date}</span>
                      </span>
                    )}
                  </div>
                  
                  <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
                    <span className="inline-block animate-fade-in-up" style={{ animationDelay: '0ms' }}>Meal Management</span>
                    <span className="mx-3 text-2xl font-normal text-gray-400 inline-block animate-fade-in-up" style={{ animationDelay: '100ms' }}>|</span>
                    <span className="text-2xl font-normal text-gray-500 inline-block animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                      Command Center
                    </span>
                  </h1>
                  
                  <p className="text-gray-600 max-w-2xl text-base leading-relaxed animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    Centralized control for kitchen operations and third-party partner management. 
                    Monitor real-time metrics and access detailed operational dashboards.
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 shrink-0">
                  <div className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
                    <button
                      type="button"
                      onClick={loadStats}
                      disabled={loading}
                      className="group relative inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:bg-gray-50 hover:border-gray-400 hover:shadow-md hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2872A1]/0 via-[#2872A1]/10 to-[#2872A1]/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      {loading || isRefreshing ? (
                        <Loader2 className="h-4 w-4 animate-spin text-[#2872A1]" />
                      ) : (
                        <RefreshCw className={`h-4 w-4 text-[#2872A1] transition-transform duration-500 ${isRefreshing ? 'rotate-180' : 'group-hover:rotate-180'}`} />
                      )}
                      <span>Refresh Metrics</span>
                    </button>
                    
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </div>
                      <span className="text-xs font-semibold text-gray-700">Live Data</span>
                      {lastUpdated && (
                        <span className="text-[10px] text-gray-400 ml-1 transition-opacity duration-300">
                          Updated {formatLastUpdated()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50/90 backdrop-blur-sm px-4 py-3.5 animate-fade-in-up">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-800">Unable to load operational metrics</p>
                      <p className="text-xs text-red-700 mt-0.5">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="px-8 py-10">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
                {cards.map(({ to, title, subtitle, description, icon: Icon, stats, theme, delay }) => (
                  <Link 
                    key={to} 
                    to={to} 
                    className={`
                      group relative block rounded-3xl ${theme.ringHover} 
                      transition-all duration-700
                      ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                    `}
                    style={{ transitionDelay: `${delay}ms` }}
                  >
                    {/* Glow effect on hover */}
                    <div className={`
                      absolute -inset-1 bg-gradient-to-r from-${theme.glowColor}-400 to-${theme.glowColor}-600 
                      rounded-3xl blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500
                    `} />
                    
                    <div className={`
                      relative h-full overflow-hidden rounded-3xl border-2 ${theme.border}
                      bg-gradient-to-br ${theme.gradient} backdrop-blur-sm
                      shadow-lg shadow-gray-200/50 p-8
                      transition-all duration-500 
                      group-hover:shadow-2xl group-hover:shadow-${theme.accentColor}-100/40
                      group-hover:border-${theme.accentColor}-300/80
                      group-hover:-translate-y-1
                    `}>
                      {/* Animated gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {/* Decorative Elements */}
                      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" style={{ animationDuration: '4s' }} />
                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-black/[0.02] to-transparent rounded-full blur-2xl -ml-24 -mb-24" />

                      <div className="relative flex flex-col gap-6">
                        {/* Card Header */}
                        <div className="flex gap-5">
                          <div className={`
                            flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl 
                            ${theme.iconBg} text-white shadow-xl 
                            transition-all duration-500 
                            group-hover:shadow-2xl group-hover:scale-110 group-hover:rotate-3
                          `}>
                            <Icon className="h-8 w-8 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.75} />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`h-2 w-2 rounded-full ${theme.dot} animate-pulse`} />
                              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
                                {subtitle}
                              </span>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 leading-tight transition-colors duration-300 group-hover:text-gray-800">
                              {title}
                            </h2>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 leading-relaxed pl-2 border-l-2 border-gray-200/60 transition-all duration-300 group-hover:border-gray-300 group-hover:pl-3">
                          {description}
                        </p>

                        {/* Statistics Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {stats.map(({ label, statKey, icon: StatIcon, accent }, index) => (
                            <StatCard
                              key={statKey}
                              label={label}
                              value={getStatValue(statKey)}
                              icon={StatIcon}
                              loading={loading}
                              accent={accent}
                              delay={delay + (index * 50)}
                            />
                          ))}
                        </div>

                        {/* Action Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200/60 transition-colors duration-300 group-hover:border-gray-300">
                          <div className="relative">
                            <span className={`
                              inline-flex items-center gap-2 text-sm font-semibold 
                              bg-gradient-to-r ${theme.buttonGradient} bg-clip-text text-transparent
                              transition-all duration-300 group-hover:gap-3
                            `}>
                              Access Dashboard
                              <ArrowRight className={`
                                h-4 w-4 text-${theme.accentColor}-600 
                                transition-all duration-300 
                                group-hover:translate-x-2 group-hover:scale-110
                              `} />
                            </span>
                          </div>
                          
                          <span className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full 
                            text-[10px] font-semibold uppercase tracking-wider 
                            ${theme.badge} transition-all duration-300
                            group-hover:scale-105 group-hover:shadow-sm
                          `}>
                            <Zap className="h-3 w-3" />
                            Click to Manage
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Enterprise Footer Note */}
              <div className={`
                mt-10 text-center transition-all duration-700 delay-500
                ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
              `}>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100/60 backdrop-blur-sm border border-gray-200/60 hover:bg-gray-100/80 transition-colors duration-300">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </div>
                  <span className="text-xs text-gray-500">
                    Metrics reflect real-time operational data across all integrated kitchen facilities and partner networks
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ManageMealsHub;