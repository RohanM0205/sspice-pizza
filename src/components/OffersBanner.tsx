import { useState } from "react";
import { Link } from "react-router-dom";
import { Copy, Check } from "lucide-react";

const OffersBanner = () => {
  const [copied, setCopied] = useState(false);

  const banner = {
    title: "🏏 Match Day Special",
    description:
      "India vs New Zealand — Grab your pizza before the first ball!",
    discount: "Flat ₹120 OFF",
    code: "INDWIN",
    minOrder: "Min order ₹499",
    image:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1600&q=80",
  };

  const copyCode = () => {
    navigator.clipboard.writeText(banner.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className="py-14">
      <div className="container mx-auto px-4">

        <div
          className="relative w-full h-[230px] md:h-[240px] rounded-2xl overflow-hidden group"
          style={{
            backgroundImage: `url(${banner.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />

          {/* Shine animation */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-700">
            <div className="absolute top-0 left-[-75%] w-[50%] h-full bg-white/10 rotate-12 blur-xl animate-[shine_2s_ease-in-out]" />
          </div>

          {/* Content Card */}
          <div className="relative z-10 h-full flex items-center">
            <div className="ml-8 md:ml-12 backdrop-blur-md bg-black/40 border border-white/10 p-6 rounded-xl max-w-md text-white shadow-lg">

              <h2 className="text-2xl font-bold mb-1">
                {banner.title}
              </h2>

              <p className="text-sm text-gray-200 mb-3">
                {banner.description}
              </p>

              <p className="text-lg font-semibold text-primary">
                {banner.discount}
              </p>

              {/* Coupon Row */}
              <div className="flex items-center gap-2 mt-2 mb-2">

                <span className="bg-white text-black px-3 py-1 rounded-md font-semibold text-sm">
                  {banner.code}
                </span>

                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
                >
                  {copied ? (
                    <>
                      <Check size={14} /> Copied
                    </>
                  ) : (
                    <>
                      <Copy size={14} /> Copy
                    </>
                  )}
                </button>

              </div>

              <p className="text-xs text-gray-300 mb-4">
                {banner.minOrder}
              </p>

              <Link
                to="/menu"
                className="inline-block bg-primary hover:bg-primary/90 transition px-5 py-2 rounded-lg font-semibold shadow-md hover:shadow-primary/30"
              >
                Order Now
              </Link>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default OffersBanner;