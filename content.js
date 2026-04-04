//misbah khatoon 4/4/2026


document.getElementById("scanBtn").addEventListener("click", async () => {
    // 1. Initial UI feedback
    const scanBtn = document.getElementById("scanBtn");
    const descSection = document.getElementById("descSection");
    const tagsSection = document.getElementById("tagsSection");
    const resultDesc = document.getElementById("resultDesc");
    const tagContainer = document.getElementById("tagContainer");

    scanBtn.innerText = "Scanning...";
    // Reset any previous results
    descSection.style.display = 'none';
    tagsSection.style.display = 'none';
    tagContainer.innerHTML = '';
    resultDesc.innerText = "Waiting for scan...";

    // 2. Get the active tab and extract text
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Safety check for restricted chrome:// pages
    if (tab.url.startsWith("chrome://")) {
        scanBtn.innerText = "Scan This Page";
        alert("Extensions cannot scan system pages.");
        return;
    }

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => document.body.innerText,
    }, async (injectionResults) => {
        
        const pageText = injectionResults[0].result;

        // 3. Send text to your Python server (on port 8000)
        try {
            const response = await fetch("http://127.0.0.1:8000/classify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: pageText })
            });
            
            const data = await response.json();
            
            // --- 4. SUCCESS! Populate the new structured UI ---
            scanBtn.innerText = "Scan This Page";
            
            // We can only show data our Python backend sends. 
            // For now, let's use the single category we get.
            // We will need to decide later if the backend should send more data.

            // A) Populate Description Section (Section 2 from sketch)
            descSection.style.display = 'block';
            resultDesc.innerText = "This page was analyzed and classified using the keyword detection method.";
            
            // B) Populate Classifications/Tags Section (Section 3 from sketch)
            tagsSection.style.display = 'block';
            
            // Create a tag element
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.innerText = data.category;
            
            // Determine tag style based on classification result
            if (data.category.includes("Educational")) {
                tag.classList.add('educational');
            } else if (data.category.includes("Warning")) {
                tag.classList.add('graphic');
            } else {
                tag.classList.add('neutral');
            }

            tagContainer.appendChild(tag);
            
        } catch (error) {
            scanBtn.innerText = "Scan This Page";
            alert("Connection Error. Is your Python server running on Port 8000?");
        }
    });
});