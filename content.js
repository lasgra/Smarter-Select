let selectedTextRect = {top: 0, left: 0}

document.addEventListener("mouseup", function (e) {
    const selectedText = window.getSelection().toString().trim();

    const existing = document.getElementById("selectionPopup123");
    
    if (existing?.innerText == "🔍 " + selectedText){
        if (existing) existing.remove();
    }
    else if (e.target?.id != "selectionPopup123") {
        if (existing) existing.remove();

        if (selectedText.length > 0) {
            sel = window.getSelection();
            if (sel.rangeCount) {
                range = sel.getRangeAt(0).cloneRange();
                if (range.getBoundingClientRect) {
                    var rect = range.getBoundingClientRect();

                    selectionWidth = rect.right - rect.left;
                    selectionHeight = rect.bottom - rect.top;
                    selectedTextRect = {top: rect.top, left: rect.left, bottom: rect.bottom, right: rect.right}
                }
            }
            console.log(e.pageY, selectedTextRect.top);
            
            const popup = document.createElement("div");
            popup.id = "selectionPopup123";
            popup.innerText = "🔍 " + selectedText;
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

            document.body.appendChild(popup);
        }
    }
});
