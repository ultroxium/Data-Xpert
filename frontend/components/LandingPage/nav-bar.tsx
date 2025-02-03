import Link from 'next/link'
import { MoveRight, Boxes } from 'lucide-react'
import LoginDialog from './login-dialog'

export default function Navbar() {
  return (
    <nav className="border-b border-gray-300/20 bg-black w-full fixed top-0 z-50">
      <div className="container mx-auto px-4 ">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-2">
            <Boxes size={30} className='text-white/80'/> <MoveRight size={24} className='text-white/50'/> <span className='text-white/80 text-xl hidden md:block'>DataXpert</span>
            </Link>
          </div>
          <div >
            <div className="ml-10 flex items-baseline space-x-4">
{/*               
              <Link href="/readme" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium hidden md:block">
                Readme
              </Link> */}
              <LoginDialog title='Sign in'/>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

