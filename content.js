selectedTextRect = {top: 0, left: 0}
userData = null
fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    userData = data;
  });

document.addEventListener("mouseup", async function (e) {
    const selectedText = window.getSelection().toString().trim();

    const existing = document.getElementById("selectionPopup123");
    
    if (existing?.innerText == "🔍 " + selectedText){
        if (existing) existing.style.opacity = "0";
    }
    else if (e.target?.id != "selectionPopup123") {
        if (existing) existing.style.opacity = "0";
        let smallerText = ""
        let largerText = ""

        if (selectedText.length > 0) {
            sel = window.getSelection();
            selElement = sel.getRangeAt(0).commonAncestorContainer;
            let selectedElement = selElement.nodeType === 3 ? selElement.parentElement : selElement;
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getBoundingClientRect) {
                    var rect = range.getBoundingClientRect();

                    selectionWidth = rect.right - rect.left;
                    selectionHeight = rect.bottom - rect.top;
                    selectedTextRect = {top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right}
                }
            }
            
            // Monetary value check
            const moneyRegex = /.{0,4}\s?\d{1,3}(?:[.,'\s]?\d{3})*(?:[.,]\d{2})?\s?.{0,4}/g

            const matches = selectedText.match(moneyRegex);
            
            if (matches && !/^[0-9,.'']+$/.test(matches[0])) { //check if it is a currency
                let money = (await extractAndNormalizeCurrency(matches[0])).split(" ");
                let exchangeResponse = await fetch(`https://latest.currency-api.pages.dev/v1/currencies/${money[1].toLowerCase()}.json`)
                let exchangeRates = await exchangeResponse.json()
                
                smallerText = `${(parseFloat(money[0])).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${money[1]} = `;
                largerText = `${(parseFloat((money[0] * exchangeRates[money[1].toLowerCase()][userData["currency"].toLowerCase()])).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))} ${userData["currency"]}`
            };

            // date check


            

            const popup = document.createElement("div");
            popup.id = "selectionPopup123";
            popup.innerText = smallerText + largerText;
            popup.style.position = "absolute";
            popup.style.transform = "translate(-50%, -100%)";
            popup.style.left = (selectedTextRect.left + (selectionWidth / 2)) + "px";
            popup.style.top = (e.pageY - selectionHeight) + "px";
            popup.style.background = "white";
            popup.style.border = "1px solid black";
            popup.style.padding = "5px 10px";
            popup.style.borderRadius = "5px";
            popup.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
            popup.style.zIndex = 9999;
            popup.style.fontSize = "14px";
            popup.style.cursor = "pointer";
            popup.style.transition = "opacity 0.1s ease";

            popup.addEventListener('transitionend', () => {
               popup.remove();
            });

            document.body.appendChild(popup);
        }
    }
});

window.addEventListener("scroll", function () {
    const existing = document.getElementById("selectionPopup123");
        if (existing) existing.style.opacity = "0";
}, true)

async function extractAndNormalizeCurrency(text) {
    const response = await fetch(chrome.runtime.getURL('currencyData.json'));
    let currencyData = await response.json();

    function normalizeCurrency(value) { // normalize currency format
        let cleaned = value.replace(/[^\d.,'\s]/g, '').replace(/\s/g, '');

        const separators = [];
        for (let i = 0; i < cleaned.length; i++) {
            if (['.', ',', `'`].includes(cleaned[i])) {
                separators.push({ index: i, char: cleaned[i] });
            }
        }

        if (separators.length === 0) return cleaned;

        const last = separators[separators.length - 1];
        const afterLast = cleaned.slice(last.index + 1);

        if (/^\d{2}$/.test(afterLast)) {
            const integerPart = cleaned.slice(0, last.index).replace(/[.,']/g, '');
            return `${integerPart}.${afterLast}`;
        } else {
            return cleaned.replace(/[.,']/g, '');
        }
    }

    let foundCurrencyCode = null;
    let possibleCodes = []
    for (const [code, data] of Object.entries(currencyData)) { // searches currecydata for currency symbol to normalize format
        const symbolsToCheck = [data.symbol, data.code];
        for (const sym of symbolsToCheck) {
            if (sym && text.includes(sym)) {
                possibleCodes.push({code: code, sym: sym})
                break;
            }
        }
    }
    
    foundCurrencyCode = possibleCodes.sort(
        function (a, b) {return b.sym.length - a.sym.length;}
    )[0].code;

    const normalized = normalizeCurrency(amountMatch[0]);
    return `${normalized} ${foundCurrencyCode}`
}


        