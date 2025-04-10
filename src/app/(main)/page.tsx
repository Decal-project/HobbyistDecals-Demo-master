import BrowsePanelComponent from "@/components/global/browse-panel";
import AdvertisementBannersComponent from "./_components/advertisement-banners";
import BestDealsComponent from "./_components/best-deals";
import UserBenefitsComponent from "@/components/global/user-benefits";
import DecalListCarousalComponent from "@/components/global/decals-list-carousal";
import { categoriesList, newArrivalsList, topPicksList } from "@/lib/constants";
import BlogsComponent from "./_components/blogs";
import YettoComponent from "./_components/yet-to";
import Link from "next/link";

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

      {/* New Arrivals */}
      <div className="w-full max-w-7xl bg-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">
            Discover Our Latest Hobbyist Decals – New Arrivals with Top-Quality Designs
          </h2>
          <Link href="/new-arrivals">
            <span className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
              VIEW MORE →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {newArrivalsList.slice(0, 6).map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2 flex flex-col items-center shadow-sm">
              <img src={item.img} alt={item.title} className="w-full h-auto rounded mb-2" />
              <p className="text-sm font-medium text-center">{item.title}</p>
              <p className="text-blue-600 font-bold mt-1">From $9.90</p>
              <button className="mt-2 text-sm text-gray-700 border-t border-gray-300 pt-2 hover:underline">
                SELECT OPTIONS
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Top Picks */}
      <div className="w-full max-w-7xl bg-white rounded-lg p-4 shadow-md">
        <div className="flex justify-between items-center mb-4 border-b pb-2">
          <h2 className="text-xl font-bold text-gray-800">
            Browse Our Featured Decals – Top Picks for Quality and Design
          </h2>
          <Link href="/new-arrivals">
            <span className="text-sm text-blue-600 font-semibold cursor-pointer hover:underline">
              VIEW MORE →
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {topPicksList.slice(0, 6).map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-2 flex flex-col items-center shadow-sm">
              <img src={item.img} alt={item.title} className="w-full h-auto rounded mb-2" />
              <p className="text-sm font-medium text-center">{item.title}</p>
              <p className="text-blue-600 font-bold mt-1">From $9.90</p>
              <button className="mt-2 text-sm text-gray-700 border-t border-gray-300 pt-2 hover:underline">
                SELECT OPTIONS
              </button>
            </div>
          ))}
        </div>
      </div>

      <YettoComponent />
      <BlogsComponent />
    </div>
  );
}
