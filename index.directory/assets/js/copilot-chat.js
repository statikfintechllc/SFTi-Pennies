/**
 * GitHub Copilot Chat Integration for SFTi-Pennies
 * Provides AI-powered assistance for trading journal and analysis
 */

class CopilotChat {
  constructor() {
    this.isOpen = false;
    this.currentModel = 'gpt-4o';
    this.messages = [];
    this.chatHistory = this.loadChatHistory();
    this.currentChatId = null;
    
    // Keyboard detection and layout constants
    this.KEYBOARD_DETECTION_THRESHOLD = 100; // pixels - viewport height change to detect keyboard
    this.CHAT_PADDING_NORMAL = '100px'; // Normal bottom padding for messages
    this.CHAT_PADDING_KEYBOARD = '120px'; // Extra padding when keyboard is open
    
    // Cached DOM elements for keyboard handler
    this.cachedElements = {
      chatContainer: null,
      inputArea: null,
      messagesArea: null
    };
    
    // Available GitHub Copilot models with GitHub routing
    this.models = [
      // Fast & Efficient
      {
        id: 'gpt-5-mini',
        name: 'GPT-5-mini',
        description: 'Fast & Efficient',
        category: 'fast',
        route: 'github/gpt-5-mini'
      },
      {
        id: 'grok-code-fast-1',
        name: 'Grok Code Fast 1',
        description: 'Fast & Efficient',
        category: 'fast',
        route: 'github/grok-code-fast-1'
      },
      // Versatile and Highly Intelligent
      {
        id: 'gpt-4.1',
        name: 'GPT-4.1',
        description: 'Versatile and Highly Intelligent',
        category: 'versatile',
        route: 'github/gpt-4.1'
      },
      {
        id: 'gpt-5',
        name: 'GPT-5',
        description: 'Versatile and Highly Intelligent',
        category: 'versatile',
        route: 'github/gpt-5'
      },
      {
        id: 'gpt-4o',
        name: 'GPT-4o',
        description: 'Versatile and Highly Intelligent',
        category: 'versatile',
        route: 'github/gpt-4o'
      },
      {
        id: 'claude-sonnet-3.5',
        name: 'Claude Sonnet 3.5',
        description: 'Versatile and Highly Intelligent',
        category: 'versatile',
        route: 'github/claude-sonnet-3.5'
      },
      {
        id: 'claude-sonnet-4',
        name: 'Claude Sonnet 4',
        description: 'Versatile and Highly Intelligent',
        category: 'versatile',
        route: 'github/claude-sonnet-4'
      },
      {
        id: 'claude-sonnet-4.5',
        name: 'Claude Sonnet 4.5',
        description: 'Versatile and Highly Intelligent',
        category: 'versatile',
        route: 'github/claude-sonnet-4.5'
      },
      {
        id: 'claude-haiku-4.5',
        name: 'Claude Haiku 4.5',
        description: 'Versatile and Highly Intelligent',
        category: 'versatile',
        route: 'github/claude-haiku-4.5'
      },
      // Most Powerful at Complex Tasks
      {
        id: 'claude-opus-4.1',
        name: 'Claude Opus 4.1',
        description: 'Most Powerful at Complex Tasks',
        category: 'powerful',
        route: 'github/claude-opus-4.1'
      },
      {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Most Powerful at Complex Tasks',
        category: 'powerful',
        route: 'github/gemini-2.5-pro'
      }
    ];
    
    this.init();
  }
  
  renderModelsWithCategories() {
    const categories = {
      'fast': 'Fast & Efficient',
      'versatile': 'Versatile and Highly Intelligent',
      'powerful': 'Most Powerful at Complex Tasks'
    };
    
    let html = '';
    let currentCategory = '';
    
    this.models.forEach(model => {
      if (model.category !== currentCategory) {
        currentCategory = model.category;
        html += `<div class="copilot-model-category">${categories[currentCategory]}</div>`;
      }
      html += `
        <div class="copilot-model-option ${model.id === this.currentModel ? 'active' : ''}" data-model="${model.id}">
          <div class="copilot-model-name">${model.name}</div>
          <div class="copilot-model-desc">${model.description}</div>
        </div>
      `;
    });
    
    return html;
  }
  
  init() {
    // Only create FAB button if not on copilot.html page
    const isCopilotPage = window.location.pathname.includes('copilot.html');
    
    if (!isCopilotPage) {
      this.createCopilotButton();
    } else {
      // On copilot.html, populate the model dropdown and attach event listeners
      this.populateModelDropdown();
      this.attachEventListeners();
      this.setupMobileKeyboardHandler();
    }
  }
  
  populateModelDropdown() {
    const modelDropdown = document.getElementById('model-dropdown');
    if (modelDropdown) {
      modelDropdown.innerHTML = this.renderModelsWithCategories();
    }
  }
  
  createCopilotButton() {
    // Create floating Copilot button (bottom right corner) as a link to separate page
    const copilotButton = document.createElement('a');
    copilotButton.className = 'copilot-fab';
    copilotButton.id = 'copilot-trigger';
    copilotButton.href = 'index.directory/copilot.html';
    copilotButton.setAttribute('aria-label', 'Open GitHub Copilot');
    copilotButton.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
      </svg>
    `;
    
    // Append to body instead of navbar
    document.body.appendChild(copilotButton);
  }
  
  attachEventListeners() {
    // Menu toggle
    const menuToggle = document.getElementById('copilot-menu-toggle');
    const navSidebar = document.getElementById('copilot-nav-sidebar');
    const navOverlay = document.getElementById('copilot-nav-overlay');
    const navClose = document.getElementById('copilot-nav-close');
    
    if (menuToggle && navSidebar && navOverlay) {
      menuToggle.addEventListener('click', () => {
        navSidebar.classList.add('active');
        navOverlay.classList.add('active');
        menuToggle.classList.add('active');
      });
      
      const closeNav = () => {
        navSidebar.classList.remove('active');
        navOverlay.classList.remove('active');
        menuToggle.classList.remove('active');
      };
      
      if (navClose) {
        navClose.addEventListener('click', closeNav);
      }
      
      navOverlay.addEventListener('click', closeNav);
    }
    
    // Trigger button
    const triggerButton = document.getElementById('copilot-trigger');
    if (triggerButton) {
      triggerButton.addEventListener('click', () => this.openChat());
    }
    
    // New Chat button (for standalone page)
    const newChatButton = document.getElementById('copilot-new-chat');
    if (newChatButton) {
      newChatButton.addEventListener('click', () => this.newChat());
    }
    
    // Send button
    const sendButton = document.getElementById('send-button');
    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendMessage());
    }
    
    // Input enter key
    const input = document.getElementById('chat-input');
    if (input) {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.sendMessage();
        }
      });
      
      // Auto-resize textarea
      input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 150) + 'px';
      });
    }
    
    // Model selector
    const modelButton = document.getElementById('model-selector-button');
    const modelDropdown = document.getElementById('model-dropdown');
    if (modelButton && modelDropdown) {
      modelButton.addEventListener('click', (e) => {
        e.stopPropagation();
        modelDropdown.classList.toggle('active');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!modelDropdown.contains(e.target) && e.target !== modelButton) {
          modelDropdown.classList.remove('active');
        }
      });
      
      // Model selection
      const modelOptions = modelDropdown.querySelectorAll('.copilot-model-option');
      modelOptions.forEach(option => {
        option.addEventListener('click', () => {
          const modelId = option.dataset.model;
          this.switchModel(modelId);
          modelDropdown.classList.remove('active');
        });
      });
    }
    
    // History button
    const historyButton = document.getElementById('history-button');
    const historyDropdown = document.getElementById('history-dropdown');
    if (historyButton && historyDropdown) {
      historyButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.updateHistoryDropdown();
        historyDropdown.classList.toggle('active');
      });
      
      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!historyDropdown.contains(e.target) && e.target !== historyButton) {
          historyDropdown.classList.remove('active');
        }
      });
    }
  }
  
  setupMobileKeyboardHandler() {
    // Cache DOM elements once for better performance
    this.cachedElements.chatContainer = document.querySelector('.copilot-chat-container');
    this.cachedElements.inputArea = document.querySelector('.copilot-chat-input-area');
    this.cachedElements.messagesArea = document.getElementById('chat-messages');
    
    const input = document.getElementById('chat-input');
    if (!input) return;
    
    // Store original viewport height for comparison
    let initialHeight = window.innerHeight;
    let keyboardOpen = false;
    
    // Handle keyboard appearance using resize events
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      const { chatContainer, messagesArea, inputArea } = this.cachedElements;
      
      if (!chatContainer || !messagesArea || !inputArea) return;
      
      // Detect keyboard: viewport height decreased by threshold
      const heightDiff = initialHeight - currentHeight;
      const wasKeyboardOpen = keyboardOpen;
      keyboardOpen = heightDiff > this.KEYBOARD_DETECTION_THRESHOLD;
      
      if (keyboardOpen && !wasKeyboardOpen) {
        // Keyboard just opened - adjust layout
        // Calculate available height: viewport - header
        const headerHeight = 60; // Mobile header height
        const availableHeight = currentHeight - headerHeight;
        
        // Set container to available height to prevent scrolling
        chatContainer.style.height = `${availableHeight}px`;
        
        // Ensure messages area scrolls to bottom
        setTimeout(() => {
          messagesArea.scrollTop = messagesArea.scrollHeight;
        }, 100);
      } else if (!keyboardOpen && wasKeyboardOpen) {
        // Keyboard closed - restore normal layout
        chatContainer.style.height = '100%';
      }
    };
    
    // Handle input focus events
    const handleFocus = () => {
      const { messagesArea } = this.cachedElements;
      if (!messagesArea) return;
      
      // Wait for keyboard animation, then scroll to bottom
      setTimeout(() => {
        messagesArea.scrollTop = messagesArea.scrollHeight;
      }, 300);
      
      // Also trigger resize handler after delay
      setTimeout(handleResize, 400);
    };
    
    // Handle input blur (keyboard closing)
    const handleBlur = () => {
      setTimeout(handleResize, 100);
    };
    
    // Modern browsers: use visualViewport API for more accurate detection
    if ('visualViewport' in window) {
      const visualViewport = window.visualViewport;
      let lastViewportHeight = visualViewport.height;
      
      const handleViewportChange = () => {
        const currentHeight = visualViewport.height;
        const { chatContainer, messagesArea } = this.cachedElements;
        
        if (!chatContainer || !messagesArea) return;
        
        const heightDiff = lastViewportHeight - currentHeight;
        const wasKeyboardOpen = keyboardOpen;
        keyboardOpen = heightDiff > this.KEYBOARD_DETECTION_THRESHOLD;
        
        if (keyboardOpen && !wasKeyboardOpen) {
          // Keyboard opened
          const headerHeight = window.innerWidth <= 768 ? 60 : 70;
          const availableHeight = currentHeight - headerHeight;
          chatContainer.style.height = `${availableHeight}px`;
          
          setTimeout(() => {
            messagesArea.scrollTop = messagesArea.scrollHeight;
          }, 100);
        } else if (!keyboardOpen && wasKeyboardOpen) {
          // Keyboard closed
          chatContainer.style.height = '100%';
        }
        
        lastViewportHeight = currentHeight;
      };
      
      visualViewport.addEventListener('resize', handleViewportChange);
      visualViewport.addEventListener('scroll', handleViewportChange);
    } else {
      // Fallback: use window resize
      window.addEventListener('resize', handleResize);
    }
    
    // Listen to input focus/blur events
    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);
    
    // Update initial height on orientation change
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        initialHeight = window.innerHeight;
        keyboardOpen = false;
        const { chatContainer } = this.cachedElements;
        if (chatContainer) {
          chatContainer.style.height = '100%';
        }
      }, 300);
    });
  }
  
  openChat() {
    const modal = document.getElementById('copilot-modal');
    if (modal) {
      this.isOpen = true;
      modal.classList.add('active');
      
      // On mobile, prevent ANY scrolling of the page
      if (window.innerWidth <= 768) {
        // Lock both html and body to prevent any page scrolling
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.width = '100%';
        document.documentElement.style.height = '100%';
        document.documentElement.style.overflow = 'hidden';
        
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.top = '0';
        document.body.style.left = '0';
      } else {
        document.body.style.overflow = 'hidden';
      }
      
      // Focus input
      setTimeout(() => {
        const input = document.getElementById('chat-input');
        if (input) input.focus();
      }, 300);
    }
  }
  
  closeChat() {
    const modal = document.getElementById('copilot-modal');
    if (modal) {
      this.isOpen = false;
      modal.classList.remove('active');
      
      // Reset both html and body styles
      document.documentElement.style.position = '';
      document.documentElement.style.width = '';
      document.documentElement.style.height = '';
      document.documentElement.style.overflow = '';
      
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.overflow = '';
      document.body.style.top = '';
      document.body.style.left = '';
    }
  }
  
  newChat() {
    // Clear current messages
    this.messages = [];
    this.currentChatId = null;
    
    // Clear the chat display
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.innerHTML = `
        <div class="copilot-welcome">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <h3>Welcome to GitHub Copilot</h3>
          <p>Ask me anything about trading, analyze your trades, or get help with your trading journal. I'm here to assist you!</p>
        </div>
      `;
    }
    
    // Clear input
    const input = document.getElementById('chat-input');
    if (input) {
      input.value = '';
      input.style.height = 'auto';
    }
  }
  
  switchModel(modelId) {
    this.currentModel = modelId;
    const model = this.models.find(m => m.id === modelId);
    
    // Update button text
    const currentModelName = document.getElementById('current-model-name');
    if (currentModelName && model) {
      currentModelName.textContent = model.name;
    }
    
    // Update active state
    const modelOptions = document.querySelectorAll('.copilot-model-option');
    modelOptions.forEach(option => {
      if (option.dataset.model === modelId) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
    
    // Log GitHub routing for debugging
    if (model && model.route) {
      console.log(`Switched to ${model.name} using GitHub route: ${model.route}`);
    }
    
    // Show notification
    this.addSystemMessage(`Switched to ${model ? model.name : modelId}`);
  }
  
  async sendMessage() {
    const input = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    
    if (!input || !input.value.trim()) return;
    
    const userMessage = input.value.trim();
    input.value = '';
    input.style.height = 'auto';
    
    // Disable input while processing
    input.disabled = true;
    sendButton.disabled = true;
    
    // Add user message
    this.addMessage('user', userMessage);
    
    // Show loading indicator
    this.showLoadingIndicator();
    
    // Simulate AI response (in production, this would call GitHub Copilot API)
    try {
      const response = await this.getAIResponse(userMessage);
      this.removeLoadingIndicator();
      this.addMessage('assistant', response);
      
      // Save to history
      this.saveToHistory(userMessage, response);
    } catch (error) {
      this.removeLoadingIndicator();
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      console.error('Error getting AI response:', error);
    }
    
    // Re-enable input
    input.disabled = false;
    sendButton.disabled = false;
    input.focus();
  }
  
  async getAIResponse(userMessage) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get current model route
    const model = this.models.find(m => m.id === this.currentModel);
    const modelRoute = model ? model.route : 'github/gpt-4o';
    
    // In production, this would call the GitHub Copilot API using the model route
    // Example: await fetch(`https://api.github.com/copilot/chat/${modelRoute}`, {...})
    console.log(`Using GitHub model route: ${modelRoute} for query: "${userMessage}"`);
    
    // For now, return intelligent mock responses based on context
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('trade') || lowerMessage.includes('trading')) {
      return `I can help you analyze your trades! Here are some things I can do:

**Trade Analysis:**
- Review your win/loss patterns
- Identify profitable setups
- Analyze risk management

**Strategy Help:**
- 7-Step Framework guidance
- GSTRWT workflow tips
- Pattern recognition assistance

**Journal Insights:**
- Track your progress over time
- Identify improvement areas
- Calculate key metrics

What specific aspect of your trading would you like to explore?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
      return `I'm here to help! I can assist with:

1. **Trade Analysis** - Review your trading performance
2. **Strategy Guidance** - Help with the 7-Step Framework and GSTRWT
3. **Risk Management** - Calculate position sizes and stop losses
4. **Pattern Recognition** - Identify chart patterns in your trades
5. **Journal Insights** - Analyze your trading journal data

Just ask me anything related to trading or your journal!`;
    }
    
    if (lowerMessage.includes('pattern') || lowerMessage.includes('setup')) {
      return `Let me help you with trading patterns!

**Common Penny Stock Patterns:**
- **Morning Panic Dip Buys** - Buy the panic, sell into strength
- **Afternoon Breakouts** - Consolidation breaks with volume
- **Red-to-Green Moves** - Reversal plays
- **Parabolic Short Squeezes** - High-risk momentum plays

**Pattern Checklist:**
✅ Volume spike (2x+ average)
✅ Clear support/resistance levels
✅ News catalyst present
✅ Float under 100M shares
✅ Price action confirms pattern

Would you like me to analyze a specific pattern or trade setup?`;
    }
    
    if (lowerMessage.includes('risk') || lowerMessage.includes('position size')) {
      return `**Risk Management Guidelines:**

**Position Sizing:**
- Never risk more than 2% of total capital per trade
- For a $10,000 account, max risk = $200
- Calculate: Position Size = Risk Amount / (Entry - Stop Loss)

**Stop Loss Rules:**
- Always set before entering
- Use support/resistance levels
- Mental stops can fail - use hard stops
- Never move stop loss against you

**Example:**
- Account: $10,000
- Risk: 2% = $200
- Entry: $2.00
- Stop: $1.80
- Risk per share: $0.20
- Max shares: $200 / $0.20 = 1,000 shares

Would you like help calculating position size for a specific trade?`;
    }
    
    // Default response
    return `I understand you're asking about: "${userMessage}"

As your AI trading assistant, I'm here to help with:
- **Trading Analysis** - Review performance and patterns
- **Strategy Development** - Improve your trading plan
- **Risk Management** - Calculate position sizes
- **Journal Insights** - Track and analyze progress

Could you provide more details about what you'd like to know?

*Note: This is a demo response. In production, I would connect to GitHub Copilot's actual AI models for real-time, intelligent responses.*`;
  }
  
  addMessage(role, content) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    // Remove welcome message if present
    const welcome = messagesContainer.querySelector('.copilot-welcome');
    if (welcome) {
      welcome.remove();
    }
    
    const time = new Date().toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    
    const messageHTML = `
      <div class="copilot-message ${role}">
        <div class="copilot-message-avatar">
          ${role === 'user' ? 'You' : 'AI'}
        </div>
        <div class="copilot-message-content">
          <div class="copilot-message-header">
            <span class="copilot-message-author">${role === 'user' ? 'You' : 'GitHub Copilot'}</span>
            <span class="copilot-message-time">${time}</span>
          </div>
          <div class="copilot-message-text">${this.formatMessage(content)}</div>
        </div>
      </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store message
    this.messages.push({ role, content, timestamp: new Date().toISOString() });
  }
  
  addSystemMessage(content) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const messageHTML = `
      <div style="text-align: center; padding: 0.5rem; color: var(--text-dim); font-size: 0.875rem;">
        ${content}
      </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  formatMessage(content) {
    // First, escape HTML to prevent XSS
    const escaped = this.escapeHtml(content);
    
    // Convert markdown-style formatting to HTML
    let formatted = escaped
      // Convert **bold** to <strong>
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      // Convert `code` to <code>
      .replace(/`(.+?)`/g, '<code>$1</code>')
      // Convert line breaks
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    if (!formatted.startsWith('<p>')) {
      formatted = '<p>' + formatted + '</p>';
    }
    
    return formatted;
  }
  
  showLoadingIndicator() {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) return;
    
    const loadingHTML = `
      <div class="copilot-message assistant" id="loading-indicator">
        <div class="copilot-message-avatar">AI</div>
        <div class="copilot-message-content">
          <div class="copilot-loading">
            <div class="copilot-loading-dots">
              <div class="copilot-loading-dot"></div>
              <div class="copilot-loading-dot"></div>
              <div class="copilot-loading-dot"></div>
            </div>
            <span style="color: var(--text-dim); font-size: 0.875rem;">Thinking...</span>
          </div>
        </div>
      </div>
    `;
    
    messagesContainer.insertAdjacentHTML('beforeend', loadingHTML);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }
  
  removeLoadingIndicator() {
    const loading = document.getElementById('loading-indicator');
    if (loading) {
      loading.remove();
    }
  }
  
  saveToHistory(question, answer) {
    if (!this.currentChatId) {
      this.currentChatId = Date.now().toString();
    }
    
    const chat = {
      id: this.currentChatId,
      title: question.substring(0, 50) + (question.length > 50 ? '...' : ''),
      preview: answer.substring(0, 80) + (answer.length > 80 ? '...' : ''),
      timestamp: new Date().toISOString(),
      messages: this.messages,
      model: this.currentModel
    };
    
    // Update or add chat
    const existingIndex = this.chatHistory.findIndex(c => c.id === this.currentChatId);
    if (existingIndex >= 0) {
      this.chatHistory[existingIndex] = chat;
    } else {
      this.chatHistory.unshift(chat);
    }
    
    // Keep only last 20 chats
    if (this.chatHistory.length > 20) {
      this.chatHistory = this.chatHistory.slice(0, 20);
    }
    
    localStorage.setItem('copilot_chat_history', JSON.stringify(this.chatHistory));
  }
  
  loadChatHistory() {
    try {
      const history = localStorage.getItem('copilot_chat_history');
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error loading chat history:', error);
      return [];
    }
  }
  
  updateHistoryDropdown() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;
    
    if (this.chatHistory.length === 0) {
      historyList.innerHTML = '<div class="copilot-history-empty">No chat history yet</div>';
      return;
    }
    
    const historyHTML = this.chatHistory.map(chat => {
      const date = new Date(chat.timestamp);
      const timeAgo = this.getTimeAgo(date);
      
      return `
        <div class="copilot-history-item" data-chat-id="${chat.id}">
          <div class="copilot-history-title">${this.escapeHtml(chat.title)}</div>
          <div class="copilot-history-preview">${this.escapeHtml(chat.preview)}</div>
          <div class="copilot-history-time">${timeAgo}</div>
        </div>
      `;
    }).join('');
    
    historyList.innerHTML = historyHTML;
    
    // Attach click listeners
    historyList.querySelectorAll('.copilot-history-item').forEach(item => {
      item.addEventListener('click', () => {
        const chatId = item.dataset.chatId;
        this.loadChat(chatId);
        document.getElementById('history-dropdown').classList.remove('active');
      });
    });
  }
  
  loadChat(chatId) {
    const chat = this.chatHistory.find(c => c.id === chatId);
    if (!chat) return;
    
    // Clear current messages
    this.messages = chat.messages || [];
    this.currentChatId = chatId;
    this.currentModel = chat.model || 'gpt-4o';
    
    // Update UI
    const messagesContainer = document.getElementById('chat-messages');
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
      
      this.messages.forEach(msg => {
        this.addMessage(msg.role, msg.content);
      });
    }
    
    // Update model selector
    this.switchModel(this.currentModel);
  }
  
  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' min ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hr ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    
    return date.toLocaleDateString();
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize Copilot Chat when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.copilotChat = new CopilotChat();
  });
} else {
  window.copilotChat = new CopilotChat();
}
