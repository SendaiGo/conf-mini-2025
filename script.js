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
    // 会場の住所
    const venueAddress = '宮城県仙台市青葉区中央4丁目4-19 アーバンネットビル仙台中央';

    // ジオコーダーの作成
    const geocoder = new google.maps.Geocoder();

    // マップの初期作成（仙台駅周辺を表示）
    const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: { lat: 38.2581925, lng: 140.8760207 },
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

    // DirectionsServiceとRendererの作成
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // デフォルトのマーカーを非表示
        polylineOptions: {
            strokeColor: '#00ADD8',
            strokeWeight: 5,
            strokeOpacity: 0.8
        }
    });
    directionsRenderer.setMap(map);

    // JR仙台駅から会場までの経路を表示
    const sendaiStation = 'JR仙台駅';

    // 住所からジオコーディング
    geocoder.geocode({ address: venueAddress }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;

            // マップの中心を更新
            map.setCenter(location);

            // Gopherアイコンのマーカー
            const marker = new google.maps.Marker({
                position: location,
                map: map,
                title: 'アーバンネットビル仙台中央 カンファレンスルーム',
                icon: {
                    url: 'pin.png',
                    scaledSize: new google.maps.Size(80, 100),
                    anchor: new google.maps.Point(40, 90)
                }
            });

            // JR仙台駅のマーカー
            const stationMarker = new google.maps.Marker({
                position: { lat: 38.2601908, lng: 140.8820988 },
                map: map,
                title: 'JR仙台駅',
                label: {
                    text: 'JR仙台駅',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 'bold'
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 10,
                    fillColor: '#22C55E',
                    fillOpacity: 1,
                    strokeColor: '#FFFFFF',
                    strokeWeight: 2
                }
            });

            // 経路の計算と表示
            directionsService.route({
                origin: sendaiStation,
                destination: venueAddress,
                travelMode: google.maps.TravelMode.WALKING
            }, (result, status) => {
                if (status === 'OK') {
                    directionsRenderer.setDirections(result);

                    // ルート情報を取得
                    const route = result.routes[0].legs[0];
                    const distance = route.distance.text;
                    const duration = route.duration.text;

                    // 情報ウィンドウの内容を更新
                    infowindow.setContent(`
                        <div style="padding: 10px; font-family: 'Noto Sans JP', sans-serif;">
                            <h3 style="margin: 0 0 5px 0; color: #00ADD8;">Go Conference mini in Sendai 2026</h3>
                            <p style="margin: 5px 0;"><strong>アーバンネットビル仙台中央</strong></p>
                            <p style="margin: 5px 0; font-size: 14px;">〒980-0021 宮城県仙台市青葉区中央4丁目4-19</p>
                            <p style="margin: 5px 0; font-size: 14px; color: #22C55E; font-weight: bold;">
                                🚶 JR仙台駅西口より徒歩 ${duration} (${distance})
                            </p>
                        </div>
                    `);
                } else {
                    console.error('Directions request failed: ' + status);
                }
            });

            // マーカークリックで情報ウィンドウを表示
            marker.addListener('click', () => {
                infowindow.open(map, marker);
            });
        } else {
            console.error('Geocoding failed: ' + status);
        }
    });
}

// Google Maps APIが読み込まれる前にinitMapが呼ばれた場合のフォールバック
window.initMap = initMap;