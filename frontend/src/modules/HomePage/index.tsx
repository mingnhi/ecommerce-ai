import { CategorySection } from "./components/CategorySection";
import { CtaSection } from "./components/CtaSection";
import { DailyBestSection } from "./components/DailyBestSection";
import { DealSection } from "./components/DealSection";
import { PopularProductSection } from "./components/PopularProductSection";
import { ProductListsSection } from "./components/ProductListsSection";
import { SlideSection } from "./components/SlideSection";

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-10 px-4 py-8 md:space-y-12 md:px-6 md:p-8">
      <SlideSection />
      <CategorySection />
      <PopularProductSection />
      <DailyBestSection />
      <DealSection />
      <ProductListsSection />
      <CtaSection />
    </div>
  );
}
