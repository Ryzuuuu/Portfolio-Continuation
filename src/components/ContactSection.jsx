import { Github, Linkedin, Mail, MoveUpRight } from "lucide-react";
import { profileShape, sectionShape } from "../lib/propTypes.js";
import { ContactForm } from "./ContactForm.jsx";
import { Reveal } from "./Reveal.jsx";
import { SectionKicker } from "./SectionKicker.jsx";

export function ContactSection({ section, profile }) {
  return (
    <section className="contact section-pad" id={section.id} aria-labelledby="contact-title">
      <SectionKicker section={section} />
      <div className="contact__grid">
        <Reveal className="contact__copy">
          <p className="eyebrow">
            <span className="eyebrow__line" /> HAVE A HARD PROBLEM?
          </p>
          <h2 id="contact-title">
            Let&apos;s make
            <br />
            something
            <br />
            <em>matter.</em>
          </h2>
          <p className="contact__sub">
            I’m looking for hard problems and a team that ships. If you’re building something
            ambitious, let’s talk.
          </p>
          <a className="contact__email" href={`mailto:${profile.email}`}>
            {profile.email} <MoveUpRight size={16} aria-hidden="true" />
          </a>
          <div className="social-links">
            <a
              href={profile.social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub profile (opens in a new tab)"
            >
              <Github size={18} aria-hidden="true" />
            </a>
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn profile (opens in a new tab)"
            >
              <Linkedin size={18} aria-hidden="true" />
            </a>
            <a href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`}>
              <Mail size={18} aria-hidden="true" />
            </a>
          </div>
        </Reveal>
        <Reveal className="contact__form-wrap" delay={100}>
          <ContactForm />
        </Reveal>
      </div>
    </section>
  );
}

ContactSection.propTypes = {
  section: sectionShape.isRequired,
  profile: profileShape.isRequired,
};
