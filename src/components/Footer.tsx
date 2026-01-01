import React from "react";
import localFont from "next/font/local";

const Footer = () => {
  return (
    <div className="flex w-screen min-h-[33vh] flex-col justify-center items-center bg-white">
      <div className="grid grid-cols-5 bg-black w-screen h-56">
        <div className="col-span-3 bg-pink-300  flex w-auto h-full">hello</div>
        <div className="col-span-2  flex w-auto h-full bg-green-300">
          {" "}
          hello
        </div>
      </div>
    </div>
  );
};

export default Footer;
