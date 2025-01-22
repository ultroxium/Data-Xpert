"use client"

import LoginDialog from './login-dialog'
import { useEffect, useState } from 'react'
import * as React from "react"
import Image from 'next/image'

export default function Hero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])


  return (
      <div className="relative w-full pt-48 pb-24 flex items-center justify-center px-4 overflow-hidden">
        {/* Animated background grid */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h1 className="text-slate-700 text-5xl md:text-6xl">
            Unlock the Power of Your Data
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-slate-600 sm:text-lg md:mt-5 md:text-xl">
            Analyze, visualize, train, and predict - all in one platform.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <LoginDialog title='Get started' isArrow={true} />
          </div>
        </div>


      </div>
  )
}

