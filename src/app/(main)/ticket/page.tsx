import Prism from "@/components/Prism";
import GlassSurface from "@/my_components/GlassSurface";

export default function TicketPage() {
  function handleBuy(tier: number) {
    console.log(tier);
  }

  return (
    <div className="w-screen relative h-screen flex items-end p-3 md:p-5 justify-center flex-col lg:flex-row gap-3 md:gap-5">
      <div className="w-full h-full absolute inset-0 rotate-180">
        <Prism
          animationType="3drotate"
          timeScale={0.5}
          height={4.1}
          baseWidth={10}
          scale={2}
          hueShift={-0.34}
          colorFrequency={2.15}
          noise={0}
          glow={0.75}
        />
      </div>

      <div className="w-1/3 h-2/3 bg-black/30 flex items-center justify-center border-white border backdrop-blur-2xl rounded-xl">
        <button className="text-white border border-white px-4 py-2 cursor-pointer hover:bg-white/30 rounded-lg">
          Buy Tier 1
        </button>
      </div>
      <div className="w-1/3 h-2/3 bg-black/30 flex items-center justify-center border-white border backdrop-blur-2xl rounded-xl">
        <button className="text-white border border-white px-4 py-2 cursor-pointer hover:bg-white/30 rounded-lg">
          Buy Tier 2
        </button>
      </div>
      <div className="w-1/3 h-2/3 bg-black/30 flex items-center justify-center border-white border backdrop-blur-2xl rounded-xl">
        <button className="text-white border border-white px-4 py-2 cursor-pointer hover:bg-white/30 rounded-lg">
          Buy Tier 3
        </button>
      </div>
    </div>
  );
}
