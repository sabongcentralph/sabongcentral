"use client";

import { useState } from "react";
import { AREAS } from "@/lib/locations";
import { input, labelCls } from "./ui";

// Province → City/Municipality. Changing the province resets the city.
export function LocationFields({
  province = "", city = "", allLabel = "All", required = false, idPrefix = "loc",
}: { province?: string; city?: string; allLabel?: string; required?: boolean; idPrefix?: string }) {
  const [p, setP] = useState(province);
  const [c, setC] = useState(city);
  const cities = AREAS.find((a) => a.p === p)?.c ?? [];
  return (
    <>
      <label className={labelCls} htmlFor={`${idPrefix}-p`}>
        Province / Area
        <select id={`${idPrefix}-p`} name="province" value={p} required={required} onChange={(e) => { setP(e.target.value); setC(""); }} className={input}>
          <option value="">{required ? "Select" : allLabel}</option>
          {AREAS.map((a) => <option key={a.p} value={a.p}>{a.p}</option>)}
        </select>
      </label>
      <label className={labelCls} htmlFor={`${idPrefix}-c`}>
        City / Municipality
        <select id={`${idPrefix}-c`} name="city" value={c} required={required} onChange={(e) => setC(e.target.value)} className={input}>
          <option value="">{required ? "Select" : allLabel}</option>
          {cities.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
      </label>
    </>
  );
}
