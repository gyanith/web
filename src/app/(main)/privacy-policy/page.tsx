"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { garetBook, pixel, pressStart2P, unispace } from "@/fonts/fonts";
import Footer from "@/my_components/Footer";

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState("");
  const [selectedSection, setSelectedSection] = useState("introduction");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );

    document.querySelectorAll("section[id]").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`${garetBook.className} min-h-screen w-screen bg-[#070a10] text-white`}>
      {/* Hero Section */}
      <div className="relative h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh] flex items-center   lg:items-end lg:pb-15 justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-amber-700/20 to-transparent" />
      
        
        <motion.div
          className="relative z-10 text-center px-4 sm:px-6 "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`${pressStart2P.className} text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent`}>
            Privacy Policy
          </h1>
          <p className={`${garetBook.className} text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2`}>
            Your Data, Our Commitment to Transparency and Security
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Mobile Section Selector */}
        <div className="lg:hidden mb-6" suppressHydrationWarning>
          <div className="relative bg-gradient-to-br from-amber-900/20 to-amber-700/10 border-2 border-amber-500/50 p-5 backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all duration-300">
            <label className="block text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">
              Jump to Section
            </label>
            <Select value={selectedSection} onValueChange={setSelectedSection} >
              <SelectTrigger className="w-full bg-gray-900/80 border-2 border-amber-600/40 text-white h-12 active:outline-none focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-amber-500/60 transition-all duration-200 font-medium [&>span]:text-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-2 border-amber-600/40 backdrop-blur-md shadow-[0_0_25px_rgba(251,191,36,0.2)]">
                <SelectItem value="introduction" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Introduction</SelectItem>
                <SelectItem value="definitions" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Definitions</SelectItem>
                <SelectItem value="data-collection" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Data Collection</SelectItem>
                <SelectItem value="data-usage" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Use of Data</SelectItem>
                <SelectItem value="data-retention" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Data Retention</SelectItem>
                <SelectItem value="data-transfer" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Data Transfer</SelectItem>
                <SelectItem value="data-deletion" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Delete Your Data</SelectItem>
                <SelectItem value="disclosure" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Disclosure</SelectItem>
                <SelectItem value="security" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Security</SelectItem>
                <SelectItem value="children" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Children's Privacy</SelectItem>
                <SelectItem value="links" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">External Links</SelectItem>
                <SelectItem value="changes" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Policy Changes</SelectItem>
                <SelectItem value="contact" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Contact</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Table of Contents - Sidebar - Hidden on Mobile */}
          <motion.aside
            className="hidden lg:block lg:w-64 lg:sticky lg:top-24 self-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-gradient-to-br from-amber-900/10 to-amber-700/5 border border-amber-700/20 p-4 sm:p-6 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-amber-400">Table of Contents</h2>
              <nav className="space-y-2">
                {[
                  { id: "introduction", label: "Introduction" },
                  { id: "definitions", label: "Definitions" },
                  { id: "data-collection", label: "Data Collection" },
                  { id: "data-usage", label: "Use of Data" },
                  { id: "data-retention", label: "Data Retention" },
                  { id: "data-transfer", label: "Data Transfer" },
                  { id: "data-deletion", label: "Delete Your Data" },
                  { id: "disclosure", label: "Disclosure" },
                  { id: "security", label: "Security" },
                  { id: "children", label: "Children's Privacy" },
                  { id: "links", label: "External Links" },
                  { id: "changes", label: "Policy Changes" },
                  { id: "contact", label: "Contact" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full text-left px-3 py-2  transition-all duration-200 flex items-center gap-2 text-sm ${
                      activeSection === item.id
                        ? "bg-amber-600/20 text-amber-400 font-medium"
                        : "text-gray-400 hover:text-amber-300 hover:bg-amber-900/10"
                    }`}
                  >
                    <ChevronRight className={`w-4 h-4 transition-transform ${activeSection === item.id ? "rotate-90" : ""}`} />
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>
          </motion.aside>

          {/* Content */}
          <motion.div
            className="flex-1 prose prose-invert prose-amber max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/30  p-6 sm:p-8 md:p-10 lg:p-12 backdrop-blur-sm">
              
              {/* Introduction */}
              <section 
                id="introduction" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'introduction' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-amber-400">Welcome to our privacy policy!</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  <strong>Last updated:</strong> January 15, 2026
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.
                </p>
              </section>

              {/* Definitions */}
              <section 
                id="definitions" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'definitions' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Interpretation and Definitions</h2>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-amber-300">Interpretation</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-amber-300">Definitions</h3>
                <p className="text-gray-300 leading-relaxed mb-4">For the purposes of this Privacy Policy:</p>
                <ul className="space-y-4 text-gray-300">
                  <li>
                    <strong className="text-amber-200">Account</strong> means a unique account created for You to access our Service or parts of our Service.
                  </li>
                  <li>
                    <strong className="text-amber-200">Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
                  </li>
                  <li>
                    <strong className="text-amber-200">Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Gyanith, NIT Puducherry, Karaikal, Puducherry, India - 609609.
                  </li>
                  <li>
                    <strong className="text-amber-200">Cookies</strong> are small files that are placed on Your computer, mobile device or any other device by a website, containing the details of Your browsing history on that website among its many uses.
                  </li>
                  <li>
                    <strong className="text-amber-200">Country</strong> refers to: Puducherry, India
                  </li>
                  <li>
                    <strong className="text-amber-200">Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.
                  </li>
                  <li>
                    <strong className="text-amber-200">Personal Data</strong> is any information that relates to an identified or identifiable individual.
                  </li>
                  <li>
                    <strong className="text-amber-200">Service</strong> refers to the Website.
                  </li>
                  <li>
                    <strong className="text-amber-200">Service Provider</strong> means any natural or legal person who processes the data on behalf of the Company. It refers to third-party companies or individuals employed by the Company to facilitate the Service, to provide the Service on behalf of the Company, to perform services related to the Service or to assist the Company in analyzing how the Service is used.
                  </li>
                  <li>
                    <strong className="text-amber-200">Usage Data</strong> refers to data collected automatically, either generated by the use of the Service or from the Service infrastructure itself (for example, the duration of a page visit).
                  </li>
                  <li>
                    <strong className="text-amber-200">Website</strong> refers to Gyanith, accessible from{" "}
                    <a href="https://gyanith.org" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 underline">
                      https://gyanith.org
                    </a>
                  </li>
                  <li>
                    <strong className="text-amber-200">You</strong> means the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service, as applicable.
                  </li>
                </ul>
              </section>

              {/* Data Collection */}
              <section 
                id="data-collection" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'data-collection' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Collecting and Using Your Personal Data</h2>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-300">Types of Data Collected</h3>

                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-amber-200">Personal Data</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to:
                </p>
                <ul className="space-y-2 text-gray-300 mb-6">
                  <li>Email address</li>
                  <li>First name and last name</li>
                  <li>Phone number</li>
                  <li>Address, State, Province, ZIP/Postal code, City</li>
                  <li>Usage Data</li>
                </ul>

                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-amber-200">Usage Data</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Usage Data is collected automatically when using the Service.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  When You access the Service by or through a mobile device, We may collect certain information automatically, including, but not limited to, the type of mobile device You use, Your mobile device unique ID, the IP address of Your mobile device, Your mobile operating system, the type of mobile Internet browser You use, unique device identifiers and other diagnostic data.
                </p>
                <p className="text-gray-300 leading-relaxed mb-6">
                  We may also collect information that Your browser sends whenever You visit our Service or when You access the Service by or through a mobile device.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-amber-200">Tracking Technologies and Cookies</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We use Cookies and similar tracking technologies to track the activity on Our Service and store certain information. Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze Our Service. The technologies We use may include:
                </p>
                <ul className="space-y-4 text-gray-300 mb-4">
                  <li>
                    <strong className="text-amber-200">Cookies or Browser Cookies.</strong> A cookie is a small file placed on Your Device. You can instruct Your browser to refuse all Cookies or to indicate when a Cookie is being sent. However, if You do not accept Cookies, You may not be able to use some parts of our Service. Unless you have adjusted Your browser setting so that it will refuse Cookies, our Service may use Cookies.
                  </li>
                  <li>
                    <strong className="text-amber-200">Web Beacons.</strong> Certain sections of our Service and our emails may contain small electronic files known as web beacons (also referred to as clear gifs, pixel tags, and single-pixel gifs) that permit the Company, for example, to count users who have visited those pages or opened an email and for other related website statistics (for example, recording the popularity of a certain section and verifying system and server integrity).
                  </li>
                </ul>

                <p className="text-gray-300 leading-relaxed mb-4">
                  Cookies can be "Persistent" or "Session" Cookies. Persistent Cookies remain on Your personal computer or mobile device when You go offline, while Session Cookies are deleted as soon as You close Your web browser.
                </p>

                <p className="text-gray-300 leading-relaxed mb-4">
                  We use both Session and Persistent Cookies for the purposes set out below:
                </p>

                <ul className="space-y-4 text-gray-300 mb-4">
                  <li>
                    <div>
                      <strong className="text-amber-200">Necessary / Essential Cookies</strong>
                      <p className="mt-1">Type: Session Cookies</p>
                      <p>Administered by: Us</p>
                      <p>Purpose: These Cookies are essential to provide You with services available through the Website and to enable You to use some of its features. They help to authenticate users and prevent fraudulent use of user accounts. Without these Cookies, the services that You have asked for cannot be provided, and We only use these Cookies to provide You with those services.</p>
                    </div>
                  </li>
                  <li>
                    <div>
                      <strong className="text-amber-200">Cookies Policy / Notice Acceptance Cookies</strong>
                      <p className="mt-1">Type: Persistent Cookies</p>
                      <p>Administered by: Us</p>
                      <p>Purpose: These Cookies identify if users have accepted the use of cookies on the Website.</p>
                    </div>
                  </li>
                  <li>
                    <div>
                      <strong className="text-amber-200">Functionality Cookies</strong>
                      <p className="mt-1">Type: Persistent Cookies</p>
                      <p>Administered by: Us</p>
                      <p>Purpose: These Cookies allow us to remember choices You make when You use the Website, such as remembering your login details or language preference. The purpose of these Cookies is to provide You with a more personal experience and to avoid You having to re-enter your preferences every time You use the Website.</p>
                    </div>
                  </li>
                </ul>

                <p className="text-gray-300 leading-relaxed">
                  For more information about the cookies we use and your choices regarding cookies, please visit our Cookies Policy or the Cookies section of our Privacy Policy.
                </p>
              </section>

              {/* Use of Data */}
              <section 
                id="data-usage" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'data-usage' ? 'hidden lg:block' : 'block'}`}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-300">Use of Your Personal Data</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The Company may use Personal Data for the following purposes:
                </p>
                <ul className="space-y-4 text-gray-300 mb-4">
                  <li>
                    <strong className="text-amber-200">To provide and maintain our Service</strong>, including to monitor the usage of our Service.
                  </li>
                  <li>
                    <strong className="text-amber-200">To manage Your Account:</strong> to manage Your registration as a user of the Service. The Personal Data You provide can give You access to different functionalities of the Service that are available to You as a registered user.
                  </li>
                  <li>
                    <strong className="text-amber-200">For the performance of a contract:</strong> the development, compliance and undertaking of the purchase contract for the products, items or services You have purchased or of any other contract with Us through the Service.
                  </li>
                  <li>
                    <strong className="text-amber-200">To contact You:</strong> To contact You by email, telephone calls, SMS, or other equivalent forms of electronic communication, such as a mobile application's push notifications regarding updates or informative communications related to the functionalities, products or contracted services, including the security updates, when necessary or reasonable for their implementation.
                  </li>
                  <li>
                    <strong className="text-amber-200">To provide You</strong> with news, special offers and general information about other goods, services and events which we offer that are similar to those that you have already purchased or enquired about unless You have opted not to receive such information.
                  </li>
                  <li>
                    <strong className="text-amber-200">To manage Your requests:</strong> To attend and manage Your requests to Us.
                  </li>
                  <li>
                    <strong className="text-amber-200">For business transfers:</strong> We may use Your information to evaluate or conduct a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of Our assets, whether as a going concern or as part of bankruptcy, liquidation, or similar proceeding, in which Personal Data held by Us about our Service users is among the assets transferred.
                  </li>
                  <li>
                    <strong className="text-amber-200">For other purposes</strong>: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.
                  </li>
                </ul>

                <p className="text-gray-300 leading-relaxed mb-4">
                  We may share Your personal information in the following situations:
                </p>
                <ul className="space-y-3 text-gray-300">
                  <li>
                    <strong className="text-amber-200">With Service Providers:</strong> We may share Your personal information with Service Providers to monitor and analyze the use of our Service, to contact You.
                  </li>
                  <li>
                    <strong className="text-amber-200">For business transfers:</strong> We may share or transfer Your personal information in connection with, or during negotiations of, any merger, sale of Company assets, financing, or acquisition of all or a portion of Our business to another company.
                  </li>
                  <li>
                    <strong className="text-amber-200">With Affiliates:</strong> We may share Your information with Our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include Our parent company and any other subsidiaries, joint venture partners or other companies that We control or that are under common control with Us.
                  </li>
                  <li>
                    <strong className="text-amber-200">With business partners:</strong> We may share Your information with Our business partners to offer You certain products, services or promotions.
                  </li>
                  <li>
                    <strong className="text-amber-200">With other users:</strong> when You share personal information or otherwise interact in the public areas with other users, such information may be viewed by all users and may be publicly distributed outside.
                  </li>
                  <li>
                    <strong className="text-amber-200">With Your consent</strong>: We may disclose Your personal information for any other purpose with Your consent.
                  </li>
                </ul>
              </section>

              {/* Data Retention */}
              <section 
                id="data-retention" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'data-retention' ? 'hidden lg:block' : 'block'}`}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-300">Retention of Your Personal Data</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The Company will retain Your Personal Data only for as long as is necessary for the purposes set out in this Privacy Policy. We will retain and use Your Personal Data to the extent necessary to comply with our legal obligations (for example, if we are required to retain your data to comply with applicable laws), resolve disputes, and enforce our legal agreements and policies.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  The Company will also retain Usage Data for internal analysis purposes. Usage Data is generally retained for a shorter period of time, except when this data is used to strengthen the security or to improve the functionality of Our Service, or We are legally obligated to retain this data for longer time periods.
                </p>
              </section>

              {/* Data Transfer */}
              <section 
                id="data-transfer" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'data-transfer' ? 'hidden lg:block' : 'block'}`}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-300">Transfer of Your Personal Data</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Your information, including Personal Data, is processed at the Company's operating offices and in any other places where the parties involved in the processing are located. It means that this information may be transferred to — and maintained on — computers located outside of Your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from Your jurisdiction.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Your consent to this Privacy Policy followed by Your submission of such information represents Your agreement to that transfer.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  The Company will take all steps reasonably necessary to ensure that Your data is treated securely and in accordance with this Privacy Policy and no transfer of Your Personal Data will take place to an organization or a country unless there are adequate controls in place including the security of Your data and other personal information.
                </p>
              </section>

              {/* Delete Data */}
              <section 
                id="data-deletion" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'data-deletion' ? 'hidden lg:block' : 'block'}`}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-300">Delete Your Personal Data</h3>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You have the right to delete or request that We assist in deleting the Personal Data that We have collected about You.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our Service may give You the ability to delete certain information about You from within the Service.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You may update, amend, or delete Your information at any time by signing in to Your Account, if you have one, and visiting the account settings section that allows you to manage Your personal information. You may also contact Us to request access to, correct, or delete any personal information that You have provided to Us.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Please note, however, that We may need to retain certain information when we have a legal obligation or lawful basis to do so.
                </p>
              </section>

              {/* Disclosure */}
              <section 
                id="disclosure" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'disclosure' ? 'hidden lg:block' : 'block'}`}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-300">Disclosure of Your Personal Data</h3>
                
                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-amber-200">Business Transactions</h4>
                <p className="text-gray-300 leading-relaxed mb-6">
                  If the Company is involved in a merger, acquisition or asset sale, Your Personal Data may be transferred. We will provide notice before Your Personal Data is transferred and becomes subject to a different Privacy Policy.
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-amber-200">Law enforcement</h4>
                <p className="text-gray-300 leading-relaxed mb-6">
                  Under certain circumstances, the Company may be required to disclose Your Personal Data if required to do so by law or in response to valid requests by public authorities (e.g. a court or a government agency).
                </p>

                <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-amber-200">Other legal requirements</h4>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The Company may disclose Your Personal Data in the good faith belief that such action is necessary to:
                </p>
                <ul className="space-y-2 text-gray-300">
                  <li>Comply with a legal obligation</li>
                  <li>Protect and defend the rights or property of the Company</li>
                  <li>Prevent or investigate possible wrongdoing in connection with the Service</li>
                  <li>Protect the personal safety of Users of the Service or the public</li>
                  <li>Protect against legal liability</li>
                </ul>
              </section>

              {/* Security */}
              <section 
                id="security" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'security' ? 'hidden lg:block' : 'block'}`}
              >
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-amber-300">Security of Your Personal Data</h3>
                <p className="text-gray-300 leading-relaxed">
                  The security of Your Personal Data is important to Us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While We strive to use commercially acceptable means to protect Your Personal Data, We cannot guarantee its absolute security.
                </p>
              </section>

              {/* Children's Privacy */}
              <section 
                id="children" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'children' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-amber-400">Children's Privacy</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our Service does not address anyone under the age of 13. We do not knowingly collect personally identifiable information from anyone under the age of 13. If You are a parent or guardian and You are aware that Your child has provided Us with Personal Data, please contact Us. If We become aware that We have collected Personal Data from anyone under the age of 13 without verification of parental consent, We take steps to remove that information from Our servers.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  If We need to rely on consent as a legal basis for processing Your information and Your country requires consent from a parent, We may require Your parent's consent before We collect and use that information.
                </p>
              </section>

              {/* Links to Other Websites */}
              <section 
                id="links" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'links' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-amber-400">Links to Other Websites</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our Service may contain links to other websites that are not operated by Us. If You click on a third party link, You will be directed to that third party's site. We strongly advise You to review the Privacy Policy of every site You visit.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We have no control over and assume no responsibility for the content, privacy policies or practices of any third party sites or services.
                </p>
              </section>

              {/* Changes to Privacy Policy */}
              <section 
                id="changes" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'changes' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-amber-400">Changes to this Privacy Policy</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
                </p>
              </section>

              {/* Contact */}
              <section 
                id="contact" 
                className={`scroll-mt-24 ${selectedSection !== 'contact' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-amber-400">Contact Us</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about this Privacy Policy, You can contact us:
                </p>
                <ul className="text-gray-300">
                  <li>
                    By email:{" "}
                    <a href="mailto:gyanithwebteamnitpy@gmail.com" className="text-amber-400 hover:text-amber-300 underline">
                     gyanith@nitpy.ac.in
                    </a>
                  </li>
                </ul>
              </section>

            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
