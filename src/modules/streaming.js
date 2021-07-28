$(document).on('ChromegleInit', function () {

    fetch("https://cdn.isaackogan.com/streaming")
       .then(response => response.json())
       .then(response => {

           let primaryDiv = $("<div class='streamerDiv'></div>").get(0)
           primaryDiv.id = "streamingDiv";

           let innerDiv = document.createElement("div");
           innerDiv.id = "innerStreamingDiv";

           // Hide if disabled
           chrome.storage.sync.get(
               {streamListEnabled: settings.defaultsNew.streamListEnabled},
               (result) => {if (!result.streamListEnabled) innerDiv.style.display = "none"}
           );

           for (let item of response) {

               let div = document.createElement("div")
               $(div).load(`chrome-extension://${appID}/src/injection/streaming.html`)
               div.style.marginBottom = "30px";

               setTimeout(() => {

                   let streamUser;
                   let streamTitle;

                   // Load Content
                   {
                       streamUser = div.getElementsByClassName("streamUser")[0]
                       streamUser.href = item["stream"]["url"]

                       let streamName = streamUser.childNodes[0]
                       streamName.textContent = item["member"]["name"] + " "

                       streamTitle = div.getElementsByClassName("streamTitle")[0]
                       streamTitle.innerHTML = ellipsesText(item["stream"]["name"], 22);

                       let streamPic = div.getElementsByClassName("profile")[0]
                       streamPic.src = item["member"]["avatar_url"]

                       innerDiv.appendChild(div)
                   }

                   // Dark Mode Changes
                   if (darkModeEnabled) {

                       let streamBox = div.getElementsByClassName("streamBox")[0]
                       streamBox.style.boxShadow = "none";
                       streamBox.style.backgroundColor = "#292a2d";

                       streamTitle.style.color = 'darkgray';
                       streamUser.style.color = 'whitesmoke';
                       streamUser.style.fontWeight = '600';
                   }

               }, 500)

           }

           primaryDiv.appendChild(innerDiv);
           $("body").get(0).appendChild(primaryDiv);

       })

});