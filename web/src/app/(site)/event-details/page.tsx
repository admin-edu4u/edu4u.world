import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { CDN } from "@/lib/cdn";

export default function EventDetailsPage() {
  return (
    <div className="pb-20">
      <div className="blog-header">
        <div className="mw-1200 mx-auto">
          <div className="d-flex align-items-center">
            <Link href="/events">
              <ArrowLeft weight="light" size={24} color="black" className="me-10" />
            </Link>
            <span className="blog-header-title">Event Highlights</span>
          </div>
        </div>
      </div>
      <div className="mw-1200 mx-auto mt-10">
        <span className="blog-carousel-header d-block">How to do More with Less in 2023</span>
        <span className="blog-recommend-date d-block pt-3">01 May 2023</span>
        <div className="col-12 row mt-5">
          <div className="col-7 order-1 mt-5">
            <img className="col-12 br-8 event-details-img" src={`${CDN}/images/assets/blog-img.png`} alt="Event" />
          </div>
          <div className="col-5 order-2 mt-5">
            <img src={`${CDN}/images/assets/blog-img.png`} className="col-12 br-8 event-details-img" alt="Event" />
          </div>
          <div className="col-7 order-2 mt-5">
            <img className="col-12 br-8 event-details-img" src={`${CDN}/images/assets/blog-img.png`} alt="Event" />
          </div>
          <div className="col-5 order-1 mt-5">
            <img src={`${CDN}/images/assets/blog-img.png`} className="col-12 br-8 event-details-img" alt="Event" />
          </div>
        </div>
        <div className="mt-10">
          <span className="blog-details-desc">
            BNB Chain has successfully completed its 25th quarterly BNB burn. The burn includes the Auto-Burn as well as the Pioneer Burn Program.
            <br />
            Here are the facts and figures from the latest burn:
            <ul>
              <li>Auto-Burn (Total BNB burned): 2,139,182.98 BNB</li>
              <li>Approximate value in USD: ~$501,617,017</li>
              <li>Transaction ID (TXID) for BNB burn: View transaction</li>
              <li>BNB burned from the Pioneer Burn Program: 314.69 BNB</li>
              <li>Real Burn (Auto-Burn - Pioneer Burn): 2,138,868.29</li>
            </ul>

            <br /><br /><span className="blog-carousel-header">BNB What You Need to Know About the BNB</span><br />
            Burn BNB is the cryptocurrency that fuels the BNB Chain ecosystem. It acts as the native coin of the BNB Beacon Chain, the BNB Smart Chain, and the opBNB L2s and BNB Greenfield blockchain. It also serves as a governance token and allows holders to transact with projects built on those chains.

            When BNB was launched in 2017, a commitment was made to remove 100 million BNB (half of its total supply) from circulation through a burning process. This ultimately will keep only 100 million BNB in circulation. This commitment is automatically honored each quarter and calculated according to the Auto-Burn formula.

            The BNB Auto-Burn provides an independently auditable, objective process. The figures are reported quarterly, and the mechanism is independent of the Binance centralized exchange. On top of that, BNB Chain continues to burn a portion of BNB Chain&apos;s gas fees in real-time using the Real-Time-Burn mechanism. To learn more about the BNB Burn, refer to this Binance Academy article.

            <br /><br /><span className="blog-carousel-header">Pioneer Burn Program</span><br />
            The Pioneer Burn Program also permanently removes an amount of BNB from circulation equal to provable lost funds by eligible BNB Chain users. This number is then counted towards the total quarterly burn figure. More details can be found here.

            When it comes to the Pioneer Burn, BNB Auto-Burn, and Real-Time-Burn (BEP95) mechanisms, everything has stayed the same as in the 24th BNB burn. As always, these are transparent and independently verifiable.

            Since the introduction of BEP95, roughly 146,650 BNB has been burnt under this mechanism.
          </span>
        </div>
      </div>
    </div>
  );
}
