document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const websitesList = document.getElementById('websites-list');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const sortSelect = document.getElementById('sort-select');
  const clearAllBtn = document.getElementById('clear-all');
  
  // Load and display saved websites
  loadWebsites();
  
  // Event listeners
  searchInput.addEventListener('input', filterWebsites);
  clearSearchBtn.addEventListener('click', clearSearch);
  sortSelect.addEventListener('change', loadWebsites);
  clearAllBtn.addEventListener('click', clearAllWebsites);
  
  // Function to load websites from storage
  function loadWebsites() {
    chrome.storage.sync.get('savedWebsites', (data) => {
      const savedWebsites = data.savedWebsites || [];
      
      if (savedWebsites.length === 0) {
        showEmptyState();
        return;
      }
      
      // Sort websites based on selected option
      const sortedWebsites = sortWebsites(savedWebsites);
      
      // Display websites
      displayWebsites(sortedWebsites);
      
      // Filter websites if search input has value
      if (searchInput.value.trim() !== '') {
        filterWebsites();
      }
    });
  }
  
  // Function to sort websites
  function sortWebsites(websites) {
    const sortOption = sortSelect.value;
    
    return [...websites].sort((a, b) => {
      switch (sortOption) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'title-desc':
          return b.title.localeCompare(a.title);
        default:
          return new Date(b.date) - new Date(a.date);
      }
    });
  }
  
  // Function to display websites
  function displayWebsites(websites) {
    websitesList.innerHTML = '';
    
    websites.forEach((site, index) => {
      const websiteItem = document.createElement('div');
      websiteItem.className = 'website-item';
      websiteItem.dataset.url = site.url;
      
      const date = new Date(site.date);
      const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      
      websiteItem.innerHTML = `
        <div class="website-title">${site.title || 'Untitled'}</div>
        <div class="website-url">${site.url}</div>
        <div class="website-date">Saved on ${formattedDate}</div>
        <button class="delete-button" data-index="${index}">✕</button>
      `;
      
      // Add click event to open the website
      websiteItem.addEventListener('click', (e) => {
        // Don't open if clicking the delete button
        if (e.target.className !== 'delete-button') {
          chrome.tabs.create({ url: site.url });
        }
      });
      
      websitesList.appendChild(websiteItem);
    });
    
    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-button').forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(e.target.dataset.index);
        deleteWebsite(index);
      });
    });
  }
  
  // Function to filter websites based on search
  function filterWebsites() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const websiteItems = websitesList.querySelectorAll('.website-item');
    
    if (searchTerm === '') {
      websiteItems.forEach(item => {
        item.style.display = 'block';
      });
      return;
    }
    
    let hasVisibleItems = false;
    
    websiteItems.forEach(item => {
      const title = item.querySelector('.website-title').textContent.toLowerCase();
      const url = item.querySelector('.website-url').textContent.toLowerCase();
      
      if (title.includes(searchTerm) || url.includes(searchTerm)) {
        item.style.display = 'block';
        hasVisibleItems = true;
      } else {
        item.style.display = 'none';
      }
    });
    
    // Show empty state if no results
    if (!hasVisibleItems && websiteItems.length > 0) {
      const emptySearch = document.createElement('div');
      emptySearch.className = 'empty-state';
      emptySearch.textContent = 'No results found';
      websitesList.appendChild(emptySearch);
    }
  }
  
  // Function to clear search
  function clearSearch() {
    searchInput.value = '';
    filterWebsites();
    searchInput.focus();
  }
  
  // Function to delete a website
  function deleteWebsite(index) {
    chrome.storage.sync.get('savedWebsites', (data) => {
      const savedWebsites = data.savedWebsites || [];
      
      // Remove the website at the specified index
      savedWebsites.splice(index, 1);
      
      // Save the updated list
      chrome.storage.sync.set({ savedWebsites: savedWebsites }, () => {
        loadWebsites();
      });
    });
  }
  
  // Function to clear all websites
  function clearAllWebsites() {
    if (confirm('Are you sure you want to delete all saved websites?')) {
      chrome.storage.sync.set({ savedWebsites: [] }, () => {
        loadWebsites();
      });
    }
  }
  
  // Function to show empty state
  function showEmptyState() {
    websitesList.innerHTML = '<div class="empty-state">No websites saved yet</div>';
  }
}); 