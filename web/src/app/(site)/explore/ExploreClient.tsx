"use client";

import { MagnifyingGlass, MapPin } from "@phosphor-icons/react/dist/ssr";
import { useState, useEffect, useCallback, useMemo } from "react";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
import { useT } from "@/components/LocaleProvider";

// -- Types --
interface StudyField { c_id: number; c_name: string; }
interface StateOption { state_id: number; state_name: string; }

interface UniItem {
  id: number; url: string; name: string; img: string;
  ttl_course: number; ttl_scholarship: number;
  has_branch: boolean; ttl_branch: number; state: string;
}

interface CourseItem {
  id: number; url_code: string; name: string;
  uni_name: string; uni_logo: string;
  duration: string; intake: string;
  ttl_fees: string; deals: string; scholarship: string; ttl_amt: string;
}

interface ScholarshipItem {
  id: number; url_code: string; name: string;
  uni_name: string; uni_logo: string;
  applicable: string; has_all_cat: boolean;
  has_interview: string; requirement: string; max_discount: string;
}

// -- Helpers --
function buildQuery(params: Record<string, string | string[]>): string {
  const parts: string[] = [];
  for (const [key, val] of Object.entries(params)) {
    if (Array.isArray(val)) {
      val.forEach((v) => { if (v) parts.push(`${key}[]=${encodeURIComponent(v)}`); });
    } else if (val) {
      parts.push(`${key}=${encodeURIComponent(val)}`);
    }
  }
  return parts.join("&");
}

// -- Icons --
function SearchIcon() {
  return <MagnifyingGlass weight="light" size={24} color="#999999" />;
}

function LocationIcon() {
  return <MapPin weight="light" size={24} color="#999999" />;
}// -- Sub-components --

function AccordionSection({
  id, title, open, onToggle, children,
}: {
  id: string; title: string; open: boolean;
  onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="accordion-item">
      <h2 className="accordion-header" id={`${id}_hdr`}>
        <button
          className={`accordion-button${open ? "" : " collapsed"}`}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={`${id}_body`}
        >
          {title}
        </button>
      </h2>
      <div
        id={`${id}_body`}
        className={`accordion-collapse collapse${open ? " show" : ""}`}
        aria-labelledby={`${id}_hdr`}
      >
        <div className="accordion-body">{children}</div>
      </div>
    </div>
  );
}

function CheckboxGroup({
  name, options, checked, onChange,
}: {
  name: string;
  options: { value: string; label: string }[];
  checked: string[];
  onChange: (vals: string[]) => void;
}) {  return (
    <>
      {options.map((opt, i) => (
        <div className="form-check form-check-custom form-check-sm mb-5" key={opt.value}>
          <input
            className="form-check-input"
            type="checkbox"
            name={name}
            value={opt.value}
            id={`${name}_${i}`}
            checked={checked.includes(opt.value)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...checked, opt.value]);
              } else {
                onChange(checked.filter((v) => v !== opt.value));
              }
            }}
          />
          <label className="form-check-label" htmlFor={`${name}_${i}`}>
            {opt.label}
          </label>
        </div>
      ))}
    </>
  );
}

// -- Mobile filter pills: horizontal scrollable row, one panel open at a
//    time; shares the same filter state as the desktop accordion sidebar --
function MobileFilterBar({
  sections, onReset, resetLabel,
}: {
  sections: {
    id: string; title: string;
    options: { value: string; label: string }[];
    checked: string[];
    onChange: (vals: string[]) => void;
  }[];
  onReset: () => void;
  resetLabel: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const open = sections.find((s) => s.id === openId) || null;
  return (
    <div className="explore-mobile-filters">
      <div className="explore-mobile-pills">
        {sections.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`explore-mobile-pill${openId === s.id ? " active" : ""}`}
            aria-expanded={openId === s.id}
            onClick={() => setOpenId(openId === s.id ? null : s.id)}
          >
            {s.title}
            {s.checked.length > 0 && (
              <span className="explore-pill-count">{s.checked.length}</span>
            )}
          </button>
        ))}
        <button
          type="button"
          className="explore-mobile-pill explore-pill-reset"
          onClick={onReset}
        >
          {resetLabel}
        </button>
      </div>
      {open && (
        <div className="explore-mobile-panel">
          <CheckboxGroup
            name={`m_${open.id}`}
            options={open.options}
            checked={open.checked}
            onChange={open.onChange}
          />
        </div>
      )}
    </div>
  );
}

function UniCard({ item }: { item: UniItem }) {
  const t = useT();
  return (
    <div className="col-6 mt-5">
      <a href={`/university/${item.url}`} className="text-decoration-none">
        <div className="col-12 explore-uni-outter">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="uni-img" src={item.img} alt={item.name} />
          <span className="d-block uni-name pt-5">{item.name}</span>
          <div className="mt-2">
            <LocationIcon />
            {item.has_branch && item.ttl_branch > 0 ? (
              <span className="uni-location">{item.state} +{item.ttl_branch} more</span>
            ) : (
              <span className="uni-location">{item.state}</span>
            )}
          </div>
          <div className="d-flex justify-content-center mt-7">
            <div className="col-12 bg-grey br-8 row" style={{ padding: 16 }}>
              <div className="col-6">
                <span className="uni-location d-block">{t("courses")}</span>
                <span className="uni-total d-block">{item.ttl_course}</span>
              </div>
              <div className="col-6">
                <span className="uni-location d-block">{t("scholarship")}</span>
                <span className="uni-total d-block">{item.ttl_scholarship}</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  );
}

function CourseCard({ item }: { item: CourseItem }) {
  const t = useT();
  const truncated =
    item.name.length > 75 ? item.name.substring(0, 75) + "..." : item.name;
  return (
    <div className="col-6 col-md-6 mt-5">
      <a href={`/course-details/${item.url_code}`} className="text-decoration-none">
        <div className="col-12 explore-course-outter">
          <div className="d-flex justify-content-between">
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="course-uni-img" src={item.uni_logo} alt={item.uni_name} />
            </div>
          </div>
          <div>
            <span className="d-block uni-name mt-5 mb-3" style={{ height: 48 }}>
              {truncated}
            </span>
            <span className="uni-location d-block">{item.uni_name}</span>
            <div className="separator my-5"></div>
            <div className="col-12 row">
              <div className="col-3">
                <span className="uni-location d-block">{t("durationLabel")}</span>
                <span className="uni-total d-block pt-2">{item.duration}</span>
              </div>
              <div className="col-9">
                <span className="uni-location d-block">{t("intake")}</span>
                <span className="uni-total d-block pt-2">{item.intake}</span>
              </div>
            </div>
            <div className="separator my-5"></div>
            <div className="d-flex justify-content-between">
              <span className="uni-location">{t("totalFees")}</span>
              <span className="uni-total">{item.ttl_fees}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="uni-location">{t("deals")}</span>
              <span className="uni-total">{item.deals}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="uni-location">{t("scholarship")}</span>
              <span className="uni-total">{item.scholarship}</span>
            </div>
            <div className="separator my-5"></div>
            <span className="uni-total d-block text-end">
              <span className="ttl-amt">{item.ttl_amt}</span>
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}

function ScholarshipCard({ item }: { item: ScholarshipItem }) {
  const t = useT();
  return (
    <div className="col-6 col-md-6 mt-5">
      <a href={`/scholarship/${item.url_code}`} className="text-decoration-none">
        <div className="col-12 explore-course-outter">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="course-uni-img" src={item.uni_logo} alt={item.uni_name} />
          <div>
            <span className="d-block uni-name pt-5">{item.name}</span>
            <span className="uni-location d-block">{item.uni_name}</span>
            <div className="separator my-5"></div>
            <span className="uni-location d-block">{t("applicableFor")}</span>
            <span className="uni-total d-block pt-2" id="applicable">
              {item.has_all_cat ? t("exploreAllFields") : item.applicable}
            </span>
            <div className="separator my-5"></div>
            <div className="d-flex justify-content-between">
              <span className="uni-location">{t("interviewRequired")}</span>
              <span className="uni-total">{item.has_interview}</span>
            </div>
            <div className="d-flex justify-content-between">
              <span className="uni-location">{t("approval")}</span>
              <span className="uni-total">{t("instantApproval")}</span>
            </div>
            <div className="d-flex justify-content-between">
              <div>
                <span className="uni-location">{t("requirements")}</span>
              </div>
              <div className="text-end">
                <span className="uni-total">{item.requirement}</span>
              </div>
            </div>
            <div className="separator my-5"></div>
            {item.max_discount && (
              <span className="uni-total d-block text-end">
                {t("feesWaiver")}<span className="ttl-amt"> {item.max_discount}</span>
              </span>
            )}
            <button className="w-100 mt-10 apply-scholarship-btn">
              {t("pathway360")} - {t("applicable")}
            </button>
          </div>
        </div>
      </a>
    </div>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <div className="col-12 mt-5" style={{ color: "#999", textAlign: "center" }}>
      {msg}
    </div>
  );
}

// -- Main component --

export type ExploreType = "university" | "course" | "scholarship";

export default function ExploreClient({
  type,
  studyFields,
  scholarshipFields,
  states,
}: {
  type: ExploreType;
  studyFields: StudyField[];
  scholarshipFields: StudyField[];
  states: StateOption[];
}) {
  const t = useT();

  const levelOptions = useMemo(
    () => [
      { value: "1", label: t("exploreLevelFoundation") },
      { value: "2", label: t("exploreLevelDiploma") },
      { value: "3", label: t("exploreLevelDegree") },
      { value: "4", label: t("exploreLevelMasters") },
      { value: "5", label: t("exploreLevelPhd") },
    ],
    [t],
  );
  const scholarshipRanges = useMemo(
    () => [
      { value: "1", label: t("none") },
      { value: "2", label: t("exploreSchRange2") },
      { value: "3", label: t("exploreSchRange3") },
      { value: "4", label: t("exploreSchRange4") },
      { value: "5", label: t("exploreSchRange5") },
    ],
    [t],
  );
  const feeRanges = useMemo(
    () => [
      { value: "1", label: t("exploreFeeBelow20k") },
      { value: "2", label: t("exploreFee20to40k") },
      { value: "3", label: t("exploreFee40to60k") },
      { value: "4", label: t("exploreFee60to80k") },
      { value: "5", label: t("exploreFee80to100k") },
      { value: "6", label: t("exploreFeeAbove100k") },
    ],
    [t],
  );
  const durationOptions = useMemo(
    () =>
      [1, 2, 3, 4, 5].map((n) => ({
        value: String(n),
        label: `${n} ${n === 1 ? t("yearSingular") : t("years")}`,
      })),
    [t],
  );
  const monthOptions = useMemo(
    () =>
      (
        [
          "january", "february", "march", "april", "may", "june",
          "july", "august", "september", "october", "november", "december",
        ] as const
      ).map((key, i) => ({ value: String(i + 1), label: t(key) })),
    [t],
  );
  const countryOptions = useMemo(
    () => [
      { value: "129", label: t("malaysia") },
      { value: "192", label: t("singapore") },
      { value: "13", label: t("australia") },
      { value: "826", label: t("unitedKingdom") },
      { value: "840", label: t("unitedStates") },
    ],
    [t],
  );

  // Accordion open state (shared across tabs)
  const [openAcc, setOpenAcc] = useState<Record<string, boolean>>({});
  const toggle = useCallback(
    (id: string) => setOpenAcc((p) => ({ ...p, [id]: !p[id] })),
    []
  );

  // -- University filter state --
  const [uniSearch, setUniSearch] = useState("");
  const [uniSort, setUniSort] = useState("1");
  const [uniStudyField, setUniStudyField] = useState<string[]>([]);
  const [uniLevel, setUniLevel] = useState<string[]>([]);
  const [uniScholarship, setUniScholarship] = useState<string[]>([]);
  const [uniCountry, setUniCountry] = useState<string[]>([]);
  const [uniState, setUniState] = useState<string[]>([]);
  const [uniList, setUniList] = useState<UniItem[] | null>(null);
  const [uniLoading, setUniLoading] = useState(false);

  // -- Course filter state --
  const [courseSearch, setCourseSearch] = useState("");
  const [courseSort, setCourseSort] = useState("1");
  const [courseStudyField, setCourseStudyField] = useState<string[]>([]);
  const [courseLevel, setCourseLevel] = useState<string[]>([]);
  const [courseScholarship, setCourseScholarship] = useState<string[]>([]);
  const [courseFee, setCourseFee] = useState<string[]>([]);
  const [courseDuration, setCourseDuration] = useState<string[]>([]);
  const [courseMonth, setCourseMonth] = useState<string[]>([]);
  const [courseCountry, setCourseCountry] = useState<string[]>([]);
  const [courseState, setCourseState] = useState<string[]>([]);
  const [courseList, setCourseList] = useState<CourseItem[] | null>(null);
  const [courseLoading, setCourseLoading] = useState(false);

  // -- Scholarship filter state --
  const [schSearch, setSchSearch] = useState("");
  const [schSort, setSchSort] = useState("1");
  const [schCountry, setSchCountry] = useState<string[]>([]);
  const [schState, setSchState] = useState<string[]>([]);
  const [schStudyField, setSchStudyField] = useState<string[]>([]);
  const [schLevel, setSchLevel] = useState<string[]>([]);
  const [schList, setSchList] = useState<ScholarshipItem[] | null>(null);
  const [schLoading, setSchLoading] = useState(false);

  // -- Fetch functions --
  const fetchUnis = useCallback(async () => {
    setUniLoading(true);
    try {
      const qs = buildQuery({
        search: uniSearch,
        sort: uniSort,
        "study_field": uniStudyField,
        "level": uniLevel,
        "scholarship": uniScholarship,
        "country": uniCountry,
        "state": uniState,
      });
      const res = await fetch(`/api/explore/universities?${qs}`);
      const data = await res.json();
      setUniList(data.status ? data.list : []);
    } catch {
      setUniList([]);
    }
    setUniLoading(false);
  }, [uniSearch, uniSort, uniStudyField, uniLevel, uniScholarship, uniCountry, uniState]);

  const fetchCourses = useCallback(async () => {
    setCourseLoading(true);
    try {
      const qs = buildQuery({
        search: courseSearch,
        sort: courseSort,
        "study_field": courseStudyField,
        "level": courseLevel,
        "scholarship": courseScholarship,
        "fee": courseFee,
        "duration": courseDuration,
        "month": courseMonth,
        "country": courseCountry,
        "state": courseState,
      });
      const res = await fetch(`/api/explore/courses?${qs}`);
      const data = await res.json();
      setCourseList(data.status ? data.list : []);
    } catch {
      setCourseList([]);
    }
    setCourseLoading(false);
  }, [courseSearch, courseSort, courseStudyField, courseLevel, courseScholarship, courseFee, courseDuration, courseMonth, courseCountry, courseState]);

  const fetchScholarships = useCallback(async () => {
    setSchLoading(true);
    try {
      const qs = buildQuery({
        search: schSearch,
        sort: schSort,
        "country": schCountry,
        "state": schState,
        "study_field": schStudyField,
        "level": schLevel,
      });
      const res = await fetch(`/api/explore/scholarships?${qs}`);
      const data = await res.json();
      setSchList(data.status ? data.list : []);
    } catch {
      setSchList([]);
    }
    setSchLoading(false);
  }, [schSearch, schSort, schCountry, schState, schStudyField, schLevel]);

  useEffect(() => { if (type === "university") fetchUnis(); }, [type, fetchUnis]);
  useEffect(() => { if (type === "course") fetchCourses(); }, [type, fetchCourses]);
  useEffect(() => { if (type === "scholarship") fetchScholarships(); }, [type, fetchScholarships]);

  function resetUniFilters() {
    setUniSearch(""); setUniSort("1");
    setUniStudyField([]); setUniLevel([]);
    setUniScholarship([]); setUniCountry([]);
    setUniState([]);
  }

  function resetCourseFilters() {
    setCourseSearch(""); setCourseSort("1");
    setCourseStudyField([]); setCourseLevel([]);
    setCourseScholarship([]); setCourseFee([]);
    setCourseDuration([]); setCourseMonth([]);
    setCourseCountry([]); setCourseState([]);
  }

  function resetSchFilters() {
    setSchSearch(""); setSchSort("1");
    setSchCountry([]); setSchState([]);
    setSchStudyField([]); setSchLevel([]);
  }

  const studyFieldOpts = studyFields.map((sf) => ({
    value: String(sf.c_id),
    label: sf.c_name,
  }));
  const stateOpts = states.map((s) => ({
    value: String(s.state_id),
    label: s.state_name,
  }));

  return (
    <>
      <div className="tab-content mb-20" id="pills-tabContent">

        {/* ---- University section ---- */}
        {type === "university" && (
        <div
          className="tab-pane fade show active text-white"
          id="pills-orders"
          role="tabpanel"
          aria-labelledby="pills-orders-tab"
        >
          <div className="col-12 d-flex flex-column flex-lg-row justify-content-between align-items-stretch gap-4 gap-lg-0">
            {/* Filter sidebar */}
            <div className="col-12 col-lg-3">
              <aside className="explore-filter-outer">
                <span className="explore-filter-heading">{t("filters")}</span>
                <span className="explore-filter-title">{t("courseInfo")}</span>
                <div className="explore-filter-section">
                  <div className="accordion" id="uni_acc_1">
                    <AccordionSection
                      id="uni_field" title={t("fieldOfStudy")}
                      open={!!openAcc["uni_field"]} onToggle={() => toggle("uni_field")}
                    >
                      <CheckboxGroup
                        name="study_field" options={studyFieldOpts}
                        checked={uniStudyField} onChange={setUniStudyField}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="uni_level" title={t("level")}
                      open={!!openAcc["uni_level"]} onToggle={() => toggle("uni_level")}
                    >
                      <CheckboxGroup
                        name="level" options={levelOptions}
                        checked={uniLevel} onChange={setUniLevel}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="uni_scholarship" title={t("scholarships")}
                      open={!!openAcc["uni_scholarship"]} onToggle={() => toggle("uni_scholarship")}
                    >
                      <CheckboxGroup
                        name="scholarship" options={scholarshipRanges}
                        checked={uniScholarship} onChange={setUniScholarship}
                      />
                    </AccordionSection>
                  </div>
                </div>
                <span className="explore-filter-title">{t("location")}</span>
                <div className="explore-filter-section">
                  <div className="accordion" id="uni_acc_5">
                    <AccordionSection
                      id="uni_country" title={t("country")}
                      open={!!openAcc["uni_country"]} onToggle={() => toggle("uni_country")}
                    >
                      <CheckboxGroup
                        name="country" options={countryOptions}
                        checked={uniCountry} onChange={setUniCountry}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="uni_state" title={t("state")}
                      open={!!openAcc["uni_state"]} onToggle={() => toggle("uni_state")}
                    >
                      <CheckboxGroup
                        name="state" options={stateOpts}
                        checked={uniState} onChange={setUniState}
                      />
                    </AccordionSection>
                  </div>
                </div>
                <div className="explore-filter-actions">
                  <button type="button" className="explore-filter-btn" onClick={resetUniFilters}>
                    {t("resetFilter")}
                  </button>
                </div>
              </aside>
            </div>

            {/* Results */}
            <div className="col-12 col-lg-9">
              <div className="ms-lg-10">
                <MobileFilterBar
                  onReset={resetUniFilters}
                  resetLabel={t("resetFilter")}
                  sections={[
                    { id: "uni_field", title: t("fieldOfStudy"), options: studyFieldOpts, checked: uniStudyField, onChange: setUniStudyField },
                    { id: "uni_level", title: t("level"), options: levelOptions, checked: uniLevel, onChange: setUniLevel },
                    { id: "uni_scholarship", title: t("scholarships"), options: scholarshipRanges, checked: uniScholarship, onChange: setUniScholarship },
                    { id: "uni_country", title: t("country"), options: countryOptions, checked: uniCountry, onChange: setUniCountry },
                    { id: "uni_state", title: t("state"), options: stateOpts, checked: uniState, onChange: setUniState },
                  ]}
                />
                <div className="col-12 row mx-auto explore-toolbar">
                  <div className="filter-width">
                    <div className="input-group input-group-solid explore-search-group col-6">
                      <span className="input-group-text explore-search-icon" id="uni-search-icon">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        name="search_uni"
                        className="form-control explore-search-uni"
                        placeholder={t("searchUni")}
                        aria-label={t("searchUni")}
                        aria-describedby="uni-search-icon"
                        value={uniSearch}
                        onChange={(e) => setUniSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="explore-sort-wrap">
                    <CustomDropdown
                      name="sort-uni"
                      className="explore-sort sort-uni"
                      value={uniSort}
                      onChange={setUniSort}
                      options={[
                        { value: "1", label: t("exploreSortAtoZ") },
                        { value: "2", label: t("exploreSortZtoA") },
                      ]}
                    />
                  </div>
                </div>
                <div id="uni_list">
                  {uniLoading || uniList === null ? (
                    <div className="col-12 row m-0">
                      <EmptyState msg={t("loading")} />
                    </div>
                  ) : uniList.length === 0 ? (
                    <div className="col-12 row m-0">
                      <EmptyState msg={t("noUniversitiesFound")} />
                    </div>
                  ) : (
                    <div className="col-12 row m-0">
                      {uniList.map((item) => (
                        <UniCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        )}

        {/* ---- Course section ---- */}
        {type === "course" && (
        <div
          className="tab-pane fade show active text-white"
          id="pills-courses"
          role="tabpanel"
          aria-labelledby="pills-subscriptions-tab"
        >
          <div className="col-12 d-flex flex-column flex-lg-row justify-content-between align-items-stretch gap-4 gap-lg-0">
            {/* Filter sidebar */}
            <div className="col-12 col-lg-3">
              <aside className="explore-filter-outer">
                <span className="explore-filter-heading">{t("filters")}</span>
                <span className="explore-filter-title">{t("courseInfo")}</span>
                <div className="explore-filter-section">
                  <div className="accordion" id="c_acc_1">
                    <AccordionSection
                      id="c_field" title={t("fieldOfStudy")}
                      open={!!openAcc["c_field"]} onToggle={() => toggle("c_field")}
                    >
                      <CheckboxGroup
                        name="major_study_field" options={studyFieldOpts}
                        checked={courseStudyField} onChange={setCourseStudyField}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="c_level" title={t("level")}
                      open={!!openAcc["c_level"]} onToggle={() => toggle("c_level")}
                    >
                      <CheckboxGroup
                        name="course_level" options={levelOptions}
                        checked={courseLevel} onChange={setCourseLevel}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="c_scholarship" title={t("scholarships")}
                      open={!!openAcc["c_scholarship"]} onToggle={() => toggle("c_scholarship")}
                    >
                      <CheckboxGroup
                        name="course_scholarship" options={scholarshipRanges}
                        checked={courseScholarship} onChange={setCourseScholarship}
                      />
                    </AccordionSection>
                  </div>
                </div>
                <span className="explore-filter-title">{t("financialsTiming")}</span>
                <div className="explore-filter-section">
                  <div className="accordion" id="c_acc_4">
                    <AccordionSection
                      id="c_fee" title={t("feeBudget")}
                      open={!!openAcc["c_fee"]} onToggle={() => toggle("c_fee")}
                    >
                      <CheckboxGroup
                        name="course_fee" options={feeRanges}
                        checked={courseFee} onChange={setCourseFee}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="c_duration" title={t("fullTimeDuration")}
                      open={!!openAcc["c_duration"]} onToggle={() => toggle("c_duration")}
                    >
                      <CheckboxGroup
                        name="course_duration" options={durationOptions}
                        checked={courseDuration} onChange={setCourseDuration}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="c_month" title={t("intakeMonth")}
                      open={!!openAcc["c_month"]} onToggle={() => toggle("c_month")}
                    >
                      <CheckboxGroup
                        name="course_month" options={monthOptions}
                        checked={courseMonth} onChange={setCourseMonth}
                      />
                    </AccordionSection>
                  </div>
                </div>
                <span className="explore-filter-title">{t("location")}</span>
                <div className="explore-filter-section">
                  <div className="accordion" id="c_acc_7">
                    <AccordionSection
                      id="c_country" title={t("country")}
                      open={!!openAcc["c_country"]} onToggle={() => toggle("c_country")}
                    >
                      <CheckboxGroup
                        name="course_country" options={countryOptions}
                        checked={courseCountry} onChange={setCourseCountry}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="c_state" title={t("state")}
                      open={!!openAcc["c_state"]} onToggle={() => toggle("c_state")}
                    >
                      <CheckboxGroup
                        name="course_state" options={stateOpts}
                        checked={courseState} onChange={setCourseState}
                      />
                    </AccordionSection>
                  </div>
                </div>
                <div className="explore-filter-actions">
                  <button type="button" className="explore-filter-btn" onClick={resetCourseFilters}>
                    {t("resetFilter")}
                  </button>
                </div>
              </aside>
            </div>

            {/* Results */}
            <div className="col-12 col-lg-9">
              <div className="ms-lg-10">
                <MobileFilterBar
                  onReset={resetCourseFilters}
                  resetLabel={t("resetFilter")}
                  sections={[
                    { id: "c_field", title: t("fieldOfStudy"), options: studyFieldOpts, checked: courseStudyField, onChange: setCourseStudyField },
                    { id: "c_level", title: t("level"), options: levelOptions, checked: courseLevel, onChange: setCourseLevel },
                    { id: "c_scholarship", title: t("scholarships"), options: scholarshipRanges, checked: courseScholarship, onChange: setCourseScholarship },
                    { id: "c_fee", title: t("feeBudget"), options: feeRanges, checked: courseFee, onChange: setCourseFee },
                    { id: "c_duration", title: t("fullTimeDuration"), options: durationOptions, checked: courseDuration, onChange: setCourseDuration },
                    { id: "c_month", title: t("intakeMonth"), options: monthOptions, checked: courseMonth, onChange: setCourseMonth },
                    { id: "c_country", title: t("country"), options: countryOptions, checked: courseCountry, onChange: setCourseCountry },
                    { id: "c_state", title: t("state"), options: stateOpts, checked: courseState, onChange: setCourseState },
                  ]}
                />
                <div className="col-12 row mx-auto explore-toolbar">
                  <div className="filter-width">
                    <div className="input-group input-group-solid explore-search-group col-6">
                      <span className="input-group-text explore-search-icon" id="course-search-icon">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        name="course_search"
                        className="form-control explore-search-uni"
                        placeholder={t("searchCourses")}
                        aria-label={t("searchCourses")}
                        aria-describedby="course-search-icon"
                        value={courseSearch}
                        onChange={(e) => setCourseSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="explore-sort-wrap">
                    <CustomDropdown
                      name="sort-courses"
                      className="explore-sort sort-courses"
                      value={courseSort}
                      onChange={setCourseSort}
                      options={[
                        { value: "1", label: t("sortLowestShort") },
                        { value: "2", label: t("sortHighestShort") },
                      ]}
                    />
                  </div>
                </div>
                <div id="course_list">
                  {courseLoading || courseList === null ? (
                    <div className="col-12 row justify-content-between m-0">
                      <EmptyState msg={t("loading")} />
                    </div>
                  ) : courseList.length === 0 ? (
                    <div className="col-12 row justify-content-between m-0">
                      <EmptyState msg={t("noCoursesFound")} />
                    </div>
                  ) : (
                    <div className="col-12 row justify-content-between m-0">
                      {courseList.map((item) => (
                        <CourseCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        )}

        {/* ---- Scholarship section ---- */}
        {type === "scholarship" && (
        <div
          className="tab-pane fade show active text-white"
          id="pills-scholarship"
          role="tabpanel"
          aria-labelledby="pills-subscriptions-tab"
        >
          <div className="col-12 d-flex flex-column flex-lg-row justify-content-between align-items-stretch gap-4 gap-lg-0">
            {/* Filter sidebar */}
            <div className="col-12 col-lg-3">
              <aside className="explore-filter-outer">
                <span className="explore-filter-heading">{t("filters")}</span>
                <span className="explore-filter-title">{t("location")}</span>
                <div className="explore-filter-section">
                  <div className="accordion" id="s_acc_1">
                    <AccordionSection
                      id="s_country" title={t("country")}
                      open={!!openAcc["s_country"]} onToggle={() => toggle("s_country")}
                    >
                      <CheckboxGroup
                        name="scholarship_country" options={countryOptions}
                        checked={schCountry} onChange={setSchCountry}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="s_state" title={t("state")}
                      open={!!openAcc["s_state"]} onToggle={() => toggle("s_state")}
                    >
                      <CheckboxGroup
                        name="scholarship_state" options={stateOpts}
                        checked={schState} onChange={setSchState}
                      />
                    </AccordionSection>
                  </div>
                </div>
                <span className="explore-filter-title">{t("courseInfo")}</span>
                <div className="explore-filter-section">
                  <div className="accordion" id="s_acc_3">
                    <AccordionSection
                      id="s_field" title={t("fieldOfStudy")}
                      open={!!openAcc["s_field"]} onToggle={() => toggle("s_field")}
                    >
                      <CheckboxGroup
                        name="scholarship_study_field" options={scholarshipFields.map((sf) => ({ value: String(sf.c_id), label: sf.c_name }))}
                        checked={schStudyField} onChange={setSchStudyField}
                      />
                    </AccordionSection>
                    <AccordionSection
                      id="s_level" title={t("level")}
                      open={!!openAcc["s_level"]} onToggle={() => toggle("s_level")}
                    >
                      <CheckboxGroup
                        name="scholarship_level" options={levelOptions}
                        checked={schLevel} onChange={setSchLevel}
                      />
                    </AccordionSection>
                  </div>
                </div>
                <div className="explore-filter-actions">
                  <button type="button" className="explore-filter-btn" onClick={resetSchFilters}>
                    {t("resetFilter")}
                  </button>
                </div>
              </aside>
            </div>

            {/* Results */}
            <div className="col-12 col-lg-9">
              <div className="ms-lg-10">
                <MobileFilterBar
                  onReset={resetSchFilters}
                  resetLabel={t("resetFilter")}
                  sections={[
                    { id: "s_field", title: t("fieldOfStudy"), options: scholarshipFields.map((sf) => ({ value: String(sf.c_id), label: sf.c_name })), checked: schStudyField, onChange: setSchStudyField },
                    { id: "s_level", title: t("level"), options: levelOptions, checked: schLevel, onChange: setSchLevel },
                    { id: "s_country", title: t("country"), options: countryOptions, checked: schCountry, onChange: setSchCountry },
                    { id: "s_state", title: t("state"), options: stateOpts, checked: schState, onChange: setSchState },
                  ]}
                />
                <div className="col-12 row mx-auto explore-toolbar">
                  <div className="filter-width">
                    <div className="input-group input-group-solid explore-search-group col-6">
                      <span className="input-group-text explore-search-icon" id="sch-search-icon">
                        <SearchIcon />
                      </span>
                      <input
                        type="text"
                        name="search_scholarship"
                        className="form-control explore-search-uni"
                        placeholder={t("searchScholarship")}
                        aria-label={t("searchScholarship")}
                        aria-describedby="sch-search-icon"
                        value={schSearch}
                        onChange={(e) => setSchSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="explore-sort-wrap">
                    <CustomDropdown
                      name="sort-scholarship"
                      className="explore-sort sort-scholarship"
                      value={schSort}
                      onChange={setSchSort}
                      options={[
                        { value: "1", label: t("schSortHighPct") },
                        { value: "2", label: t("schSortLowPct") },
                        { value: "3", label: t("schSortHighAmt") },
                        { value: "4", label: t("schSortLowAmt") },
                      ]}
                    />
                  </div>
                </div>
                <div id="scholarship_list">
                  {schLoading || schList === null ? (
                    <div className="col-12 row justify-content-between m-0">
                      <EmptyState msg={t("loading")} />
                    </div>
                  ) : schList.length === 0 ? (
                    <div className="col-12 row justify-content-between m-0">
                      <EmptyState msg={t("noScholarshipsFound")} />
                    </div>
                  ) : (
                    <div className="col-12 row justify-content-between m-0">
                      {schList.map((item) => (
                        <ScholarshipCard key={item.id} item={item} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </>
  );
}
