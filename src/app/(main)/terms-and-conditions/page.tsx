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
import { garetBook, pressStart2P } from "@/fonts/fonts";
import Footer from "@/my_components/Footer";

export default function TermsAndConditions() {
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
      <div className="relative h-[35vh] sm:h-[40vh] md:h-[45vh] lg:h-[50vh]  flex items-center lg:items-end lg:pb-10  justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-amber-700/20 to-transparent" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5" />
        
        <motion.div
          className="relative z-10 text-center lg:text-left px-4 sm:px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={`${pressStart2P.className} text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3  sm:mb-4 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600 bg-clip-text text-transparent`}>
            Terms <br/> and <br/> Conditions
          </h1>
          <p className={` ${garetBook.className} text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-2`}>
            Please read these terms carefully before using our service
          </p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {/* Mobile Section Selector */}
        <div className="lg:hidden mb-6" suppressHydrationWarning>
          <div className="relative bg-gradient-to-br from-amber-900/20 to-amber-700/10 border-2 border-amber-500/50  p-5 backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.15)] hover:shadow-[0_0_30px_rgba(251,191,36,0.25)] transition-all duration-300">
            <label className="block text-sm font-bold text-amber-400 mb-3 uppercase tracking-wider">
              Jump to Section
            </label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full bg-gray-900/80 border-2 border-amber-600/40 text-white h-12 active:outline-none focus:outline-none shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] hover:border-amber-500/60 transition-all duration-200 font-medium [&>span]:text-shadow-[0_0_10px_rgba(251,191,36,0.3)]">
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900/95 border-2 border-amber-600/40 backdrop-blur-md shadow-[0_0_25px_rgba(251,191,36,0.2)]">
                <SelectItem value="introduction" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Introduction</SelectItem>
                <SelectItem value="definitions" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Definitions</SelectItem>
                <SelectItem value="acknowledgment" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Acknowledgment</SelectItem>
                <SelectItem value="links" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">External Links</SelectItem>
                <SelectItem value="termination" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Termination</SelectItem>
                <SelectItem value="liability" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Limitation of Liability</SelectItem>
                <SelectItem value="disclaimer" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Disclaimer</SelectItem>
                <SelectItem value="governing-law" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Governing Law</SelectItem>
                <SelectItem value="disputes" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Disputes Resolution</SelectItem>
                <SelectItem value="eu-users" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">EU Users</SelectItem>
                <SelectItem value="us-compliance" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">US Compliance</SelectItem>
                <SelectItem value="severability" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Severability & Waiver</SelectItem>
                <SelectItem value="translation" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Translation</SelectItem>
                <SelectItem value="changes" className="text-white hover:bg-amber-500/20 focus:bg-amber-500/30 cursor-pointer">Changes to Terms</SelectItem>
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
            <div className="bg-gradient-to-br from-amber-900/10 to-amber-700/5 border border-amber-700/20  p-4 sm:p-6 backdrop-blur-sm">
              <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-amber-400">Table of Contents</h2>
              <nav className="space-y-2">
                {[
                  { id: "introduction", label: "Introduction" },
                  { id: "definitions", label: "Definitions" },
                  { id: "acknowledgment", label: "Acknowledgment" },
                  { id: "links", label: "External Links" },
                  { id: "termination", label: "Termination" },
                  { id: "liability", label: "Limitation of Liability" },
                  { id: "disclaimer", label: "Disclaimer" },
                  { id: "governing-law", label: "Governing Law" },
                  { id: "disputes", label: "Disputes Resolution" },
                  { id: "eu-users", label: "EU Users" },
                  { id: "us-compliance", label: "US Compliance" },
                  { id: "severability", label: "Severability & Waiver" },
                  { id: "translation", label: "Translation" },
                  { id: "changes", label: "Changes to Terms" },
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
                <p className="text-gray-300 leading-relaxed mb-4">
                  <em>Last updated: January 15, 2026</em>
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Please read these terms and conditions carefully before using Our Service.
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
                <p className="text-gray-300 leading-relaxed mb-4">For the purposes of these Terms and Conditions:</p>
                <ul className="space-y-4 text-gray-300">
                  <li>
                    <strong className="text-amber-200">Affiliate</strong> means an entity that controls, is controlled by or is under common control with a party, where "control" means ownership of 50% or more of the shares, equity interest or other securities entitled to vote for election of directors or other managing authority.
                  </li>
                  <li>
                    <strong className="text-amber-200">Country</strong> refers to: Puducherry, India
                  </li>
                  <li>
                    <strong className="text-amber-200">Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to Gyanith.
                  </li>
                  <li>
                    <strong className="text-amber-200">Device</strong> means any device that can access the Service such as a computer, a cellphone or a digital tablet.
                  </li>
                  <li>
                    <strong className="text-amber-200">Service</strong> refers to the Website.
                  </li>
                  <li>
                    <strong className="text-amber-200">Terms and Conditions</strong> (also referred as "Terms") mean these Terms and Conditions that form the entire agreement between You and the Company regarding the use of the Service.
                  </li>
                  <li>
                    <strong className="text-amber-200">Third-party Social Media Service</strong> means any services or content (including data, information, products or services) provided by a third-party that may be displayed, included or made available by the Service.
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

              {/* Acknowledgment */}
              <section 
                id="acknowledgment" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'acknowledgment' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Acknowledgment</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  These are the Terms and Conditions governing the use of this Service and the agreement that operates between You and the Company. These Terms and Conditions set out the rights and obligations of all users regarding the use of the Service.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Your access to and use of the Service is conditioned on Your acceptance of and compliance with these Terms and Conditions. These Terms and Conditions apply to all visitors, users and others who access or use the Service.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  By accessing or using the Service You agree to be bound by these Terms and Conditions. If You disagree with any part of these Terms and Conditions then You may not access the Service.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  You represent that you are over the age of 18. The Company does not permit those under 18 to use the Service.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Your access to and use of the Service is also conditioned on Your acceptance of and compliance with the Privacy Policy of the Company. Our Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your personal information when You use the Application or the Website and tells You about Your privacy rights and how the law protects You. Please read Our{" "}
                  <Link href="/privacy-policy" className="text-amber-400 hover:text-amber-300 underline">
                    Privacy Policy
                  </Link>{" "}
                  carefully before using Our Service.
                </p>
              </section>

              {/* Links to Other Websites */}
              <section 
                id="links" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'links' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Links to Other Websites</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Our Service may contain links to third-party web sites or services that are not owned or controlled by the Company.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The Company has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that the Company shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods or services available on or through any such web sites or services.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  We strongly advise You to read the terms and conditions and privacy policies of any third party web sites or services that You visit.
                </p>
              </section>

              {/* Termination */}
              <section 
                id="termination" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'termination' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Termination</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We may terminate or suspend Your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if You breach these Terms and Conditions.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Upon termination, Your right to use the Service will cease immediately.
                </p>
              </section>

              {/* Limitation of Liability */}
              <section 
                id="liability" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'liability' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Limitation of Liability</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Notwithstanding any damages that You might incur, the entire liability of the Company and any of its suppliers under any provision of this Terms and Your exclusive remedy for all of the foregoing shall be limited to the amount actually paid by You through the Service or 100 USD if You haven't purchased anything through the Service.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  To the maximum extent permitted by applicable law, in no event shall the Company or its suppliers be liable for any special, incidental, indirect, or consequential damages whatsoever (including, but not limited to, damages for loss of profits, loss of data or other information, for business interruption, for personal injury, loss of privacy arising out of or in any way related to the use of or inability to use the Service, third-party software and/or third-party hardware used with the Service, or otherwise in connection with any provision of this Terms), even if the Company or any supplier has been advised of the possibility of such damages and even if the remedy fails of its essential purpose.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Some states do not allow the exclusion of implied warranties or limitation of liability for incidental or consequential damages, which means that some of the above limitations may not apply. In these states, each party's liability will be limited to the greatest extent permitted by law.
                </p>
              </section>

              {/* Disclaimer */}
              <section 
                id="disclaimer" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'disclaimer' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">"AS IS" and "AS AVAILABLE" Disclaimer</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  The Service is provided to You "AS IS" and "AS AVAILABLE" and with all faults and defects without warranty of any kind. To the maximum extent permitted under applicable law, the Company, on its own behalf and on behalf of its Affiliates and its and their respective licensors and service providers, expressly disclaims all warranties, whether express, implied, statutory or otherwise, with respect to the Service, including all implied warranties of merchantability, fitness for a particular purpose, title and non-infringement, and warranties that may arise out of course of dealing, course of performance, usage or trade practice. Without limitation to the foregoing, the Company provides no warranty or undertaking, and makes no representation of any kind that the Service will meet Your requirements, achieve any intended results, be compatible or work with any other software, applications, systems or services, operate without interruption, meet any performance or reliability standards or be error free or that any errors or defects can or will be corrected.
                </p>
                <p className="text-gray-300 leading-relaxed mb-4">
                  Without limiting the foregoing, neither the Company nor any of the company's provider makes any representation or warranty of any kind, express or implied: (i) as to the operation or availability of the Service, or the information, content, and materials or products included thereon; (ii) that the Service will be uninterrupted or error-free; (iii) as to the accuracy, reliability, or currency of any information or content provided through the Service; or (iv) that the Service, its servers, the content, or e-mails sent from or on behalf of the Company are free of viruses, scripts, trojan horses, worms, malware, timebombs or other harmful components.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  Some jurisdictions do not allow the exclusion of certain types of warranties or limitations on applicable statutory rights of a consumer, so some or all of the above exclusions and limitations may not apply to You. But in such a case the exclusions and limitations set forth in this section shall be applied to the greatest extent enforceable under applicable law.
                </p>
              </section>

              {/* Governing Law */}
              <section 
                id="governing-law" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'governing-law' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Governing Law</h2>
                <p className="text-gray-300 leading-relaxed">
                  The laws of the Country, excluding its conflicts of law rules, shall govern this Terms and Your use of the Service. Your use of the Application may also be subject to other local, state, national, or international laws.
                </p>
              </section>

              {/* Disputes Resolution */}
              <section 
                id="disputes" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'disputes' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Disputes Resolution</h2>
                <p className="text-gray-300 leading-relaxed">
                  If You have any concern or dispute about the Service, You agree to first try to resolve the dispute informally by contacting the Company.
                </p>
              </section>

              {/* EU Users */}
              <section 
                id="eu-users" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'eu-users' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">For European Union (EU) Users</h2>
                <p className="text-gray-300 leading-relaxed">
                  If You are a European Union consumer, you will benefit from any mandatory provisions of the law of the country in which you are resident in.
                </p>
              </section>

              {/* US Compliance */}
              <section 
                id="us-compliance" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'us-compliance' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">United States Legal Compliance</h2>
                <p className="text-gray-300 leading-relaxed">
                  You represent and warrant that (i) You are not located in a country that is subject to the United States government embargo, or that has been designated by the United States government as a "terrorist supporting" country, and (ii) You are not listed on any United States government list of prohibited or restricted parties.
                </p>
              </section>

              {/* Severability and Waiver */}
              <section 
                id="severability" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'severability' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Severability and Waiver</h2>
                
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-amber-300">Severability</h3>
                <p className="text-gray-300 leading-relaxed mb-6">
                  If any provision of these Terms is held to be unenforceable or invalid, such provision will be changed and interpreted to accomplish the objectives of such provision to the greatest extent possible under applicable law and the remaining provisions will continue in full force and effect.
                </p>

                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-amber-300">Waiver</h3>
                <p className="text-gray-300 leading-relaxed">
                  Except as provided herein, the failure to exercise a right or to require performance of an obligation under these Terms shall not effect a party's ability to exercise such right or require such performance at any time thereafter nor shall the waiver of a breach constitute a waiver of any subsequent breach.
                </p>
              </section>

              {/* Translation */}
              <section 
                id="translation" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'translation' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Translation Interpretation</h2>
                <p className="text-gray-300 leading-relaxed">
                  These Terms and Conditions may have been translated if We have made them available to You on our Service. You agree that the original English text shall prevail in the case of a dispute.
                </p>
              </section>

              {/* Changes to Terms */}
              <section 
                id="changes" 
                className={`mb-8 sm:mb-10 md:mb-12 scroll-mt-24 ${selectedSection !== 'changes' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Changes to These Terms and Conditions</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  We reserve the right, at Our sole discretion, to modify or replace these Terms at any time. If a revision is material We will make reasonable efforts to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at Our sole discretion.
                </p>
                <p className="text-gray-300 leading-relaxed">
                  By continuing to access or use Our Service after those revisions become effective, You agree to be bound by the revised terms. If You do not agree to the new terms, in whole or in part, please stop using the website and the Service.
                </p>
              </section>

              {/* Contact */}
              <section 
                id="contact" 
                className={`scroll-mt-24 ${selectedSection !== 'contact' ? 'hidden lg:block' : 'block'}`}
              >
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-5 md:mb-6 text-amber-400">Contact Us</h2>
                <p className="text-gray-300 leading-relaxed mb-4">
                  If you have any questions about these Terms and Conditions, You can contact us:
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
