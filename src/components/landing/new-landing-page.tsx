export function NewLandingPage() {
  return <section>
    <video autoPlay loop muted width="360" height="528" className="absolute top-[20rem] right-[20%]">
      <source src="/girl-animation.webm" type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div className="grid place-items-center space-y-10 z-10 m-[20%] sm:m-[15%] md:m-[10%]">
      <h1 className="stroked-text font-crimson text-center text-4xl sm:text-5xl lg:text-7xl font-black max-w-4xl">
        Search and track your favorite anime
      </h1>
      <h2 className="stroked-text text-center text-xl md:text-2xl font-black">
        Explore a vast collection of anime, manga, and more.
      </h2>
      <div className="input-field-bg flex border border-[#847858] p-2 space-x-2 rounded-lg inline-block max-w-xl w-full">
        <input className="bg-inherit font-geist text-neutral-700 w-full placeholder:text-neutral-700 outline-none focus:outline-none" placeholder="Search for anime, manga..." />
        <button className="font-crimson input-btn-bg p-1 px-3 border border-[#847858] rounded-lg">Search</button>
      </div>
    </div>
  </section>;
}
