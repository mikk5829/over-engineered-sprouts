export function getCookieValue(cookieName) {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim().split('=');
        if (cookieName === cookie[0]) {
            return cookie[1];
        }
    }
}

export function getResolutionFromCookie(cookieName) {
    let value = getCookieValue(cookieName);
    let components = value.split('x'); 
    return {res_x:components[0],res_y:components[1]};
}