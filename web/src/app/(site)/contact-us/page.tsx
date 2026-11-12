"use client";

import { CDN } from "@/lib/cdn";
import { ContactForm } from "@/components/ContactForm";
import { useT } from "@/components/LocaleProvider";

export default function ContactUsPage() {
  const t = useT();

  return (
    <div className="pb-20">
      <style>{`
        @media screen and (max-width: 767px) {
          img.w-100 { height: 320px; object-fit: cover; }
          .event-title-2, .event-title-3 { width: 340px; max-width: calc(100vw - 40px); margin: 0 auto; }
          .mobile-font-size { font-size: 14px; }
        }
      `}</style>

      <div className="position-relative">
        <img src={`${CDN}/images/assets/event-background.png`} className="w-100" alt={t("contactUs")} />
        <div className="mw-1200 text-center event-overlay-text position-absolute">
          <span className="d-block event-title-1">{t("contactUs")}</span>
          <span className="d-block event-title-2 pt-5">{t("getInTouch")}</span>
          <span className="d-block event-title-3 pt-5">{t("askUs")}</span>
        </div>
      </div>

      <div className="mw-1200 mx-auto px-5 px-lg-0">
        <div className="row mt-20 g-4 g-lg-5 align-items-start">
          <ContactForm />

          <div className="col-12 col-lg-6 ps-lg-4">
            <div className="w-100">
              <a href="https://wa.me/60184659867" className="d-block text-decoration-none">
                <div className="d-flex align-items-center btn-whatsapp w-100">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <g clipPath="url(#clip0_whatsapp)">
                        <path d="M0.510625 12.3564C0.510062 14.3728 1.04106 16.3418 2.05075 18.0772L0.414062 24.0067L6.52956 22.4156C8.22103 23.3293 10.1162 23.8081 12.0421 23.8082H12.0471C18.4048 23.8082 23.5801 18.6749 23.5828 12.3654C23.584 9.308 22.3851 6.43302 20.2069 4.27005C18.0291 2.10725 15.1327 0.915534 12.0467 0.914139C5.68825 0.914139 0.513344 6.04716 0.510719 12.3564" fill="url(#paint0_wa)" />
                        <path d="M0.100313 12.3527C0.0996563 14.4417 0.649687 16.481 1.69537 18.2786L0 24.4206L6.33478 22.7726C8.08022 23.7168 10.0454 24.2147 12.0451 24.2154H12.0502C18.636 24.2154 23.9972 18.8975 24 12.3621C24.0011 9.19488 22.7591 6.21656 20.5031 3.97609C18.2468 1.73591 15.2468 0.501302 12.0502 0.5C5.46337 0.5 0.102938 5.81721 0.100313 12.3527ZM3.87281 17.969L3.63628 17.5965C2.64197 16.0277 2.11716 14.2149 2.11791 12.3534C2.12006 6.9213 6.57544 2.50186 12.054 2.50186C14.7071 2.50298 17.2005 3.52921 19.0759 5.39116C20.9512 7.2533 21.9831 9.72865 21.9824 12.3614C21.98 17.7935 17.5245 22.2135 12.0502 22.2135H12.0463C10.2638 22.2126 8.51569 21.7376 6.99113 20.84L6.62831 20.6265L2.86912 21.6045L3.87281 17.9689V17.969Z" fill="url(#paint1_wa)" />
                        <path d="M9.06187 7.39749C8.83819 6.90419 8.60278 6.89424 8.39006 6.88559C8.21587 6.87814 8.01675 6.8787 7.81781 6.8787C7.61869 6.8787 7.29516 6.95303 7.02169 7.24931C6.74794 7.54587 5.97656 8.26252 5.97656 9.7201C5.97656 11.1778 7.04653 12.5864 7.19569 12.7843C7.34503 12.9818 9.26128 16.0687 12.2962 17.2562C14.8184 18.2431 15.3317 18.0468 15.8791 17.9973C16.4266 17.948 17.6457 17.2808 17.8944 16.589C18.1433 15.8973 18.1433 15.3044 18.0687 15.1805C17.9941 15.057 17.795 14.9829 17.4964 14.8348C17.1977 14.6866 15.7297 13.9699 15.4561 13.871C15.1823 13.7722 14.9833 13.7229 14.7842 14.0195C14.5851 14.3157 14.0133 14.9829 13.839 15.1805C13.6649 15.3785 13.4906 15.4032 13.1921 15.255C12.8933 15.1063 11.9317 14.7939 10.7909 13.7847C9.90328 12.9994 9.30403 12.0296 9.12984 11.7329C8.95566 11.4367 9.11119 11.2762 9.26091 11.1286C9.39506 10.9958 9.55959 10.7826 9.70903 10.6097C9.85791 10.4367 9.90759 10.3132 10.0072 10.1156C10.1068 9.91786 10.0569 9.74484 9.98241 9.59666C9.90759 9.44847 9.32737 7.98326 9.06187 7.39749Z" fill="white" />
                      </g>
                      <defs>
                        <linearGradient id="paint0_wa" x1="1158.85" y1="2310.17" x2="1158.85" y2="0.914139" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#1FAF38" />
                          <stop offset="1" stopColor="#60D669" />
                        </linearGradient>
                        <linearGradient id="paint1_wa" x1="1200" y1="2392.56" x2="1200" y2="0.5" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#F9F9F9" />
                          <stop offset="1" stopColor="white" />
                        </linearGradient>
                        <clipPath id="clip0_whatsapp">
                          <rect width="24" height="24" fill="white" transform="translate(0 0.5)" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  <div className="ms-5">
                    <span className="btn-contact-title-1 d-block">{t("whatsappUs")}</span>
                    <span className="btn-contact-title-2">{t("whatsappDesc")}</span>
                  </div>
                </div>
              </a>

              <a href="mailto:jacob@edu4u.world" className="d-block text-decoration-none">
                <div className="d-flex align-items-center btn-contact-blue mt-5 w-100">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 6.5C22 5.4 21.1 4.5 20 4.5H4C2.9 4.5 2 5.4 2 6.5V18.5C2 19.6 2.9 20.5 4 20.5H20C21.1 20.5 22 19.6 22 18.5V6.5ZM20 6.5L12 11.5L4 6.5H20ZM20 18.5H4V8.5L12 13.5L20 8.5V18.5Z" fill="white" />
                    </svg>
                  </div>
                  <div className="ms-5">
                    <span className="btn-contact-title-1 d-block">{t("generalEmail")}</span>
                    <span className="btn-contact-title-2">{t("generalDesc")}</span>
                  </div>
                </div>
              </a>

              <a href="mailto:jacob@edu4u.world" className="d-block text-decoration-none">
                <div className="d-flex align-items-center btn-contact-blue mt-5 w-100">
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M22 6.5C22 5.4 21.1 4.5 20 4.5H4C2.9 4.5 2 5.4 2 6.5V18.5C2 19.6 2.9 20.5 4 20.5H20C21.1 20.5 22 19.6 22 18.5V6.5ZM20 6.5L12 11.5L4 6.5H20ZM20 18.5H4V8.5L12 13.5L20 8.5V18.5Z" fill="white" />
                    </svg>
                  </div>
                  <div className="ms-5">
                    <span className="btn-contact-title-1 d-block">{t("partnerships")}</span>
                    <span className="btn-contact-title-2">{t("partnershipsDesc")}</span>
                  </div>
                </div>
              </a>

              <div className="d-flex mt-5 align-items-center">
                <a className="me-5" href="https://www.facebook.com/edu4Uworld/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M29.3346 16C29.3346 8.63999 23.3613 2.66666 16.0013 2.66666C8.6413 2.66666 2.66797 8.63999 2.66797 16C2.66797 22.4533 7.25464 27.8267 13.3346 29.0667V20H10.668V16H13.3346V12.6667C13.3346 10.0933 15.428 7.99999 18.0013 7.99999H21.3346V12H18.668C17.9346 12 17.3346 12.6 17.3346 13.3333V16H21.3346V20H17.3346V29.2667C24.068 28.6 29.3346 22.92 29.3346 16Z" fill="#999999" />
                  </svg>
                </a>
                <a className="me-5" href="https://www.instagram.com/edu4u_/">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M17.2336 4.00148C18.1092 3.99812 18.9849 4.00692 19.8603 4.02788L20.0931 4.03628C20.3619 4.04587 20.627 4.05787 20.9474 4.07227C22.2242 4.13227 23.0953 4.33387 23.8597 4.63026C24.6516 4.93504 25.3188 5.34783 25.986 6.01501C26.596 6.61452 27.0681 7.3397 27.3695 8.14014C27.6659 8.90451 27.8675 9.77688 27.9275 11.0536C27.9419 11.3728 27.9539 11.6392 27.9635 11.908L27.9707 12.1408C27.992 13.0158 28.0012 13.8911 27.9983 14.7663L27.9995 15.6615V17.2334C28.0024 18.1091 27.9932 18.9847 27.9719 19.8601L27.9647 20.0929C27.9551 20.3617 27.9431 20.6269 27.9287 20.9473C27.8687 22.2241 27.6647 23.0952 27.3695 23.8596C27.0691 24.6609 26.5968 25.3867 25.986 25.9859C25.386 26.5959 24.6604 27.068 23.8597 27.3695C23.0953 27.6659 22.2242 27.8675 20.9474 27.9275C20.627 27.9419 20.3619 27.9539 20.0931 27.9635L19.8603 27.9707C18.9849 27.992 18.1093 28.0012 17.2336 27.9983L16.3385 27.9995H14.7677C13.8921 28.0024 13.0165 27.9932 12.1411 27.9719L11.9083 27.9647C11.6234 27.9543 11.3386 27.9423 11.0539 27.9287C9.7772 27.8687 8.90604 27.6647 8.14048 27.3695C7.33974 27.0687 6.61444 26.5965 6.01539 25.9859C5.40467 25.3863 4.93211 24.6606 4.63066 23.8596C4.33428 23.0952 4.13269 22.2241 4.07269 20.9473C4.05932 20.6626 4.04733 20.3778 4.03669 20.0929L4.03069 19.8601C4.00857 18.9847 3.99857 18.1091 4.00069 17.2334V14.7663C3.99734 13.8911 4.00614 13.0158 4.02709 12.1408L4.03549 11.908C4.04509 11.6392 4.05709 11.3728 4.07149 11.0536C4.13149 9.77568 4.33308 8.90571 4.62946 8.14014C4.93109 7.33931 5.40458 6.61432 6.01659 6.01621C6.61523 5.40513 7.34007 4.93213 8.14048 4.63026C8.90604 4.33387 9.776 4.13227 11.0539 4.07227L11.9083 4.03628L12.1411 4.03028C13.016 4.00816 13.8913 3.99816 14.7665 4.00028L17.2336 4.00148ZM16.0001 10.0013C14.3467 10.0013 12.7608 10.6581 11.5953 11.8236C10.4298 12.9892 9.77295 14.575 9.77295 16.2284C9.77295 17.8817 10.4298 19.4676 11.5953 20.6331C12.7608 21.7986 14.3467 22.4554 16.0001 22.4554C17.6534 22.4554 19.2393 21.7986 20.4048 20.6331C21.5703 19.4676 22.2271 17.8817 22.2271 16.2284C22.2271 14.575 21.5703 12.9892 20.4048 11.8236C19.2393 10.6581 17.6534 10.0013 16.0001 10.0013ZM22.2998 8.20133C21.5127 8.20133 20.8744 8.83963 20.8744 9.62675C20.8744 10.4139 21.5127 11.0522 22.2998 11.0522C23.0869 11.0522 23.7252 10.4139 23.7252 9.62675C23.7252 8.83963 23.0869 8.20133 22.2998 8.20133Z" fill="#999999" />
                  </svg>
                </a>
                <a href="https://www.xiaohongshu.com/user/profile/644e67d8000000002a00bf55">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect width="32" height="32" rx="6" fill="#EFEFEF" />
                    <text x="16" y="22" textAnchor="middle" fontSize="14" fill="#999">小</text>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
