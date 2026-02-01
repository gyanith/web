"use client";

import LegalPageLayout from "@/components/LegalPageLayout";
import { unispace } from "@/fonts/fonts";

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout title="Privacy Policy" lastUpdated="January 15, 2026">
      <section id="introduction">
        <p>
          By using this Service, you expressly consent to the collection,
          processing, storage, and sharing of your Personal Data in accordance
          with this Privacy Policy.
        </p>
      </section>

      <section id="data-collection">
        <h2 className={unispace.className}>Data We Collect</h2>
        <p>
          We may collect Personal Data including name, email, phone number,
          usage data, and sensitive personal data only when legally required.
          This data is essential for providing you with a seamless experience
          across our platform.
        </p>
      </section>

      <section id="data-use">
        <h2 className={unispace.className}>Use of Data</h2>
        <p>
          Personal Data is used to operate, maintain, secure, and improve our
          services. We use this information to personalize your experience,
          process transactions, and comply with legal obligations under
          applicable laws.
        </p>
      </section>

      <section id="data-sharing">
        <h2 className={unispace.className}>Disclosure of Data</h2>
        <p>
          We prioritize your privacy. However, we may share your data with
          trusted service providers, banks, payment processors, or regulatory
          authorities strictly when required by law or to facilitate the
          services you have requested.
        </p>
      </section>

      <section id="data-rights">
        <h2 className={unispace.className}>Your Rights</h2>
        <p>
          You have the right to access, update, or request deletion of your
          personal data. We enable you to manage your information directly
          through your account settings or by contacting our support team,
          subject to legal requirements.
        </p>
      </section>

      <section id="security">
        <h2 className={unispace.className}>Security</h2>
        <p>
          We implement robust, industry-standard security practices, including
          data encryption and secure server environments. However, please note
          that no system is completely impenetrable, and we cannot guarantee
          absolute security.
        </p>
      </section>

      <section id="jurisdiction">
        <h2 className={unispace.className}>Governing Law</h2>
        <p>
          This Privacy Policy shall be governed by and construed in accordance
          with the laws of India. Any disputes arising under this policy shall
          be subject to the exclusive jurisdiction of the courts.
        </p>
      </section>

      <section id="contact">
        <h2 className={unispace.className}>Grievance & Contact</h2>
        <p>
          For privacy-related concerns, grievances, or questions regarding this
          policy, please contact us at{" "}
          <a href="mailto:gyanith@nitpy.ac.in">gyanith@nitpy.ac.in</a>.
        </p>
      </section>
    </LegalPageLayout>
  );
}
