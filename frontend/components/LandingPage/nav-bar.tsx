import Link from 'next/link'
import { Github } from 'lucide-react'
import { Button } from "@/components/ui/button"
import LoginDialog from './login-dialog'

export default function Navbar() {
  return (
    <nav className="border-b bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
            <img src="/logo.png" alt="Logo" className='w-24 h-10 object-contain'/>
            </Link>
          </div>
          <div >
            <div className="ml-10 flex items-baseline space-x-4">
              
              <Link href="/readme" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hidden md:block">
                Readme
              </Link>
              <LoginDialog title='Sign in'/>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

