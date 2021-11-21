$(document).on('ChromegleInit', function () {

    // Create Buttons TODO change to jquery
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("itemBar"); // Add class
    buttonContainer.style.marginLeft = 240 + settings.constants.baseButtonContainerMargin + "px"; // Set position
    buttonContainer.appendChild(settingsButton.get(0));

    // Static item replacement
    $("#tagline").html('').append(buttonContainer);  // Add the button container
    $("canvas").replaceWith(homeButton); // Replace the home button
    $("img[src$='/static/standwithhk.jpeg']").replaceWith(discordButton); // Replace HK banner with Discord
    $("#mobilesitenote").html("Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source?</a> Consider donating to my college fund!"
    ).css("overflow", "hidden").css("width", "100%")
    $("#footer").css("display", "none")
    $("#sharebuttons").css("display", "none");
    $("a").css("color", settings.constants.linkColourCode);
    $("#intro").css("z-index", "5")


    let promoEnabled = false;
    let promo = document.createElement("promotion")
    $(promo).load(`chrome-extension://${appID}/src/injection/promo.html`).hide();
    $("html").get(0).appendChild(promo)


    chrome.storage.sync.get(
        {promotionHidden1: "false"}, (result) => {
            if (result["promotionHidden1"] === "false") {
                promoEnabled = true;
                if ($(this).width() < 1600) {$(promo).hide();
                } else { $(promo).show();}
            }
        }
    )

    $(document).on("PromoClicked", () => {
        chrome.storage.sync.set({promotionHidden1: "true"});
        $(promo).hide();
    });

    // Hide count if window is too small (prevent going over buttons)
    $(window).on('resize', function() {

        if ($(this).width() < 900) {$(newOmegleOnlineDiv).hide();
        } else {$(newOmegleOnlineDiv).show();}

        if ($(this).width() < 1600 && promoEnabled) {$(promo).hide();
        } else { $(promo).show();}

    });




});