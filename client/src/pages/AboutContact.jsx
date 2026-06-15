import { Link } from "react-router-dom";

export default function AboutContact() {
  return (
    <section className="about-contact-page">
      <div className="about-contact-card">
        <h1>About Quick.ai</h1>
        <p>
          Quick.ai is built to help creators, students, and teams produce better content
          in less time using practical AI tools.
        </p>
        <p>
          From article writing to summaries and resume reviews, our goal is to keep every
          workflow simple, fast, and reliable.
        </p>

        <h2>Contact Us</h2>
        <p>
          Need help or want to collaborate? Reach us at{" "}
          <a href="mailto:support@quick.ai">support@quick.ai</a>.
        </p>

        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
