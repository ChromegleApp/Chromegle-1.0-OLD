$(document).on('ChromegleInit', function () {

    // Create Buttons TODO change to jquery
    let buttonContainer = document.createElement("div");
    buttonContainer.classList.add("itemBar"); // Add class
    buttonContainer.style.marginLeft = 240 + settings.constants.baseButtonContainerMargin + "px"; // Set position
    [greetingButton, settingsButton].forEach((element) => buttonContainer.appendChild(element.get(0)));

    // Static item replacement
    $("#tagline").html('').append(buttonContainer);  // Add the button container
    $("canvas").replaceWith(homeButton); // Replace the home button
    $("img[src$='/static/standwithhk.jpeg']").replaceWith(discordButton); // Replace HK banner with Discord
    $("#mobilesitenote").html("Thanks for using Chromegle! Want to <a href=\"https://www.buymeacoffee.com/isaackogan\">support open source?</a> Consider donating to my college fund!"
    ).css("overflow", "hidden").css("width", "100%")
    $("#footer").css("display", "none")
    $("#sharebuttons").css("display", "none");
    $("a").css("color", settings.constants.linkColourCode);

    $(window).on('resize', function() {
        if ($(this).width() < 1024) {

            $(ononline).hide();

        } else {

            $(discordWidget).show();

        }

    });

});