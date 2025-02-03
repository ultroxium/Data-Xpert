import Link from 'next/link'
import { Github, Boxes } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-black border-t border-gray-300/20">
      <div className="container mx-auto p-4">
        <div className="flex flex-col md:flex-row justify-between items-center w-full">
          <div className="mb-4 md:mb-0 flex flex-col items-center md:items-start">
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 mb-2">
            <Boxes size={30} className='text-white/80'/>
            </Link>
            <p className="text-sm text-muted-foreground mt-1">
              Transforming data into insights
            </p>
          </div>

          <div className="flex space-x-6">
            <a href="https://github.com/ultroxium/Data-Xpert" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground bg-white/80 p-2 rounded-full">
              <Github size={16} className='text-black'/>
              <span className="sr-only">GitHub</span>
            </a>
            <a href="https://x.com/ultroxium" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground bg-white/80 p-2 rounded-full">
              <img src="/x.svg" alt="X" className='w-4 h-4'/>
              <span className="sr-only">Twitter</span>
            </a>
            <a href="https://instagram.com/ultroxium" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground bg-white/80 p-2 rounded-full">
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
