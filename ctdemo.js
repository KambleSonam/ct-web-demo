<!DOCTYPE html>
<html>
   <head>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <script type="text/javascript">
         var clevertap = {
             event: [],
             profile: [],
             account: [],
             onUserLogin: [],
             notifications: [],
             privacy: [],
             region: 'in1'
         };
         clevertap.privacy.push({ optOut: false }); //set the flag to true, if the user of the device opts out of sharing their data
         clevertap.privacy.push({ useIP: false }); //set the flag to true, if the user agrees to share their IP data
         // Update account for which you are testing 
         clevertap.account.push({ id: "ZWW-WWW-WW4Z" }); // in1 bearded robot
         //         clevertap.account.push({ id: "BR 4R4-5K9-475Z" }); // sk1 noc internal
         //         clevertap.account.push({ id: "R99-655-K75Z" }); // sk1-staging-7 Stranger testing 
         //            clevertap.account.push({ id: "WRK-485-456Z" }); // sk1 web testing
         //         clevertap.account.push({ id: "R99-655-K75Z" });    // sk1 web testing stranger 
         //         clevertap.account.push({ id: "WR5-Z98-W56Z" }); // sk1 qa champs
         //         clevertap.account.push({id: "W9R-486-4W5Z"}); // eu1 clevertapsample
         //         clevertap.account.push({id: "ZWW-WWW-WWRZ"}); // eu1 BR
         // 	    clevertap.account.push({id: "WW4-646-R66Z"}); // sk1 amee test
         // 	    clevertap.account.push({id: "ZWW-WWW-WW4Z"}); // aps3 BR
         // 	    clevertap.account.push({id: "6K5-587-466Z"}); // test akshat
         // 	    clevertap.account.push({id: "R76-WR4-576Z"}); // sk1 TEST WEB DEMO - under web testing
         // 	    clevertap.account.push({id: "R97-5R4-576Z"}); // sk1 WEB DEMO
         
         
         // 	    clevertap.onUserLogin.push({ 
         //       "Site": {
         //         "Name": "Sonam",                         // String
         //         "Identity": 610260622,                      // String or number
         //         "Email": "amee10Aug@test.com",               // Email address of the user
         //         "Phone": "+14159551234",                    // Phone (with the country code)
         //         "Gender": "F",                              // Can be either M or F
         //         // "DOB": new Date(),                          // Date of Birth. Javascript Date object
         //         // "Photo": 'www.foobar.com/image.jpeg',       // URL to the Image
         //         "Price": 69.99,
         //       }
         //     });
         
         (function () {
             var wzrk = document.createElement("script");
             wzrk.type = "text/javascript";
             wzrk.async = true;
             wzrk.src = ('https:' == document.location.protocol ? 'https://d2r1yp2w7bby2u.cloudfront.net' : 'http://static.clevertap.com') + '/js/a.js';
             //             wzrk.src = "https://cdn.jsdelivr.net/gh/CleverTap/clevertap-web-sdk@task/SDK-1596/track_campaign_stats/clevertap.js";
             //             wzrk.src= "./a.js"
             //             wzrk.src= "./amee-web-inbox.js"
             // 		wzrk.src = "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js";
             // 		wzrk.src = "https://cdn.jsdelivr.net/gh/CleverTap/clevertap-web-sdk@task/SDK-2041/web_inbox/clevertap.js"
             //             wzrk.src = "https://cdn.jsdelivr.net/gh/CleverTap/clevertap-web-sdk/clevertap.js";
             // 		wzrk.src = "https://d2r1yp2w7bby2u.cloudfront.net/js/clevertap.min.js";
             //             wzrk.src="https://cdn.jsdelivr.net/gh/CleverTap/clevertap-web-sdk@task/SDK-2521/popup_imageonly/clevertap.js";
             // 		wzrk.src = "https://cdn.jsdelivr.net/gh/CleverTap/clevertap-web-sdk@task/SDK-2301/sdkReleasev1.3.2/clevertap.js";
             var s = document.getElementsByTagName("script")[0];
             s.parentNode.insertBefore(wzrk, s);
         })();
         
         
         
         (function () {
             var test = document.createElement("script");
             test.type = "text/javascript";
             test.async = true;
             test.src = 'https://inspiring-brown-22b84d.netlify.app/test1.js';
             var s1 = document.getElementsByTagName("script")[0];
             s1.parentNode.insertBefore(test, s1);
         })();
         
         
         document.addEventListener("CT_web_personalization", function (e) {
             console.log('Yayy!!', e.detail);
         
         });
         //         window.addEventListener('load', (event) => {
         //              window.clevertap.onUserLogin.push({"Site": {"Email": "amee+sep22@clevertap.com"}})
         //              window.clevertap.event.push("Amee")
         //         });
         
         window.addEventListener('load', (event) => {
             const CT_DASHBOARD_URL = 'https://sk1-dashboard-staging-4.dashboard.clevertap.com'
             // 		const CT_DASHBOARD_URL = 'http://localhost:8083'
             window.addEventListener('message', function (event) {
         
                 if (event.origin === CT_DASHBOARD_URL && typeof (event.data) === "string") {
                     const notif = JSON.parse(event.data);
                     $WZRK_WR.tr(notif);
                 }
         
             }, false);
         
             console.log('in load', document.referrer, document.referrer === CT_DASHBOARD_URL + '/')
             if (document.referrer === CT_DASHBOARD_URL + '/') {
                 console.log('posting ... ')
                 window.opener.postMessage('previewReady', CT_DASHBOARD_URL);
             }
             console.log('Added event listener');
         });
         
         
         
      </script>
      <style>
         /* 	    web-inbox::part(inbox) {
         width: 600px !important;
         } */
         /* 	    web-inbox::part(inbox-message)::part(message) {
         background-color: red !important;
         } */
         /* 	    web-inbox {
         font-family: monospace;
         --inbox-width:400px;
         --inbox-height:300px;
         --inbox-position:absolute;
         --inbox-top:0px;
         --inbox-left:unset;
         --inbox-right:0px;
         --inbox-bottom:unset;
         } */
         #banner {
         height: 400px;
         width: 100%;
         background-color: antiquewhite;
         }
         #carousel {
         height: 400px;
         width: 100%;
         background-color: rgb(215, 250, 247);
         }
         .nav {
         height: 40px;
         background-color: #fefcfe;
         justify-content: end;
         align-items: center;
         display: flex;
         color: rgb(220, 43, 226);
         }
         .nav img,
         .nav span {
         height: 20px;
         margin-right: 30px;
         }
      </style>
   </head>
   <body>
      <div class="nav">
         <!-- <span id="bell-selector">Whats New</span> -->
         <img id="inbox"
            src="https://img.icons8.com/emoji/48/000000/bell-emoji.png" />
      </div>
      <script type="text/javascript">
         function pushprofile() {
             var id = makeid(5);
             clevertap.profile.push({
                 Site: {
                     Name: "User " + id, // User's name
                     Email: id + "@clevertap.com", // User's email
                     Phone: "+917710004770", // User's phone with country code
                     Gender: "aasd", // Can be either M or F
                     Employed: "Y", // Can be either Y or N
                     Education: "Graduate", // Can be either School, College or Graduate
                     Married: "Y", // Can be either Y or N
                     DOB: $WZRK_WR.setDate(20150501), // Set date in format yyyymmdd
                     Language: "Deutsche",
                     "MSG-email": true, // Disable email notifications
                     "MSG-push": true, // Enable push notifications
                     "MSG-sms": true // Enable sms notifications
                 }
             });
             console.log("pushprofile successful");
         }
         
         function pushbid() {
             clevertap.event.push("Place Bid");
             console.log("place bid");
         }
         
         function pushcharged() {
             clevertap.event.push("Charged", {
                 "Product name": "Casio Chronograph Watch",
                 ts: new Date()
             });
             console.log("push charged");
         }
         
         function pushProductSearched() {
             clevertap.event.push("Product Searched");
             console.log("push Product Searched");
         }
         
         function pushEventAddToCart() {
             clevertap.event.push("Added to Cart", {
                 "Product ID": "pr_57235721c9f9a1",
                 "product name": "Lamb Curry Cut1",
                 Price: 298,
                 Long_1: 6473329386,
                 Long_2: 2,
                 Currency: "INR"
             });
         }
         
         function clearLocalStorage() {
             localStorage.clear();
         }
         
         function makeid(length) {
             var text = "";
             var possible =
                 "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
         
             for (var i = 0; i < length; i++)
                 text += possible.charAt(
                     Math.floor(Math.random() * possible.length)
                 );
         
             return text;
         }
         
         function logout() {
             clevertap.logout();
         }
         
         function onClickOUL() {
             clevertap.onUserLogin.push({
                 Site: {
                     Email: `qw${Math.ceil(
                         Math.random() * 10002312
                     )}@gmail.com`
                     // Email: "799726789@gmail.com"
                 }
             });
             getLS();
         }
         
         function onClickOULSame() {
             let value = document.getElementById("constantOUL").value;
             clevertap.onUserLogin.push({
                 Site: {
                     // Email: `${Math.ceil(Math.random() * 100012)}@gmail.com`
                     Email: `${value}@gmail.com`
                 }
             });
             getLS();
         }
         
         function onClickOULIdentitySame() {
             let value = document.getElementById("constantOULIdentity").value;
             clevertap.onUserLogin.push({
                 Site: {
                     // Email: `${Math.ceil(Math.random() * 100012)}@gmail.com`
                     Identity: `${value}`
                 }
             });
             getLS();
         }
         
         function onClickPP() {
             clevertap.profile.push({
                 Site: {
                     Email: `as${Math.ceil(
                         Math.random() * 10002320
                     )}@gmail.com`
                 }
             });
             getLS();
         }
         
         function onClickPPSame() {
             let value = document.getElementById("constantPP").value;
             clevertap.profile.push({
                 Site: {
                     Email: `${value}@gmail.com`
                 }
             });
         }
         
         function onClickPPIdentitySame() {
             let value = document.getElementById("constantPPIdentity").value;
             clevertap.profile.push({
                 Site: {
                     Identity: `${value}`
                 }
             });
         }
         
         function onClickEP() {
             clevertap.event.push("Product Eaten");
             clevertap.event.push("Message Received");
             clevertap.event.push("Message Viewed");
             clevertap.event.push("Product add to cart");
             getLS();
         }
         
         function pushSelectedEvents() {
             var adc = document.getElementById("adc").checked;
             var ps = document.getElementById("ps").checked;
             var pv = document.getElementById("pv").checked;
             var amee = document.getElementById("amee").checked;
             var amee1 = document.getElementById("amee1").checked;
             var ameeatc = document.getElementById("amee-atc").checked;
         
             if (!adc && !ps && !pv && !amee && !amee1 && !ameeatc) {
                 alert("Select atleast one event");
                 return;
             }
             if (adc) clevertap.event.push("Added to Cart");
             if (ps) clevertap.event.push("Product Sold");
             if (pv) clevertap.event.push("Viewed");
             if (amee) clevertap.event.push("Amee");
             if (amee1) clevertap.event.push("Amee-01");
             if (ameeatc) clevertap.event.push("Added To Cart - Amee");
         
             document.getElementById("adc").checked = false;
             document.getElementById("ps").checked = false;
             document.getElementById("pv").checked = false;
             document.getElementById("amee").checked = false;
             document.getElementById("amee1").checked = false;
             document.getElementById("amee-atc").checked = false;
             getLS();
         }
         
         function getLS() {
             var LRU_CACHE = decodeURIComponent(localStorage["WZRK_X"]);
             var WZRK_K = decodeURIComponent(localStorage["WZRK_K"]);
             var WZRK_G = decodeURIComponent(localStorage["WZRK_G"]);
             var WZRK_EV = decodeURIComponent(localStorage["WZRK_EV"]);
             var WZRK_ARP = decodeURIComponent(localStorage["WZRK_ARP"]);
         
             var data = `<div>WZRK_K: ${WZRK_K}</div><br /><div>WZRK_G: ${WZRK_G}</div><br /><div>LRU_CAHCE: ${LRU_CACHE}</div><br /><div>WZRK_EV: ${WZRK_EV}</div><br /><div>WZRK_ARP: ${WZRK_ARP}</div>`;
         
             document.getElementById("lsData").innerHTML = data;
         }
         
         function clearLS() {
             localStorage.clear();
             getLS();
         }
         
         function getProfile() {
             var customerType = clevertap.profile.getAttribute("Customer type");
             console.log(customerType);
         }
         
         function enablePush() {
             clevertap.notifications.push({
                 "titleText": 'Wish to receive push notifications?',
                 "bodyText": 'Click Yes to receive push notifications',
                 "okButtonText": 'Yes',
                 "rejectButtonText": 'No',
                 "serviceWorkerPath": '/assets/js/sw.js'
             });
         }
         
         function enableSafariPush() {
             clevertap.notifications.push({
                 "apnsWebPushId": "web.come.amee.webpush.test", //only for safari browser
                 "apnsWebPushServiceUrl": "https://admin:Intermiles2021@hidden-lowlands-78580.herokuapp.com",//only for safari browser
                 "titleText": 'Wish to receive push notifications?',
                 "bodyText": 'Click Yes to receive push notifications',
                 "okButtonText": 'Yes',
                 "rejectButtonText": 'No',
                 "serviceWorkerPath": 'clevertap_sw.js'
             });
         }
         
         function requestPermForSafariWebPush() {
             if ('safari' in window && 'pushNotification' in window.safari) {
         
                 window.safari.pushNotification.requestPermission(
                     'https://hidden-lowlands-78580.herokuapp.com',
                     'web.come.amee.webpush.test', {}, function (subscription) {
                         console.log(subscription);
                         if (subscription.permission === 'granted') {
                             subscriptionInfoSafari = subscription;
                             safariToken = subscription.deviceToken;
                             sending(safariToken);
                             console.log('Yayy', safariToken);
                             // do not know what to do here
                             // updateSubscriptionOnServer(subscription);
                         }
                         else if (subscription.permission === 'denied') {
                             // TODO:
                             console.log('Permission denied');
                         }
                     });
         
             } else {
                 alert("Push notifications not supported.");
             }
         }
         
         //         clevertap.onUserLogin.push({
         //              "Site": {
         //                "Name": "JP",            // String
         //                "Identity": 6,              // String or number
         //                "Email": "ja@gmail.com",         // Email address of the user
         //                "Phone": "+14155551234",           // Phone (with the country code)
         //                "Gender": "M",                     // Can be either M or F
         //                "DOB": new Date(),                 // Date of Birth. Date object
         //             // optional fields. controls whether the user will be sent email, push etc.
         //                "MSG-email": false,                // Disable email notifications
         //                "MSG-push": true,                  // Enable push notifications
         //                "MSG-sms": true,                   // Enable sms notifications
         //                "MSG-whatsapp": true,              // Enable WhatsApp notifications
         //              }
         //         })
         
      </script>
      <link rel="stylesheet" href="style.css" />
      <h1>CT Web Channel Test - in1 BR a.js</h1>
      <button onclick="onClickPP()">Random PP</button>
      <button onclick="onClickOUL()">Random OUL</button>
      <button onclick="onClickEP()">Event Push</button>
      <hr />
      <br />
      <p>On User Login</p>
      <input type="text" id="constantOUL" class="textInput" /><input
         type="text" value="@gmail.com" class="textInput" />
      <button onclick="onClickOULSame()" class="inputBtn">OUL</button>
      <br />
      <hr />
      <p>On User Login Identity</p>
      <input type="text" id="constantOULIdentity" class="textInput" />
      <button onclick="onClickOULIdentitySame()" class="inputBtn">OUL Identity</button>
      <br />
      <hr />
      <p>Profile Push</p>
      <input type="text" id="constantPP" class="textInput" /><input
         type="text" value="@gmail.com" class="textInput" />
      <button onclick="onClickPPSame()" class="inputBtn">PP</button>
      <hr />
      <p>PP Identity</p>
      <input type="text" id="constantPPIdentity" class="textInput" />
      <button onclick="onClickPPIdentitySame()" class="inputBtn">PP Identity</button>
      <br />
      <hr />
      <input type="checkbox" name="event" value="adc" id="adc" /> Added to
      Cart <br />
      <input type="checkbox" name="event" value="ps" id="ps" /> Product Sold
      <br />
      <input type="checkbox" name="event" value="pv" id="pv" /> Viewed
      <br />
      <input type="checkbox" name="event" value="amee" id="amee" /> Amee
      <br />
      <input type="checkbox" name="event" value="amee1" id="amee1" /> Amee-01
      <br />
      <input type="checkbox" name="event" value="amee-atc" id="amee-atc" />
      Added To Cart - Amee
      <br />
      <button id="eventPushSelect" onclick="pushSelectedEvents()">
      Push Selected Events
      </button>
      <button id="enablePushNotifications" onclick="enablePush()">
      Enable Push Notifications
      </button>
      <button id="enablePushNotifications" onclick="enableSafariPush()">
      Enable Safari Push Notifications
      </button>
      <br />
      <hr />
      <button onclick="getLS()"
         style="background: #2b39ff;color: white; padding: 5px">
      Show Local Storage
      </button>
      <br /><br />
      <button onclick="clearLS()"
         style="background: red;color: white; padding: 5px">
      Clear Local Storage
      </button>
      <br>
      <div id="banner"></div>
      <br />
      <br />
      <br />
      <hr />
      <div id="lsData"></div>
      <div id="carousel"></div>
   </body>
</html>