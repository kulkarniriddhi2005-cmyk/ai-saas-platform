// import { Link } from "react-router-dom";
// import { useAuth } from "../hooks/useAuth.js";

// export default function Home() {
//   const { isAuthenticated } = useAuth();

//   return (
//     <div>
//       <h1 className="page-title">Welcome to QuickAI</h1>
//       <p style={{ color: "var(--muted)", maxWidth: 560 }}>
//         Articles, resumes, summaries, blog titles, emails, background removal,
//         object-removal guidance, and image generation — in one workspace. Sign in
//         for the dashboard and tools.
//       </p>
//       <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
//         {isAuthenticated ? (
//           <Link to="/dashboard" className="btn btn-primary">
//             Go to dashboard
//           </Link>
//         ) : (
//           <Link to="/login" className="btn btn-primary">
//             Get started
//           </Link>
//         )}
//       </div>
//     </div>
//   );
// }
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth.js";

export default function Home() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const scrollToHash = () => {
      if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };

    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    return () => window.removeEventListener("hashchange", scrollToHash);
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setEmailMessage("");
    setEmailError("");

    const trimmed = email.trim();
    if (!trimmed) {
      setEmailError("Please enter your email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setEmailError(data?.message || "Subscription failed. Please try again.");
        return;
      }

      if (data?.duplicate) {
        setEmailMessage("You are already subscribed. ✅");
      } else {
        setEmailMessage("Thanks for subscribing! 🎉");
      }
      setEmail("");
    } catch (err) {
      console.error(err);
      setEmailError("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔥 Updated features + routes
  const features = [
    {
      title: "AI Article Writer",
      desc: "Generate high-quality, engaging articles on any topic using AI.",
      path: "/write",
    },
    {
      title: "Blog Title Generator",
      desc: "Find catchy and SEO-friendly titles instantly.",
      path: "/titles",
    },
    {
      title: "Email Writer", // ✅ changed
      desc: "Generate professional emails instantly using AI.",
      path: "/email",
    },
    {
      title: "Background Removal",
      desc: "Remove backgrounds from images effortlessly.",
      path: "/bg-remove",
    },
    {
      title: "Text Summary", // ✅ changed
      desc: "Summarize long content into short meaningful text.",
      path: "/summary",
    },
    {
      title: "Resume Reviewer",
      desc: "Improve your resume with AI feedback.",
      path: "/resume",
    },
    {
      title: "Voice to Text",
      desc: "Turn recordings or audio files into text with AI.",
      path: "/voice-to-text",
    },
    {
      title: "Text to Voice",
      desc: "Listen to any text with natural browser speech.",
      path: "/text-to-voice",
    },
    {
      title: "AI Code Generator",
      desc: "Describe what you need and get working code in your chosen stack.",
      path: "/code-generator",
    },
    {
      title: "Handwriting to Text",
      desc: "Snap a photo of notes and get clean, editable text.",
      path: "/handwriting-to-text",
    },
    {
      title: "Data & Chart Insights",
      desc: "Paste data or describe a chart for trends, caveats, and ideas.",
      path: "/data-insights",
    },
    {
      title: "AI Meme Generator",
      desc: "Top and bottom captions plus a fun preview image for your idea.",
      path: "/meme-generator",
    },
  ];

  // 🔥 Handle card click
  const handleClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <div>
      {/* 🔷 HERO SECTION */}
      <section className="hero" id="home">
        <nav className="navbar">
          <div className="logo">Quick.ai</div>

          <div className="home-nav-actions">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="btn btn-primary home-nav-primary">
                  Dashboard →
                </Link>
                <button
                  type="button"
                  className="btn btn-ghost home-nav-auth"
                  onClick={logout}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary home-nav-primary">
                  Get started →
                </Link>
                <Link to="/login" className="btn btn-ghost home-nav-auth">
                  Log in
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="hero-content">
          <h1>
            Create amazing content <br />
            with <span>AI tools</span>
          </h1>

          <p>
            Transform your content creation with our suite of premium AI tools.
            Write articles, generate emails, and enhance your workflow.
          </p>

          <div className="hero-buttons">
            <Link
              to={isAuthenticated ? "/dashboard" : "/login"}
              className="btn btn-primary"
            >
              Start creating now
            </Link>

            <button className="btn btn-secondary">Watch demo</button>
          </div>

          <div className="trusted">
            <span>⭐ Trusted by 10K+ users</span>
          </div>
        </div>
      </section>

      {/* 🔷 FEATURES SECTION */}
      <section className="features" id="powerful-ai-tools">
        <h2>Powerful AI Tools</h2>
        <p>
          Everything you need to create, enhance, and optimize your content
        </p>

        <div className="card-container">
          {features.map((item, index) => (
            <div
              className="card clickable"
              key={index}
              onClick={() => handleClick(item.path)}
            >
              <div className="icon">✨</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 🔷 FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div>
            <h3 className="footer-brand">Quick.ai</h3>
            <p className="footer-desc">
              Experience the power of AI with QuickAI. Transform your content creation
              with our suite of premium AI tools.
            </p>
          </div>

          <div>
            <h4 className="footer-heading">Company</h4>
            <div className="footer-links">
              <Link to="/#home">Home</Link>
              <Link to="/about-contact">About & Contact</Link>
              <Link to="/#powerful-ai-tools">Powerful AI Tools</Link>
            </div>
          </div>

          <div>
            <h4 className="footer-heading">Subscribe to our newsletter</h4>
            <p className="footer-desc">
              The latest news, articles, and resources, sent to your inbox weekly.
            </p>
            <form className="footer-subscribe" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="btn footer-subscribe-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {emailError && <p className="error-text">{emailError}</p>}
            {emailMessage && (
              <p className="footer-desc" style={{ marginTop: "0.5rem", color: "#4ade80" }}>
                {emailMessage}
              </p>
            )}
          </div>
        </div>
        <p className="footer-copy">Copyright 2025 © QuickAI. All Right Reserved.</p>
      </footer>
    </div>
  );
}