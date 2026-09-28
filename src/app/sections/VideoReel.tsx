import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

const reels = [
  {
    src: "/site-videos/work-reel-1.mp4",
    label: "Solar Installation",
    poster: "/site-images/project-commercial-solar.jpg",
  },
  {
    src: "/site-videos/work-reel-2.mp4",
    label: "Energy Systems",
    poster: "/site-images/project-power-unit.jpg",
  },
];

function VideoCard({ src, label, poster }: { src: string; label: string; poster: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); }
    else { v.pause(); setPlaying(false); }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden group"
    >
      <video
        ref={videoRef}
        src={src}
        muted
        playsInline
        loop
        preload="metadata"
        poster={poster}
        className="w-full h-64 lg:h-80 object-cover"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {/* Dark overlay */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ background: "rgba(4,22,39,0.45)", opacity: playing ? 0 : 1 }}
      />

      {/* Play / pause button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? `Pause ${label} video` : `Play ${label} video`}
          className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F0A20E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#041627]"
        >
          <motion.span
            animate={{ opacity: playing ? 0.2 : 1, scale: playing ? 0.88 : 1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/70 bg-white/10 backdrop-blur-sm"
          >
            {playing ? (
              <Pause size={22} className="text-white" />
            ) : (
              <Play size={22} className="ml-1 text-white" />
            )}
          </motion.span>
        </button>
      </div>

      {/* Label + mute */}
      <div className="absolute bottom-0 left-0 right-0 p-4 flex items-end justify-between">
        <span
          className="text-white text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: "var(--font-ui)" }}
        >
          {label}
        </span>
        <button
          onClick={toggleMute}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Toggle mute"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>
    </motion.div>
  );
}

export function VideoReel() {
  return (
    <section className="py-20 overflow-hidden" style={{ background: "#041627" }}>
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-px" style={{ background: "#F0A20E" }} />
              <span
                className="text-xs font-semibold tracking-widest uppercase"
                style={{ fontFamily: "var(--font-ui)", color: "#F0A20E" }}
              >
                In the Field
              </span>
            </div>
            <h2
              className="text-white"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                lineHeight: 1.1,
              }}
            >
              Watch Us Work
            </h2>
          </div>
          <p
            className="text-white/40 text-sm max-w-sm"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Real footage from our installation crews across Nigeria — solar, industrial wiring, and energy storage.
          </p>
        </motion.div>

        {/* Videos */}
        <div className="grid md:grid-cols-2 gap-4">
          {reels.map((r) => (
            <VideoCard key={r.src} src={r.src} label={r.label} poster={r.poster} />
          ))}
        </div>
      </div>
    </section>
  );
}
