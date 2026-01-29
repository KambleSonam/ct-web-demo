(function(cleverWindow, cleverDocument, cleverApp){

    'use strict';

    var cookieVariable, isCustomerLogged, isCartEventTrack, oldCartItems;
    const LOCAL_STORAGE_CART_ITEMS = "WZRK_LOCAL_CART_ITEMS";
    const LS_CART_ITEMS_SET_AFTER_LOGIN = "WZRK_CISAL";
    let hasCorrectItemsInLSCartForLoggedInUser = false;
    const CHECKOUT_EVENT = "Checkout";
    const CHECKOUT_SDK_EVENT = "Checkout SDK";

    const FETCH_CART_DETAILS_URL = '/cart.js';
    const UPDATE_LS_CART_DETAILS_ERR = `Failed to update the local storage with items obtained from ${FETCH_CART_DETAILS_URL} call due to - `;

    const CART_URLS = [
        FETCH_CART_DETAILS_URL,
        "/cart/add.js",
        "/cart/update.js",
        "/cart/change",
        "/cart/clear.js"
    ];
    const isMultiCartPersonalisationEnabled = __wzrk_multi_cart_personalistion_enabled
    const shopifyCartIdKey =  __wzrk_shopify_cart_id_key

    function isCartChangePossible(url = '') {
        return CART_URLS.some(cartUrl => url.includes(cartUrl));
    }

    function setWithExpiry(key, value, ttl = 0) {
        const now = new Date()

        // `item` is an object which contains the original value
        // as well as the time when it's supposed to expire
        const item = {
            value: value,
            expiry: (ttl !== 0) ? now.getTime() + ttl : null,
        }
        localStorage.setItem(key, JSON.stringify(item))
    }

    function getWithExpiry(key) {
        const itemStr = localStorage.getItem(key)
        // if the item doesn't exist, return null
        if (!itemStr) {
            return null
        }
        const item = JSON.parse(itemStr)
        if (!item.expiry) {
            return item.value;
        }
        const now = new Date()
        // compare the expiry time of the item with the current time
        if (now.getTime() > item.expiry) {
            // If the item is expired, delete the item from storage
            // and return null
            localStorage.removeItem(key)
            return null
        }
        return item.value
    }

    cookieVariable = {
        customerLoginToken: 'customer-login-event',
        customerRegisterToken: 'customer-register-event',
        addToCartToken: 'add-to-cart-event'
    }

    /* SET COOKIE START */
    function setCookie(cname, cvalue, expire, expireType = 'day'){

        var currentDate, expires;

        if(expireType == 'hour')
            expire = expire * 60 * 60 * 1000;
        else if(expireType == 'minute')
            expire = expire * 60 * 1000;
        else if(expireType == 'second')
            expire = expire * 1000;
        else
            expire = expire * 24 * 60 * 60 * 1000;

        currentDate = new Date();
        currentDate.setTime(currentDate.getTime() + expire);
        expires = "expires="+ currentDate.toUTCString();
        cleverDocument.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        return cvalue;
    };
    /* SET COOKIE END */

    /* GET COOKIE START */
    function getCookie(cname){

        var name, decodedCookie, cookieSplit;

        name = cname + "=";
        decodedCookie = decodeURIComponent(cleverDocument.cookie);
        cookieSplit = decodedCookie.split(';');
        for(var i = 0; i < cookieSplit.length; i++){

            var cookie;

            cookie = cookieSplit[i];
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            if(cookie.indexOf(name) == 0){
                return cookie.substring(name.length, cookie.length);
            }
        }
        return null;
    };
    /* GET COOKIE END */

    /* DELETE COOKIE START */
    function deleteCookie(cname){
        cleverDocument.cookie = cname + "=;expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
        return true;
    };
    /* DELETE COOKIE END */

    /* CONVERT FORM TO JSON START */
    function getFromJson(form){

        var formDataObject;

        formDataObject = {};
        new FormData(form).forEach(function(value, key){
            if(key != 'utf8')
                formDataObject[key] = value;
        });
        return formDataObject;
    };
    /* CONVERT FORM TO JSON END */

    /* REQUEST TO JSON START */
    function getRequestToJson(request){

        var requestJson;

        requestJson = {};
        if(request == undefined || request.trim() == '')
            return {};

        if(typeof request == 'string'){
            try{
                requestJson = JSON.parse(request);
            }catch(errorMessage){

                if(request.indexOf('&') > -1 && request.indexOf('=') > -1){

                    var formDataObject = {};
                    for(var pair of new URLSearchParams(request).entries()){
                        formDataObject[pair[0]] = pair[1];
                    }
                    requestJson = formDataObject;
                }
            }
        }else if(request instanceof FormData){

            var formDataObject = {};
            fetchBody.forEach(function(value, key){
                if(key != 'utf8')
                    formDataObject[key] = value;
            });
            requestJson = formDataObject;
        }else if(typeof request == 'object'){
            requestJson = request;
        }
        return requestJson;
    };
    /* REQUEST TO JSON END */

    /* PARSE BOOLEAN SATRT */
    function parseBoolean(value){
        return (value == 'true') ? true : false;
    };
    /* PARSE BOOLEAN END */

    /* CHECK IS NUMERIC START */
    function isNumeric(number){
        return !isNaN(parseFloat(number)) && isFinite(number);
    };
    /* CHECK IS NUMERIC END */

    function sendEvent (eventName, eventPayload) {
        console.log(eventName, eventPayload);
        clevertap.event.push(eventName, eventPayload);
        return true
    }

    /* PUSH CLEVERTAP EVENT START */
    function pushEvent(eventName, eventPayload){
        const discardedSDKEvents = cleverApp.discardedSDKEvents;
        if (typeof discardedSDKEvents === 'string') {
            const discardedSDKEventsArray = discardedSDKEvents.split(', ');
            if (!discardedSDKEventsArray.includes(eventName)) {
                return sendEvent(eventName, eventPayload)
            }
        } else {
            return sendEvent(eventName, eventPayload)
        }
    };
    /* PUSH CLEVERTAP EVENT END */

    /* PUSH CLEVERTAP PROFILE START */
    function pushProfile(eventPayload){
        console.log('Profile Push', eventPayload);
        clevertap.profile.push(eventPayload);
        return true;
    };
    /* PUSH CLEVERTAP PROFILE END */

    /* FULL SCRIPT HANDLER START */
    function eventHandler(){

        var originalSendEvent, originalFetchEvent, customerAccountUrl, customerLoginUrl, addToCartUrl, changeCartUrl, updateCartUrl, checkoutUrl;

        /* GENERATE ALL URL IN LIQUID OBJECT START */
        if(cleverApp && cleverApp.config && cleverApp.config.routes && cleverApp.config.routes.customer && cleverApp.config.routes.customer.account)
            customerAccountUrl = cleverApp.config.routes.customer.account;

        if(cleverApp && cleverApp.config && cleverApp.config.routes && cleverApp.config.routes.customer && cleverApp.config.routes.customer.login)
            customerLoginUrl = cleverApp.config.routes.customer.login;

        if(cleverApp && cleverApp.config && cleverApp.config.routes && cleverApp.config.routes.cart && cleverApp.config.routes.cart.add)
            addToCartUrl = cleverApp.config.routes.cart.add;

        if(cleverApp && cleverApp.config && cleverApp.config.routes && cleverApp.config.routes.cart && cleverApp.config.routes.cart.change)
            changeCartUrl = cleverApp.config.routes.cart.change;

        if(cleverApp && cleverApp.config && cleverApp.config.routes && cleverApp.config.routes.cart && cleverApp.config.routes.cart.update)
            updateCartUrl = cleverApp.config.routes.cart.update;

        if(cleverApp && cleverApp.config && cleverApp.config.routes && cleverApp.config.routes.cart && cleverApp.config.routes.cart.list)
            checkoutUrl = cleverApp.config.routes.cart.list;
        /* GENERATE ALL URL IN LIQUID OBJECT END */

        originalSendEvent = cleverWindow.XMLHttpRequest.prototype.send;
        cleverWindow.XMLHttpRequest.prototype.send = function (sendData) {
            this.addEventListener('load', function (loadData) {
                if (isCartEventTrack !== false && (isCartChangePossible(this._url) || (addToCartUrl && this._url == addToCartUrl))) {
                    if (this._url.includes(FETCH_CART_DETAILS_URL)) {
                        try {
                            const response = JSON.parse(this.responseText)
                            updateLSWithCartItems(response);
                            onCartHandler(getWithExpiry(LOCAL_STORAGE_CART_ITEMS) || []);
                            buyItNowInit(); // TODO - WEB-1709
                        } catch (e) {
                            console.error(UPDATE_LS_CART_DETAILS_ERR, e);
                            processCartChanges();
                        }
                    } else {
                        processCartChanges();
                    }
                }
            });
            return originalSendEvent.apply(this, arguments);
        };
        /* XHR & AJX REQUEST HANDLER END */

        originalFetchEvent = cleverWindow.fetch;
        cleverWindow.fetch = function (fetchUrl, options) {
            return originalFetchEvent.apply(window, arguments).then((response) => {
                if (isCartEventTrack !== false && (isCartChangePossible(fetchUrl) || (addToCartUrl && fetchUrl == addToCartUrl))) {
                    if (fetchUrl.includes(FETCH_CART_DETAILS_URL)) {
                        try {
                            const clonedResponse = response.clone();
                            clonedResponse.json().then((data) => {
                                updateLSWithCartItems(data);
                                onCartHandler(getWithExpiry(LOCAL_STORAGE_CART_ITEMS) || []);
                                buyItNowInit(); // TODO - WEB-1709
                            })
                        } catch (e) {
                            console.error(UPDATE_LS_CART_DETAILS_ERR, e);
                            processCartChanges();
                        }
                    } else {
                        processCartChanges();
                    }
                }
                return response;
            });
        };
        /* FETCH REQUEST HANDLER END */

        /* FROM SUBMIT HANDLER START */
        cleverDocument.addEventListener('submit', function(event){
            if(customerAccountUrl && event.target.getAttribute('action') == customerAccountUrl)
                setCookie(cookieVariable.customerRegisterToken, 'Yes', 10, 'minute');
            else if(customerLoginUrl && event.target.getAttribute('action') == customerAccountUrl)
                setCookie(cookieVariable.customerLoginToken, 'Yes', 10, 'minute');
            else if(addToCartUrl && event.target.getAttribute('action') == addToCartUrl)
                setCookie(cookieVariable.addToCartToken, getFromJson(event.target).id, 2, 'minute');
            else if (event.target.getAttribute('action') == '/cart' || event.target.getAttribute('action') == checkoutUrl) {
                handleCheckout();
            }
        });
        /* FROM SUBMIT HANDLER END */

        var checkoutBtn = cleverDocument.querySelector('[name="checkout"]')

        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', function () {
                handleCheckout();
            })
        }

    };
    /* FULL SCRIPT HANDLER END */

    function processCartChanges() {
        isCartEventTrack = false;
        onUpdateCart(function () {
            const localCartitems = getWithExpiry(LOCAL_STORAGE_CART_ITEMS) || [];
            onCartHandler(localCartitems);
            isCartEventTrack = true;
        })
    }

    /* PAGE BROWSE EVENT HANDLER START */
    function onPageBrowse(){
        /* PUSH EVENT START */
        return pushEvent('Page Browsed', {
            URL: cleverApp.config.meta.url,
            Page: cleverApp.config.meta.type,
            Title: cleverApp.config.meta.title,
            "CT Source": "Shopify"
        });
        /* PUSH EVENT END */
    };
    /* PAGE BROWSE EVENT HANDLER END */

    /* PRODUCT SEARCH EVENT HANDLER START */
    function onSearchProduct(){
        /* PUSH EVENT START */
        return pushEvent('Searched Product', {
            Terms: cleverApp.searchProduct.terms,
            'Total Items': cleverApp.searchProduct.items.length,
            "CT Source": "Shopify"
        });
        /* PUSH EVENT END */
    };
    /* PRODUCT SEARCH EVENT HANDLER END */

    /* COLLECTION VIEW EVENT HANDLER START */
    function onCategoryView(){
        /* PUSH EVENT START */
        return pushEvent('Category Viewed', {
            Id: cleverApp.collection.id,
            URL: cleverApp.collection.url,
            Title: cleverApp.collection.title,
            Image: cleverApp.collection.image,
            "Product Count": cleverApp.collection.productCount,
            "CT Source": "Shopify"

        });
        /* PUSH EVENT END */
    };
    /* COLLECTION VIEW EVENT HANDLER END */

    /* Product VIEW EVENT HANDLER START */
    function onProductView(){
        /* PUSH EVENT START */
        return pushEvent('Product Viewed', {
            ID: cleverApp.product.id,
            URL: cleverApp.product.url,
            Price: cleverApp.product.price,
            Title: cleverApp.product.title,
            Handle: cleverApp.product.handle,
            Currency: cleverApp.config.currency,
            Available: cleverApp.product.available,
            'Total Variants': Object.keys(cleverApp.product.variants).length,
            "CT Source": "Shopify"
        });
        /* PUSH EVENT END */
    };
    /* Product VIEW EVENT HANDLER END */

    /* CUSTOMER REGISTER EVENT HANDLER START */
    function onCustomerRegister(){

        deleteCookie(cookieVariable.customerRegisterToken);
        isCustomerLogged = setCookie(cookieVariable.customerLoginToken, true, 30);

        let profile = getUserProps(cleverApp.customer);

        clevertap.onUserLogin.push({
            "Site": profile
        })
        /* PUSH EVENT START */
        delete profile.Tags;
        profile["CT Source"] = "Shopify";
        return pushEvent('Customer Registered', profile);
        /* PUSH EVENT END */

    };
    /* CUSTOMER REGISTER EVENT HANDLER END */

    /* CUSTOMER LOGIN EVENT HANDLER START */
    function onCustomerLogin(){

        isCustomerLogged = setCookie(cookieVariable.customerLoginToken, true, 30);

        let profile = getUserProps(cleverApp.customer);

        clevertap.onUserLogin.push({
            "Site": profile
        })
        /* PUSH EVENT START */
        delete profile.Tags;
        profile["CT Source"] = "Shopify";
        return pushEvent('Customer Logged In', profile);
        /* PUSH EVENT END */
    };
    /* CUSTOMER LOGIN EVENT HANDLER END */

    /* CUSTOMER LOGOUT EVENT HANDLER START */
    function onCustomerLogout(){
        setWithExpiry(LS_CART_ITEMS_SET_AFTER_LOGIN, false);
        isCustomerLogged = false;
        deleteCookie(cookieVariable.customerLoginToken);
        /* PUSH EVENT START */
        pushEvent('Customer Logged Out', {
            "CT Source": "Shopify"
        });
        /* PUSH EVENT END */

        clevertap.logout();
        return
    };
    /* CUSTOMER LOGOUT EVENT HANDLER END */

    function getUserProps (customer) {

        const userProps = {
            "Email": customer.email,
            "Phone": customer.phone
        }
        if (__wzrk_version === 3) {
            return userProps
        }
        return {
            ...userProps,
            "Name": customer.name,
            "Identity": customer.email,
            "Tags": customer.tags,
            "City": customer.city,
            "Accepts Marketing": customer.acceptsMarketing,
            "Has Account": customer.hasAccount,
            "Orders Count": customer.ordersCount,
            "Tax Exempt": customer.taxExempt,
            "Total Spent": customer.totalSpent,
            "Shopify ID": customer.id,
            "First Name": customer.firstName,
            "Last Name": customer.lastName
        }
    }

    /* ADD TO CART ITEM EVENT HANDLER START */
    function onAddedToCart (item) {
        if (isMultiCartPersonalisationEnabled && shopifyCartIdKey) {
            const productValue = item[shopifyCartIdKey] || '';
            if (productValue) {
                clevertap.addMultiValueForKey('shopify_cart_ids', productValue);
            }
        }

        /* PUSH EVENT START */
        pushEvent('Added To Cart', {
            URL: item.url,
            Title: item.title,
            Image: item.image,
            Vendor: item.vendor,
            Quantity: item.quantity,
            'Product ID': item.product_id,
            'Variant ID': item.variant_id,
            'Product Type': item.product_type,
            'Variant Title': item.variant_title,
            Currency: cleverApp.config.currency,
            Price: parseFloat((parseInt(item.price) / 100).toFixed(2)),
            "CT Source": "Shopify"
        });
        /* PUSH EVENT END */
    };
    /* ADD TO CART ITEM EVENT HANDLER END */

    function isProductInCart(productId, idType) {
        const currentCart = getWithExpiry(LOCAL_STORAGE_CART_ITEMS) || [];
        return currentCart.some(product => product[idType] === productId);
    }

    function shouldRemoveShopifyCartId(productId, idType) {
        return isMultiCartPersonalisationEnabled && shopifyCartIdKey && !isProductInCart(productId, idType);
    }

    /* REMOVE CART ITEM EVENT HANDLER START */
    function onRemoveToCart(item) {
        const itemId = shopifyCartIdKey === 'product_id' ? item.product_id : item.variant_id;
        const idType = shopifyCartIdKey === 'product_id' ? 'product_id' : 'variant_id';

        if (shouldRemoveShopifyCartId(itemId, idType)) {
            const productValue = item[shopifyCartIdKey] || '';
            if (productValue) {
                clevertap.removeMultiValueForKey('shopify_cart_ids', productValue);
            }
        }

        /* PUSH EVENT START */
        return pushEvent('Removed From Cart', {
            URL: item.url,
            Title: item.title,
            Image: item.image,
            Vendor: item.vendor,
            Quantity: item.quantity,
            'Product ID': item.product_id,
            'Variant ID': item.variant_id,
            'Product Type': item.product_type,
            'Variant Title': item.variant_title,
            Currency: cleverApp.config.currency,
            Price: parseFloat((parseInt(item.price) / 100).toFixed(2)),
            "CT Source": "Shopify"
        });
        /* PUSH EVENT END */
    };
    /* REMOVE CART ITEM EVENT HANDLER END */

    /* CART ITEM CHANGE TYPE HANDLER START */
    function onCartHandler(items) {
        var cartItemList;

        cartItemList = {};
        if (Array.isArray(oldCartItems)) {
            oldCartItems.forEach(function(cartItem){
                cartItemList[cartItem.id] = cartItem;
            });
        }

        items.forEach(function(item){
            if(cartItemList[item.id]){

                var cartItem = cartItemList[item.id];
                if(parseInt(cartItem.quantity) != parseInt(item.quantity)){
                    if(cartItem.quantity < item.quantity)
                        onAddedToCart(fetchCartItemDifference(cartItem, item));
                    else
                        onRemoveToCart(fetchCartItemDifference(cartItem, item));
                }
                delete cartItemList[item.id];
            }else{
                onAddedToCart(item);
            }
        });

        if(Object.keys(cartItemList).length !== 0 && cartItemList.constructor === Object){

            for (var key in cartItemList) {
                if (cartItemList.hasOwnProperty(key)) {
                    var item = cartItemList[key]
                    onRemoveToCart(item)
                    delete cartItemList[key]
                }
            }
        }
    };
    /* CART ITEM CHANGE TYPE HANDLER END */

    /* CART UPDATE EVENT HANDLER START */
    function updateLSWithCartItems (response) {
        if (response != undefined) {
            oldCartItems = getWithExpiry(LOCAL_STORAGE_CART_ITEMS);
            setWithExpiry(LOCAL_STORAGE_CART_ITEMS, response.items);
            if (cleverApp.customer) {
                const lsCartItemsSetAfterLogin = getWithExpiry(LS_CART_ITEMS_SET_AFTER_LOGIN);
                if (lsCartItemsSetAfterLogin) {
                    hasCorrectItemsInLSCartForLoggedInUser = true;
                } else {
                    setWithExpiry(LS_CART_ITEMS_SET_AFTER_LOGIN, true);
                }
            }
        }
    }

    async function onUpdateCart(callback = new Function){

        await fetch(FETCH_CART_DETAILS_URL).then(function(response){
            if(response.status == 200)
                return response.json();
        }).then(function(response){
            updateLSWithCartItems(response);
            callback();
        });
        return buyItNowInit();
    };

    /* CART UPDATE EVENT HANDLER END */

    /* CART ITEM DIFFERENCE HANDLER START */
    function fetchCartItemDifference(oldItem, newItem){

        var itemQty, imageUrl;

        itemQty = newItem.quantity;
        if(oldItem.quantity < newItem.quantity)
            itemQty = parseInt(newItem.quantity) - parseInt(oldItem.quantity);
        else if(oldItem.quantity > newItem.quantity)
            itemQty = parseInt(oldItem.quantity) - parseInt(newItem.quantity);

        newItem.quantity = itemQty;
        return newItem;
    };
    /* CART ITEM DIFFERENCE HANDLER END */

    /* BUY IT NOW EVENT HANDLER START */
    function buyItNowInit(){

        /* CHECK ALREADY EVENT ASSIGN OR NOT START */
        if(!cleverDocument.querySelectorAll('.clevertap-payment-button').length){

            var shopifyPaymentButton, shopifyPaymentButtonParent, shopifyPaymentButtonReplace;

            /* CHECK SHOPIFY BUY IT NOW ENABLE START */
            shopifyPaymentButton = cleverDocument.querySelector('.shopify-payment-button .shopify-payment-button__button.shopify-payment-button__button--unbranded');
            if(shopifyPaymentButton){

                /* ASSIGN EVENT START */
                // shopifyPaymentButtonParent = shopifyPaymentButton.parentNode;
                // shopifyPaymentButtonReplace = shopifyPaymentButton.cloneNode(true);

                shopifyPaymentButton.classList.add('clevertap-payment-button');
                // shopifyPaymentButtonParent.replaceChild(shopifyPaymentButtonReplace, shopifyPaymentButton);

                // cleverDocument.querySelector('.clevertap-payment-button').removeEventListener('click', new Function);
                shopifyPaymentButton.addEventListener('click', function(){
                    onCheckoutInit(function(item){

                        if(item != undefined)
                            onCheckout([item]);
                        // shopifyPaymentButton.click();
                    });
                });
                /* ASSIGN EVENT END */
            }
            /* CHECK SHOPIFY BUY IT NOW ENABLE END */
        }
        /* CHECK ALREADY EVENT ASSIGN OR NOT END */
    };
    /* BUY IT NOW EVENT HANDLER END */

    /* DIRECT CHECKOUT BUTTON EVENT HANDLER START */
    function onCheckoutInit(callback = new Function){

        var productForm, productFormData, checkoutQty;

        productForm = cleverDocument.querySelector('form[action="/cart/add"]');
        productFormData = new FormData(productForm);
        checkoutQty = productFormData.get('quantity');
        checkoutQty = Number.isNaN(parseInt(checkoutQty)) ? 1 : parseInt(checkoutQty);

        isCartEventTrack = false;

        if (cleverApp && cleverApp.product && cleverApp.product.price) {
            raiseCheckoutEvent(checkoutQty, parseFloat(+cleverApp.product.price * checkoutQty).toFixed(2))
        } else {
            fetch('/cart/add.js', {
                method: 'post',
                body: productFormData
            }).then(function(response) {
                return response.json();
            }).then(function(checkoutData){

                var updateFormData;

                updateFormData = new FormData();
                updateFormData.append('id', checkoutData.id);
                updateFormData.append('quantity', parseInt(checkoutData.quantity) - checkoutQty);
                checkoutData.quantity = checkoutQty;

                fetch('/cart/change.js', {
                    method: 'post',
                    body: updateFormData
                }).then(function(response) {
                    return response.json();
                }).then(function(){
                    callback(checkoutData);
                    isCartEventTrack = true;
                }).catch((error) => {
                    callback();
                    isCartEventTrack = true;
                });
            }).catch((error) => {
                callback();
                isCartEventTrack = true;
            });
        }
    };
    /* DIRECT CHECKOUT BUTTON EVENT HANDLER END */

    var push_checkout = function() {
        var len = Shopify.checkout.line_items.length;
        var items = [];
        for (var i = 0; i < len; i++) {
            var obj = {};
            obj["Product_id"] = Shopify.checkout.line_items[i].product_id;
            obj["Title"] = Shopify.checkout.line_items[i].title;
            obj["Quantity"] = Shopify.checkout.line_items[i].quantity;
            obj["Vendor"] = Shopify.checkout.line_items[i].vendor;
            items.push(obj);
        }
        var checkout = Shopify.checkout;
        if(typeof checkout !== "undefined"){
            var shipping_address = checkout.shipping_address;
            var amount = checkout.total_price;

            var eventData={
                "Amount": amount,
                "Currency": checkout.currency,
                "Email": checkout.email,
                "Charged ID": checkout.order_id,
                "Items": items,
                "CT Source": "Shopify"
            };

            if(__wzrk_webhook_enabled !== "undefined" && __wzrk_webhook_enabled !== "" && __wzrk_webhook_enabled == "true"){
                eventName="Charged SDK";
                delete eventData['Items'];
            }
            if(typeof shipping_address !== "undefined"){
                eventData["Ship_country"]=shipping_address.country;                
                eventData["Ship_region"]=shipping_address.province;                
                eventData["Ship_city"]=shipping_address.city;                
            }
            clevertap.event.push(eventName, eventData);
        }
    };

    const LOCAL_STORAGE_TTL = 48 * 60 * 60 * 1000;

    function getLastChargedItems() {
        var validLastChargedItems = [];
        try {
            var lastChargedIdItems = JSON.parse(localStorage.getItem("WZRK_LST_CHID") || "[]");
            var now = new Date().getTime();
            validLastChargedItems = lastChargedIdItems.filter(item => now < item.expiry);
        } catch(err) {
            var lastChargedId = localStorage.getItem("WZRK_LST_CHID");
            if (lastChargedId !== null) {
                validLastChargedItems = [{
                    "chargedId": lastChargedId,
                    "expiry": (new Date().getTime()) + LOCAL_STORAGE_TTL
                }];
            }
        }
        localStorage.setItem("WZRK_LST_CHID", JSON.stringify(validLastChargedItems));
        return validLastChargedItems;
    }

    function insertChargedId(chargedId) {
        if(localStorage) {
            var lastChargedIdItems = getLastChargedItems();
            var lastChargedIdItem = {
                chargedId,
                expiry: (new Date().getTime()) + LOCAL_STORAGE_TTL
            };
            localStorage.setItem("WZRK_LST_CHID", JSON.stringify([...lastChargedIdItems, lastChargedIdItem]));
        }
    }

    function handleCharged(accountId) {
        if (typeof Shopify.checkout !== "undefined" && accountId !== "W88-4Z5-9Z6Z") { //plixlife account does not want charged event to be raised via plugin
            var shouldPushCharged = true;
            var chargedId = "" + Shopify.checkout.order_id;
            if(localStorage && localStorage.getItem("WZRK_LST_CHID") !== null) {
                var lastChargedIdItems = getLastChargedItems();
                shouldPushCharged = !lastChargedIdItems.some(item => item.chargedId === chargedId);
            }
            if(shouldPushCharged) {
                profile_push_checkout();
                push_checkout();
                insertChargedId(chargedId);
            }
        }
    }

    function isEqual (obj1, obj2) {

        /**
         * More accurately check the type of a JavaScript object
         * @param  {Object} obj The object
         * @return {String}     The object type
         */
        function getType (obj) {
            return Object.prototype.toString.call(obj).slice(8, -1).toLowerCase();
        }

        function areArraysEqual () {
            // Check length
            if (obj1.length !== obj2.length) return false;

            // Check each item in the array
            for (let i = 0; i < obj1.length; i++) {
                if (!isEqual(obj1[i], obj2[i])) return false;
            }
            // If no errors, return true
            return true;
        }

        function areObjectsEqual () {
            if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

            // Check each item in the object
            for (let key in obj1) {
                if (Object.prototype.hasOwnProperty.call(obj1, key)) {
                    if (!isEqual(obj1[key], obj2[key])) return false;
                }
            }
            // If no errors, return true
            return true;
        }

        function areFunctionsEqual () {
            return obj1.toString() === obj2.toString();
        }

        function arePrimativesEqual () {
            return obj1 === obj2;
        }

        // Get the object type
        let type = getType(obj1);

        // If the two items are not the same type, return false
        if (type !== getType(obj2)) return false;

        // Compare based on type
        if (type === 'array') return areArraysEqual();
        if (type === 'object') return areObjectsEqual();
        if (type === 'function') return areFunctionsEqual();
        return arePrimativesEqual();
    }

    function handleCheckout() {
        const LOCAL_STORAGE_CART_TTL = 2 * 1000;
        const localStorageCartKey = "WZRK_CHECKOUT_CART_ITEMS";

        var lastCartItems = getWithExpiry(localStorageCartKey) || [];
        var currentCart = getWithExpiry(LOCAL_STORAGE_CART_ITEMS) || [];
        var isCartItemsChanged = !isEqual(lastCartItems, currentCart);

        if (isCartItemsChanged) {
            setWithExpiry(localStorageCartKey, currentCart, LOCAL_STORAGE_CART_TTL);
            onCheckout(currentCart);
        }
    }

    function raiseCheckoutEvent (totalItems, totalPrice) {
        const eventName = __wzrk_webhook_enabled === "true" ? CHECKOUT_SDK_EVENT : CHECKOUT_EVENT;
        const checkoutJson = {
            'Total Items': totalItems,
            'Currency': cleverApp.config.currency,
            'Total Price': totalPrice
        };
        if (cleverApp.customer) {
            pushProfile(getUserProps(cleverApp.customer))
        }
        return pushEvent(eventName, checkoutJson);
    }

    /* CHECKOUT EVENT HANDLER START */
    function onCheckout(items) {
        var totalPrice = 0;
        var totalItems = 0;
        items.forEach(function(item) {
            totalPrice += item.price * item.quantity;
            totalItems += item.quantity;
        });
        raiseCheckoutEvent(totalItems, parseFloat((parseInt(totalPrice) / 100).toFixed(2)))
    };
    /* CHECKOUT EVENT HANDLER END */

    /* CART PAGE HANDLER START */
    function cartPageHandler () {
        if (cleverApp && cleverApp.config && cleverApp.config.meta && cleverApp.config.meta.type && cleverApp.config.meta.type == 'cart') {
            const checkForCartUpdates = (!cleverApp.customer && oldCartItems !== null) || (cleverApp.hasOwnProperty('customer') && hasCorrectItemsInLSCartForLoggedInUser);
            const latestCartItems = getWithExpiry(LOCAL_STORAGE_CART_ITEMS) || [];
            const addToCartToken = parseInt(getCookie(cookieVariable.addToCartToken));
            if (isNumeric(addToCartToken)) {
                const oldEntry = (oldCartItems || []).filter(i => i.id === addToCartToken)[0];
                const newEntry = latestCartItems.filter(i => i.id === addToCartToken)[0];
                if (oldEntry) {
                    const diff = Math.abs(oldEntry.quantity - newEntry.quantity);
                    if (diff) {
                        onAddedToCart({...newEntry, quantity: diff});
                    }
                } else {
                    onAddedToCart(newEntry);
                }
                deleteCookie(cookieVariable.addToCartToken);
            } else if (checkForCartUpdates) {
                onCartHandler(latestCartItems);
            }
        }
    }
    /* CART PAGE HANDLER END */

    /* SCRIPT INIT START */
    (function() {

        var customerRegisterToken;

        /* CUSTOMER REGISTER EVENT HANDLING START */
        customerRegisterToken = getCookie(cookieVariable.customerRegisterToken);
        if(customerRegisterToken != null && cleverApp.customer)
            onCustomerRegister();
        /* CUSTOMER REGISTER EVENT HANDLING END */

        /* CUSTOMER LOGIN EVENT HANDLING START */
        /* IMPORTANT: User identification MUST happen BEFORE any events are raised
         * to prevent duplicate CleverTap profiles. This is especially critical for
         * Shopify's new Customer Accounts auth flow where login happens on shopify.com
         * (external domain where CleverTap is not present).
         *
         * The Liquid template (clevertap-variables.liquid) may have already queued
         * an onUserLogin call via clevertapApp.isNewLogin flag. We check this to
         * avoid duplicate onUserLogin calls.
         */
        isCustomerLogged = parseBoolean(getCookie(cookieVariable.customerLoginToken));
        if(cleverApp.customer && isCustomerLogged !== true) {
            // Check if onUserLogin was already queued by the Liquid template
            // for the new Shopify Customer Accounts auth flow
            if (cleverApp.isNewLogin === true) {
                // onUserLogin was already queued by Liquid template, just set the cookie
                // and raise the login event without calling onUserLogin again
                isCustomerLogged = setCookie(cookieVariable.customerLoginToken, true, 30);
                let profile = getUserProps(cleverApp.customer);
                delete profile.Tags;
                profile["CT Source"] = "Shopify";
                pushEvent('Customer Logged In', profile);
                console.log('[CleverTap] Customer login detected (onUserLogin already queued by theme)');
            } else {
                // Standard login flow - call full onCustomerLogin
                onCustomerLogin();
            }
        }
        /* CUSTOMER LOGIN EVENT HANDLING END */

        /* CUSTOMER LOGOUT EVENT HANDLING START */
        if(isCustomerLogged === true && !cleverApp.customer)
            onCustomerLogout();
        /* CUSTOMER LOGOUT EVENT HANDLING END */

        /* Now raise events AFTER user identification is complete */
        onPageBrowse();

        /* SEARCH PRODUCT EVENT HANDLING START */
        if(cleverApp.searchProduct)
            onSearchProduct();
        /* SEARCH PRODUCT EVENT HANDLING END */

        /* CATEGORY VIEW EVENT HANDLING START */
        if(cleverApp && cleverApp.collection)
            onCategoryView();
        /* CATEGORY VIEW EVENT HANDLING END */

        /* PRODUCT VIEW EVENT HANDLING START */
        if(cleverApp && cleverApp.product)
            onProductView();
        /* PRODUCT VIEW EVENT HANDLING END */

        let accountId;
        if (typeof clevertap !== "undefined" && typeof clevertap.account !== "undefined" && clevertap.account.length > 0) {
            accountId = clevertap.account[0].id
        }

        handleCharged(accountId);

        /* Initialize cart and event handlers */
        onUpdateCart(cartPageHandler);
        setTimeout(buyItNowInit, 1500);
        eventHandler();
    })();
})(window, window.document, window.clevertapApp);
