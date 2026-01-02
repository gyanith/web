import localFont from "next/font/local";

export const ledLight = localFont({
    src: [{
        path: "./LEDLIGHT.otf",
        weight: "400",
        style: "normal",
    }],
    variable: '--font-ledlight',
    display: "swap"
})

export const pressStart2P = localFont({
    src: [{
        path: "./PRESSSTART2P.ttf",
        weight: "400",
        style: "normal",
    }],
    variable: '--font-pressStart',
    display: "swap"
})

export const pixel = localFont({
    src: [{
        path: "./PIXEL.ttf",
        weight: "400",
        style: "normal",
    }],
    variable: '--font-pixel',
    display: "swap"
})