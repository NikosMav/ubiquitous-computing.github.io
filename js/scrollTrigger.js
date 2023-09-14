$(document).ready(function() {
    $("[tr-scroll-toggle='component']").each(function (index) {
        // get elements
        let component = $(this);
        let lists = component.find("[tr-scroll-toggle='list']");
        // set item total
        let itemTotal = lists.first().children().length;
        component.find("[tr-scroll-toggle='number-total']").text(itemTotal);
        // create trigger divs & spacer
        let firstTrigger = component.find("[tr-scroll-toggle='trigger']").first();
        for (let i = 1; i < itemTotal; i++) {
        firstTrigger.clone().appendTo(component);
        }
        let triggers = component.find("[tr-scroll-toggle='trigger']");
        firstTrigger.css("margin-top", "-100vh");
        let trSpacer = $("<div class='tr-scroll-toggle-spacer' style='width: 100%; height: 100vh;'></div>").hide().appendTo(component);
        // check for min width
        let minWidth = 0;
        let trMinWidth = component.attr("tr-min-width");
        if (trMinWidth !== undefined && trMinWidth !== false) {
        minWidth = +trMinWidth;
        }
        // main breakpoint
        gsap.matchMedia().add(`(min-width: ${minWidth}px)`, () => {
        // show spacer
        trSpacer.show();
        // switch which item is active
        function makeItemActive(activeIndex) {
            component.find("[tr-scroll-toggle='transform-y']").css("transform", `translateY(${activeIndex * -100}%)`);
            component.find("[tr-scroll-toggle='transform-x']").css("transform", `translateX(${activeIndex * -100}%)`);
            component.find("[tr-scroll-toggle='number-current']").text(activeIndex + 1);
            lists.each(function (index) {
            $(this).children().removeClass("is-active");
            $(this).children().eq(activeIndex).addClass("is-active");
            });
        }
        makeItemActive(0);
        // scroll to trigger div on click of anchor
        let anchorLinks = component.find("[tr-anchors]").children();
        anchorLinks.on("click", function () {
            let myIndex = $(this).index();
            let scrollDistance = triggers.eq(myIndex).offset().top + triggers.eq(myIndex).height() - 1;
            $("html, body").animate({ scrollTop: scrollDistance });
        });
        // triggers timeline
        triggers.each(function (index) {
            let triggerIndex = index;
            let tl = gsap.timeline({
            scrollTrigger: {
                trigger: $(this),
                start: "top top",
                end: "bottom top",
                scrub: true,
                onToggle: ({ self, isActive }) => {
                if (isActive) {
                    makeItemActive(triggerIndex);
                }
                }
            },
            defaults: {
                ease: "none"
            }
            });
            lists.each(function () {
            let childItem = $(this).children().eq(triggerIndex);
            tl.to(childItem.find("[tr-item-animation='scale-to-1']"), { scale: 1 }, 0);
            tl.from(childItem.find("[tr-item-animation='scale-from-1']"), { scale: 1 }, 0);
            tl.to(childItem.find("[tr-item-animation='progress-horizontal']"), { width: "100%" }, 0);
            tl.to(childItem.find("[tr-item-animation='progress-vertical']"), { height: "100%" }, 0);
            tl.to(childItem.find("[tr-item-animation='rotate-to-0']"), { rotation: 0 }, 0);
            tl.from(childItem.find("[tr-item-animation='rotate-from-0']"), { rotation: 0 }, 0);
            });
        });
        // component timeline
        let tl = gsap.timeline({
            scrollTrigger: {
            trigger: component,
            start: "top top",
            end: "bottom bottom",
            scrub: true
            },
            defaults: {
            ease: "none"
            }
        });
        tl.to(component.find("[tr-section-animation='scale-to-1']"), { scale: 1 }, 0);
        tl.from(component.find("[tr-section-animation='scale-from-1']"), { scale: 1 }, 0);
        tl.to(component.find("[tr-section-animation='progress-horizontal']"), { width: "100%" }, 0);
        tl.to(component.find("[tr-section-animation='progress-vertical']"), { height: "100%" }, 0);
        tl.to(component.find("[tr-section-animation='rotate-to-0']"), { rotation: 0 }, 0);
        tl.from(component.find("[tr-section-animation='rotate-from-0']"), { rotation: 0 }, 0);
        // optional scroll snapping
        if (component.attr("tr-scroll-snap") === "true") {
            let tl2 = gsap.timeline({
            scrollTrigger: {
                trigger: component,
                start: "top top",
                end: "bottom bottom",
                snap: {
                snapTo: "labelsDirectional",
                duration: { min: 0.01, max: 0.2 },
                delay: 0.0001,
                ease: "power1.out"
                }
            }
            });
            triggers.each(function (index) {
            tl2.to($(this), { scale: 1, duration: 1 });
            tl2.addLabel("trigger" + index);
            });
        }
        // smaller screen sizes
        return () => {
            trSpacer.hide();
            component.find("[tr-scroll-toggle='transform-y']").css("transform", "translateY(0%)");
            component.find("[tr-scroll-toggle='transform-x']").css("transform", "translateX(0%)");
            lists.each(function (index) {
            $(this).children().removeClass("is-active");
            });
        };
        });
    });
});
