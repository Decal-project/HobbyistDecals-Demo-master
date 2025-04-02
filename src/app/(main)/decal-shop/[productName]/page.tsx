import BrowsePanelComponent from "@/components/global/browse-panel";
import React from "react";
import ProductDetailsComponent from "./_components/product-details";
import UserBenefitsComponent from "@/components/global/user-benefits";
import { categoriesList, newArrivalsList, topPicksList } from "@/lib/constants";
import DecalListCarousalComponent from "@/components/global/decals-list-carousal";

const ProductPage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start p-3 bg-primary gap-3">
      <BrowsePanelComponent />
      <ProductDetailsComponent />
      <UserBenefitsComponent />
      <DecalListCarousalComponent
        title="explore our wide range of high-quality decal categories"
        list={categoriesList}
      />
      <DecalListCarousalComponent
        title="Discover Our Latest Hobbyist Decals – New Arrivals with Top-Quality Designs"
        list={newArrivalsList}
      />
      <DecalListCarousalComponent
        title="Browse Our Featured Decals – Top Picks for Quality and Design"
        list={topPicksList} 
      />
    </div>
  );
};

export default ProductPage;
