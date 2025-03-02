// Create the "Add to List" button
function createAddButton() {
  const button = document.createElement('button');
  button.id = 'website-saver-button';
  button.textContent = 'Add to List';
  button.title = 'Add this website to your saved list';
  
  // Add click event listener
  button.addEventListener('click', () => {
    const url = window.location.href;
    const title = document.title;
    
    // Save the website to Chrome storage
    chrome.storage.sync.get('savedWebsites', (data) => {
      const savedWebsites = data.savedWebsites || [];
      
      // Check if website is already saved
      const alreadySaved = savedWebsites.some(site => site.url === url);
      
      if (!alreadySaved) {
        savedWebsites.push({
          url: url,
          title: title,
          date: new Date().toISOString()
        });
        
        chrome.storage.sync.set({ savedWebsites: savedWebsites }, () => {
          // Change button appearance to indicate success
          button.textContent = 'Added!';
          button.classList.add('added');
          
          // Reset button after 2 seconds
          setTimeout(() => {
            button.textContent = 'Add to List';
            button.classList.remove('added');
          }, 2000);
        });
      } else {
        // Indicate that the website is already saved
        button.textContent = 'Already Saved';
        button.classList.add('already-saved');
        
        // Reset button after 2 seconds
        setTimeout(() => {
          button.textContent = 'Add to List';
          button.classList.remove('already-saved');
        }, 2000);
      }
    });
  });
  
  return button;
}

// Add the button to the page
function addButtonToPage() {
  // Check if button already exists
  if (document.getElementById('website-saver-button')) {
    return;
  }
  
  const button = createAddButton();
  document.body.appendChild(button);
}

// Wait for the page to fully load
window.addEventListener('load', () => {
  addButtonToPage();
});

// Also add the button now in case the page is already loaded
addButtonToPage(); 