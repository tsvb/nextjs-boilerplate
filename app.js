// Sample data from the application data
const samplePosts = [
    {
        id: 1,
        title: "Welcome to My Blog",
        date: "Aug 01, 2025",
        excerpt: "This is the beginning of something new. A place to share thoughts, ideas, and discoveries.",
        content: "Welcome to my new blog! This is a space where I'll be sharing my thoughts on technology, design, and life. I've always believed that the best ideas come from sharing and discussion, so I hope this becomes a place for meaningful conversation.",
        category: "general",
        tags: ["welcome", "blogging", "thoughts"]
    },
    {
        id: 2,
        title: "The Art of Simple Design",
        date: "Jul 30, 2025", 
        excerpt: "Why less is often more when it comes to creating beautiful, functional interfaces.",
        content: "In a world filled with noise and complexity, there's something refreshing about simple, clean design. It's not about removing features or functionality - it's about presenting them in a way that feels effortless and intuitive.",
        category: "design",
        tags: ["design", "minimalism", "ui"]
    },
    {
        id: 3,
        title: "Building with Glass",
        date: "Jul 28, 2025",
        excerpt: "Exploring the glassmorphism design trend and how to implement it effectively.",
        content: "Glassmorphism has become one of the most striking design trends of recent years. When done right, it creates depth and visual interest while maintaining clarity and usability.",
        category: "development",
        tags: ["glassmorphism", "css", "frontend"]
    }
];

// App state
let posts = [...samplePosts];
let filteredPosts = [...posts];
let currentFilter = 'all';
let currentSearchTerm = '';

// DOM elements - will be initialized after DOM loads
let navLinks, pages, postsContainer, searchInput, searchBtn, filterBtns;
let adminToggle, adminPanel, adminBackdrop, closeAdmin;
let tabBtns, tabContents, createPostForm, contactForm;
let backToHome, postDetailContent;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeDOMElements();
    initializeApp();
});

function initializeDOMElements() {
    // Get all DOM elements
    navLinks = document.querySelectorAll('.nav-link');
    pages = document.querySelectorAll('.page');
    postsContainer = document.getElementById('posts-feed');
    searchInput = document.getElementById('search-input');
    searchBtn = document.getElementById('search-btn');
    filterBtns = document.querySelectorAll('.filter-btn');
    adminToggle = document.getElementById('admin-toggle');
    adminPanel = document.getElementById('admin-panel');
    adminBackdrop = document.getElementById('admin-backdrop');
    closeAdmin = document.getElementById('close-admin');
    tabBtns = document.querySelectorAll('.tab-btn');
    tabContents = document.querySelectorAll('.tab-content');
    createPostForm = document.getElementById('create-post-form');
    contactForm = document.getElementById('contact-form');
    backToHome = document.getElementById('back-to-home');
    postDetailContent = document.getElementById('post-detail-content');
}

function initializeApp() {
    renderPosts();
    setupEventListeners();
    showPage('home');
}

function setupEventListeners() {
    // Navigation
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                if (page) {
                    showPage(page);
                    updateActiveNavLink(e.target);
                }
            });
        });
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleSearch();
        });
    }

    // Filter
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = e.target.getAttribute('data-category');
                if (category) {
                    handleFilter(category);
                    updateActiveFilterBtn(e.target);
                }
            });
        });
    }

    // Admin panel
    if (adminToggle) {
        adminToggle.addEventListener('click', (e) => {
            e.preventDefault();
            toggleAdminPanel(true);
        });
    }
    
    if (adminBackdrop) {
        adminBackdrop.addEventListener('click', () => toggleAdminPanel(false));
    }
    
    if (closeAdmin) {
        closeAdmin.addEventListener('click', () => toggleAdminPanel(false));
    }

    // Admin tabs
    if (tabBtns) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.getAttribute('data-tab');
                if (tab) {
                    showTab(tab);
                    updateActiveTabBtn(e.target);
                }
            });
        });
    }

    // Forms
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePost);
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }

    // Post detail navigation
    if (backToHome) {
        backToHome.addEventListener('click', (e) => {
            e.preventDefault();
            showPage('home');
            updateActiveNavLink(document.querySelector('[data-page="home"]'));
        });
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            toggleAdminPanel(false);
        }
    });
}

function showPage(pageId) {
    if (!pages) return;
    
    pages.forEach(page => {
        page.classList.remove('active');
    });
    
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
        targetPage.classList.add('active');
    }
}

function updateActiveNavLink(activeLink) {
    if (!navLinks || !activeLink) return;
    
    navLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

function updateActiveFilterBtn(activeBtn) {
    if (!filterBtns || !activeBtn) return;
    
    filterBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function updateActiveTabBtn(activeBtn) {
    if (!tabBtns || !activeBtn) return;
    
    tabBtns.forEach(btn => btn.classList.remove('active'));
    activeBtn.classList.add('active');
}

function showTab(tabId) {
    if (!tabContents) return;
    
    tabContents.forEach(content => content.classList.remove('active'));
    const targetTab = document.getElementById(`${tabId}-tab`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    if (tabId === 'manage') {
        renderPostsList();
    }
}

function renderPosts() {
    if (!postsContainer) return;
    
    if (filteredPosts.length === 0) {
        postsContainer.innerHTML = `
            <div class="glass-card" style="padding: var(--space-32); text-align: center;">
                <h3>No posts found</h3>
                <p>Try adjusting your search or filter criteria.</p>
            </div>
        `;
        return;
    }

    postsContainer.innerHTML = filteredPosts.map(post => `
        <article class="glass-card post-card" data-post-id="${post.id}">
            <div class="post-meta">
                <span class="post-date">${post.date}</span>
                <span class="post-category">${post.category}</span>
            </div>
            <h2 class="post-title">${post.title}</h2>
            <p class="post-excerpt">${post.excerpt}</p>
            <div class="post-tags">
                ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
            </div>
        </article>
    `).join('');

    // Add click handlers to post cards
    const postCards = document.querySelectorAll('.post-card');
    if (postCards) {
        postCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = parseInt(card.getAttribute('data-post-id'));
                if (postId) {
                    showPostDetail(postId);
                }
            });
        });
    }
}

function showPostDetail(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !postDetailContent) return;

    postDetailContent.innerHTML = `
        <div class="post-meta">
            <span class="post-date">${post.date}</span>
            <span class="post-category">${post.category}</span>
        </div>
        <h1 class="post-title">${post.title}</h1>
        <div class="post-tags">
            ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
        </div>
        <div class="post-content">${post.content}</div>
    `;

    showPage('post-detail');
}

function handleSearch() {
    if (!searchInput) return;
    
    currentSearchTerm = searchInput.value.toLowerCase().trim();
    filterPosts();
}

function handleFilter(category) {
    currentFilter = category;
    filterPosts();
}

function filterPosts() {
    filteredPosts = posts.filter(post => {
        const matchesSearch = !currentSearchTerm || 
            post.title.toLowerCase().includes(currentSearchTerm) ||
            post.excerpt.toLowerCase().includes(currentSearchTerm) ||
            post.content.toLowerCase().includes(currentSearchTerm) ||
            post.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm));
        
        const matchesCategory = currentFilter === 'all' || post.category === currentFilter;
        
        return matchesSearch && matchesCategory;
    });
    
    renderPosts();
}

function toggleAdminPanel(show) {
    if (!adminPanel) return;
    
    if (show) {
        adminPanel.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } else {
        adminPanel.classList.add('hidden');
        document.body.style.overflow = '';
    }
}

function handleCreatePost(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('post-title');
    const categoryInput = document.getElementById('post-category');
    const tagsInput = document.getElementById('post-tags');
    const excerptInput = document.getElementById('post-excerpt');
    const contentInput = document.getElementById('post-content');
    
    if (!titleInput || !categoryInput || !tagsInput || !excerptInput || !contentInput) {
        showNotification('Form elements not found', 'error');
        return;
    }
    
    const title = titleInput.value.trim();
    const category = categoryInput.value;
    const tags = tagsInput.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    const excerpt = excerptInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!title || !excerpt || !content) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    const newPost = {
        id: Math.max(...posts.map(p => p.id)) + 1,
        title,
        date: new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: '2-digit' 
        }),
        excerpt,
        content,
        category,
        tags
    };
    
    posts.unshift(newPost); // Add to beginning of array
    filterPosts(); // Refresh the filtered posts
    
    // Reset form
    if (createPostForm) {
        createPostForm.reset();
    }
    
    // Show success message
    showNotification('Post created successfully!', 'success');
    
    // Close admin panel
    toggleAdminPanel(false);
}

function renderPostsList() {
    const postsList = document.getElementById('posts-list');
    if (!postsList) return;
    
    if (posts.length === 0) {
        postsList.innerHTML = '<p>No posts yet.</p>';
        return;
    }
    
    postsList.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-item-info">
                <h4>${post.title}</h4>
                <p>${post.date} • ${post.category}</p>
            </div>
            <div class="post-item-actions">
                <button class="btn btn--sm glass-btn" onclick="editPost(${post.id})">Edit</button>
                <button class="btn btn--sm glass-btn" onclick="deletePost(${post.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const titleInput = document.getElementById('post-title');
    const categoryInput = document.getElementById('post-category');
    const tagsInput = document.getElementById('post-tags');
    const excerptInput = document.getElementById('post-excerpt');
    const contentInput = document.getElementById('post-content');
    
    if (!titleInput || !categoryInput || !tagsInput || !excerptInput || !contentInput) return;
    
    // Fill the create form with existing post data
    titleInput.value = post.title;
    categoryInput.value = post.category;
    tagsInput.value = post.tags.join(', ');
    excerptInput.value = post.excerpt;
    contentInput.value = post.content;
    
    // Switch to create tab
    showTab('create');
    const createTabBtn = document.querySelector('[data-tab="create"]');
    if (createTabBtn) {
        updateActiveTabBtn(createTabBtn);
    }
    
    // Remove the post from array (it will be re-added when form is submitted)
    posts = posts.filter(p => p.id !== postId);
    
    showNotification('Post loaded for editing. Make your changes and click "Create Post" to save.', 'info');
}

function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    posts = posts.filter(p => p.id !== postId);
    filterPosts();
    renderPostsList();
    
    showNotification('Post deleted successfully!', 'success');
}

function handleContactSubmission(e) {
    e.preventDefault();
    
    // Simulate form submission
    showNotification('Thank you for your message! I\'ll get back to you soon.', 'success');
    
    // Reset form
    if (contactForm) {
        contactForm.reset();
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 3000;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: var(--radius-base);
        padding: var(--space-16);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        color: var(--color-text);
        font-weight: var(--font-weight-medium);
        max-width: 300px;
        opacity: 0;
        transform: translateX(100%);
        transition: all var(--duration-normal) var(--ease-standard);
    `;
    
    if (type === 'success') {
        notification.style.borderLeftColor = 'var(--color-success)';
        notification.style.borderLeftWidth = '4px';
    } else if (type === 'error') {
        notification.style.borderLeftColor = 'var(--color-error)';
        notification.style.borderLeftWidth = '4px';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    });
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Handle browser back/forward buttons
window.addEventListener('popstate', function(e) {
    if (e.state && e.state.page) {
        showPage(e.state.page);
    }
});

// Add some sample interaction animations
document.addEventListener('mousemove', function(e) {
    // Subtle parallax effect for glass elements (optional enhancement)
    const glassElements = document.querySelectorAll('.glass-card');
    const mouseX = e.clientX / window.innerWidth;
    const mouseY = e.clientY / window.innerHeight;
    
    glassElements.forEach((element, index) => {
        const speed = (index % 3 + 1) * 0.5;
        const x = (mouseX - 0.5) * speed;
        const y = (mouseY - 0.5) * speed;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
    });
});

// Initialize with a small delay to ensure DOM is ready
setTimeout(() => {
    // Add a subtle fade-in animation to the initial content
    const glassCards = document.querySelectorAll('.glass-card');
    if (glassCards) {
        glassCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.6s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
}, 100);