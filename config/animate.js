import * as THREE from 'three';

import { scene, group, camera, renderer } from './scene';
import { mouse } from './mouse';

const popupElement = document.querySelector('#popup');
const countryBannerElement = document.querySelector('#popup-country');

const moreInfoElement = document.querySelector('#more-info');
const infoCountryElement = document.querySelector('#info-country');
const infoCapitalElement = document.querySelector('#info-capital');
const infoContinentElement = document.querySelector('#info-continent');
const infoPopulationElement = document.querySelector('#info-population');
const infoAreaElement = document.querySelector('#info-area');
const infoDensityElement = document.querySelector('#info-density');
const infoCurrencyElement = document.querySelector('#info-currency');

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
    document.body.style.cursor = 'pointer'

    point.material.opacity = 1;

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
    infoCurrencyElement.innerHTML = pointData.currency.includes('undefined') ? '' :
        `Currency: ${pointData.currency}`;

    moreInfoElement.style.display = 'block';
}

//used for determining if the user hovers over a point
const raycaster = new THREE.Raycaster();
const pointsGroup = group.children.filter((x, i) => i !== 0);

export function animate() {
    requestAnimationFrame(animate);

    resetValues();

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera(mouse, camera);

    // calculate objects intersecting the picking ray
    //a.k.a objects hovered by the mouse
    const intersects = raycaster.intersectObjects(pointsGroup);

    //loop over intersects with mouse
    for (let i = 0; i < intersects.length; i++) {

        //avoid clicking on the back of the globe
        if (intersects[i].distance > 16.5) {
            break;
        }

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