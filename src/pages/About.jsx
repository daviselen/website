import NavBar from "../sections/NavBar.jsx";
import Footer from "../sections/Footer.jsx";

export default function About() {
  return (
    <div
      itemScope
      itemType="https://schema.org/Organization"
      className="min-h-screen bg-surface-default pb-1800 font-narrow font-light text-neutral-0 pt-2000"
    >
      <meta itemProp="name" content="Davis Elen Advertising" />
      <meta itemProp="url" content="https://daviselen.com" />
      <NavBar />
      <Footer />
    </div>
  );
}
