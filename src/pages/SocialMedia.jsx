import { useEffect, useRef, useState } from "react";
import { useStaggerReveal } from "../design-system/animation.js";
import MastheadImage from "../design-system/components/MastheadImage";
import SplitIntro from "../design-system/components/SplitIntro";
import MediaObject from "../design-system/components/MediaObject";
import Card from "../design-system/components/Card.jsx";

const examples = [
    {
      heading: "McDonald’s: Iconic Brand, Iconic Moments",
      src: "/images/social-media-mcdonalds.jpg",
      alt: "Telly Award trophies",
      slug: "#",
    },
    {
      heading: "Toyota: Unwavering Fandom",
      src: "/images/social-media-toyota.jpg",
      alt: "Shorty Award trophy",
      slug: "#",
    },
    {
      heading: "Smart & Final: We Put the Sizzle in the Supermarket",
      src: "/images/social-media-smart-and-final.jpg",
      alt: "Silver and bronze One Show Pencil awards",
      slug: "#",
    },
  ];

export default function SocialMedia({ className = "mx-2 lg:mx-8" }) {
    const gridRef = useRef(null);

    // Note the ref goes on the inner grid, NOT the <section> — the section also
    // contains the HeadingReveal, which runs its own reveal and must not be
    // caught by the stagger's direct-child selector.
    useStaggerReveal(gridRef, { amount: 0.333 });

    return (
        <main
            className="flex min-h-screen flex-col gap-0 bg-surface-default light:bg-neutral-0 pb-1800 font-narrow font-light text-neutral-0 light:text-neutral-1000"
        >
            <section id="top">
                <MastheadImage src="/images/social-media-masthead.jpg" alt="Social Media" title={`Social \nMedia`} />
                <div className="px-2 lg:px-8">
                    <SplitIntro
                        gridClassName="lg:grid lg:grid-cols-12 lg:gap-400"
                        leftClassName="lg:pr-300 lg:col-span-6 lg:col-start-1"
                        rightClassName="lg:pr-600 lg:col-span-6 lg:col-start-7"
                        left={`For 15 years, Davis Elen has been at the forefront of social media — fluent in every platform that matters, from the rise of Facebook to the dominance of TikTok and everything in between. \n\nSocial is woven into each account we serve. Paid, organic, influencer, and social PR aren't add-ons, they're integral to our strategic approach.`}
                        right="As social consumption dominates and our agency continues to modernize, our paid social investments have tripled, driving demand for original creative that performs across every platform. From community management to thousands of UGC assets, from micro-influencers to celebrities and professional athletes — we build real third-party credibility, brand equity, and measurable ROI."
                    />
                </div>
            </section>
            <MediaObject
                titleSize="large"
                title="The Work Speaks for Itself"
                text="Five Shorty Award nominations, including the 2023 Shorty Impact Award and the 2026 Audience Honor in UGC. Not to mention the prestigious One Award for an original social docuseries created for McDonald's."
                imgSrc="/images/social-media-shorty-awards.jpg"
                imgAlt="Davis Elen Advertising has won a number of Shorty Awards"
            />
            <section id="social-media-examples" className="w-full px-2 pt-1000 text-left md:pt-3000 lg:px-8">
                <div ref={gridRef} className="grid gap-1000 md:grid-cols-3 lg:gap-8">
                    {examples.map((example) => (
                        <Card key={example.heading} {...example} headingItemProp="award" size="med" />
                    ))}
                </div>
            </section>
        </main>
    );
  }