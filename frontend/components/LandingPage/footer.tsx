import Link from 'next/link'
import { Github, Twitter, Linkedin } from 'lucide-react'
import Logo from '../logo'

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start">
            <Link href="/" className="text-2xl font-bold">
              <img src="/logo.png" alt="Logo" className='w-24 h-10 object-contain'/>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              Transforming data into insights
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="https://github.com/ultroxium/Data-Xpert" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <Github size={16} />
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://x.com/ultroxium" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <img src="/x.svg" alt="X" className='w-4 h-4'/>
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://instagram.com/ultroxium" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              <img src="/instagram.svg" alt="Instagram" className='w-4 h-4'/>
              <span className="sr-only">Twitter</span>
            </a>
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground text-center md:text-start">
          © {new Date().getFullYear()} DataXpert. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
