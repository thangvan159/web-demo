/**
 * Cousins Vietnam Website - Fixed for GitHub Pages
 */

(function() {
    'use strict';

    // Đợi DOM hoàn toàn sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        // DOM đã sẵn sàng nhưng đảm bảo ảnh cũng load xong
        if (document.images.length > 0) {
            window.addEventListener('load', initApp);
        } else {
            initApp();
        }
    }

    function initApp() {
        console.log('Initializing app...'); // Debug
        
        // =====================
        // CONFIGURATION
        // =====================
        const CONFIG = {
            sliderInterval: 5000, // Tăng lên 5s cho chắc
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

        console.log('Found slides:', DOM.heroSlides.length); // Debug

        // =====================
        // UTILITY FUNCTIONS
        // =====================
        const utils = {
            debounce: (func, wait) => {
                let timeout;
                return function executedFunction(...args) {
                    const later = () => {
                        clearTimeout(timeout);
                        func(...args);
                    };
                    clearTimeout(timeout);
                    timeout = setTimeout(later, wait);
                };
            },

            throttle: (func, limit) => {
                let lastFunc;
                let lastRan;
                return function(...args) {
                    if (!lastRan) {
                        func.apply(this, args);
                        lastRan = Date.now();
                    } else {
                        clearTimeout(lastFunc);
                        lastFunc = setTimeout(() => {
                            if ((Date.now() - lastRan) >= limit) {
                                func.apply(this, args);
                                lastRan = Date.now();
                            }
                        }, limit - (Date.now() - lastRan));
                    }
                };
            }
        };

        // =====================
        // MOBILE MENU
        // =====================
        const initMobileMenu = () => {
            if (!DOM.mobileMenuToggle || !DOM.nav) return;

            DOM.mobileMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isActive = DOM.nav.classList.toggle('active');
                DOM.mobileMenuToggle.setAttribute('aria-expanded', isActive);
            });

            // Close menu when clicking on links
            DOM.nav.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    DOM.nav.classList.remove('active');
                    DOM.mobileMenuToggle.setAttribute('aria-expanded', 'false');
                });
            });

            // Close when click outside
            document.addEventListener('click', (e) => {
                if (!DOM.nav.contains(e.target) && !DOM.mobileMenuToggle.contains(e.target)) {
                    DOM.nav.classList.remove('active');
                }
            });
        };

        // =====================
        // HERO SLIDER - FIXED
        // =====================
        const initHeroSlider = () => {
            if (!DOM.heroSlides.length) {
                console.warn('No slides found');
                return;
            }

            let currentSlide = 0;
            let slideInterval = null;
            const totalSlides = DOM.heroSlides.length;

            console.log('Initializing slider with', totalSlides, 'slides');

            // Đảm bảo chỉ có slide đầu active
            DOM.heroSlides.forEach((slide, index) => {
                slide.classList.remove('active');
                if (index === 0) {
                    slide.classList.add('active');
                }
            });

            const showSlide = (index) => {
                console.log('Showing slide:', index);
                
                // Remove active từ tất cả
                DOM.heroSlides.forEach(slide => {
                    slide.classList.remove('active');
                    slide.style.display = 'none'; // Force reset
                });

                // Thêm active cho slide hiện tại
                const targetSlide = DOM.heroSlides[index];
                if (targetSlide) {
                    targetSlide.style.display = ''; // Reset inline style
                    targetSlide.classList.add('active');
                }
            };

            const nextSlide = () => {
                currentSlide = (currentSlide + 1) % totalSlides;
                showSlide(currentSlide);
            };

            const prevSlide = () => {
                currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
                showSlide(currentSlide);
            };

            // Auto-play với kiểm tra visibility
            const startAutoPlay = () => {
                if (slideInterval) clearInterval(slideInterval);
                slideInterval = setInterval(() => {
                    if (!document.hidden) { // Chỉ chạy khi tab active
                        nextSlide();
                    }
                }, CONFIG.sliderInterval);
                console.log('Auto-play started');
            };

            const stopAutoPlay = () => {
                if (slideInterval) {
                    clearInterval(slideInterval);
                    slideInterval = null;
                }
            };

            // Event listeners cho nút
            if (DOM.nextBtn) {
                DOM.nextBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    stopAutoPlay();
                    nextSlide();
                    startAutoPlay();
                });
            }

            if (DOM.prevBtn) {
                DOM.prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
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

            // Start
            showSlide(0);
            if (totalSlides > 1) {
                startAutoPlay();
            }

            // Handle visibility change
            document.addEventListener('visibilitychange', () => {
                if (document.hidden) {
                    stopAutoPlay();
                } else {
                    startAutoPlay();
                }
            });
        };

        // =====================
        // SMOOTH SCROLLING
        // =====================
        const initSmoothScroll = () => {
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const targetId = this.getAttribute('href');
                    if (targetId === '#' || targetId === '#home') {
                        // Scroll to top nếu là #home
                        if (targetId === '#home') {
                            e.preventDefault();
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                        return;
                    }
                    
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
                const scrollPos = window.scrollY + CONFIG.scrollOffset + 150;

                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    const sectionHeight = section.clientHeight;
                    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
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
            // Trigger once để set active ban đầu
            onScroll();
        };

        // =====================
        // COUNTER ANIMATION
        // =====================
        const initCounterAnimation = () => {
            if (!DOM.statsSection) return;

            const animateCounter = (element, target, duration) => {
                const startTime = performance.now();
                
                const updateCounter = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    // Easing function
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = Math.floor(target * easeOutQuart);

                    element.textContent = current.toLocaleString() + (element.textContent.includes('%') ? '%' : '+');

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        element.textContent = element.textContent.replace(/[0-9,]+/, target.toLocaleString());
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
                            
                            if (number && !isNaN(number)) {
                                stat.classList.add('animated');
                                animateCounter(stat, number, CONFIG.counterDuration);
                            }
                        });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.3, rootMargin: '0px 0px -50px 0px' });

            observer.observe(DOM.statsSection);
        };

        // =====================
        // FORM HANDLING
        // =====================
        const initFormHandling = () => {
            if (!DOM.contactForm) return;

            DOM.contactForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
                const originalText = submitBtn ? submitBtn.textContent : 'Gửi';

                if (submitBtn) {
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Đang gửi...';
                }

                try {
                    // Giả lập API call
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    alert('Cảm ơn bạn đã gửi tin nhắn! Chúng tôi sẽ liên hệ lại sớm nhất có thể.');
                    DOM.contactForm.reset();
                } catch (error) {
                    alert('Có lỗi xảy ra. Vui lòng thử lại sau hoặc gọi hotline: 028 1234 5678');
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
        // PARALLAX EFFECT (Tối ưu)
        // =====================
        const initParallax = () => {
            if (!DOM.hero || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            let ticking = false;
            
            const handleParallax = () => {
                const scrolled = window.pageYOffset;
                if (scrolled < window.innerHeight) {
                    DOM.hero.style.transform = `translateY(${scrolled * 0.3}px)`;
                }
                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    window.requestAnimationFrame(handleParallax);
                    ticking = true;
                }
            });
        };

        // =====================
        // INITIALIZE ALL
        // =====================
        const init = () => {
            console.log('Running init...');
            
            initMobileMenu();
            initHeroSlider(); // Quan trọng nhất
            initSmoothScroll();
            initActiveNav();
            initCounterAnimation();
            initFormHandling();
            initProductCards();
            initParallax();

            // Thêm class loaded cho body
            document.body.classList.add('loaded');
            console.log('Init complete');
        };

        // Chạy init
        init();
    }

})();