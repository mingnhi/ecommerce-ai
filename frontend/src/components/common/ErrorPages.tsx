import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, Home, ShieldAlert } from 'lucide-react';

type ErrorPageProps = {
    title: string;
    description: string;
    icon: React.ReactNode;
    iconColor?: string;
    iconBg?: string;
    primaryButtonColor?: string;
};

function ErrorPageContent({ 
    title, 
    description, 
    icon, 
    iconColor = 'text-sky-600',
    iconBg = 'bg-sky-50',
    primaryButtonColor = 'bg-sky-600 hover:bg-sky-700 hover:cursor-pointer' 
}: ErrorPageProps) {
    return (
        <section className="bg-white dark:bg-gray-900">
            <div className="container flex items-center min-h-screen px-6 py-12 mx-auto">
                <div className="flex flex-col items-center max-w-sm mx-auto text-center">
                    <div className={`p-3 text-sm font-medium ${iconColor} rounded-full ${iconBg} dark:bg-gray-800`}>
                        {icon}
                    </div>
                    <h1 className="mt-3 text-2xl font-semibold text-gray-800 dark:text-white md:text-3xl">
                        {title}
                    </h1>
                    <p className="mt-4 text-gray-500 dark:text-gray-400">
                        {description}
                    </p>

                    <div className="flex items-center w-full mt-6 gap-x-3 shrink-0 sm:w-auto">
                        <Button
                            asChild
                            variant="outline"
                            className="flex items-center justify-center w-1/2 sm:w-auto gap-x-2"
                        >
                            <Link href="/">
                                <ArrowLeft className="w-5 h-5" />
                                <span>Quay lại</span>
                            </Link>
                        </Button>

                        <Button
                            asChild
                            className={`w-1/2 px-5 py-2 text-sm tracking-wide text-white transition-colors duration-200 ${primaryButtonColor} rounded-lg shrink-0 sm:w-auto`}
                        >
                            <Link href="/">
                                <Home className="w-4 h-4 mr-2" />
                                Trang chủ
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export function Page404() {
    return (
        <ErrorPageContent
            title="Trang không tìm thấy"
            description="Trang bạn đang tìm kiếm không tồn tại. Dưới đây là một số liên kết hữu ích:"
            icon={<AlertCircle className="w-6 h-6" />}
        />
    );
}

export function Page403() {
    return (
        <ErrorPageContent
            title="Quyền truy cập bị từ chối"
            description="Bạn không có quyền truy cập trang này."
            icon={<ShieldAlert className="w-6 h-6" />}
            iconColor="text-red-500"
            iconBg="bg-red-50"
            primaryButtonColor="bg-red-500 hover:bg-red-600"
        />
    );
}

