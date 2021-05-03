 /**
* Temporary workaround for secondary monitors on MacOS where redraws don't happen
* @See https://bugs.chromium.org/p/chromium/issues/detail?id=971701
*/
if (
// From testing the following conditions seem to indicate that the popup was opened on a secondary monitor
window.screenLeft < 0 ||
window.screenTop < 0 ||
window.screenLeft > window.screen.width ||
window.screenTop > window.screen.height
) {
    console.log('HERE')
    chrome.runtime.getPlatformInfo(function (info) {
        if (info.os === 'mac') {
            const fontFaceSheet = new CSSStyleSheet()
            fontFaceSheet.insertRule(`
                @keyframes redraw {
                0% {
                    opacity: 1;
                }
                100% {
                    opacity: .99;
                }
                }
            `)
            fontFaceSheet.insertRule(`
                html {
                animation: redraw 1s linear infinite;
                }
            `)
            document.adoptedStyleSheets = [
                ...document.adoptedStyleSheets,
                fontFaceSheet,
            ]
        }
    });
}
