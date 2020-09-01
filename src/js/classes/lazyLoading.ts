function preloadImage(img: any) {
    const src = img.getAttribute("data-src");
    if (!src) {
        return;
    }
    img.src = src;
}

export default class LazyLoading {
    constructor() {
        const images = document.querySelectorAll("[data-src]");
        // console.log("images", images);
        const config = {
            rootMargin: "0px 0px 50px 0px",
            threshold: 0,
        };

        let observer = new IntersectionObserver(function (entries, self) {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // console.log(
                    //     //@ts-ignore
                    //     `Image ${entry.target.src} is in the viewport!`
                    // );
                    preloadImage(entry.target);
                    // Stop watching and load the image
                    self.unobserve(entry.target);
                }
            });
        }, config);

        images.forEach((image) => {
            observer.observe(image);
        });
    }
}
