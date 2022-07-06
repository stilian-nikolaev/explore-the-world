import * as THREE from 'three';
import gsap from 'gsap';

const API_URL = 'https://restcountries.com/v3.1/all'

function createPoint(country, group) {
    let population = country.population;

    //scale based on population of the country
    const scale = 0.000000002 * population;

    //sizes of the prism
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

    //calculating xyz
    const x = 6 * Math.cos(latitude) * Math.sin(longtitude);
    const y = 6 * Math.sin(latitude);
    const z = 6 * Math.cos(latitude) * Math.cos(longtitude);

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

export function attachPoints(group) {
    fetch(API_URL)
        .then(res => res.json())
        .then(countries => countries.forEach(country => createPoint(country, group)))
}