/**
 * Tenglong Group Website - Optimized JavaScript
 * Features: Mobile menu, hero slider, smooth scroll, counter animation, form handling
 */

(function() {
    'use strict';

    // =====================
    // CONFIGURATION
    // =====================
    const CONFIG = {
        sliderInterval: 4000,
        scrollOffset: 80,
        counterDuration: 2000
    };

    // =====================
    // DOM ELEMENTS CACHE
    // =====================
    const DOM = {
        mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
        nav: document.querySelector('.nav'),
        heroSlides: document.querySelectorAll('.hero .slide'),
        prevBtn: document.querySelector('.slider-arrow.prev'),
        nextBtn: document.querySelector('.slider-arrow.next'),
        statsSection: document.querySelector('.stats'),
        contactForm: document.querySelector('.contact-form'),
        productCards: document.querySelectorAll('.product-card'),
        hero: document.querySelector('.hero')
    };

    // =====================
    // UTILITY FUNCTIONS
    // =====================
    const utils = {
        debounce: (func, wait) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            };
        },

        throttle: (func, limit) => {
            let inThrottle;
            return (...args) => {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        }
    };

    // =====================
    // MOBILE MENU
    // =====================
    const initMobileMenu = () => {
        if (!DOM.mobileMenuToggle || !DOM.nav) return;

        DOM.mobileMenuToggle.addEventListener('click', () => {
            DOM.nav.classList.toggle('active');
            const isOpen = DOM.nav.classList.contains('active');
            DOM.mobileMenuToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu when clicking on links
        DOM.nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                DOM.nav.classList.remove('active');
                DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });
    };

    // =====================
    // HERO SLIDER
    // =====================
    const initHeroSlider = () => {
        if (!DOM.heroSlides.length) return;

        let currentSlide = 0;
        let slideInterval;
        const totalSlides = DOM.heroSlides.length;

        const showSlide = (index) => {
            DOM.heroSlides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
            });
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        };

        // Auto-play
        const startAutoPlay = () => {
            slideInterval = setInterval(nextSlide, CONFIG.sliderInterval);
        };

        const stopAutoPlay = () => {
            clearInterval(slideInterval);
        };

        // Event listeners
        if (DOM.nextBtn) {
            DOM.nextBtn.addEventListener('click', () => {
                stopAutoPlay();
                nextSlide();
                startAutoPlay();
            });
        }

        if (DOM.prevBtn) {
            DOM.prevBtn.addEventListener('click', () => {
                stopAutoPlay();
                prevSlide();
                startAutoPlay();
            });
        }

        // Pause on hover
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            heroSlider.addEventListener('mouseenter', stopAutoPlay);
            heroSlider.addEventListener('mouseleave', startAutoPlay);
        }

        // Initialize
        showSlide(0);
        if (totalSlides > 1) startAutoPlay();
    };

    // =====================
    // SMOOTH SCROLLING
    // =====================
    const initSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - CONFIG.scrollOffset;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };

    // =====================
    // ACTIVE NAVIGATION
    // =====================
    const initActiveNav = () => {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav a');

        if (!sections.length || !navLinks.length) return;

        const onScroll = utils.throttle(() => {
            let current = '';
            const scrollPos = window.scrollY + CONFIG.scrollOffset + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollPos >= sectionTop) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', onScroll);
    };

    // =====================
    // COUNTER ANIMATION
    // =====================
    const initCounterAnimation = () => {
        if (!DOM.statsSection) return;

        const animateCounter = (element, target, duration) => {
            const startTime = performance.now();
            const startValue = 0;

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const current = Math.floor(startValue + (target - startValue) * easeOutQuart);

                element.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                }
            };

            requestAnimationFrame(updateCounter);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const statNumbers = entry.target.querySelectorAll('.stat-number');
                    statNumbers.forEach(stat => {
                        if (stat.classList.contains('animated')) return;
                        
                        const text = stat.textContent;
                        const number = parseInt(text.replace(/[^0-9]/g, ''));
                        
                        if (number) {
                            stat.classList.add('animated');
                            animateCounter(stat, number, CONFIG.counterDuration);
                        }
                    });
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        observer.observe(DOM.statsSection);
    };

    // =====================
    // FORM HANDLING
    // =====================
    const initFormHandling = () => {
        if (!DOM.contactForm) return;

        DOM.contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(DOM.contactForm);
            const data = Object.fromEntries(formData);
            const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn?.textContent;

            // Loading state
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Đang gửi...';
            }

            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Success
                alert('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ liên hệ lại sớm nhất có thể.');
                DOM.contactForm.reset();
            } catch (error) {
                alert('Có lỗi xảy ra. Vui lòng thử lại sau.');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        });
    };

    // =====================
    // PRODUCT CARDS HOVER
    // =====================
    const initProductCards = () => {
        DOM.productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    };

    // =====================
    // PARALLAX EFFECT
    // =====================
    const initParallax = () => {
        if (!DOM.hero) return;

        const handleParallax = utils.throttle(() => {
            const scrolled = window.pageYOffset;
            if (scrolled < window.innerHeight) {
                DOM.hero.style.transform = `translateY(${scrolled * 0.3}px)`;
            }
        }, 16);

        window.addEventListener('scroll', handleParallax);
    };

    // =====================
    // LOADING ANIMATION
    // =====================
    const initLoadingAnimation = () => {
        window.addEventListener('load', () => {
            document.body.classList.add('loaded');
        });
    };

    // =====================
    // INITIALIZE ALL
    // =====================
    const init = () => {
        initMobileMenu();
        initHeroSlider();
        initSmoothScroll();
        initActiveNav();
        initCounterAnimation();
        initFormHandling();
        initProductCards();
        initParallax();
        initLoadingAnimation();
    };

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();