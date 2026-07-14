import React from 'react'

export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse p-4 md:p-0">
      {/* Page header skeleton */}
      <div className="space-y-3">
        <div className="h-4 w-48 bg-slate-800 rounded-full"></div>
        <div className="h-10 w-3/4 max-w-md bg-slate-800 rounded-lg"></div>
        <div className="h-4 w-32 bg-slate-800 rounded-full"></div>
      </div>

      {/* Stat row skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6 bg-slate-900/40">
            <div className="h-3 w-24 bg-slate-800 rounded-full mb-4"></div>
            <div className="h-8 w-16 bg-slate-800 rounded-lg"></div>
            <div className="h-3 w-20 bg-slate-800 rounded-full mt-3"></div>
          </div>
        ))}
      </div>

      {/* Main grid skeleton */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Missing submissions skeleton */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-slate-800 rounded-full"></div>
            <div className="h-4 w-24 bg-slate-800 rounded-full"></div>
          </div>
          <div className="h-32 bg-slate-900/40 border border-slate-800/50 rounded-2xl"></div>
        </div>

        {/* Team standings skeleton */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="h-5 w-32 bg-slate-800 rounded-full"></div>
            <div className="h-4 w-20 bg-slate-800 rounded-full"></div>
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-slate-900/40 border border-slate-800/50 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
