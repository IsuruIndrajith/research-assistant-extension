document.addEventListener('DOMContentLoaded', () => { 
    chrome.storage.local.get(['researchNotes'], function (result) {
        if (result.researchNotes) { 
            document.getElementById('notes').value = result.researchNotes;
        }
    }); 
    document.getElementById('summerizeBtn').addEventListener('click', summerizeText);
    document.getElementById('saveNotesBtn').addEventListener('click', saveNotes);
});

async function summerizeText() { 
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result}] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: () => window.getSelection().toString(),
        }); 

        if (!result) { 
            showResult('Please select some text to summarize.');
            return;
        }

        const response = await fetch('http://localhost:8080/api/research/process', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content: result, operation: 'summarize' }),
        });

        if (!response.ok) { 
            showResult(`Failed to summarize the selected text. Please try again. Error: ${response.status}`);
            return;
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));

    } catch (error) { 
        showResult(`An error occurred while summarizing the text. Please try again. Error: ${error.message}`);
    }


}

async function saveNotes() { 
    const notes = document.getElementById('notes').value;
    chrome.storage.local.set({ researchNotes: notes }, function () {
        showResult('Notes saved successfully!');
    });
}

async function showResult(content) { 
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`
}