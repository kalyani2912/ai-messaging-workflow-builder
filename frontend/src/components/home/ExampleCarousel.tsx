
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";

const examples = [
  {
    title: "Appointment Reminders",
    description: "Reduce no-shows by 35% with automated reminder sequences. Includes pre-appointment instructions and easy rescheduling options.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Abandoned Cart Recovery",
    description: "Recover lost sales with perfectly timed follow-ups. Gentle reminders with product images drive 25% recovery rate.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Event Promo Drip",
    description: "Build anticipation with timed event announcements. From save-the-date to post-event surveys, keep attendees engaged.",
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
  },
];

const ExampleCarousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((current) => (current === examples.length - 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? examples.length - 1 : current - 1));
  };

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Example Campaigns</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get inspired by these popular workflows our users are creating with just a few minutes of chat.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="overflow-hidden rounded-xl shadow-lg">
            <div className="relative grid grid-cols-1 md:grid-cols-2 bg-white">
              <div className="p-6 md:p-10 flex flex-col justify-center">
                <h3 className="text-2xl font-semibold mb-4">{examples[activeIndex].title}</h3>
                <p className="text-gray-600 mb-8">{examples[activeIndex].description}</p>
                <Button asChild className="self-start">
                  <a href="/create-workflow">Create Similar</a>
                </Button>
              </div>
              <div className="h-64 md:h-auto">
                <img
                  src={examples[activeIndex].image}
                  alt={examples[activeIndex].title}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 gap-3">
            {examples.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`h-3 w-3 rounded-full transition-colors ${
                  activeIndex === index ? "bg-brand-blue" : "bg-gray-300"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              ></button>
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 md:-translate-x-6 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6 text-gray-700" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 md:translate-x-6 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6 text-gray-700" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ExampleCarousel;
