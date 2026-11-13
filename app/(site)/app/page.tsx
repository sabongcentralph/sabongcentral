import type { Metadata } from "next";
import { InstallButton } from "@/components/InstallApp";
import { Note, Page, PageHead } from "@/components/ui";

export const metadata: Metadata = { title: "Get the app" };

const IOS = [
  "Open this site in Safari (the compass icon). Other browsers on iPhone may not show this option.",
  "Find Share. On newer iPhones (iOS 26), tap the ··· (three dots) button next to the address bar, then tap Share. On older iPhones, tap the Share button (a square with an arrow pointing up) at the bottom of the screen.",
  "Scroll down and tap “Add to Home Screen”. If you don't see it, tap “View More” or “Edit Actions” first.",
  "Tap “Add”. The Sabong Sentral icon appears on your Home Screen.",
]
const ANDROID = [
  "Open the site in Chrome.",
  "Tap the ⋮ menu (three dots) at the top right.",
  "Tap “Install app” or “Add to Home screen”.",
  "Tap “Install” or “Add”. The Sabong Sentral icon appears on your Home Screen and in your apps.",
];

function Steps({ title, steps }: { title: string; steps: string[] }) {
  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-line bg-cream p-4">
      <h2 className="m-0 text-[18px] font-bold">{title}</h2>
      <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed">
            <span className="flex size-7 flex-none items-center justify-center rounded-full bg-crimson text-[13px] font-bold text-white">{i + 1}</span>
            <span>{s}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

export default function GetAppPage() {
  return (
    <Page>
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
        <div className="flex items-center gap-4">
          <img src="/icons/icon-192.png" alt="Sabong Sentral app icon" width={72} height={72} className="size-[72px] flex-none rounded-2xl" />
          <PageHead kicker="Free · No download from an app store" title="Get the Sabong Sentral app" sub="Add Sabong Sentral to your Home Screen. It opens full screen like an app, with the latest listings every time." />
        </div>
        <InstallButton />
        <Steps title="iPhone and iPad" steps={IOS} />
        <Steps title="Android" steps={ANDROID} />
        <Note>It uses almost no phone storage and updates by itself. To remove it, press and hold the icon, then tap Remove or Uninstall.</Note>
      </div>
    </Page>
  );
}
