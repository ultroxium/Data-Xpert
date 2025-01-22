'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useWebSocket } from '@/providers/socket-provider';
import useAuthStore from '@/store/auth';
import Cookies from 'js-cookie';
import { AlertTriangle, Loader2, LogOut } from 'lucide-react';
import { useState } from 'react';


export default function SecurityPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const { closeSocket } = useWebSocket();

  const { deleteAccount, isAccountDeleting, isAccountDeleted }: any = useAuthStore();

  const handleDeleteAccount = async() => {
    const success = await deleteAccount(confirmation);
    if(success) {
      closeSocket();
      localStorage.clear();
      Cookies.remove('token');
      setIsOpen(false);
      setConfirmation('');
      window.location.href = `${process.env.NEXT_PUBLIC_FRONTEND_URL}`;
    }
  };

  return (
    <>
      <h3 className="text-lg font-medium">Account</h3>
      <p className="text-sm text-muted-foreground">
        Manage your account settings
      </p>
      <Separator className="my-4" />

      <Card className="bg-destructive/10 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible and destructive actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between md:items-center xxs:flex-col md:flex-row gap-4">
            <div>
              <h3 className="font-semibold">Delete account</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] rounded-lg">
                <DialogHeader>
                  <DialogTitle className="text-start">Delete Account</DialogTitle>
                  <DialogDescription className="text-start">
                    This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid items-start gap-4">
                    <Label htmlFor="confirmation" className="text-left">
                      Type <span className='font-semibold'>{"'DELETE/ACCOUNT'"}</span> to confirm
                    </Label>
                    <Input
                      id="confirmation"
                      type="text"
                      className="col-span-3"
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" variant="destructive" onClick={handleDeleteAccount}>
                    {isAccountDeleting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Please wait ...
                      </div>
                    ) : (
                      'Delete Account'
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
