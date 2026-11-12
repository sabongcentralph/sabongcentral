// Shown until the visitor confirms they are 21 or older. A plain form, so it works without JavaScript.
export function AgeGate({ under }: { under: boolean }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="age-title" className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2a0a0e]/95 p-4 backdrop-blur">
      <div className="flex w-full max-w-[420px] flex-col gap-4 rounded-2xl border-2 border-gold bg-cream p-6 text-center">
        <span className="font-serif text-[22px] font-semibold text-crimson">Sabong Central</span>
        {under ? (
          <>
            <h2 id="age-title" className="m-0 text-[18px] font-bold">Sorry, this site is for adults 21 and over.</h2>
            <p className="m-0 text-[14px] text-ink-soft">Please come back when you are 21.</p>
          </>
        ) : (
          <>
            <h2 id="age-title" className="m-0 text-[20px] font-bold">Are you 21 or older?</h2>
            <p className="m-0 text-[14px] text-ink-soft">This site is for adults 21 and above only. It is an information directory: no bets, no payments, no e-sabong.</p>
            <form action="/api/age" method="post" className="flex flex-col gap-2">
              <button name="ok" value="1" className="min-h-12 cursor-pointer rounded-full border-0 bg-crimson text-[16px] font-semibold text-white">Yes, I am 21 or older</button>
              <button name="ok" value="0" className="min-h-11 cursor-pointer rounded-full border border-sand bg-transparent text-[14px] font-semibold text-ink-soft">No, I am under 21</button>
            </form>
          </>
        )}
        <p className="m-0 text-[12px] text-muted">Gamble responsibly. Need help? National Problem Gambling Helpline: (02) 8248-9568, 24/7.</p>
      </div>
    </div>
  );
}
