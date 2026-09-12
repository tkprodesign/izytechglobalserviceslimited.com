import { useMemo, useState } from "react";
import { ArrowRight, BatteryCharging, Calculator, Gauge, Info, Minus, Plus, RotateCcw, SunMedium, Zap } from "lucide-react";
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
  description: string;
};

type InverterCalculatorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const appliances: Appliance[] = [
  { id: "light-bulbs", name: "Light bulbs", watts: 10, description: "LED bulb" },
  { id: "television", name: "Television", watts: 120, description: "LED TV" },
  { id: "phones", name: "Phones", watts: 10, description: "Charging phones" },
  { id: "laptops", name: "Laptops", watts: 65, description: "Laptop charger" },
  { id: "decoder", name: "Decoder", watts: 25, description: "Cable / TV decoder" },
  { id: "freezer", name: "Freezer", watts: 180, description: "Chest freezer" },
  { id: "blender", name: "Blender", watts: 500, description: "Kitchen blender" },
  { id: "iron-microwave", name: "Iron or microwave", watts: 1_000, description: "High-load appliance" },
  { id: "juice-mixer", name: "Juice mixer / grinder", watts: 500, description: "Kitchen grinder" },
  { id: "air-conditioner", name: "Air conditioner", watts: 1_200, description: "Small split unit" },
  { id: "gaming-console", name: "Gaming console", watts: 200, description: "Console and screen" },
  { id: "music-system", name: "Music system", watts: 150, description: "Home audio system" },
];

const inverterSizes = [1, 1.5, 2, 3, 5, 8, 10];
const defaultQuantities = Object.fromEntries(appliances.map(appliance => [appliance.id, 0]));
const defaultWattages = Object.fromEntries(appliances.map(appliance => [appliance.id, ""]));

function formatWatts(watts: number) {
  return watts >= 1_000 ? `${(watts / 1_000).toFixed(watts % 1_000 === 0 ? 0 : 1)}kW` : `${watts}W`;
}

export function InverterCalculator({ open, onOpenChange }: InverterCalculatorProps) {
  const [quantities, setQuantities] = useState<Record<string, number>>(defaultQuantities);
  const [wattages, setWattages] = useState<Record<string, string>>(defaultWattages);
  const [customWatts, setCustomWatts] = useState("");
  const [backupHours, setBackupHours] = useState(4);
  const [showBackupHelp, setShowBackupHelp] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);

  const customLoadWatts = Math.max(0, Number(customWatts) || 0);
  const totalWatts = useMemo(
    () => appliances.reduce((total, appliance) => {
      const enteredWatts = Number(wattages[appliance.id]);
      const wattsPerItem = Number.isFinite(enteredWatts) && enteredWatts > 0 ? enteredWatts : appliance.watts;
      return total + wattsPerItem * (quantities[appliance.id] ?? 0);
    }, 0) + customLoadWatts,
    [quantities, wattages, customLoadWatts],
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

  const updateWattage = (id: string, value: string) => {
    setWattages(current => ({ ...current, [id]: value }));
    setHasCalculated(false);
  };

  const reset = () => {
    setQuantities(defaultQuantities);
    setWattages(defaultWattages);
    setCustomWatts("");
    setBackupHours(4);
    setShowBackupHelp(false);
    setHasCalculated(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        side="right"
        className="max-h-screen overflow-hidden border-[#15334b] bg-[#f8fafc] text-[#041627] sm:!max-w-[780px]"
        aria-describedby="inverter-calculator-description"
      >
        <DialogHeader className="shrink-0 border-b border-white/10 bg-[#041627] px-6 pb-7 pt-8 text-left sm:px-10">
          <div className="flex items-start gap-4 pr-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[#4BC47A]/15 text-[#63D58D]">
              <Calculator size={22} strokeWidth={1.8} />
            </div>
            <div>
              <DialogTitle
                className="text-2xl font-extrabold tracking-[-0.03em] text-white sm:text-3xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Inverter Calculator
              </DialogTitle>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#71D897]" style={{ fontFamily: "var(--font-ui)" }}>
                Find a starting point for your backup system
              </p>
            </div>
          </div>
          <DialogDescription id="inverter-calculator-description" className="mt-6 max-w-xl text-sm leading-relaxed text-white/60">
            Select the appliances you want to run at the same time. Enter the wattage for each item when you know it, then we’ll estimate a starting inverter and battery size.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="px-6 py-8 sm:px-10 sm:py-10">
            <div className="mb-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#60758a]" style={{ fontFamily: "var(--font-ui)" }}>
                Step 1
              </p>
              <h3 className="mt-2 text-2xl font-bold tracking-[-0.025em]" style={{ fontFamily: "var(--font-display)" }}>
                What do you need to power?
              </h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#60758a]">
                Add the quantity for each appliance, then type the actual wattage from its label when you know it. The typical rating shown below each item is only a guide.
              </p>
            </div>

            <div className="mb-3 grid gap-2 px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#8a9aaa] sm:grid-cols-[minmax(0,1fr)_150px_108px]">
              <span>Equipment</span>
              <span className="sm:text-center">Wattage per item</span>
              <span className="sm:text-center">Quantity</span>
            </div>

            <div className="divide-y divide-[#e2e8ee] border border-[#dfe7ee] bg-white">
              {appliances.map(appliance => {
                const quantity = quantities[appliance.id] ?? 0;
                return (
                  <div key={appliance.id} className="grid items-center gap-4 px-5 py-5 sm:grid-cols-[minmax(0,1fr)_150px_108px]">
                    <div className="min-w-0">
                      <p className="text-sm font-bold uppercase tracking-[0.04em] text-[#173047]" style={{ fontFamily: "var(--font-ui)" }}>
                        {appliance.name}
                      </p>
                      <p className="mt-1 text-xs text-[#8a9aaa]">{appliance.description}</p>
                      <p className="mt-1 text-[11px] font-semibold text-[#35A96B]">Typical rating: {formatWatts(appliance.watts)}</p>
                    </div>

                    <label className="block">
                      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#60758a]">Enter watts</span>
                      <span className="flex items-center border-2 border-[#aebfca] bg-white shadow-sm transition-colors focus-within:border-[#35A96B] focus-within:ring-2 focus-within:ring-[#35A96B]/15">
                        <span className="sr-only">Wattage per {appliance.name}</span>
                      <input
                        type="number"
                        min="1"
                        max="50000"
                        step="1"
                        inputMode="numeric"
                        value={wattages[appliance.id]}
                        onChange={event => updateWattage(appliance.id, event.target.value)}
                        placeholder={`e.g. ${appliance.watts}`}
                        className="min-w-0 w-full bg-transparent px-3 py-3 text-sm font-semibold text-[#173047] outline-none placeholder:text-[#aebbc5]"
                        aria-label={`Wattage per ${appliance.name}`}
                      />
                      <span className="pr-3 text-xs font-bold text-[#60758a]">W</span>
                      </span>
                    </label>

                    <div className="flex items-center justify-start gap-2 sm:justify-center">
                      <button
                        type="button"
                        onClick={() => updateQuantity(appliance.id, -1)}
                        disabled={quantity === 0}
                        aria-label={`Remove one ${appliance.name}`}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#35A96B] text-white transition-colors hover:bg-[#278d58] disabled:cursor-not-allowed disabled:opacity-35"
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
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#35A96B] text-white transition-colors hover:bg-[#278d58] disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border border-[#dfe7ee] bg-white p-5 sm:p-6">
              <label htmlFor="custom-wattage" className="block text-sm font-bold uppercase tracking-[0.04em] text-[#173047]" style={{ fontFamily: "var(--font-ui)" }}>
                Other equipment or custom load
              </label>
              <p className="mt-1 text-xs leading-relaxed text-[#8a9aaa]">
                Add one extra wattage for equipment that is not listed above.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <input
                  id="custom-wattage"
                  type="number"
                  min="0"
                  max="50000"
                  step="1"
                  inputMode="numeric"
                  value={customWatts}
                  onChange={event => {
                    setCustomWatts(event.target.value);
                    setHasCalculated(false);
                  }}
                  placeholder="e.g. 750"
                  className="w-full border border-[#cbd7e0] bg-[#fbfcfd] px-3 py-3 text-sm text-[#173047] outline-none transition-colors placeholder:text-[#9aa9b5] focus:border-[#35A96B] focus:ring-2 focus:ring-[#35A96B]/15"
                  aria-describedby="custom-wattage-help"
                />
                <span className="shrink-0 text-sm font-bold text-[#60758a]">watts</span>
              </div>
              <p id="custom-wattage-help" className="mt-2 text-xs text-[#8a9aaa]">
                This extra load is added once to the estimated demand.
              </p>
            </div>

            <div className="mt-8 border border-[#dfe7ee] bg-white p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#60758a]" style={{ fontFamily: "var(--font-ui)" }}>
                    Step 2
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <h3 className="text-lg font-bold text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                      Desired backup time
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowBackupHelp(current => !current)}
                      aria-expanded={showBackupHelp}
                      aria-controls="backup-time-help"
                      aria-label="What does backup time mean?"
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-[#35A96B] text-[11px] font-extrabold text-[#298054] transition-colors hover:bg-[#35A96B] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#35A96B]/25"
                    >
                      ?
                    </button>
                  </div>
                </div>
                <div className="flex w-fit items-center gap-1 rounded-full bg-[#edf7f1] p-1" role="group" aria-label="Desired backup time">
                  {[2, 4, 6].map(hours => (
                    <button
                      key={hours}
                      type="button"
                      onClick={() => {
                        setBackupHours(hours);
                        setHasCalculated(false);
                      }}
                      aria-pressed={backupHours === hours}
                      className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${backupHours === hours ? "bg-[#35A96B] text-white" : "text-[#298054] hover:bg-white"}`}
                    >
                      {hours}h
                    </button>
                  ))}
                </div>
              </div>
              {showBackupHelp && (
                <div
                  id="backup-time-help"
                  role="note"
                  className="mt-4 flex gap-3 border-l-2 border-[#35A96B] bg-[#f5fbf7] px-4 py-3 text-xs leading-relaxed text-[#4d6c5a]"
                >
                  <Info size={15} className="mt-0.5 shrink-0 text-[#35A96B]" />
                  <p>
                    Backup time is how long your batteries should power the appliances you selected when grid or generator power is unavailable. Choosing more hours usually means a larger battery bank and a higher system cost.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 border border-[#cbd7e0] px-5 py-3.5 text-sm font-bold text-[#4c6477] transition-colors hover:border-[#35A96B] hover:text-[#278d58]"
                style={{ fontFamily: "var(--font-ui)" }}
              >
                <RotateCcw size={14} /> Reset
              </button>
              <button
                type="button"
                onClick={() => setHasCalculated(true)}
                className="inline-flex items-center justify-center gap-2 bg-[#35A96B] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#278d58] disabled:cursor-not-allowed disabled:opacity-50"
                style={{ fontFamily: "var(--font-ui)" }}
                disabled={totalWatts === 0}
              >
                <Calculator size={15} /> Calculate my system
              </button>
            </div>

            <div className="mt-8 border border-[#cce8d6] bg-[#eef8f2] p-5 sm:p-6" aria-live="polite">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#298054]" style={{ fontFamily: "var(--font-ui)" }}>
                Your estimate
              </p>
              {!hasCalculated ? (
                <div className="flex items-center gap-4 py-7">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-[#35A96B]">
                    <Gauge size={25} strokeWidth={1.6} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                      Your recommendation will appear here
                    </h3>
                    <p className="mt-1 max-w-xl text-sm leading-relaxed text-[#607d6b]">
                      Add at least one appliance, then select “Calculate my system”.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <div className="border border-[#cce8d6] bg-white p-5">
                    <div className="flex items-center gap-3 text-[#35A96B]">
                      <Zap size={18} />
                      <span className="text-xs font-bold uppercase tracking-[0.1em]">Recommended inverter</span>
                    </div>
                    <p className="mt-3 text-3xl font-extrabold tracking-[-0.04em] text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                      {recommendedKva} kVA
                    </p>
                    <p className="mt-1 text-xs text-[#60758a]">For an estimated {formatWatts(peakWatts)} peak demand</p>
                  </div>
                  <div className="border border-[#cce8d6] bg-white p-5">
                    <div className="flex items-center gap-3 text-[#35A96B]">
                      <BatteryCharging size={18} />
                      <span className="text-xs font-bold uppercase tracking-[0.1em]">Battery starting point</span>
                    </div>
                    <p className="mt-3 text-xl font-extrabold tracking-[-0.03em] text-[#173047]" style={{ fontFamily: "var(--font-display)" }}>
                      48V · {batteryModules * 100}Ah
                    </p>
                    <p className="mt-1 text-xs text-[#60758a]">Approx. for {backupHours} hours of backup</p>
                  </div>
                  <div className="flex gap-2 border-t border-[#cce8d6] pt-4 text-xs leading-relaxed text-[#607d6b] sm:col-span-2">
                    <Info size={15} className="mt-0.5 shrink-0 text-[#35A96B]" />
                    <p>This is an initial estimate. Our team will confirm appliance ratings, startup loads, solar input, and your usage pattern before installation.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-[#dfe7ee] bg-white px-6 py-5 sm:px-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <SunMedium size={18} className="mt-0.5 shrink-0 text-[#F0A20E]" />
              <div>
                <p className="text-sm font-bold text-[#173047]" style={{ fontFamily: "var(--font-ui)" }}>
                  Need a precise quote?
                </p>
                <p className="mt-1 max-w-md text-xs leading-relaxed text-[#60758a]">
                  Request a paid site assessment. Submit your site details and we’ll send the assessment charge and payment instructions before scheduling.
                </p>
              </div>
            </div>
            <a
              href="/?service=Solar%20Energy%20Systems#contact"
              onClick={() => onOpenChange(false)}
              className="inline-flex shrink-0 items-center justify-center gap-2 bg-[#041627] px-5 py-3 text-xs font-bold tracking-wider text-white transition-colors hover:bg-[#173047]"
              style={{ fontFamily: "var(--font-ui)" }}
            >
              REQUEST ASSESSMENT <ArrowRight size={14} />
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}