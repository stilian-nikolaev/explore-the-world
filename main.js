import './style.css'
import * as THREE from 'three';
import THREEx from './helpers/threex.domevents';
import gsap from 'gsap';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });

renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 0, 15);

//create light
const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)

const directionLight = new THREE.DirectionalLight(0xffffff, 1)
directionLight.position.set(-10, 0, 7);
directionLight.target.position.set(0, 0, 0);

scene.add(directionLight, ambientLight)

const lightHelper = new THREE.DirectionalLightHelper(directionLight);


//create sphere
const sphereRadius = 6;
const geometry = new THREE.SphereGeometry(sphereRadius, 32, 32);
const texture = new THREE.TextureLoader().load('./images/earth8k.jpg')
const material = new THREE.MeshStandardMaterial({
    map: texture,
});

const sphere = new THREE.Mesh(geometry, material);


//create clouds
const cloudsGeometry = new THREE.SphereGeometry(sphereRadius + 0.1, 32, 32);
const cloudsTexture = new THREE.TextureLoader().load('./images/earthCloud.png')
const cloudsMaterial = new THREE.MeshStandardMaterial({
    map: cloudsTexture,
    transparent: true,
});

const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);

// scene.add(clouds);


//group sphere and clouds 
const group = new THREE.Group();
group.add(sphere);
scene.add(group)

let sphereRotation = 0.005;
let cloudsRotation = 0.004;

createPoint({
    lat: 23.6345,
    lon: -102.5528,
    country: 'Australia',
    area: 354
})
createPoint({
    lat: 42.698334,
    lon: 23.319941,
    country: 'Mexico',
    area: 555
})
createPoint({
    lat: -14.2350,
    lon: -51.9253,
    country: 'Italy',
    area: 111
})
createPoint({
    lat: 25.286106,
    lon: 51.534817,
    country: 'Denmark',
    area: 454
})
createPoint({
    lat: 28.0339,
    lon: 1.6596,
    country: 'Bulgaria',
    area: 154
})
createPoint({
    lat: -33.865143,
    lon: 151.209900,
    country: 'India',
    area: 251
})


//starting position of the sphere on load
sphere.rotation.y = -Math.PI / 2;

//used for determining if the user hovers over a point
const raycaster = new THREE.Raycaster();

const mouse = {
    x: null,
    y: null,
}

const infoPopupElement = document.querySelector('#info-popup');
const countryElement = document.querySelector('#country');
const areaElement = document.querySelector('#area');

//add dom events 

const domEvents = new THREEx.DomEvents(camera, renderer.domElement)
domEvents.addEventListener(sphere, 'mouseover', event => {
    sphereRotation = 0.002;
    cloudsRotation = 0.0016;
})

domEvents.addEventListener(sphere, 'mouseout', () => {
    sphereRotation = 0.005;
    cloudsRotation = 0.004;
})

function animate() {
    requestAnimationFrame(animate);

    //rotate globe
    group.rotation.y += sphereRotation;
    clouds.rotation.y += cloudsRotation;

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(group.children.filter((x, i) => {
        return i !== 0;
    }))

    //change opacity of intersects back to original 0.4
    for (let i = 1; i < group.children.length; i++) {
        group.children[i].material.opacity = 0.4;
    }

    //hide the info element
    gsap.set(infoPopupElement, {
        display: 'none'
    })

    //loop over intersects with mouse
    for (let i = 0; i < intersects.length; i++) {
        //spotlight intersects
        intersects[i].object.material.opacity = 1;

        gsap.set(countryElement, {
            innerHTML: intersects[i].object.country
        })

        gsap.set(areaElement, {
            innerHTML: `${intersects[i].object.area} km²`
        })

        //show info window
        gsap.set(infoPopupElement, {
            display: 'block'
        })
    }

    renderer.render(scene, camera);
}
animate();

//change our custom mouse object's coordinates
window.addEventListener('mousemove', e => {
    //change coordinates
    mouse.x = (e.clientX / innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / innerHeight) * 2 + 1;

    //move info window
    gsap.set(infoPopupElement, {
        x: e.clientX,
        y: e.clientY,
    })
})

function createPoint({ lat, lon, country, area }) {
    const pointGeometry = new THREE.SphereGeometry(0.15, 32, 32);
    const pointMaterial = new THREE.MeshBasicMaterial({
        color: '#00ffff',
        transparent: true,
        opacity: 0.4,
    });

    const point = new THREE.Mesh(pointGeometry, pointMaterial);

    const latitude = (lat / 180) * Math.PI;
    const longtitude = (lon / 180) * Math.PI;

    const x = sphereRadius * Math.cos(latitude) * Math.sin(longtitude);
    const y = sphereRadius * Math.sin(latitude);
    const z = sphereRadius * Math.cos(latitude) * Math.cos(longtitude);

    point.position.setX(x);
    point.position.setY(y);
    point.position.setZ(z);

    point.country = country;
    point.area = area;

    group.add(point);
}