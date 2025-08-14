// Search functionality for Claude Code Templates
let searchActive = false;
let searchResults = [];
let allComponents = {};
let searchTimeout = null;

/**
 * Toggle search bar visibility
 */
function toggleSearch() {
    const container = document.getElementById('searchBarContainer');
    const input = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchToggleBtn');
    
    if (searchActive) {
        // Hide search
        container.style.display = 'none';
        searchActive = false;
        searchBtn.classList.remove('active');
        clearSearch();
    } else {
        // Show search
        container.style.display = 'block';
        searchActive = true;
        searchBtn.classList.add('active');
        input.focus();
        
        // Ensure components are loaded
        if (Object.keys(allComponents).length === 0) {
            loadComponentsForSearch();
        }
    }
}

/**
 * Handle search input with debouncing
 */
function handleSearchInput(event) {
    const query = event.target.value;
    const clearBtn = document.getElementById('clearSearchBtn');
    
    // Show/hide clear button
    if (query.length > 0) {
        clearBtn.style.display = 'flex';
    } else {
        clearBtn.style.display = 'none';
    }
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce search after 300ms
    searchTimeout = setTimeout(() => {
        performSearch(query);
    }, 300);
}

/**
 * Handle keyboard shortcuts in search
 */
function handleSearchKeydown(event) {
    if (event.key === 'Escape') {
        toggleSearch();
    } else if (event.key === 'Enter') {
        event.preventDefault();
        // Focus first result if any
        const firstResult = document.querySelector('.unified-grid .component-card:not([style*="display: none"])');
        if (firstResult) {
            firstResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
}

/**
 * Clear search and reset view
 */
function clearSearch() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearchBtn');
    const resultsInfo = document.getElementById('searchResultsInfo');
    const unifiedGrid = document.getElementById('unifiedGrid');
    
    input.value = '';
    clearBtn.style.display = 'none';
    resultsInfo.style.display = 'none';
    
    // Clear search timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
    }
    
    // Reset to show all components or return to filter view
    const activeFilter = document.querySelector('.filter-btn.active:not(.search-btn)');
    if (activeFilter) {
        const filterType = activeFilter.getAttribute('data-filter');
        setUnifiedFilter(filterType);
    } else {
        // Show all components except templates
        showAllComponents();
    }
    
    searchResults = [];
}

/**
 * Load all components for search functionality
 */
async function loadComponentsForSearch() {
    try {
        // First try to load from main components.json
        const response = await fetch('components.json');
        if (response.ok) {
            const data = await response.json();
            
            // Process each category for search
            const categories = ['agents', 'commands', 'settings', 'hooks', 'mcps'];
            
            for (const category of categories) {
                if (data[category] && Array.isArray(data[category])) {
                    // Process components to make them search-friendly
                    allComponents[category] = data[category].map(component => ({
                        ...component,
                        // Normalize fields for better searching
                        title: component.name || component.title || 'Untitled',
                        displayName: (component.name || component.title || '').replace(/[-_]/g, ' '),
                        category: category,
                        searchableText: [
                            component.name || component.title,
                            component.description,
                            component.category,
                            ...(component.tags || []),
                            component.keywords || '',
                            component.path || ''
                        ].filter(Boolean).join(' ').toLowerCase(),
                        
                        // Ensure tags exist
                        tags: component.tags || [component.category].filter(Boolean)
                    }));
                }
            }
            
            console.log('Search data loaded successfully:', Object.keys(allComponents));
        } else {
            console.error('Failed to load components.json');
        }
    } catch (error) {
        console.error('Error loading components for search:', error);
        
        // Fallback: try to use cached data if available
        if (window.getSearchData) {
            const categories = ['agents', 'commands', 'settings', 'hooks', 'mcps'];
            for (const category of categories) {
                const data = window.getSearchData(category);
                if (data && data.length > 0) {
                    allComponents[category] = data;
                }
            }
        }
    }
}

/**
 * Perform search across all loaded components
 */
function performSearch(query) {
    if (!query || query.length < 3) {
        updateSearchResults([]);
        return;
    }
    
    const normalizedQuery = query.toLowerCase().trim();
    const results = [];
    const categoryMatches = new Set();
    
    // Search across all categories except templates
    Object.keys(allComponents).forEach(category => {
        if (category === 'templates') return; // Skip templates
        
        const components = allComponents[category];
        if (!components || !Array.isArray(components)) return;
        
        components.forEach(component => {
            const matchScore = calculateMatchScore(component, normalizedQuery, category);
            
            if (matchScore > 0) {
                results.push({
                    ...component,
                    category: category,
                    matchScore: matchScore,
                    matchType: getMatchType(component, normalizedQuery, category)
                });
                categoryMatches.add(category);
            }
        });
    });
    
    // Sort by match score (highest first)
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    searchResults = results;
    updateSearchResults(results, categoryMatches);
    displaySearchResults(results);
}

/**
 * Calculate match score for a component
 */
function calculateMatchScore(component, query, category) {
    let score = 0;
    
    // Category name match (highest priority)
    if (category.includes(query)) {
        score += 100;
    }
    
    // Component name/title match
    const name = (component.name || component.title || '').toLowerCase();
    if (name.includes(query)) {
        score += name.startsWith(query) ? 80 : 60;
    }
    
    // Description match
    const description = (component.description || '').toLowerCase();
    if (description.includes(query)) {
        score += 30;
    }
    
    // Tags match
    if (component.tags && Array.isArray(component.tags)) {
        const tagMatch = component.tags.some(tag => 
            tag.toLowerCase().includes(query)
        );
        if (tagMatch) {
            score += 40;
        }
    }
    
    // Keywords match (for settings/hooks)
    if (component.keywords) {
        const keywordMatch = component.keywords.toLowerCase().includes(query);
        if (keywordMatch) {
            score += 25;
        }
    }
    
    // Path match (for file-based components)
    if (component.path) {
        const pathMatch = component.path.toLowerCase().includes(query);
        if (pathMatch) {
            score += 15;
        }
    }
    
    return score;
}

/**
 * Get match type for display
 */
function getMatchType(component, query, category) {
    const name = (component.name || component.title || '').toLowerCase();
    const description = (component.description || '').toLowerCase();
    
    if (category.includes(query)) return 'category';
    if (name.includes(query)) return 'name';
    if (description.includes(query)) return 'description';
    if (component.tags && component.tags.some(tag => tag.toLowerCase().includes(query))) return 'tag';
    if (component.keywords && component.keywords.toLowerCase().includes(query)) return 'keyword';
    if (component.path && component.path.toLowerCase().includes(query)) return 'path';
    
    return 'other';
}

/**
 * Update search results info display
 */
function updateSearchResults(results, categoryMatches = new Set()) {
    const resultsInfo = document.getElementById('searchResultsInfo');
    const resultsCount = document.getElementById('resultsCount');
    const filterTags = document.getElementById('searchFilterTags');
    
    if (results.length === 0) {
        resultsInfo.style.display = 'none';
        return;
    }
    
    resultsInfo.style.display = 'block';
    
    // Update count
    const count = results.length;
    resultsCount.textContent = `${count} result${count !== 1 ? 's' : ''} found`;
    
    // Update category tags
    if (categoryMatches.size > 0) {
        const categoryIcons = {
            agents: '🤖',
            commands: '⚡',
            settings: '⚙️',
            hooks: '🪝',
            mcps: '🔌'
        };
        
        const tags = Array.from(categoryMatches).map(category => {
            const icon = categoryIcons[category] || '';
            const name = category.charAt(0).toUpperCase() + category.slice(1);
            return `<span class="search-category-tag">${icon} ${name}</span>`;
        }).join('');
        
        filterTags.innerHTML = tags;
    } else {
        filterTags.innerHTML = '';
    }
}

/**
 * Display search results in the grid
 */
function displaySearchResults(results) {
    const unifiedGrid = document.getElementById('unifiedGrid');
    
    if (!unifiedGrid) {
        console.error('Unified grid not found');
        return;
    }
    
    // Clear current content
    unifiedGrid.innerHTML = '';
    
    if (results.length === 0) {
        // Show no results message
        unifiedGrid.innerHTML = `
            <div class="no-search-results">
                <div class="no-results-icon">🔍</div>
                <h3>No components found</h3>
                <p>Try searching for:</p>
                <ul class="search-suggestions">
                    <li><strong>Categories:</strong> agents, commands, settings, hooks, mcps</li>
                    <li><strong>Technologies:</strong> react, python, git, telegram, api</li>
                    <li><strong>Features:</strong> security, performance, automation, notifications</li>
                </ul>
            </div>
        `;
        return;
    }
    
    // Group results by category for better organization
    const groupedResults = {};
    results.forEach(result => {
        if (!groupedResults[result.category]) {
            groupedResults[result.category] = [];
        }
        groupedResults[result.category].push(result);
    });
    
    // Render grouped results
    let html = '';
    Object.keys(groupedResults).forEach(category => {
        const categoryResults = groupedResults[category];
        const categoryIcon = getCategoryIcon(category);
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        
        html += `
            <div class="search-category-section">
                <h3 class="search-category-header">
                    <span class="category-icon">${categoryIcon}</span>
                    ${categoryName} (${categoryResults.length})
                </h3>
                <div class="search-category-grid">
        `;
        
        categoryResults.forEach(component => {
            html += generateComponentCard(component, category);
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    unifiedGrid.innerHTML = html;
}

/**
 * Get category icon
 */
function getCategoryIcon(category) {
    const icons = {
        agents: '🤖',
        commands: '⚡',
        settings: '⚙️',
        hooks: '🪝',
        mcps: '🔌'
    };
    return icons[category] || '📦';
}

/**
 * Generate component card HTML (this should match the existing card format)
 */
function generateComponentCard(component, category) {
    const name = component.name || component.title || 'Unnamed Component';
    const description = component.description || 'No description available';
    const tags = component.tags || [];
    
    // Generate installation command based on category
    const installCommand = generateInstallCommand(component, category);
    
    return `
        <div class="component-card" data-category="${category}">
            <div class="card-front">
                <div class="card-header">
                    <div class="card-title-row">
                        <h3 class="card-title">${name}</h3>
                        <div class="card-category">${getCategoryIcon(category)} ${category}</div>
                    </div>
                    <p class="card-description">${description}</p>
                </div>
                <div class="card-tags">
                    ${tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    ${tags.length > 3 ? `<span class="tag-more">+${tags.length - 3}</span>` : ''}
                </div>
                <div class="card-actions">
                    <button class="btn btn-primary add-to-cart" onclick="addToCart('${category}', '${component.name || component.path}')">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19,7H16V6A4,4 0 0,0 12,2A4,4 0 0,0 8,6V7H5A1,1 0 0,0 4,8V19A3,3 0 0,0 7,22H17A3,3 0 0,0 20,19V8A1,1 0 0,0 19,7M10,6A2,2 0 0,1 12,4A2,2 0 0,1 14,6V7H10V6M18,19A1,1 0 0,1 17,20H7A1,1 0 0,1 6,19V9H8V10A1,1 0 0,0 10,10A1,1 0 0,0 10,8V9H14V10A1,1 0 0,0 16,10A1,1 0 0,0 14,8V9H18V19Z"/>
                        </svg>
                        Add to Cart
                    </button>
                </div>
            </div>
            <div class="card-back">
                <div class="install-commands">
                    <div class="command-section">
                        <div class="command-label">Installation Command:</div>
                        <div class="command-line">
                            <span class="prompt">$</span>
                            <code class="command">${installCommand}</code>
                            <button class="copy-btn" onclick="copyToClipboard('${installCommand}')">Copy</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate installation command for component
 */
function generateInstallCommand(component, category) {
    let name = component.name || component.path || component.title;
    let categoryParam = category.slice(0, -1); // Remove 's' from category name
    
    // Handle special cases for category parameters
    if (category === 'settings' || category === 'hooks') {
        // Use the path if available for settings and hooks
        if (component.path) {
            name = component.path.replace(/\.(json|md)$/, ''); // Remove file extension
        }
        categoryParam = category.slice(0, -1); // 'setting' or 'hook'
    }
    
    return `npx claude-code-templates@latest --${categoryParam}=${name} --yes`;
}

/**
 * Show all components except templates
 */
function showAllComponents() {
    // This function should integrate with existing filter logic
    if (typeof setUnifiedFilter === 'function') {
        setUnifiedFilter('agents'); // Default to agents
    }
}

// Initialize search functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load components for search
    loadComponentsForSearch();
    
    // Add CSS for search functionality if not already present
    if (!document.getElementById('search-styles')) {
        const searchStyles = document.createElement('style');
        searchStyles.id = 'search-styles';
        searchStyles.textContent = `
            .search-btn.active {
                background-color: var(--accent-color, #00d4aa) !important;
                color: var(--bg-color, #0a0e0f) !important;
            }
            
            .search-bar-container {
                margin-top: 1rem;
                padding: 0 1rem;
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                background: var(--card-bg, #1a1f23);
                border: 1px solid var(--border-color, #2a3338);
                border-radius: 8px;
                padding: 0.75rem 1rem;
                transition: border-color 0.2s ease;
            }
            
            .search-input-wrapper:focus-within {
                border-color: var(--accent-color, #00d4aa);
                box-shadow: 0 0 0 2px var(--accent-color, #00d4aa)20;
            }
            
            .search-icon {
                margin-right: 0.75rem;
                color: var(--text-dim, #8892a0);
            }
            
            .search-input {
                flex: 1;
                background: transparent;
                border: none;
                outline: none;
                color: var(--text-color, #ffffff);
                font-size: 1rem;
                font-family: 'Inter', sans-serif;
            }
            
            .search-input::placeholder {
                color: var(--text-dim, #8892a0);
            }
            
            .clear-search-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                height: 24px;
                margin-left: 0.5rem;
                background: transparent;
                border: none;
                border-radius: 4px;
                color: var(--text-dim, #8892a0);
                cursor: pointer;
                transition: all 0.2s ease;
            }
            
            .clear-search-btn:hover {
                background: var(--hover-bg, #2a3338);
                color: var(--text-color, #ffffff);
            }
            
            .search-results-info {
                margin-top: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
                flex-wrap: wrap;
                gap: 1rem;
            }
            
            .results-count {
                color: var(--text-dim, #8892a0);
                font-size: 0.9rem;
            }
            
            .search-filters {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                flex-wrap: wrap;
            }
            
            .search-filter-label {
                color: var(--text-dim, #8892a0);
                font-size: 0.85rem;
            }
            
            .search-category-tag {
                background: var(--accent-color, #00d4aa)20;
                color: var(--accent-color, #00d4aa);
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                font-weight: 500;
            }
            
            .no-search-results {
                text-align: center;
                padding: 3rem 2rem;
                color: var(--text-dim, #8892a0);
            }
            
            .no-results-icon {
                font-size: 4rem;
                margin-bottom: 1rem;
            }
            
            .no-search-results h3 {
                color: var(--text-color, #ffffff);
                margin-bottom: 1rem;
            }
            
            .search-suggestions {
                text-align: left;
                max-width: 400px;
                margin: 1.5rem auto 0;
            }
            
            .search-suggestions li {
                margin-bottom: 0.5rem;
                padding-left: 1rem;
            }
            
            .search-category-section {
                margin-bottom: 2rem;
            }
            
            .search-category-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                margin-bottom: 1rem;
                padding-bottom: 0.5rem;
                border-bottom: 1px solid var(--border-color, #2a3338);
                color: var(--text-color, #ffffff);
                font-size: 1.25rem;
                font-weight: 600;
            }
            
            .category-icon {
                font-size: 1.5rem;
            }
            
            .search-category-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 1.5rem;
            }
            
            @media (max-width: 768px) {
                .search-results-info {
                    flex-direction: column;
                    align-items: flex-start;
                }
                
                .search-category-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(searchStyles);
    }
});