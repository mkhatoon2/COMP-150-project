document.getElementById("scanBtn").addEventListener("click", async () => {
    document.getElementById("result").innerText = "Scanning...";

    // 1. Get the current active tab
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // 2. Inject a tiny script to grab the text of that webpage
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText,
    }, async (injectionResults) => {
        
        let pageText = injectionResults[0].result;

        // 3. Send that text to your Python server!
        try {
            let response = await fetch("http://127.0.0.1:8000/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: pageText })
            });
            
            let data = await response.json();
            
            // 4. Show the category on the screen
            document.getElementById("result").innerText = "Category: " + data.category;
            
        } catch (error) {
            document.getElementById("result").innerText = "Error: Is your Python server running?";
        }
    });
});