export type Proshow = {
    id: string;
    title: string;
    description: string;
    day: 1 | 2 | 3;
    image: string; // path or URL
    accentColor?: string; // optional per-show accent (default: #d4a574)
};

export const proshows: Proshow[] = [
    {
        id: "proshow-1",
        title: "ARTIST ONE",
        description:
            "An electrifying opening night performance that blends pulsating electronic beats with live instrumentation. Expect a sensory overload of lights, sound, and pure energy as Gyanith kicks off its most awaited event of the year.",
        day: 1,
        image: "/proshows/proshow1.jpg",
        accentColor: "#d4a574",
    },
    {
        id: "proshow-2",
        title: "ARTIST TWO",
        description:
            "A powerhouse mid-fest act that brings the crowd to its feet with a seamless fusion of Bollywood anthems and high-octane stage production. Night two promises to be an unforgettable spectacle.",
        day: 2,
        image: "/proshows/proshow2.jpg",
        accentColor: "#7dd4fc",
    },
    {
        id: "proshow-3",
        title: "ARTIST THREE",
        description:
            "The grand finale. A legendary headliner closes out Gyanith with an epic two-hour set spanning decades of music, confetti cannons, and a roaring crowd. The night you will not stop talking about.",
        day: 3,
        image: "/proshows/proshow3.jpg",
        accentColor: "#a78bfa",
    },
];
