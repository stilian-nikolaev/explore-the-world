import './style.css'
import * as THREE from 'three';
import THREEx from './helpers/threex.domevents';
import gsap from 'gsap';
import { countries } from './countries';

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


//create points
countries.forEach(createPoint);


//starting position of the sphere on load
sphere.rotation.y = -Math.PI / 2;

group.rotation.offset = {
    x: 0,
    y: 0,
}

//used for determining if the user hovers over a point
const raycaster = new THREE.Raycaster();

const mouse = {
    x: null,
    y: null,
    down: false,
    xPrev: null,
    yPrev: null,
}


//remove later from here

let sphereRotation = 0.005;
let cloudsRotation = 0.004;

// //add dom events 
// const domEvents = new THREEx.DomEvents(camera, renderer.domElement)
// domEvents.addEventListener(sphere, 'mouseover', event => {
//     sphereRotation = 0.002;
//     cloudsRotation = 0.0016;
// })

// domEvents.addEventListener(sphere, 'mouseout', () => {
//     sphereRotation = 0.005;
//     cloudsRotation = 0.004;
// })

//to here


const infoPopupElement = document.querySelector('#info-popup');
const countryElement = document.querySelector('#country');
const areaElement = document.querySelector('#area');

const pointsGroup = group.children.filter((x, i) => i !== 0);

function animate() {
    requestAnimationFrame(animate);

    //rotate globe
    // group.rotation.y += sphereRotation;
    // clouds.rotation.y += cloudsRotation;

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects(pointsGroup);

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

    if (mouse.down) {
        e.preventDefault();

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
})

function createPoint({ latitude, longitude, country, area }) {
    const scale = area / 800;
    const pointHeight = 1 * scale;
    const minHeight = 0.8;

    const size = 0.4 * scale;
    const minSize = 0.1;

    //using Math max to create minimum height
    const pointGeometry = new THREE.BoxGeometry(
        Math.max(size, minSize),
        Math.max(size, minSize),
        Math.max(pointHeight, minHeight));
    const pointMaterial = new THREE.MeshBasicMaterial({
        color: '#00ffff',
        transparent: true,
        opacity: 0.4,
    });

    const point = new THREE.Mesh(pointGeometry, pointMaterial);

    const lat = (latitude / 180) * Math.PI;
    const lon = (longitude / 180) * Math.PI;

    const x = sphereRadius * Math.cos(lat) * Math.sin(lon);
    const y = sphereRadius * Math.sin(lat);
    const z = sphereRadius * Math.cos(lat) * Math.cos(lon);

    point.position.setX(x);
    point.position.setY(y);
    point.position.setZ(z);

    //direction the prisms to the center
    point.lookAt(0, 0, 0);

    //get points out of the inside of the sphere
    point.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 0, -pointHeight / 2))

    point.country = country;
    point.area = area;

    group.add(point);

    gsap.to(point.scale, {
        z: Math.max(pointHeight, minHeight) / 1.25,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: 'linear',
        delay: Math.random(),
    })
}