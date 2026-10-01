import { ArrowLeft, Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
const members = [
  {
    name: "Deepak Kumar",
    email: "deep997398@gmail.com",
    phone: "+91 99739 87089",
  },
  {
    name: "Mainak Mishra",
    email: "mainakmishra00@gmail.com",
    phone: "+91 7908272014",
  },
  {
    name: "Abhayjit Singh Gulati",
    email: "singhabhayjit07@gmail.com",
    phone: "+91 96200 01934",
  },
];
export function Contact() {
  return (
    <div className="contact-page-new">
      <a href="#contact-content" className="skip-link">
        Skip to content
      </a>
      <header>
        <Link to="/" className="wordmark">
          <span className="brand-mark" />
          equinox<span className="wordmark-period">.</span>
        </Link>
        <Link to="/" className="text-link">
          <ArrowLeft size={16} /> Back home
        </Link>
      </header>
      <main id="contact-content" tabIndex={-1}>
        <p className="eyebrow">Get in touch</p>
        <h1>
          Let’s talk<span className="heading-dot">.</span>
        </h1>
        <p>
          Have a question or something we should hear? Reach out to our team.
        </p>
        <div className="contact-list">
          {members.map((member) => (
            <article key={member.email}>
              <strong>{member.name}</strong>
              <div className="contact-methods">
                <a href={`mailto:${member.email}`}>
                  <Mail size={16} /> {member.email}
                </a>
                <a href={`tel:${member.phone.replace(/\s/g, "")}`}>
                  <Phone size={16} /> {member.phone}
                </a>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
