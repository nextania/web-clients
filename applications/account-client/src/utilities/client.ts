
export const calculateEntropy = (string?: string) => string ? Math.round(string.length * Math.log([
    { re: /[a-z]/, length: 26 }, 
    { re: /[A-Z]/, length: 26 }, 
    { re: /[0-9]/, length: 10 }, 
    { re: /[^a-zA-Z0-9]/, length: 33 },
].reduce((length, charset) => length + (charset.re.test(string) ? charset.length : 0), 0)) / Math.LN2): 0;

export const getBrowser = () => {
    if (typeof window === "undefined") {
        return;
    }
    if (navigator.userAgent.includes("Edg")) {
        return "Edge";
    }
    if (navigator.userAgent.includes("Firefox")) {
        return "Firefox";
    }
    if (navigator.userAgent.includes("Chrome")) {
        return "Chrome";
    }
    if (navigator.userAgent.includes("Safari")) {
        return "Safari";
    }
}

export const continueToRegisteredService = (trustedServices: string[], token: string) => {        
    setTimeout(() => {
        const getContinueUrl = new URLSearchParams(window.location.search).get("continue");
        const url = new URL(getContinueUrl ? getContinueUrl : trustedServices[0]);
        if (trustedServices.some((x: string) => x === url.origin + url.pathname)) {
            url.searchParams.set("token", token);
        }
        window.location.href = url.toString();
    }, 1000);
};
