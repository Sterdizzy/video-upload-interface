import VideoUpload from '@/components/VideoUpload';

export default function AppPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 sm:p-8 md:p-12 lg:p-24">
      <div className="w-full max-w-2xl">
        <VideoUpload />
      </div>
    </main>
  );
}
