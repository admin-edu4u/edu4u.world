"use client";

import { useState } from "react";
import { ArrowUpRight, Bank, Calendar, Dot, Money, Receipt } from "@phosphor-icons/react/dist/ssr";
import { formatMoneyRange } from "@/lib/money";
import { useT } from "@/components/LocaleProvider";

type Career = {
  c_id: number;
  c_title: string;
  c_state: string;
  c_type: number;
  c_salary_min: number;
  c_salary_max: number;
  c_category: number;
  c_url: string;
};

type CareerCategory = {
  cc_id: number;
  cc_title: string;
};

type Props = {
  categories: CareerCategory[];
  careers: Career[];
};

export function CareerTabs({ categories, careers }: Props) {
  const t = useT();
  const [activeTab, setActiveTab] = useState<number>(categories[0]?.cc_id ?? 0);

  function jobType(type: number): string {
    if (type === 1) return t("fullTime");
    if (type === 2) return t("partTime");
    return t("none");
  }

  return (
    <>
      <div className="scrollable-tabs" style={{ height: "54px" }}>
        <ul className="nav nav-tabs nav-pills flex-nowrap" role="tablist">
          {categories.map((cc) => (
            <li key={cc.cc_id} className="nav-item me-5">
              <a
                className={`nav-link blog-nav-link${activeTab === cc.cc_id ? " active" : ""}`}
                role="tab"
                onClick={() => setActiveTab(cc.cc_id)}
                style={{ cursor: "pointer" }}
              >
                {cc.cc_title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="tab-content" id="myTabContent">
        {categories.map((cc) => {
          const catCareers = careers.filter((c) => c.c_category === cc.cc_id);
          return (
            <div
              key={cc.cc_id}
              className={`tab-pane fade${activeTab === cc.cc_id ? " show active" : ""}`}
              role="tabpanel"
            >
              <div className="col-12 row">
                {catCareers.length === 0 && (
                  <div className="col-12 py-10">
                    <span className="uni-location">{t("noJobsInCategory")}</span>
                  </div>
                )}
                {catCareers.map((c) => (
                  <div key={c.c_id}>
                    <div className="mt-5"></div>
                    <div className="col-lg-8 col-12">
                      <span className="d-block career-job-title">{c.c_title}</span>
                      <span className="pt-2 d-block career-job-sub-title">
                        <Calendar weight="light" size={24} color="#1F1F1F" />
                        <span className="mx-2 mobile-font-size">Edu4u</span>
                        <Dot size={24} color="#1F1F1F" />
                        <span className="ms-2 mobile-font-size">{c.c_state}</span>
                      </span>
                      <span className="d-block pt-2 career-job-sub-title-1">
                        <span className="me-2 mobile-font-size">{jobType(c.c_type)}</span>
                        <Dot size={24} color="#999999" />
                        <span className="ms-2 mobile-font-size">
                          {formatMoneyRange(c.c_salary_min, c.c_salary_max)}
                        </span>
                      </span>
                    </div>
                    <div className="col-lg-4 col-12 mb-2">
                      <a href={c.c_url} target="_blank" rel="noopener noreferrer">
                        <button className="apply-scholarship-btn float-end mt-6 col-lg-5 col-12">
                          <ArrowUpRight weight="light" size={24} color="white" />
                          {t("applyNowUncap")}
                        </button>
                      </a>
                    </div>
                    <hr className="mt-5" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}