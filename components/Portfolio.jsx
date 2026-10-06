"use client";

import { Fragment, useEffect } from "react";
import { EMAIL, projects, services, socials, statements, chapterNames } from "@/lib/data";

function Statement({ no, text, highlight }) {
  const words = text.split(/\s+/);
  return (
    <div className="statement pad">
      <div className="statement-inner">
        <div className="chap-no">{no}</div>
        <p className="says">
          {words.map((w, i) => (
            <Fragment key={i}>
              <span className={highlight.includes(i) ? "w gold" : "w"}>{w}</span>{" "}
            </Fragment>
          ))}
        </p>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a10.9 10.9 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.95v5.66H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Portfolio() {
  useEffect(() => {
    let cleanup = null;
    let cancelled = false;
    // Three.js only runs in the browser, so it is loaded here.
    import("@/lib/experience").then((mod) => {
      if (!cancelled) cleanup = mod.startExperience();
    });
    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, []);

  return (
    <>
      <div id="intro" role="dialog" aria-label="Intro">
        <div className="intro-top">
          <span>Mantasha Noor</span>
          <span>Portfolio 2026</span>
        </div>
        <div className="intro-count" id="count">0</div>
        <div className="intro-bottom">
          <p style={{ color: "var(--muted)", maxWidth: "34ch" }}>
            A short scroll story about a developer who learns by building.
          </p>
          <div className="intro-choices" id="choices">
            <button className="pill solid" type="button">Enter</button>
          </div>
        </div>
      </div>

      <canvas id="gl" aria-hidden="true" />
      <div className="cursor" id="cur" />
      <div className="cursor-ring" id="curR" />
      <div className="grain" />

      <header className="top">
        <a className="logo" href="#top" data-go="0">MN<span>.</span></a>
        <div className="top-right">
          <a className="pill solid" href="#contact" data-go="4">Let&apos;s talk</a>
        </div>
      </header>

      <div className="rail" aria-hidden="true">
        <b id="chNo">01</b>
        <div className="rail-track"><i id="railFill" /></div>
        <span id="chName">Intro</span>
      </div>

      <nav className="chapters" id="chapNav" aria-label="Chapters">
        {chapterNames.map((name, i) => (
          <button key={name} type="button" data-go={i}>{name}</button>
        ))}
      </nav>

      <main>
        {/* 01 INTRO */}
        <section className="chapter hero pad" id="top" data-name="Intro">
          <div className="hero-inner">
            <p className="hero-kicker">Full Stack Developer (Intern) from Pakistan</p>
            <h1>
              <span className="line"><span>Mantasha</span></span>
              <span className="line"><span className="outline">Noor</span><span className="dot">.</span></span>
            </h1>
            <p className="lead">
              I&apos;m currently learning and improving my full-stack development skills through hands-on projects.
              Building responsive web applications with modern technologies while growing as a developer every day.
            </p>
            <div className="row">
              <a className="pill solid" href="#projects" data-go="2">View my work</a>
              <a className="pill" href={`mailto:${EMAIL}?subject=CV%20request`}>Download CV</a>
            </div>
            <div className="scroll-cue"><span>Scroll to begin</span><i /></div>
          </div>
        </section>

        {/* 02 ABOUT */}
        <section className="chapter" id="about" data-name="About">
          <Statement no="02" {...statements.about} />
          <div className="details pad">
            <div className="sheet">
              <h2>Get to know me</h2>
              <p className="sub" style={{ marginBottom: "1.4rem" }}>
                A passionate developer learning and building real projects every day
              </p>
              <div className="body">
                <p>I&apos;m Mantasha Noor, a BS Information Technology student and Full Stack Developer Intern from Pakistan. I&apos;m currently focused on learning and improving my full-stack development skills through hands-on project experience.</p>
                <p>My journey in development started with curiosity about how websites work, and it has grown into a passion for building responsive, user-friendly web applications. I believe in learning by doing, which is why I continuously work on real projects to strengthen my understanding of modern web technologies.</p>
                <p>Currently, I&apos;m expanding my expertise in the full stack — from crafting pixel-perfect frontends with React and Next.js to building robust backends with Node.js and Express, and managing data with MongoDB. Every project I build teaches me something new, and I&apos;m committed to continuous growth as a developer.</p>
              </div>
              <div className="facts">
                <div><small>Education</small><strong>BS Information Technology</strong></div>
                <div><small>Status</small><strong>Full Stack Developer Intern</strong></div>
                <div><small>Location</small><strong>Pakistan</strong></div>
                <div><small>Focus</small><strong>Learning &amp; Building Projects</strong></div>
              </div>
              <div className="tags">
                <span>Clean Code</span><span>Responsive Design</span><span>Continuous Learning</span><span>Problem Solving</span>
              </div>
            </div>
          </div>
        </section>

        {/* 03 PROJECTS */}
        <section className="chapter" id="projects" data-name="Projects">
          <Statement no="03" {...statements.projects} />
          <div className="details pad">
            <div className="sheet wide">
              <h2>Featured projects</h2>
              <p className="sub">Real projects I&apos;ve built while learning full-stack development. Each project represents hands-on practice with modern web technologies.</p>
              <div className="works">
                {projects.map((p) => (
                  <article className="work" key={p.name}>
                    <div>
                      <small>{p.type}</small>
                      <h3>{p.name}</h3>
                      <p>{p.desc}</p>
                      <div className="stack">{p.stack}</div>
                    </div>
                    <div className="work-links">
                      <a href={p.live} target="_blank" rel="noopener noreferrer">Live demo</a>
                      <a href={p.code} target="_blank" rel="noopener noreferrer">Code</a>
                    </div>
                  </article>
                ))}
              </div>
              <p className="sub" style={{ marginTop: "1.2rem" }}>More projects coming soon as I continue learning and building...</p>
              <div className="after">
                <a className="pill" href={socials.github} target="_blank" rel="noopener noreferrer">View all on GitHub</a>
                <a className="pill" href="https://my-assignments-web-site-lnu247i1g-mantasha-noor.vercel.app/" target="_blank" rel="noopener noreferrer">View more assignments</a>
              </div>
            </div>
          </div>
        </section>

        {/* 04 SERVICES */}
        <section className="chapter" id="services" data-name="Services">
          <Statement no="04" {...statements.services} />
          <div className="details pad">
            <div className="sheet wide">
              <h2>What I can build</h2>
              <p className="sub">As a developer intern, I&apos;m continuously expanding what I can create. These are the types of projects I&apos;m currently working on and learning to build.</p>
              <div className="abil">
                {services.map(([title, desc]) => (
                  <div key={title}>
                    <h3>{title}</h3>
                    <p>{desc}</p>
                  </div>
                ))}
              </div>
              <div className="aside">
                <b>Always learning</b>
                I&apos;m actively learning backend development, database design, and advanced frontend patterns. The services above represent what I can currently build and what I&apos;m working toward mastering through hands-on projects.
              </div>
            </div>
          </div>
        </section>

        {/* 05 CONTACT */}
        <section className="chapter" id="contact" data-name="Contact">
          <Statement no="05" {...statements.contact} />
          <div className="details pad">
            <div className="sheet wide">
              <h2>Let&apos;s build something amazing together!</h2>
              <div className="nums">
                <div><strong>3+</strong><small>Projects built</small></div>
                <div><strong>10+</strong><small>Technologies learning</small></div>
                <div><strong>Daily</strong><small>Continuous learning</small></div>
                <div><strong>Current</strong><small>Developer intern</small></div>
              </div>
              <div className="body">
                <p>I&apos;m actively looking for opportunities to learn, contribute, collaborate, and grow as a developer. Whether it&apos;s an internship, a learning opportunity, or a project to collaborate on — I&apos;m eager to apply my skills and continue building real-world applications.</p>
              </div>
              <div className="tags">
                <span>Code Collaboration</span><span>Open to Learn</span><span>Remote Friendly</span><span>Growth Mindset</span>
              </div>
              <a className="mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
              <div className="links">
                <a href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><GitHubIcon /></a>
                <a href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><LinkedInIcon /></a>
                <a href={socials.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" title="Instagram"><InstagramIcon /></a>
              </div>
              <div className="status"><i />Currently available for internships, junior positions, and collaboration opportunities</div>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>© 2026 Mantasha Noor. All rights reserved.</span>
        <span>Built with Next.js, React &amp; Three.js</span>
      </footer>
    </>
  );
}
