import * as THREE from 'three';
import { attachPoints } from './points';

let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.set(0, 0, 15);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

const scene = new THREE.Scene();

//create group for the globe and all the points
const group = createGroup();
createLight();
createSphere(group);
attachPoints(group);

function createLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.25)

    const directionLight = new THREE.DirectionalLight(0xffffff, 1)
    directionLight.position.set(-10, 0, 7);
    directionLight.target.position.set(0, 0, 0);

    scene.add(directionLight, ambientLight)
}

function createSphere(group) {
    const geometry = new THREE.SphereGeometry(6, 32, 32);
    const texture = new THREE.TextureLoader().load('earth8k.jpg')
    const material = new THREE.MeshStandardMaterial({ map: texture });

    const sphere = new THREE.Mesh(geometry, material);

    //starting position of the sphere on load
    sphere.rotation.y = -Math.PI / 2;

    group.add(sphere);
}

function createGroup() {
    const group = new THREE.Group();
    
    group.rotation.offset = {
        x: 0,
        y: 0,
    }

    scene.add(group)

    return group;
}

function updateCamera(aspect) {
    camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
    camera.position.z = 15;
}


export { scene, group, camera, renderer, updateCamera }