// SPC PowerPoint++ Engine - Lightweight & Modular
class SPCPresentation {
  constructor() {
    this.slides = [];
    this.currentSlideIndex = 0;
    this.gameState = { loyaltyScore: 0, friendsRated: 0 };
    this.loadDefaultSlides();
    this.init();
  }
  
  loadDefaultSlides() {
    // Minimal default slide deck
    this.slides = [
      {
        id: 'intro',
        title: 'SPC PowerPoint++',
        type: 'static',
        rules: {
          content: {
            title: 'Welcome to SPC PowerPoint++',
            subtitle: 'Browser-Native Presentation Engine',
            sections: [
              {
                heading: 'What is SPC PowerPoint++?',
                text: 'A presentation engine that runs entirely in your browser, with no backend required. Each slide is defined by JSON/YAML rules.'
              },
              {
                heading: 'Key Features',
                list: [
                  'Text-based slide definitions (JSON/YAML)',
                  'Interactive slides with logic and state',
                  'Live editing of slide rules',
                  'Export as standalone HTML'
                ]
              }
            ]
          }
        }
      },
      {
        id: 'calculator',
        title: 'ROI Calculator',
        type: 'interactive',
        rules: {
          title: 'Investment ROI Calculator',
          description: 'Calculate your return on investment',
          inputs: [
            { name: 'initial', label: 'Initial Investment ($)', type: 'number', default: 1000 },
            { name: 'final', label: 'Final Value ($)', type: 'number', default: 1200 },
            { name: 'years', label: 'Years Held', type: 'number', default: 1 }
          ],
          calculation: 'Math.round(((inputs.final - inputs.initial) / inputs.initial) * 100 * 100) / 100',
          result_format: 'ROI: {result}% ({years} years)'
        }
      },
      {
        id: 'friend-rater',
        title: 'Friend Loyalty Game',
        type: 'game',
        rules: {
          title: 'Rate Your Friends\' Loyalty',
          description: 'The viral friend-rating game',
          friends: [
            'Sarah (always texts back)',
            'Mike (borrows money, never returns)',
            'Emma (remembers your birthday)',
            'Jake (ghosts you for weeks)'
          ],
          scoring: { 'loyal': 10, 'neutral': 5, 'sus': -5 },
          thresholds: {
            30: 'You have amazing friends!',
            10: 'Pretty good friend group',
            0: 'Time to make new friends...',
            '-20': 'Your friends are sus 👀'
          }
        }
      }
    ];
    
    // Load from localStorage if available
    const saved = localStorage.getItem('spc-presentation');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.slides = data.slides || this.slides;
        this.currentSlideIndex = data.currentSlideIndex || 0;
        this.gameState = data.gameState || this.gameState;
      } catch (e) {
        console.warn('Failed to load saved presentation:', e);
      }
    }
  }
  
  init() {
    this.renderSlideList();
    this.renderCurrentSlide();
    this.updateProgress();
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.previousSlide();
      if (e.key === 'ArrowRight') this.nextSlide();
      if (e.key === 'Escape') this.closeEditor();
    });
  }
  
  renderSlideList() {
    const container = document.getElementById('slide-list');
    container.innerHTML = '';
    
    this.slides.forEach((slide, index) => {
      const li = document.createElement('li');
      li.className = `slide-item ${index === this.currentSlideIndex ? 'active' : ''}`;
      li.innerHTML = `
        <a href="#" class="slide-link" onclick="presentation.goToSlide(${index}); return false;">
          <div class="slide-number">Slide ${index + 1}</div>
          <div class="slide-title">${slide.title}</div>
          <div class="slide-type">${slide.type}</div>
        </a>
      `;
      container.appendChild(li);
    });
  }
  
  renderCurrentSlide() {
    const slide = this.slides[this.currentSlideIndex];
    if (!slide) return;
    
    // Update header
    document.getElementById('current-slide-title').textContent = slide.title;
    document.getElementById('current-slide-meta').textContent = 
      `Slide ${this.currentSlideIndex + 1} of ${this.slides.length} • ${slide.type}`;
    
    // Render slide content
    const renderer = document.getElementById('slide-renderer');
    renderer.innerHTML = this.renderSlideContent(slide);
    
    // Update sidebar
    this.renderSlideList();
    this.updateProgress();
    this.saveState();
  }
  
  renderSlideContent(slide) {
    switch (slide.type) {
      case 'static':
        return this.renderStaticSlide(slide.rules.content);
      case 'interactive':
        return this.renderInteractiveSlide(slide.rules);
      case 'game':
        return this.renderGameSlide(slide.rules);
      default:
        return '<p>Unknown slide type</p>';
    }
  }
  
  renderStaticSlide(content) {
    let html = `<div class="static-slide">`;
    
    if (content.title) {
      html += `<h1>${content.title}</h1>`;
    }
    
    if (content.subtitle) {
      html += `<p style="text-align: center; font-size: 1.3rem; margin-bottom: 40px; opacity: 0.8;">${content.subtitle}</p>`;
    }
    
    if (content.sections) {
      content.sections.forEach(section => {
        if (section.heading) {
          html += `<h2>${section.heading}</h2>`;
        }
        if (section.text) {
          html += `<p>${section.text}</p>`;
        }
        if (section.list) {
          html += '<ul>';
          section.list.forEach(item => {
            html += `<li>${item}</li>`;
          });
          html += '</ul>';
        }
      });
    }
    
    html += '</div>';
    return html;
  }
  
  renderInteractiveSlide(rules) {
    const inputs = rules.inputs || [];
    let html = `
      <div class="interactive-slide">
        <div class="calculator">
          <h2>${rules.title}</h2>
          <p>${rules.description}</p>
    `;
    
    inputs.forEach(input => {
      html += `
        <div>
          <label>${input.label}</label><br>
          <input type="${input.type}" 
                 class="calc-input" 
                 id="input-${input.name}" 
                 value="${input.default || ''}"
                 onchange="presentation.updateCalculation()">
        </div>
      `;
    });
    
    html += `
          <div class="calc-result" id="calc-result">Enter values to calculate</div>
        </div>
      </div>
    `;
    
    setTimeout(() => this.updateCalculation(), 100);
    return html;
  }
  
  renderGameSlide(rules) {
    const friends = rules.friends || [];
    const currentFriend = friends[this.gameState.friendsRated] || null;
    
    let html = `
      <div class="game-slide">
        <div class="game-card">
          <h2>${rules.title}</h2>
          <p>${rules.description}</p>
          <div class="score-display">Loyalty Score: ${this.gameState.loyaltyScore}</div>
    `;
    
    if (currentFriend) {
      html += `
        <h3>Rate: ${currentFriend}</h3>
        <button class="game-btn" onclick="presentation.rateFriend('loyal')">😍 Super Loyal</button>
        <button class="game-btn" onclick="presentation.rateFriend('neutral')">😐 Neutral</button>
        <button class="game-btn" onclick="presentation.rateFriend('sus')">👀 Sus AF</button>
      `;
    } else {
      // Game finished
      const score = this.gameState.loyaltyScore;
      const thresholds = rules.thresholds;
      let message = 'Game complete!';
      
      for (const [threshold, msg] of Object.entries(thresholds)) {
        if (score >= parseInt(threshold)) {
          message = msg;
          break;
        }
      }
      
      html += `
        <h3>Final Result:</h3>
        <p style="font-size: 1.3rem; margin: 20px 0;">${message}</p>
        <button class="game-btn" onclick="presentation.resetGame()">🔄 Play Again</button>
      `;
    }
    
    html += `
        </div>
      </div>
    `;
    
    return html;
  }
  
  updateCalculation() {
    const slide = this.slides[this.currentSlideIndex];
    if (slide.type !== 'interactive') return;
    
    const inputs = {};
    slide.rules.inputs.forEach(input => {
      const element = document.getElementById(`input-${input.name}`);
      if (element) {
        inputs[input.name] = parseFloat(element.value) || 0;
      }
    });
    
    try {
      // Evaluate the calculation formula
      const result = eval(slide.rules.calculation.replace(/inputs\./g, 'inputs.'));
      const formatted = slide.rules.result_format.replace('{result}', result);
      
      // Replace other placeholders
      let finalResult = formatted;
      Object.keys(inputs).forEach(key => {
        finalResult = finalResult.replace(`{${key}}`, inputs[key]);
      });
      
      document.getElementById('calc-result').textContent = finalResult;
    } catch (e) {
      document.getElementById('calc-result').textContent = 'Calculation error';
    }
  }
  
  rateFriend(rating) {
    const slide = this.slides[this.currentSlideIndex];
    const points = slide.rules.scoring[rating] || 0;
    
    this.gameState.loyaltyScore += points;
    this.gameState.friendsRated++;
    
    this.renderCurrentSlide();
  }
  
  resetGame() {
    this.gameState = { loyaltyScore: 0, friendsRated: 0 };
    this.renderCurrentSlide();
  }
  
  goToSlide(index) {
    if (index >= 0 && index < this.slides.length) {
      this.currentSlideIndex = index;
      this.renderCurrentSlide();
    }
  }
  
  nextSlide() {
    if (this.currentSlideIndex < this.slides.length - 1) {
      this.currentSlideIndex++;
      this.renderCurrentSlide();
    }
  }
  
  previousSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      this.renderCurrentSlide();
    }
  }
  
  updateProgress() {
    const progress = ((this.currentSlideIndex + 1) / this.slides.length) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
  }
  
  saveState() {
    const state = {
      slides: this.slides,
      currentSlideIndex: this.currentSlideIndex,
      gameState: this.gameState
    };
    localStorage.setItem('spc-presentation', JSON.stringify(state));
  }
}

// Global presentation instance
let presentation;

// UI Functions
function editSlide() {
  const slide = presentation.slides[presentation.currentSlideIndex];
  document.getElementById('editor-textarea').value = JSON.stringify(slide, null, 2);
  document.getElementById('editor-overlay').style.display = 'flex';
}

function closeEditor() {
  document.getElementById('editor-overlay').style.display = 'none';
}

function saveSlide() {
  try {
    const newSlide = JSON.parse(document.getElementById('editor-textarea').value);
    presentation.slides[presentation.currentSlideIndex] = newSlide;
    presentation.renderCurrentSlide();
    closeEditor();
  } catch (e) {
    alert('Invalid JSON format. Please check your syntax.');
  }
}

function addSlide() {
  const newSlide = {
    id: `slide-${Date.now()}`,
    title: 'New Slide',
    type: 'static',
    rules: {
      content: {
        title: 'New Slide',
        sections: [
          {
            heading: 'Edit Me',
            text: 'Click "Edit Current Slide" to customize this content.'
          }
        ]
      }
    }
  };
  
  presentation.slides.push(newSlide);
  presentation.currentSlideIndex = presentation.slides.length - 1;
  presentation.renderCurrentSlide();
}

function exportPresentation() {
  const data = {
    slides: presentation.slides,
    timestamp: new Date().toISOString()
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'spc-presentation.json';
  a.click();
  URL.revokeObjectURL(url);
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function nextSlide() {
  presentation.nextSlide();
}

function previousSlide() {
  presentation.previousSlide();
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', function() {
  presentation = new SPCPresentation();
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', function() {
  const sidebar = document.querySelector('.sidebar');
  const header = document.querySelector('.main-header');
  
  if (document.fullscreenElement) {
    sidebar.style.display = 'none';
    header.style.display = 'none';
  } else {
    sidebar.style.display = 'block';
    header.style.display = 'flex';
  }
});

// Touch/swipe support for mobile
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', e => {
  touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
});

function handleSwipe() {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;
  
  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // Swipe left - next slide
      presentation.nextSlide();
    } else {
      // Swipe right - previous slide
      presentation.previousSlide();
    }
  }
}
