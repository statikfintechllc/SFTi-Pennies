/**
 * SFTi-Pennies Trading Journal - Authentication Module
 * Supports both OAuth/GitHub App (preferred) and manual PAT fallback
 * 
 * SECURITY NOTES:
 * - OAuth/GitHub App is the recommended authentication method
 * - PAT should only be stored in localStorage, never in code
 * - PAT storage comes with security risks - use at your own discretion
 * - This code does NOT leak tokens - they are only stored client-side
 */

class GitHubAuth {
  constructor() {
    this.token = null;
    this.authMethod = null;
    this.username = null;
    // Get repository name from the page URL or use default
    // This makes the code portable across different forks/deployments
    this.repo = this.getRepoFromURL() || 'SFTi-Pennies';
    this.owner = 'statikfintechllc';
    
    // Check for stored PAT
    this.checkStoredAuth();
  }
  
  /**
   * Extract repository name from current URL
   * Works with GitHub Pages URLs like: username.github.io/repo-name
   * @returns {string|null} - Repository name or null
   */
  getRepoFromURL() {
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    // For GitHub Pages, the first path segment is usually the repo name
    // unless it's a custom domain
    if (pathSegments.length > 0 && window.location.hostname.includes('github.io')) {
      return pathSegments[0];
    }
    return null;
  }
  
  /**
   * Check if there's a stored PAT in localStorage
   */
  checkStoredAuth() {
    const storedPAT = localStorage.getItem('github_pat');
    if (storedPAT) {
      this.token = storedPAT;
      this.authMethod = 'pat';
      console.log('Using stored PAT for authentication');
    }
  }
  
  /**
   * Initiate OAuth flow (GitHub App)
   * This is the preferred authentication method
   */
  async initiateOAuth() {
    // GitHub OAuth App credentials would be configured here
    // For now, this is a placeholder for future OAuth implementation
    console.warn('OAuth flow not yet implemented. Please use PAT authentication.');
    alert('OAuth authentication is not yet configured. Please use Personal Access Token instead.');
  }
  
  /**
   * Set PAT manually (fallback method)
   * WARNING: Storing tokens in localStorage has security implications
   * @param {string} pat - Personal Access Token with repo scope
   */
  setPAT(pat) {
    if (!pat || pat.trim() === '') {
      throw new Error('PAT cannot be empty');
    }
    
    // Basic validation
    if (!pat.startsWith('ghp_') && !pat.startsWith('github_pat_')) {
      console.warn('Token format appears incorrect. Expected format: ghp_* or github_pat_*');
    }
    
    this.token = pat;
    this.authMethod = 'pat';
    
    // Store in localStorage (user should be aware of the risks)
    localStorage.setItem('github_pat', pat);
    console.log('PAT stored in localStorage. Authentication method: PAT');
  }
  
  /**
   * Clear stored authentication
   */
  clearAuth() {
    this.token = null;
    this.authMethod = null;
    this.username = null;
    localStorage.removeItem('github_pat');
    console.log('Authentication cleared');
  }
  
  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return this.token !== null;
  }
  
  /**
   * Get authentication headers for GitHub API requests
   * @returns {Object}
   */
  getAuthHeaders() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated. Please set up authentication first.');
    }
    
    return {
      'Authorization': `Bearer ${this.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Verify authentication by testing API access
   * @returns {Promise<Object>} User information if successful
   */
  async verifyAuth() {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    try {
      const response = await fetch('https://api.github.com/user', {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
      }
      
      const user = await response.json();
      this.username = user.login;
      console.log(`Authenticated as: ${this.username}`);
      return user;
    } catch (error) {
      console.error('Authentication verification failed:', error);
      throw error;
    }
  }
  
  /**
   * Upload file to GitHub repository
   * @param {string} path - File path in repository
   * @param {string} content - Base64 encoded content
   * @param {string} message - Commit message
   * @returns {Promise<Object>}
   */
  async uploadFile(path, content, message) {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    const url = `https://api.github.com/repos/${this.owner}/${this.repo}/contents/${path}`;
    
    try {
      // Check if file exists
      let sha = null;
      try {
        const existingFile = await fetch(url, {
          headers: this.getAuthHeaders()
        });
        if (existingFile.ok) {
          const data = await existingFile.json();
          sha = data.sha;
        }
      } catch (e) {
        // File doesn't exist, which is fine
      }
      
      const body = {
        message: message,
        content: content,
        branch: 'main'
      };
      
      if (sha) {
        body.sha = sha;
      }
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('File upload failed:', error);
      throw error;
    }
  }
  
  /**
   * Create a new branch
   * @param {string} branchName - Name of the new branch
   * @param {string} fromBranch - Base branch (default: 'main')
   * @returns {Promise<Object>}
   */
  async createBranch(branchName, fromBranch = 'main') {
    if (!this.isAuthenticated()) {
      throw new Error('Not authenticated');
    }
    
    try {
      // Get the SHA of the base branch
      const refResponse = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${fromBranch}`,
        { headers: this.getAuthHeaders() }
      );
      
      if (!refResponse.ok) {
        throw new Error('Failed to get base branch reference');
      }
      
      const refData = await refResponse.json();
      const sha = refData.object.sha;
      
      // Create new branch
      const createResponse = await fetch(
        `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs`,
        {
          method: 'POST',
          headers: this.getAuthHeaders(),
          body: JSON.stringify({
            ref: `refs/heads/${branchName}`,
            sha: sha
          })
        }
      );
      
      if (!createResponse.ok) {
        const error = await createResponse.json();
        throw new Error(`Branch creation failed: ${error.message}`);
      }
      
      return await createResponse.json();
    } catch (error) {
      console.error('Branch creation failed:', error);
      throw error;
    }
  }
}

// Export for use in other modules
window.GitHubAuth = GitHubAuth;

/**
 * Show authentication modal/prompt
 */
function showAuthPrompt() {
  const modal = document.createElement('div');
  modal.className = 'auth-modal';
  modal.innerHTML = `
    <div class="auth-modal-content">
      <h2>GitHub Authentication Required</h2>
      <p class="auth-warning">
        ⚠️ <strong>Security Notice:</strong> PAT will be stored in browser localStorage.
        Only use this on trusted devices.
      </p>
      <div class="form-group">
        <label class="form-label">Personal Access Token</label>
        <input type="password" id="pat-input" class="form-input" 
               placeholder="ghp_xxxxxxxxxxxx">
        <p class="form-helper">
          Generate a PAT at: <a href="https://github.com/settings/tokens" target="_blank">
          GitHub Settings → Developer settings → Personal access tokens</a>
          <br>Required scopes: <code>repo</code>
        </p>
      </div>
      <div style="display: flex; gap: 1rem;">
        <button class="btn btn-primary" id="auth-submit">Authenticate</button>
        <button class="btn btn-secondary" id="auth-cancel">Cancel</button>
      </div>
    </div>
  `;
  
  // Add modal styles
  const style = document.createElement('style');
  style.textContent = `
    .auth-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
    }
    .auth-modal-content {
      background-color: var(--bg-secondary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 2rem;
      max-width: 500px;
      width: 90%;
    }
    .auth-warning {
      background-color: rgba(255, 217, 61, 0.1);
      border-left: 4px solid var(--accent-yellow);
      padding: 1rem;
      margin: 1rem 0;
      border-radius: 4px;
      color: var(--accent-yellow);
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(modal);
  
  // Handle authentication
  document.getElementById('auth-submit').addEventListener('click', async () => {
    const pat = document.getElementById('pat-input').value;
    if (!pat) {
      alert('Please enter a Personal Access Token');
      return;
    }
    
    const auth = new GitHubAuth();
    try {
      auth.setPAT(pat);
      await auth.verifyAuth();
      alert('Authentication successful!');
      modal.remove();
      window.location.reload();
    } catch (error) {
      alert(`Authentication failed: ${error.message}`);
    }
  });
  
  document.getElementById('auth-cancel').addEventListener('click', () => {
    modal.remove();
  });
}

// Make available globally
window.showAuthPrompt = showAuthPrompt;
