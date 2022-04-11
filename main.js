import './style.css'
import * as THREE from 'three';
import gsap from 'gsap';
import countries from './countries';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const canvasElement = document.getElementById('bg');

const renderer = new THREE.WebGLRenderer({ canvas: canvasElement, antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 15);

//create light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)

const directionLight = new THREE.DirectionalLight(0xffffff, 1)
directionLight.position.set(-10, 0, 7);
directionLight.target.position.set(0, 0, 0);

scene.add(directionLight, ambientLight)


//create sphere
const sphereRadius = 6;
const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
const texture = new THREE.TextureLoader().load('./images/earth8k.jpg')
const material = new THREE.MeshStandardMaterial({
    map: texture,
});

const sphere = new THREE.Mesh(geometry, material);

//starting position of the sphere on load
sphere.rotation.y = -Math.PI / 2;


//group for sphere and points
const group = new THREE.Group();
group.add(sphere);
scene.add(group)


//create points
countries.forEach(createPoint);

group.rotation.offset = {
    x: 0,
    y: 0,
}

const mouse = {
    x: null,
    y: null,
    down: false,
    xPrev: null,
    yPrev: null,
    busyRotating: false,
}




const moreInfoElement = document.querySelector('#more-info');
const infoCountryElement = document.querySelector('#info-country');
const infoCapitalElement = document.querySelector('#info-capital');
const infoContinentElement = document.querySelector('#info-continent');
const infoPopulationElement = document.querySelector('#info-population');
const infoAreaElement = document.querySelector('#info-area');
const infoDensityElement = document.querySelector('#info-density');
const infoCurrencyElement = document.querySelector('#info-currency');

const popupElement = document.querySelector('#popup');


const pointsGroup = group.children.filter((x, i) => i !== 0);

//used for determining if the user hovers over a point
const raycaster = new THREE.Raycaster();

function animate() {
    requestAnimationFrame(animate);

    resetValues();

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    //a.k.a objects hovered by the mouse
    const intersects = raycaster.intersectObjects(pointsGroup);


    //loop over intersects with mouse
    for (let i = 0; i < intersects.length; i++) {
        //this if statement is to avoid highlighting points while rotating the globe
        if (!mouse.busyRotating) {

            if (mouse.down) {
                showMoreInfo(intersects[i].object.data);
            }

            highlightPoint(intersects[i].object);
        }
    }

    renderer.render(scene, camera);
}
animate();
function resetValues() {
    document.body.style.cursor = 'default';

    //change opacity of intersects back to original 0.4
    for (let i = 1; i < group.children.length; i++) {
        group.children[i].material.opacity = 0.4;
    }

    if (mouse.busyRotating) {
        moreInfoElement.style.display = 'none';
    }

    popupElement.style.display = 'none';
}

function highlightPoint(point) {
    const countryBannerElement = document.querySelector('#popup-country');

    document.body.style.cursor = 'pointer'

    point.material.opacity = 1;

    //setup info window
    countryBannerElement.innerHTML = `${point.data.country}`;

    popupElement.style.display = 'block';
}

function showMoreInfo(pointData) {
    infoCountryElement.innerHTML = pointData.country;
    infoCapitalElement.innerHTML = pointData.capital ? `Capital: ${pointData.capital}` : '';
    infoContinentElement.innerHTML = `Continent: ${pointData.continent}`;
    infoPopulationElement.innerHTML = `Population: ${pointData.population}`;
    infoAreaElement.innerHTML = `Area: ${pointData.area}`;
    infoDensityElement.innerHTML = `Density: ${pointData.density}`;
    infoCurrencyElement.innerHTML = `Currency: ${pointData.currency}`;

    moreInfoElement.style.display = 'block';
}

window.addEventListener('mousemove', e => {
    //change coordinates
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;

    //move popup window
    gsap.set(popupElement, {
        x: e.clientX,
        y: e.clientY,
    })

    if (mouse.down) {
        //logic for rotating the globe by dragging

        e.preventDefault();

        mouse.busyRotating = true;

        const deltaX = e.clientX - mouse.xPrev;
        const deltaY = e.clientY - mouse.yPrev;

        group.rotation.offset.y += deltaX * 0.002;
        group.rotation.offset.x += deltaY * 0.002;

        gsap.to(group.rotation, {
            x: group.rotation.offset.x,
            y: group.rotation.offset.y,
            duration: 1.2,
        })

        mouse.xPrev = e.clientX;
        mouse.yPrev = e.clientY;
    }
})

canvasElement.addEventListener('mousedown', e => {
    mouse.down = true;
    mouse.xPrev = e.clientX;
    mouse.yPrev = e.clientY;
})

window.addEventListener('mouseup', () => {
    mouse.down = false;
    mouse.busyRotating = false;
})

function createPoint(country) {
    let population = country.population;

    //sizes of the prism
    const scale = 0.000000002 * population;

    const minHeight = 0.7;
    const maxHeight = 1;
    const height = Math.min(Math.max(1 * scale, minHeight), maxHeight);

    const minSize = 0.1;
    const maxSize = 0.4;
    const size = Math.min(Math.max(0.4 * scale, minSize), maxSize);

    const pointGeometry = new THREE.BoxGeometry(size, size, height);
    const pointMaterial = new THREE.MeshBasicMaterial({
        color: '#00ffff',
        transparent: true,
        opacity: 0.4,
    });
    const point = new THREE.Mesh(pointGeometry, pointMaterial);

    const lat = country.latlng[0];
    const lng = country.latlng[1];

    //translating latitude and longtitude from degrees to sphere coordinates
    const latitude = (lat / 180) * Math.PI;
    const longtitude = (lng / 180) * Math.PI;

    const x = sphereRadius * Math.cos(latitude) * Math.sin(longtitude);
    const y = sphereRadius * Math.sin(latitude);
    const z = sphereRadius * Math.cos(latitude) * Math.cos(longtitude);

    point.position.setX(x);
    point.position.setY(y);
    point.position.setZ(z);

    //direction the prisms to the center
    point.lookAt(0, 0, 0);

    //get points out of the inside of the sphere
    point.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -height / 2))

    //process data from country object
    const capital = country.capital ? country.capital[0] : null;
    const continent = country.continents.join('/');
    const density = `${(population / country.area).toFixed()}/km²`;
    population = population.toLocaleString();
    const area = `${country.area.toLocaleString()} km²`;
    const currencyObj = Object.values(country.currencies || {})[0];
    const currency = `${currencyObj?.name} ${currencyObj?.symbol ? `[${currencyObj.symbol}]` : ''}`;

    point.data = {
        country: country.name.common,
        capital,
        continent,
        population,
        area,
        density,
        currency
    }

    //add animation to the prism (going up and down)
    gsap.to(point.scale, {
        z: height * 1.2,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'linear',
        delay: Math.random(),
    })

    group.add(point);
}