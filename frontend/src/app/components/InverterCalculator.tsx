import { useMemo, useState } from "react";
import { BatteryCharging, Calculator, Gauge, Info, Minus, Plus, RotateCcw, SunMedium, Zap } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

type Appliance = {
  id: string;
  name: string;
  watts: number;
};

type InverterCalculatorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const appliances: Appliance[] = [
  { id: "light-bulbs", name: "Light bulbs", watts: 10 },
  { id: "television", name: "Television", watts: 120 },
  { id: "phones", name: "Phones", watts: 10 },
  { id: "laptops", name: "Laptops", watts: 65 },
  { id: "decoder", name: "Decoder", watts: 25 },
  { id: "freezer", name: "Freezer", watts: 180 },
  { id: "blender", name: "Blender", watts: 500 },
  { id: "iron-microwave", name: "Iron or microwave", watts: 1_000 },
  { id: "juice-mixer", name: "Juice mixer / grinder", watts: 500 },
  { id: "air-conditioner", name: "Air conditioner", watts: 1_200 },
  { id: "gaming-console", name: "Gaming console", watts: 200 },
  { id: "music-system", name: "Music system", watts: 150 },
];

const inverterSizes = [1, 1.5, 2, 3, 5, 8, 10];
const defaultQuantities = Object.fromEntries(appliances.map(appliance => [appliance.id, 0]));

function formatWatts(watts: number) {
  return watts >= 1_000 ? `${(watts / 1_000).toFixed(watts % 1_000 === 0 ? 0 : 1)}kW` : `${watts}W`;
}

export function InverterCalculator({ open, onOpenChange }: InverterCalculatorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(defaultQuantities);
  const [backupHours, setBackupHours] = useState(4);
  const [hasCalculated, setHasCalculated] = useState(false);

  const totalWatts = useMemo(
    () => appliances.reduce((total, appliance) => total + appliance.watts * (quantities[appliance.id] ?? 0), 0),
    [quantities],
  );
  const peakWatts = Math.ceil(totalWatts * 1.25);
  const recommendedKva = inverterSizes.find(size => size * 1_000 * 0.8 >= peakWatts) ?? inverterSizes[inverterSizes.length - 1];
  const batteryAh = totalWatts > 0 ? Math.ceil((totalWatts * backupHours) / (48 * 0.85)) : 0;
  const batteryModules = batteryAh > 0 ? Math.max(1, Math.ceil(batteryAh / 100)) : 0;

  const updateQuantity = (id: string, amount: number) => {
    setQuantities(current => ({
      ...current,
      [id]: Math.max(0, Math.min(20, (current[id] ?? 0) + amount)),
    }));
    setHasCalculated(false);
  };

  const reset = () => {
    setQuantities(defaultQuantities);
    setBackupHours(4);
    setHasCalculated(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[92vh] max-w-4xl overflow-y-auto border-[#15334b] bg-[#f8fafc] p-0 text-[#041627] sm:rounded-none"
        aria-describedby="inverter-calculator-description"
      >
        <DialogHeader className="border-b border-[#dfe7ee] bg-[#041627] px-6 pb-6 pt-7 text-left sm:px-8">
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-11 w-11 items-center justify-center bg-[#4BC47A]/15 text-[#63D58D]">
              <Calculator size={21} strokeWidth={1.8} />
            </div>
            <div>
              <DialogTitle
                className="text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Inverter Calculator
              </DialogTitle>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#71D897]" style={{ fontFamily: "var(--font-ui)" }}>
                Find a starting point for your backup system
              </p>
            </div>
          </div>
          <DialogDescription id="inverter-calculator-description" className="mt-5 max-w-2xl text-sm leading-relaxed text-white/60">
            Select the appliances you want to power at the same time. We’ll estimate the load and suggest an inverter size for your consultation.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.35fr_0.85fr]">
          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#60758a]" style={{ fontFamily: "var(--font-ui)" }}>
                  Step 1
                </p>
                <h3 className="mt-1 text-xl font-bold tracking-[-0.025em]" style={{ fontFamily: "var(--font-display)" }}>
                  What do you need to power?
                </h3>
              </div>
              <span className="hidden text-right text-xs text-[#60758a] sm:block">
                Rated load per appliance
              </span>
            </div>

            <div className="divide-y divide-[#e2e8ee] border border-[#dfe7ee] bg-white">
              {appliances.map(appliance => {
                const quantity = quantities[appliance.id] ?? 0;
                return (
                  <div key={appliance.id} className="flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold uppercase tracking-[0.04em] text-[#173047]" style={{ fontFamily: "var(--font-ui)" }}>
                        {appliance.name}
                      </p>
                      <p className="mt-0.5 text-xs text-[#8a9aaa]">{formatWatts(appliance.watts)} each</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQuantity(appliance.id, -1)}
                        disabled={quantity === 0}
                        aria-label={`Remove one ${appliance.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#35A96B] text-white transition-colors hover:bg-[#278d58] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Minus size={14} strokeWidth={2.5} />
                      </button>
                      <output className="flex h-9 w-12 items-center justify-center border border-[#d8e0e7] bg-[#fbfcfd] text-center text-sm font-semibold text-[#173047]" aria-label={`${quantity} ${appliance.name}`}>
                        {quantity}
                      </output>
                      <button
                        type="button"
                        onClick={() => updateQuantity(appliance.id, 1)}
                        disabled={quantity === 20}
                        aria-label={`Add one ${appliance.name}`}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#35A96B] text-white transition-colors hover:bg-[#278d58] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border border-[#dfe7ee] bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#60758a]" style={{ fontFamily: "var(--font-ui)" }}>
                    Step 2
                  </p>
                  <h3 className="mt-1 text-base font-bold text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                    Desired backup time
                  </h3>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-[#edf7f1] p-1" role="group" aria-label="Desired backup time">
                  {[2, 4, 6].map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => {
                        setBackupHours(hours);
                        setHasCalculated(false);
                      }}
                      aria-pressed={backupHours === hours}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${backupHours === hours ? "bg-[#35A96B] text-white" : "text-[#298054] hover:bg-white"}`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 border border-[#cbd7e0] px-5 py-3 text-sm font-bold text-[#4c6477] transition-colors hover:border-[#35A96B] hover:text-[#278d58]"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                type="button"
                onClick={() => setHasCalculated(true)}
                className="inline-flex items-center justify-center gap-2 bg-[#35A96B] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-[#278d58] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "var(--font-ui)" }}
                disabled={totalWatts === 0}
              >
                <Calculator size={15} /> Calculate my system
              </button>
            </div>
          </div>

          <aside className="self-start border border-[#dfe7ee] bg-[#eef8f2] p-5 sm:p-6" aria-live="polite">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#298054]" style={{ fontFamily: "var(--font-ui)" }}>
              Your estimate
            </p>
            {!hasCalculated ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#35A96B]">
                  <Gauge size={25} strokeWidth={1.6} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                  Your recommendation will appear here
                </h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-[#607d6b]">
                  Add at least one appliance, then select “Calculate my system”.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                <div className="border border-[#cce8d6] bg-white p-4">
                  <div className="flex items-center gap-3 text-[#35A96B]">
                    <Zap size={18} />
                    <span className="text-xs font-bold uppercase tracking-[0.1em]">Recommended inverter</span>
                  </div>
                  <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                    {recommendedKva} kVA
                  </p>
                  <p className="mt-1 text-xs text-[#60758a]">For an estimated {formatWatts(peakWatts)} peak demand</p>
                </div>
                <div className="border border-[#cce8d6] bg-white p-4">
                  <div className="flex items-center gap-3 text-[#35A96B]">
                    <BatteryCharging size={18} />
                    <span className="text-xs font-bold uppercase tracking-[0.1em]">Battery starting point</span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold tracking-[-0.03em] text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                    48V · {batteryModules * 100}Ah
                  </p>
                  <p className="mt-1 text-xs text-[#60758a]">Approx. for {backupHours} hours of backup</p>
                </div>
                <div className="flex gap-2 border-t border-[#cce8d6] pt-4 text-xs leading-relaxed text-[#607d6b]">
                  <Info size={15} className="mt-0.5 shrink-0 text-[#35A96B]" />
                  <p>This is an initial estimate. Our team will confirm appliance ratings, startup loads, solar input, and your usage pattern before installation.</p>
                </div>
              </div>
            )}
          </aside>
        </div>

        <div className="flex items-center gap-3 border-t border-[#dfe7ee] bg-white px-5 py-4 text-xs leading-relaxed text-[#60758a] sm:px-8">
          <SunMedium size={16} className="shrink-0 text-[#F0A20E]" />
          <p>Need a precise quote? <a href="#contact" onClick={() => onOpenChange(false)} className="font-bold text-[#298054] underline decoration-[#298054]/35 underline-offset-2 hover:text-[#1f6b46]">Talk to an IZY energy specialist.</a></p>
        </div>
      </DialogContent>
    </Dialog>
  );
}