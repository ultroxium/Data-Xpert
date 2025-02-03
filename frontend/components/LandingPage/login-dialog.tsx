'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { Github, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function LoginDialog({ title = 'Sign in', isArrow=false }: { title: string, isArrow?:boolean }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleAuth = (provider: 'google' | 'github') => {
    router.push(`${process.env.NEXT_PUBLIC_API_URL}/auth/${provider}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="rounded-full text-lg font-semibold px-6 py-2 transition-all duration-300 hover:scale-105 border border-white/20">
          {title} {isArrow && <ArrowRight size={16}/>}
        </Button>
      </DialogTrigger>
      <AnimatePresence>
        {isOpen && (
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-transparent border-none shadow-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-8 shadow-xl dark:bg-gray-800 bg-white">
                <CardHeader className="space-y-1 text-center">
                  <CardTitle className="text-3xl font-bold tracking-tight">Welcome to DataXpert</CardTitle>
                  <CardDescription className="text-base">
                    Choose your preferred sign-in method
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 p-6">
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-6 text-base font-medium transition-colors"
                      onClick={() => handleAuth('google')}
                    >
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_13183_10121)">
                          <path d="M20.3081 10.2303C20.3081 9.55056 20.253 8.86711 20.1354 8.19836H10.7031V12.0492H16.1046C15.8804 13.2911 15.1602 14.3898 14.1057 15.0879V17.5866H17.3282C19.2205 15.8449 20.3081 13.2728 20.3081 10.2303Z" fill="#4285F4" />
                          <path d="M10.7019 20.0006C13.3989 20.0006 15.6734 19.1151 17.3306 17.5865L14.1081 15.0879C13.2115 15.6979 12.0541 16.0433 10.7056 16.0433C8.09669 16.0433 5.88468 14.2832 5.091 11.9169H1.76562V14.4927C3.46322 17.8695 6.92087 20.0006 10.7019 20.0006V20.0006Z" fill="#34A853" />
                          <path d="M5.08857 11.9169C4.66969 10.6749 4.66969 9.33008 5.08857 8.08811V5.51233H1.76688C0.348541 8.33798 0.348541 11.667 1.76688 14.4927L5.08857 11.9169V11.9169Z" fill="#FBBC04" />
                          <path d="M10.7019 3.95805C12.1276 3.936 13.5055 4.47247 14.538 5.45722L17.393 2.60218C15.5852 0.904587 13.1858 -0.0287217 10.7019 0.000673888C6.92087 0.000673888 3.46322 2.13185 1.76562 5.51234L5.08732 8.08813C5.87733 5.71811 8.09302 3.95805 10.7019 3.95805V3.95805Z" fill="#EA4335" />
                        </g>
                        <defs>
                          <clipPath id="clip0_13183_10121">
                            <rect width="20" height="20" fill="white" transform="translate(0.5)" />
                          </clipPath>
                        </defs>
                      </svg>
                      Sign in with Google
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full py-6 text-base font-medium transition-colors"
                      onClick={() => handleAuth('github')}
                    >
                      <Github className="mr-2 h-5 w-5" />
                      Sign in with GitHub
                    </Button>
                  </motion.div>
                  <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    By signing in, you agree to our{' '}
                    <a href="#" className="underline hover:text-primary">Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" className="underline hover:text-primary">Privacy Policy</a>.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </DialogContent>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

