import { input, labelCls } from "@/components/ui";

const full = "md:col-span-2";

// Links admins use to check that a submitter, farm or organization is real.
// Private: shown to admins only, never on the public page.
export function VerifyFields({ farm = false }: { farm?: boolean }) {
  return (
    <fieldset className={`${full} m-0 flex flex-col gap-3 rounded-xl border border-line bg-ivory p-3.5`}>
      <legend className="px-1 text-[14px] font-bold">For verification</legend>
      <p className="m-0 text-[12.5px] text-muted">These links help admins confirm you are real. They are seen by admins only{farm ? ", except the farm’s Facebook page, which also powers its Message button" : ""}.</p>
      {!farm && (
        <label className={labelCls}>Your Facebook page or profile link *
          <input name="vfb" required maxLength={300} placeholder="https://www.facebook.com/yourpage" className={input} />
        </label>
      )}
      <label className={labelCls}>Organization, farm or business link (website or page)
        <input name="vlink" maxLength={300} placeholder="https://… (optional if you have none)" className={input} />
      </label>
    </fieldset>
  );
}
