'use client';

import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';
import Link from 'next/link';
import { LogIn } from 'lucide-react';


interface LoginRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message?: string;
}

export function LoginRequiredDialog({
  open,
  onOpenChange,
  message = 'Bạn cần đăng nhập để tiếp tục',
}: LoginRequiredDialogProps) {
  const router = useRouter();

  const handleLogin = () => {
    onOpenChange(false);
    router.push(ROUTES.LOGIN);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] border border-slate-200/80 p-0 overflow-hidden rounded-2xl shadow-xl">
        <div className="bg-slate-50 px-6 pt-6">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center mb-4">
            <LogIn className="w-6 h-6 text-sky-600" />
          </div>
          <DialogTitle className="text-lg font-semibold text-slate-800">
            Yêu cầu đăng nhập
          </DialogTitle>
          <DialogDescription className="sr-only">{message}</DialogDescription>
        </div>
        <div className="px-6 pb-6 ">
          <p className="text-slate-600 text-sm leading-relaxed mb-6">
            {message}
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleLogin}
              size="lg"
              className="w-full rounded-xl font-medium"
            >
              Đăng nhập
            </Button>
            <p className="text-center text-sm text-slate-500">
              Chưa có tài khoản?{' '}
              <Link
                href={ROUTES.REGISTER}
                className="text-sky-600 font-medium hover:underline hover:cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
