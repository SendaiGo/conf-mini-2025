// パララックス効果
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');

    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });

    // ヘッダーの背景効果
    const header = document.querySelector('header');
    if (header) {
        const opacity = Math.max(0, 1 - scrolled / 600);
        header.style.opacity = opacity;
    }

    // セクションのフェードイン効果
    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const windowHeight = window.innerHeight;

        if (scrolled > sectionTop - windowHeight + 200) {
            section.classList.add('visible');
        }
    });

    // プログレスバー
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (scrolled / maxScroll) * 100;
        progressBar.style.width = `${scrollPercentage}%`;
    }
});

// スムーススクロール
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

// ナビゲーションのハイライト
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop - 100;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrolled >= sectionTop && scrolled < sectionBottom) {
            navLinks.forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.nav-link[href="#${section.id}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
            }
        }
    });
});

// ローディングアニメーション
window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('fade-out');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }, 1000);
    }
});

// カウントアップアニメーション
const animateValue = (element, start, end, duration) => {
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
};

// 数値アニメーションの監視
const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const numberObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
            const target = entry.target;
            const value = parseInt(target.dataset.value);
            animateValue(target, 0, value, 1500);
            target.classList.add('animated');
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.animate-number').forEach(element => {
        numberObserver.observe(element);
    });
});

// Google Maps初期化
function initMap() {
    // 会場の座標（アーバンネットビル仙台中央）
    const venueLocation = { lat: 38.258726, lng: 140.881878 };

    // マップの作成
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: venueLocation,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }]
            }
        ]
    });

    // Gopherアイコンのマーカー
    const marker = new google.maps.Marker({
        position: venueLocation,
        map: map,
        title: 'アーバンネットビル仙台中央 カンファレンスルーム',
        icon: {
            url: 'gopher-marker.svg',
            scaledSize: new google.maps.Size(50, 50),
            anchor: new google.maps.Point(25, 50)
        }
    });

    // 情報ウィンドウ
    const infowindow = new google.maps.InfoWindow({
        content: `
            <div style="padding: 10px; font-family: 'Noto Sans JP', sans-serif;">
                <h3 style="margin: 0 0 5px 0; color: #00ADD8;">Go Conference mini in Sendai 2026</h3>
                <p style="margin: 5px 0;"><strong>アーバンネットビル仙台中央</strong></p>
                <p style="margin: 5px 0; font-size: 14px;">〒980-0021 宮城県仙台市青葉区中央4丁目4-19</p>
                <p style="margin: 5px 0; font-size: 14px;">仙台駅西口より徒歩3分</p>
            </div>
        `
    });

    // マーカークリックで情報ウィンドウを表示
    marker.addListener('click', () => {
        infowindow.open(map, marker);
    });
}

// Google Maps APIが読み込まれる前にinitMapが呼ばれた場合のフォールバック
window.initMap = initMap;