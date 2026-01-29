import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { Link } from "react-router-dom";

const Hero = () => {
  const bgImage = [
    {
      id: 1,
      src: "/anthony-a-C4YziHltnmg-unsplash.jpg",
      alt: "CALIFORNIA",
      subtitle: "Explore the golden coast and vibrant cities.",
      places: ["/luis-van-den-bos-iK3vaxuLZ8k-unsplash.jpg"],
      name: "Yosemite Valley",
    },
    {
      id: 2,
      src: "/shalender-kumar-XjKaPInYVCM-unsplash.jpg",
      alt: "INDIA",
      subtitle: "A land of rich culture and colorful traditions.",
      places: ["/subham-sharma-CQA3UyoNbeg-unsplash.jpg"],
      name: "Connaught Place",
    },
    {
      id: 3,
      src: "/david-rodrigo-Fr6zexbmjmc-unsplash.jpg",
      alt: "DUBAI",
      subtitle: "Where luxury meets the desert skyline.",
      places: ["/soran-ali-rJ9VlBsmidE-unsplash.jpg"],
      name: "Burj Khalifa",
    },
    {
      id: 4,
      src: "/david-monaghan-J-wEJwSiAbQ-unsplash.jpg",
      alt: "ENGLAND",
      subtitle: "Historic charm and modern elegance blend here.",
      places: ["/howard-senton-Vl3dgvjP1-w-unsplash.jpg"],
      name: "Leeds City Centre",
    },
    {
      id: 5,
      src: "/patrick-robert-doyle-eb8dmXNOGP4-unsplash.jpg",
      alt: "SWITZERLAND",
      subtitle: "Snowy peaks and serene alpine beauty.",
      places: ["/xavier-von-erlach-WJqq73sTb_8-unsplash.jpg"],
      name: "Kapellbrücke",
    },
  ];

  const imageRefs = useRef([]);
  const textRefs = useRef([]);
  const subtitleRefs = useRef([]);
  const placeRefs = useRef([]);

  useEffect(() => {
    const tl = gsap.timeline({ repeat: -1 });

    // Initial setup
    gsap.set(imageRefs.current, { autoAlpha: 0 });
    gsap.set(textRefs.current, { autoAlpha: 0, yPercent: 100 });
    gsap.set(subtitleRefs.current, { autoAlpha: 0, yPercent: 100 });
    gsap.set(placeRefs.current, { autoAlpha: 0, scale: 0.9 });

    // Show first slide
    if (imageRefs.current[0]) {
      tl.to(imageRefs.current[0], {
        autoAlpha: 1,
        duration: 1.2,
        ease: "power2.inOut",
      });

      tl.to(
        [textRefs.current[0], subtitleRefs.current[0]],
        {
          autoAlpha: 1,
          yPercent: 0,
          duration: 1,
          ease: "power2.out",
          stagger: 0.15,
        },
        "-=0.8"
      );

      tl.to(
        placeRefs.current[0],
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );
    }

    bgImage.forEach((_, i) => {
      const nextIndex = (i + 1) % bgImage.length;

      tl.to({}, { duration: 3 });

      tl.to([textRefs.current[i], subtitleRefs.current[i]], {
        yPercent: -100,
        autoAlpha: 0,
        duration: 0.8,
        ease: "power2.in",
        stagger: 0.05,
      });

      tl.to(
        placeRefs.current[i],
        {
          autoAlpha: 0,
          scale: 0.9,
          duration: 0.6,
          ease: "power2.in",
        },
        "-=0.6"
      );

      tl.to(
        imageRefs.current[i],
        {
          autoAlpha: 0,
          duration: 1.2,
          ease: "power2.inOut",
        },
        "-=0.4"
      );

      tl.to(
        imageRefs.current[nextIndex],
        {
          autoAlpha: 1,
          duration: 1.2,
          ease: "power2.inOut",
        },
        "-=1.2"
      );

      tl.fromTo(
        [textRefs.current[nextIndex], subtitleRefs.current[nextIndex]],
        { yPercent: 100, autoAlpha: 0 },
        {
          yPercent: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "power2.out",
          stagger: 0.15,
        },
        "-=0.8"
      );

      tl.fromTo(
        placeRefs.current[nextIndex],
        { autoAlpha: 0, scale: 0.9 },
        {
          autoAlpha: 1,
          scale: 1,
          duration: 0.8,
          ease: "back.out(1.7)",
        },
        "-=0.5"
      );
    });

    return () => tl.kill();
  }, [bgImage.length]);

  return (
    <div className="h-screen w-screen relative overflow-hidden font-sans">

      <nav className="absolute top-0 left-0 w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center justify-between text-white z-50 bg-transparent">
        <div className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight">
          Tripify
        </div>

        <div className="hidden md:flex justify-center w-[300px] lg:w-[420px] gap-4 lg:gap-18 text-sm lg:text-base font-medium backdrop-blur-md bg-white/10 px-4 lg:px-8 py-2 lg:py-3 rounded-[20px] shadow-lg border border-white/20">
          <Link
            to="/"
            className="hover:text-blue-200 transition-colors duration-200 whitespace-nowrap"
          >
            Home
          </Link>
          <Link
            to="/my-trips"
            className="hover:text-blue-200 transition-colors duration-200 whitespace-nowrap"
          >
            My Trips
          </Link>
          <Link
            to="/createTrip"
            className="hover:text-blue-200 transition-colors duration-200 whitespace-nowrap"
          >
            Create Trip
          </Link>
        </div>


        <div className="md:hidden">
          <button className="text-white p-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>


        <button className="hidden md:block border border-white/60 px-4 lg:px-6 py-1.5 lg:py-2 rounded-lg hover:bg-white hover:text-black transition-all duration-200 font-medium backdrop-blur-sm bg-white/5 text-sm lg:text-base">
          Sign In
        </button>
      </nav>


      {bgImage.map((item, index) => (
        <div
          key={item.id}
          ref={(el) => (imageRefs.current[index] = el)}
          className="absolute top-0 left-0 w-full h-full opacity-0"
        >
          <img
            className="w-full h-full object-cover brightness-[0.45]"
            src={item.src}
            alt={item.alt}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10"></div>
        </div>
      ))}


      {bgImage.map((item, index) => (
        <div
          key={`text-${item.id}`}
          className="absolute left-4 sm:left-8 lg:left-[80px] top-[200px] sm:top-[240px] lg:top-[280px] text-white opacity-0 max-w-[calc(100%-2rem)] sm:max-w-[calc(100%-4rem)] lg:max-w-2xl"
          ref={(el) => (textRefs.current[index] = el)}
        >
          <h1 className="font-bold tracking-[0.02em] text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl 3xl:text-8xl leading-tight break-words">
            {item.alt}
          </h1>
          <p
            ref={(el) => (subtitleRefs.current[index] = el)}
            className="mt-3 sm:mt-4 lg:mt-6 ml-0 sm:ml-[5px] lg:ml-[10px] text-sm sm:text-base lg:text-lg xl:text-xl max-w-xs sm:max-w-sm lg:max-w-xl leading-relaxed text-white/90 font-light tracking-wide"
          >
            {item.subtitle}
          </p>
        </div>
      ))}

      {bgImage.map((item, index) => (
        <div
          key={`place-${item.id}`}
          ref={(el) => (placeRefs.current[index] = el)}
          className="absolute right-[60px] xl:right-[130px] top-[160px] xl:top-[200px] w-[300px] xl:w-[500px] h-[200px] xl:h-[320px] rounded-2xl overflow-hidden shadow-2xl hidden xl:block border border-white/10 opacity-0"
        >
          <img
            src={item.places[0]}
            alt="place"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-3 xl:bottom-4 left-3 xl:left-4 right-3 xl:right-4">
            <div className="bg-white/10 backdrop-blur-md px-3 xl:px-4 py-1.5 xl:py-2 rounded-lg border border-white/20">
              <p className="text-xs xl:text-sm font-medium text-white/90">
                {item.alt}
              </p>
              <p className="text-xs text-white/70 mt-0.5 xl:mt-1">
                {item.name}
              </p>
            </div>
          </div>
        </div>
      ))}


      <Link to="createTrip">
        <button className="absolute text-sm sm:text-base left-4 sm:left-8 lg:left-[80px] top-[350px] sm:top-[400px] lg:top-[500px] px-6 sm:px-8 py-2.5 sm:py-3 bg-violet-700 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg backdrop-blur-sm border border-blue-500/30 tracking-wide">
          Explore Destinations
        </button>
      </Link>


      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <div className="flex justify-around text-white text-sm">
            <Link
              to="/"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Home
            </Link>
            <Link
              to="/my-trips"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              My Trips
            </Link>
            <Link
              to="/createTrip"
              className="hover:text-blue-200 transition-colors duration-200"
            >
              Create Trip
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
