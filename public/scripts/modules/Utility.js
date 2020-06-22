/**
 * The Utility methods gets settings stored as cookies from the browser
 * @namespace Utility
 * @author Laura Hansen & Benjamin Starostka
 * */

/**
 * Gets the cookies value
 * @memberOf Utility
 * @param cookieName
 */
export function getCookieValue(cookieName) {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim().split('=');
        if (cookieName === cookie[0]) {
            return cookie[1];
        }
    }
}

/**
 * Gets resolution used in the game from cookie
 * @memberOf Utility
 * @param cookieName
 */
export function getResolutionFromCookie(cookieName) {
    let value = getCookieValue(cookieName);
    let components;
    if (value) {
        components = value.split('x');
        return {res_x:components[0],res_y:components[1]};
    }
    return components;
}

/**
 * @memberOf Utility
 */
export function worldInLocalStorage() {
    let tDots = localStorage.getItem("FileResultDotTotal");
    let tPaths = localStorage.getItem("FileResultPaths");
    if (tDots !== null & tPaths !== null) {
        return {dots: JSON.parse(tDots), paths: JSON.parse(tPaths)};
    } else {
        return null;
    }
}
