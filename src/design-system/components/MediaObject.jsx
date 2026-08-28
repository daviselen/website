const cardVariants = {
    hidden: { 
      // Inset 100% from the bottom hides the card. 
      // Animating to 0% creates a top-to-bottom reveal.
      clipPath: "inset(0% 0% 100% 0%)",
    },
    visible: {
      clipPath: "inset(0% 0% 0% 0%)",
      transition: {
        duration: 26.153 / 30,
        ease: [0.8, 0, 0.2, 1], // Smooth custom cubic-bezier easing
      },
    },
};
  
export default function MediaObject({ orientation, title, text, imgSrc, imgAlt }) {
    return (
        <div className="grid grid-cols-12 gap-400 px-8">
            <div className="col-start-1 col-end-6 flex flex-col gap-600">
                <h2 className="font-display text-display-hiai uppercase">{title}</h2>
                <p className="text-pre-title pr-1000">{text}</p>
            </div>
            <img src={imgSrc} alt={imgAlt} className="col-start-6 col-end-13 rounded-md" />
        </div>
    );
};