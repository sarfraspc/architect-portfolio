class PortfolioApp {
    constructor() {
        this.initializeApp();
    }

    initializeApp() {
        document.addEventListener('DOMContentLoaded', () => {
            this.hideLoadingScreen();
            this.initializeTheme();
            this.initializeComponents();
            this.setupEventListeners();
            this.animateOnScroll();
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    initializeTheme() {
        this.themeManager = new ThemeManager();
    }

    initializeComponents() {
        if (document.getElementById('model-viewer')) {
            this.modelViewer = new ModelViewer();
        }
        if (document.querySelector('.project-grid')) {
            this.projectsManager = new ProjectsManager();
        }
    }

    setupEventListeners() {
        this.setupSmoothScrolling();
        this.setupScrollAnimation();
        this.setupContactForm();
        this.setupMobileNav();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    setupScrollAnimation() {
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.animate-on-scroll').forEach(element => {
            observer.observe(element);
        });
    }

    animateOnScroll() { /* Kept for legacy, but observer is preferred */ }

    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const btn = this.querySelector('button[type="submit"]');
                btn.classList.add('loading');
                setTimeout(() => {
                    btn.classList.remove('loading');
                    this.reset();
                    alert('Thank you for your message! I will get back to you soon.');
                }, 1500);
            });
        }
    }

    setupMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const navLinks = document.querySelector('.nav-links');
        if (navToggle && navLinks) {
            navToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
                navToggle.querySelector('i').classList.toggle('fa-bars');
                navToggle.querySelector('i').classList.toggle('fa-times');
            });
        }
    }
}

class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('themeToggle');
        this.body = document.body;
        this.icon = this.themeToggle ? this.themeToggle.querySelector('i') : null;
        this.init();
    }

    init() {
        if (!this.themeToggle) return;
        this.setInitialTheme();
        this.setupEventListeners();
    }

    setInitialTheme() {
        const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
        this.setTheme(savedTheme);
    }

    setupEventListeners() {
        this.themeToggle.addEventListener('click', () => {
            const newTheme = this.body.dataset.theme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        this.body.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        if (this.icon) {
            this.icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
        document.documentElement.style.setProperty('--background-color-rgb', theme === 'dark' ? '18, 18, 18' : '244, 245, 247');
    }
}

class ModelViewer {
    constructor() {
        this.container = document.getElementById('model-viewer');
        if (!this.container) return;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.container.clientWidth / this.container.clientHeight, 0.1, 1000);
        this.renderer = null;
        this.model = null;
        this.init();
    }

    init() {
        try {
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.container.appendChild(this.renderer.domElement);

            this.camera.position.z = 2.5;
            this.setupLights();
            this.createModel();

            window.addEventListener('resize', () => this.onWindowResize(), false);
            this.container.addEventListener('mousemove', (e) => this.onMouseMove(e), false);
            this.animate();
        } catch (error) {
            console.error('Error initializing 3D viewer:', error);
            this.container.innerHTML = '<div class="error-message">Unable to initialize 3D viewer</div>';
        }
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.scene.add(ambientLight);
        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(5, 5, 5);
        this.scene.add(pointLight);
    }

    createModel() {
        const geometry = new THREE.IcosahedronGeometry(1, 1);
        const material = new THREE.MeshStandardMaterial({
            color: 0x7c5dfa,
            wireframe: true,
            roughness: 0.5,
            metalness: 0.5
        });
        this.model = new THREE.Mesh(geometry, material);
        this.scene.add(this.model);
    }

    onWindowResize() {
        if (!this.renderer) return;
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    onMouseMove(event) {
        if (!this.model) return;
        const rect = this.container.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
        const mouseY = -(((event.clientY - rect.top) / this.container.clientHeight) * 2 - 1);

        this.model.rotation.y = mouseX * Math.PI * 0.1;
        this.model.rotation.x = mouseY * Math.PI * 0.1;
    }

    animate() {
        if (!this.renderer || !this.model) return;
        requestAnimationFrame(() => this.animate());
        this.model.rotation.x += 0.0005;
        this.model.rotation.y += 0.001;
        this.renderer.render(this.scene, this.camera);
    }
}

class ProjectsManager {
    constructor() {
        this.init();
    }

    init() {
        // The project data is now hardcoded in the HTML,
        // so this class is simpler. We can add dynamic loading later if needed.
        this.addHoverEffects();
    }

    addHoverEffects() {
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach(card => {
            // Hover effects are now primarily CSS-driven for performance
        });
    }
}

// Initialize the application
const app = new PortfolioApp();