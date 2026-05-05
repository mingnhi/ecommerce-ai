export default function HomePageSkeleton() {
  return (
    <section className="min-h-[calc(100vh-66px)] w-full flex flex-col items-center justify-center px-4 py-16 animate-pulse">
      <div className="h-12 w-64 rounded-lg bg-gray-200" />
      <div className="mt-4 h-6 w-96 max-w-full rounded bg-gray-100" />
      <div className="mt-10 flex gap-4">
        <div className="h-11 w-36 rounded-full bg-gray-200" />
        <div className="h-11 w-36 rounded-full bg-gray-100" />
      </div>
    </section>
  );
}
