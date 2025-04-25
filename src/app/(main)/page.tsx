import BrowsePanelComponent from "@/components/global/browse-panel";
import AdvertisementBannersComponent from "./_components/advertisement-banners";
import BestDealsComponent from "./_components/best-deals";
import UserBenefitsComponent from "@/components/global/user-benefits";
import DecalListCarousalComponent from "@/components/global/decals-list-carousal";
import { categoriesList, topPicksList } from "@/lib/constants";
import BlogsComponent from "./_components/blogs";
import YettoComponent from "./_components/yet-to";
import NewArrivalsSection from "./_components/new-arrivals"; 
import TopPicksComponent from "./_components/top-picks";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-3 bg-primary gap-3">
      <BrowsePanelComponent />
      <AdvertisementBannersComponent />
      <UserBenefitsComponent />

      <DecalListCarousalComponent
        title="explore our wide range of high-quality decal categories"
        list={categoriesList}
      />

      <BestDealsComponent />

      <NewArrivalsSection />

      <TopPicksComponent />

      <YettoComponent />
      <BlogsComponent />
    </div>
  );
}
