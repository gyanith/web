"use client";

import LegalPageLayout from "@/components/LegalPageLayout";
import { unispace } from "@/fonts/fonts";

export default function TermsAndConditions() {
  return (
    <LegalPageLayout title="Terms & Conditions" lastUpdated="February 1, 2026">
      <section id="introduction" className="scroll-mt-24">
        <p>
          This document is an electronic record in accordance with the
          Information Technology Act, 2000 and applicable rules. It does not
          require physical or digital signatures.
        </p>
        <p>
          By accessing or using this website, you agree to be bound by these
          Terms and Conditions.
        </p>
      </section>

      <section id="eligibility">
        <h2 className={unispace.className}>Eligibility</h2>
        <p>
          You must be at least 18 years old and legally capable of entering into
          a binding contract under applicable Indian laws to use this Service.
          By using our platform, you represent and warrant that you meet these
          eligibility requirements.
        </p>
      </section>

      <section id="intellectual-property">
        <h2 className={unispace.className}>Intellectual Property</h2>
        <p>
          All content, trademarks, logos, designs, and intellectual property
          displayed on the Website are owned by the Company. No rights are
          granted except as expressly stated. You may not copy, reproduce, or
          distribute any content without prior written permission.
        </p>
      </section>

      <section id="usage">
        <h2 className={unispace.className}>Acceptable Use</h2>
        <p>
          You agree not to use the Service for unlawful activities, fraud,
          prohibited goods or services, or in violation of any applicable laws.
          You remain solely responsible for any content involving your account.
        </p>
      </section>

      <section id="termination">
        <h2 className={unispace.className}>Termination</h2>
        <p>
          We reserve the right to suspend or terminate access to the Service
          immediately for any breach of these Terms, without prior notice or
          liability.
        </p>
      </section>

      <section id="liability">
        <h2 className={unispace.className}>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, the Company shall not be
          liable for any indirect, incidental, special, consequential or
          punitive damages, or any loss of profits or revenues.
        </p>
      </section>

      <section id="governing-law">
        <h2 className={unispace.className}>Governing Law & Jurisdiction</h2>
        <p>
          These Terms shall be governed by the laws of India. Courts located in
          Puducherry shall have exclusive jurisdiction over any disputes arising
          out of or in relation to these Terms.
        </p>
      </section>

      <section id="contact">
        <h2 className={unispace.className}>Contact</h2>
        <p>
          For questions regarding these Terms, contact us at{" "}
          <a href="mailto:gyanith@nitpy.ac.in">gyanith@nitpy.ac.in</a>.
        </p>
      </section>

      <section id="legal-name">
        <h2 className={unispace.className}>Legal Entity</h2>
        <p>
          The transactions on this website are processed by Lokesh, an
          individual operating under the name Gyanith.
        </p>
      </section>
    </LegalPageLayout>
  );
}
