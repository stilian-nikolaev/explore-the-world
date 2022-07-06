import gsap from 'gsap';

import { mouse } from './mouse';
import { group, renderer, updateCamera } from './scene'

const popupElement = document.querySelector('#popup');

function onMouseMove(e) {
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
}

function onMouseDown(e) {
    mouse.down = true;
    mouse.xPrev = e.clientX;
    mouse.yPrev = e.clientY;
}

function onMouseUp() {
    mouse.down = false;
    mouse.busyRotating = false;
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCamera(window.innerWidth / window.innerHeight)
}

export function attachEventListeners() {
    const canvasElement = document.getElementById('bg')

    canvasElement.addEventListener('mousedown', onMouseDown);

    window.addEventListener('mousemove', onMouseMove);

    window.addEventListener('mouseup', onMouseUp);

    window.addEventListener('resize', onResize);
}