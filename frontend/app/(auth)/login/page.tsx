'use client';
import { Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import Cookies from 'js-cookie';


const LoginPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            Cookies.set('token', token, { expires: 7 });
            router.push('/dashboard');
        } else {
            router.push('/');
        }
    }, [searchParams, router]);

    return <div className="w-screen h-screen flex items-center justify-center">
        <Suspense fallback={
            <Loader2 size={16} className="animate-spin" />
        }>
            <Loader2 size={16} className="animate-spin" />
        </Suspense>
    </div>
}

export default LoginPage;