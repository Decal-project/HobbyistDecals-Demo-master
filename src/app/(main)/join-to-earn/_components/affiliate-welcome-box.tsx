export default function AffiliateWelcomeBox() {
    return (
      <div className="w-full bg-[#16689A] text-white py-12 px-4 rounded-2xl">
        <h1 className="text-3xl md:text-3xl font-bold text-center text-black mb-4">
          Welcome to the Hobbyist Decals Affiliate Program!
        </h1>
        <p className="text-center text-white text-base md:text-lg max-w-3xl mx-auto mb-4">
          Partner with us and earn a generous 15% commission on every sale you refer. Our program is perfect for hobby enthusiasts, bloggers, influencers, and anyone passionate about scale models and decals.
        </p>
        <p className="text-center text-white text-2xl font-semibold mb-6">
          If you have any questions or need further assistance,<br className="hidden md:block" />
          please fill out the form below:
        </p>
        <div className="flex justify-center">
          <button className="bg-orange-600 hover:bg-black text-white font-semibold px-6 py-2 rounded-full transition">
            Register Here
          </button>
        </div>
      </div>
    );
  }
  