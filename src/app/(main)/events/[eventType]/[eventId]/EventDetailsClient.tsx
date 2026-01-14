"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin, Trophy, Users, Wallet, ShoppingCart, ArrowRight } from "lucide-react";
import ShinyText from "@/my_components/ShinyText";
import { unispace, superRetro, blueScreen } from "@/fonts/fonts";
import Image from "next/image";

type EventDetailsClientProps = {
  eventData: any;
  eventType: string;
};

export default function EventDetailsClient({ eventData, eventType }: EventDetailsClientProps) {
  
  // Stagger animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="relative min-h-screen w-full text-[#d4a574]">
      
      {/* Background with overlaid gradient for depth (matches reference 'soft glow') */}
      <div className="absolute inset-0 z-0">
         <Image
            src={eventData.imageUrl || "/api/placeholder/1920/1080"}
            alt="Background"
            fill
            className="object-cover opacity-20 blur-2xl contrast-125"
         />
         <div className="absolute inset-0 bg-gradient-to-b from-[#070a10] via-[#070a10]/90 to-[#070a10]" />
      </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 lg:pt-48 pb-20">
        
        {/* HEADER SECTION - Hero Style */}
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-4 flex items-center justify-center flex-col"
        >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-[#d4a574]/30 bg-[#d4a574]/5 backdrop-blur text-sm font-medium tracking-widest uppercase mb-4">
                <motion.span 
                    className="w-2.5 h-2.5 bg-red-600"
                    animate={{ opacity: [1, 0.2, 1], boxShadow: ["0 0 15px #ff0000", "0 0 5px #aa0000", "0 0 15px #ff0000"] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                />
                {eventData.type || eventType} Event
            </div>
            
            <h1 className={`${superRetro.className} text-6xl md:text-8xl lg:text-9xl text-white leading-none tracking-tighter mix-blend-overlay opacity-90`}>
                {eventData.eventName}
            </h1>
            
            <p className="max-w-2xl mx-5 text-lg text-white/50 leading-relaxed font-light tracking-wide text-justify">
                {eventData.description}
            </p>

            {/* MAIN CTA - Shiny Button Style from EventCard */}
            <motion.div 
                className="pt-8 flex flex-col items-center justify-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
            >
                <div className="group relative">
                    <button 
                        className="relative flex items-center gap-3 bg-[#0a0a0a] border border-[#d4a574]/50 hover:bg-[#d4a574]/10 transition-all px-8 py-4 overflow-hidden group/btn cursor-pointer"
                        onClick={() => console.log("Add to cart (Combo)")}
                    >
                         <motion.div className="flex items-center gap-3 relative z-10">
                            <ShoppingCart className="w-5 h-5 text-[#d4a574]" />
                            <ShinyText 
                                text="Add to Cart" 
                                className={`text-xl ${unispace.className}`} 
                                color="#d4a574" 
                                shineColor="#ffffff" 
                                delay={1} 
                            />
                            <ArrowRight className="w-5 h-5 text-[#d4a574] group-hover/btn:translate-x-1 transition-transform" />
                         </motion.div>
                         
                         {/* Button shine effect */}
                         <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "200%" }}
                            transition={{ duration: 0.3 }}
                        />
                    </button>
                    
                </div>
                <p className="text-xs text-center text-white/30 uppercase tracking-widest border-b border-[#d4a574]/20 pb-0.5">
                    *Exclusive to Combos
                </p>
            </motion.div>
        </motion.div>


        {/* BENTO GRID - Reference Style */}
        <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6"
        >
            
            {/* 1. Date Card (Large Square) */}
            <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors">
                <div className="space-y-2 mb-6">
                    <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574]">
                        <Calendar className="w-8 h-8" />
                    </div>
                </div>
                <div>
                     <h3 className="text-white/40 text-sm uppercase tracking-wider font-semibold mb-1">When</h3>
                     <p className={`text-3xl text-white ${blueScreen.className}`}>{eventData.date || "TBA"}</p>
                     <p className="text-[#d4a574] text-sm mt-1">Day {eventData.day || "1"}</p>
                </div>
            </motion.div>

            {/* 2. Fee Card (Wide) */}
            <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors bg-gradient-to-br from-black/20 to-[#d4a574]/5">
                 <div className="flex justify-between items-start mb-6">
                    <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574]">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <span className="px-3 py-1 border border-[#d4a574]/20 text-[#d4a574] text-xs uppercase font-bold tracking-widest">
                        Best Value
                    </span>
                 </div>
                 <div>
                     <h3 className="text-white/40 text-sm uppercase tracking-wider font-semibold mb-1">Entry Fee</h3>
                     <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">₹{eventData.fee}</span>
                        <span className="text-white/30 text-sm">/person</span>
                     </div>
                 </div>
            </motion.div>

            {/* 3. Prize Card (Vertical) */}
             <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-4 lg:row-span-2 bg-[#d4a574] p-8 flex flex-col justify-between relative overflow-hidden group">
                 <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.5'/%3E%3C/svg%3E")` }} />
                 <div className="relative z-10 text-black">
                     <div className="flex justify-between items-start mb-10">
                         <div className="p-3 w-fit bg-black/10">
                            <Trophy className="w-10 h-10" />
                         </div>
                         <ArrowRight className="-rotate-45 w-8 h-8 opacity-50 group-hover:rotate-0 transition-transform" />
                     </div>
                     <div>
                         <h3 className="text-black/60 text-sm uppercase tracking-wider font-bold mb-2">Grand Prize Pool</h3>
                         <p className={`text-6xl font-black tracking-tighter ${unispace.className}`}>₹{eventData.prize_pool}</p>
                         <p className="mt-4 text-black/70 font-medium">Win big in this {eventData.type} showdown. Top 3 teams take home layout prizes.</p>
                     </div>
                 </div>
                 {/* Decorative Circle removed */}
                 
            </motion.div>

            {/* 4. Location Card (Small) */}
             <motion.div variants={itemVariants} className="md:col-span-3 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors">
                 <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574] mb-6">
                    <MapPin className="w-8 h-8" />
                 </div>
                 <div>
                     <h3 className="text-white/40 text-sm uppercase tracking-wider font-semibold mb-1">Where</h3>
                     <p className="text-xl text-white font-medium">{eventData.location || "TBA"}</p>
                 </div>
            </motion.div>

             {/* 5. Coordinators Card (Wide) */}
             <motion.div variants={itemVariants} className="md:col-span-6 lg:col-span-4 bg-black/20 backdrop-blur-md border border-[#d4a574]/20 p-5 md:p-8 flex flex-col justify-between group transition-colors">
                  <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 w-fit bg-[#d4a574]/10 text-[#d4a574]">
                            <Users className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl text-white font-medium">Coordinators</h3>
                  </div>
                  <div className="space-y-4">
                        {eventData.coordinators && eventData.coordinators.map((name: string, i: number) => (
                            <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                                <span className="text-white/70">{name}</span>
                                <span className="text-xs px-2 py-1 bg-white/5 text-white/30">Contact</span>
                            </div>
                        ))}
                  </div>
            </motion.div>

        </motion.div>

      </div>
    </div>
  );
}
