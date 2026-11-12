import Link from "next/link";
import { CDN } from "@/lib/cdn";

const PLACEHOLDER_EVENTS = [
  { title: "How to do More with Less in 2023", desc: "Before you make choices, you need to know yourself in order to tailor the best education plan for your capabilities and aspirations.", date: "01 May 2023" },
  { title: "How to do More with Less in 2023", desc: "Before you make choices, you need to know yourself in order to tailor the best education plan for your capabilities and aspirations.", date: "01 May 2023" },
  { title: "How to do More with Less in 2023", desc: "Before you make choices, you need to know yourself in order to tailor the best education plan for your capabilities and aspirations.", date: "01 May 2023" },
  { title: "How to do More with Less in 2023", desc: "Before you make choices, you need to know yourself in order to tailor the best education plan for your capabilities and aspirations.", date: "01 May 2023" },
];

export default function EventsPage() {
  return (
    <div className="pb-20">
      <div className="position-relative">
        <img src={`${CDN}/images/assets/event-background.png`} className="w-100" alt="Events background" width={5760} height={1840} />
        <div className="mw-1200 text-center event-overlay-text position-absolute">
          <span className="d-block event-title-1">Events</span>
          <span className="d-block event-title-2 pt-5">Event Highlights</span>
          <span className="d-block event-title-3 pt-5">Discover what we do online and offline to help improve the education market</span>
        </div>
      </div>
      <div className="mw-1200 mt-10 mx-auto">
        <div className="row">
          {PLACEHOLDER_EVENTS.map((evt, i) => (
            <div key={i} className="col-12 col-sm-6 col-lg-4 mt-15">
              <Link href="/event-details" className="cursor">
                <img className="w-100 br-8" src={`${CDN}/images/assets/blog-img.png`} alt={evt.title} />
                <div>
                  <span className="blog-recommend-title d-block pt-5">{evt.title}</span>
                  <span className="blog-recommend-desc d-block pt-3">{evt.desc}</span>
                  <span className="blog-recommend-date d-block pt-3">{evt.date}</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
