

import * as THREE from '../three/three.module.js';
import { OrbitControls } from '../three/jsm/controls/OrbitControls.js';
// import { OrbitControls } from '../three/OrbitControls.js';
import { Sky } from '../three/jsm/objects/Sky.js';
import { GUI } from '../three/jsm/libs/dat.gui.module.js';
// import { OBJLoader } from './examples/jsm/loaders/OBJLoader.js';
// import {GLTFLoader} from '../three/jsm/loaders/GLTFLoader.js';
// import './three.css'

console.log('Hej MagicSpace')
const gui = new GUI();

const makeCube = (geometry, color, xpos, scene) => {
    const material = new THREE.MeshPhongMaterial({color});
    const cube = new THREE.Mesh(geometry, material);
    cube.position.x = xpos;
    cube.position.y = 2;
    scene.add(cube);
    cube.castShadow = true;
    cube.receiveShadow = true;


    return cube;
}

const createMaterial = () =>
{
    const material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide
    });

    const hue = Math.random();
    const saturation = 1;
    const luminence = 0.5;
    material.color.setHSL(hue, saturation, luminence);

    return material;
}

const createWireframeMaterial = () => {
    const wireMat = new THREE.LineBasicMaterial({
        color: 'white'
    });

    return wireMat;
}

const createPointMaterial = () =>{
    const pointMat = new THREE.PointsMaterial({
        color: 'red',
        size: 0.2,
        sizeAttenuation: true
    });

    return pointMat;
}

const addPrimitiveToObjects = (scene, obj, mesh, x, z) => {
    mesh.position.set(x, 2, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);

    obj.push(mesh);
}

const makePrimitives = (scene) => {
    const objects = [];

    //make a cone 1
    const coneRadius = 1;
    const coneHeight = 1;
    const coneRadialSegments = 16;
    const coneGeom = new THREE.ConeGeometry(coneRadius, coneHeight, coneRadialSegments);
    const coneMaterial = createMaterial();
    const coneMesh = new THREE.Mesh(coneGeom, coneMaterial);
    addPrimitiveToObjects(scene, objects, coneMesh, -3, 2);

    //make a cone 2
    const coneEdgesGeom = new THREE.EdgesGeometry(coneGeom);
    const coneEdgeMaterial = createWireframeMaterial();
    const coneEdgeMesh = new THREE.LineSegments(coneEdgesGeom, coneEdgeMaterial);
    addPrimitiveToObjects(scene, objects, coneEdgeMesh, 0, 2);

    //make a cone 3
    const coneWireGeom = new THREE.WireframeGeometry(coneGeom);
    const coneWireMesh = new THREE.LineSegments(coneWireGeom, coneEdgeMaterial);
    addPrimitiveToObjects(scene, objects, coneWireMesh, 3, 2);

    //text 3d
    const textloader = new THREE.FontLoader();
    textloader.load('./fonts/helvetiker_bold.typeface.json', (font) =>{
        const text = 'threejs';
        const geometry = new THREE.TextGeometry(text, {
            font: font,
            size: 3,
            height: 0.2,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: 0.15,
            bevelSize: 0.3,
            bevelSegments: 5
        });
        const textMesh = new THREE.Mesh(geometry, createMaterial());
        geometry.computeBoundingBox();
        geometry.boundingBox.getCenter(textMesh.position).multiplyScalar(-1);
        textMesh.scale.set(0.25, 0.25, 0.25);
        addPrimitiveToObjects(scene, objects, textMesh, -4, -4);
    });

    //sphere
    const sphereRadius = 0.5;
    const sphereWidth = 8;
    const sphereHeight = 8;
    const sphereGeom = new THREE.SphereGeometry(sphereRadius, sphereWidth, sphereHeight);
    const sphereMat = createPointMaterial();
    const sphereMesh = new THREE.Points(sphereGeom, sphereMat);
    addPrimitiveToObjects(scene, objects, sphereMesh, -3, 4);

    return objects;
}

const initSky = (scene, renderer, camera) => {
    // Add Sky
    const sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    let sun = new THREE.Vector3();

    /// GUI

    const effectController = {
        turbidity: 10,
        rayleigh: 3,
        mieCoefficient: 0.005,
        mieDirectionalG: 0.7,
        elevation: 2,
        azimuth: 180,
        exposure: renderer.toneMappingExposure
    };

    function guiChanged() {

        const uniforms = sky.material.uniforms;
        uniforms[ 'turbidity' ].value = effectController.turbidity;
        uniforms[ 'rayleigh' ].value = effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
        const theta = THREE.MathUtils.degToRad( effectController.azimuth );

        sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( sun );

        renderer.toneMappingExposure = effectController.exposure;
        renderer.render( scene, camera );

    }

    gui.add( effectController, 'turbidity', 0.0, 20.0, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'rayleigh', 0.0, 4, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'mieCoefficient', 0.0, 0.1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'mieDirectionalG', 0.0, 1, 0.001 ).onChange( guiChanged );
    gui.add( effectController, 'elevation', 0, 90, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'azimuth', - 180, 180, 0.1 ).onChange( guiChanged );
    gui.add( effectController, 'exposure', 0, 1, 0.0001 ).onChange( guiChanged );

    guiChanged();    
}

const makePlanarGrid = (size, scene) => {
    const planesz = size;
    const loader = new THREE.TextureLoader();
    const texture = loader.load('./resources/images/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;

    const repeats = planesz / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeometry = new THREE.PlaneGeometry(planesz, planesz);
    const planeMaterial = new THREE.MeshPhongMaterial({map: texture, side: THREE.DoubleSide});
    const mesh = new THREE.Mesh(planeGeometry, planeMaterial);
    mesh.receiveShadow = true;
    mesh.rotation.x = Math.PI * -0.5;

    scene.add(mesh);

    return mesh;
}

const makeSolarSystem = (scene, objects) => {
    
    const sunRadius = 1;
    const sunWidthSegs = 32;
    const sunHeightSegs = 32;
    const sphereGeom = new THREE.SphereGeometry(sunRadius, sunWidthSegs, sunHeightSegs);
    const texloader = new THREE.TextureLoader();
    const suntex = texloader.load('./resources/images/sun2.jpg');
    const sunMat = new THREE.MeshBasicMaterial({ map: suntex});
    const sunMesh = new THREE.Mesh(sphereGeom, sunMat);
    sunMesh.scale.set(2, 2, 2);
    sunMesh.position.z = 0;
    sunMesh.position.y = 2;
    
    
    const earthtex = texloader.load('./resources/images/earth.jpg');
    const earthMat = new THREE.MeshPhongMaterial({map: earthtex});
    const earthMesh = new THREE.Mesh(sphereGeom, earthMat);
    // earthMesh.position.x = 10;
    // earthMesh.position.y = 2;
    // earthMesh.scale.set(0.5, 0.5, 0.5);
    
    const moontex = texloader.load('./resources/images/moon.jpg');
    const moonMat = new THREE.MeshPhongMaterial({map: moontex});
    const moonMesh = new THREE.Mesh(sphereGeom, moonMat);
    // moonMesh.scale.set(0.25, 0.25, 0.25);
    
    
    const solarSystem = new THREE.Object3D();
    const earthOrbit = new THREE.Object3D();
    const moonOrbit = new THREE.Object3D();

    solarSystem.position.z = 5;
    earthOrbit.position.set(10, 2, 0);
    earthOrbit.scale.set(0.5, 0.5, 0.5);
    moonOrbit.position.set(2, 2, 0);
    moonOrbit.scale.set(0.25, 0.25, 0.25);

    solarSystem.add(sunMesh);
    solarSystem.add(earthOrbit);

    earthOrbit.add(earthMesh);
    earthOrbit.add(moonOrbit);

    moonOrbit.add(moonMesh);

    
    scene.add(solarSystem);
    objects.push(solarSystem);
    objects.push(earthOrbit);
    objects.push(earthMesh);
    objects.push(moonMesh);

    return objects;
}

// const loadlGltf = (scene) => {
//     const gltfLoader = new GLTFLoader();
//     const url = 'resources/models/cartoon_lowpoly_small_city_free_pack/scene.gltf';
//     gltfLoader.load(url, (gltf) => {
//       const root = gltf.scene;
//       scene.add(root);
//     });    
// }

const make01Scene = (renderer, scene) => {
    const rotatables = [];
    const boxHeight = 1;
    const boxWidth = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

    rotatables.push(makeCube(geometry, 0x44aa88, 0, scene));
    rotatables.push(makeCube(geometry, 0x8844aa, -3, scene));
    rotatables.push(makeCube(geometry, 0xaa8844, 3, scene));
    
    const primitives = makePrimitives(scene);
    rotatables.push(...primitives);

    const rt = bakeRTscene(renderer, scene);
    const rtcubeMat = new THREE.MeshPhongMaterial({map: rt.texture});
    // const rtcubeMat = new THREE.MeshPhongMaterial({color: 'red'});
    const rtcubeMesh = new THREE.Mesh(geometry, rtcubeMat);
    rtcubeMesh.position.set(0, 2, -10);
    rtcubeMesh.scale.set(2, 2, 2);
    scene.add(rtcubeMesh);

    const solarsys = [];
    makeSolarSystem(scene, solarsys);
    rotatables.push(...solarsys);

    return rotatables;
}

const bakeRTscene = (renderer, scene) => {
    const rtwidth = 512;
    const rtheight = 512;
    const renderTarget = new THREE.WebGLRenderTarget(rtwidth, rtheight);

    const rtfov = 45;
    const rtar = rtwidth/rtheight;
    const rtnear = 0.1;
    const rtfar = 100;
    const rtcamera = new THREE.PerspectiveCamera(rtfov, rtar, rtnear, rtfar);
    rtcamera.position.z = 10;

    const rtscene = new THREE.Scene();
    rtscene.background = new THREE.Color('red');

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(-1, 2, 4);
    rtscene.add(light);
    
    const boxWidth = 1;
    const boxHeight = 1;
    const boxDepth = 1;
    const geometry = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);
       
    function makeInstance(geometry, color, x) {
        const material = new THREE.MeshPhongMaterial({color});
        
        const cube = new THREE.Mesh(geometry, material);
        rtscene.add(cube);
        
        cube.position.x = x;
        
        return cube;
    }
    
    const rtCubes = [
        makeInstance(geometry, 0x44aa88,  0),
        makeInstance(geometry, 0x8844aa, -2),
        makeInstance(geometry, 0xaa8844,  2),
    ];

    renderer.setRenderTarget(renderTarget);
    renderer.render(rtscene, rtcamera);
    renderer.setRenderTarget(null);



    return renderTarget;
}

function main() 
{
    // console.log('spector: ',Spector);
    const canvas = document.querySelector('#c');
    const renderer = new THREE.WebGLRenderer({canvas});
    renderer.shadowMap.enabled = true;
    renderer.gammaFactor = 2.2;   
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.5;

    console.log(renderer);

    const fov = 30;
    const ar = canvas.clientWidth/canvas.clientHeight;
    const near = 0.1;
    const far = 1000;
    //default canvas is 300x150
    const camera = new THREE.PerspectiveCamera(fov, ar, near, far);
    camera.position.set(0, 10, 30);
    camera.up.set(0, 1, 0);
    camera.lookAt(0, 0, 0);

    const orbitControls = new OrbitControls(camera, renderer.domElement);
    orbitControls.target.set(0, 5, 0);
    orbitControls.update();
    
    const scene = new THREE.Scene();
    
    initSky(scene, renderer, camera);

    const size = 40;
    const divisions = 20;
    const gridHelper = new THREE.GridHelper(size, divisions);
    const planarGrid = makePlanarGrid(40, scene);
    
    const color = 0xFFFFFF;
    const intensity = 1;
    const dirlight = new THREE.DirectionalLight(color, intensity);
    dirlight.castShadow = true;
    dirlight.position.set(-1, 8, 4);
    dirlight.target.position.set(0, 0, 0);

    const dirlightHelper = new THREE.DirectionalLightHelper(dirlight);

    // scene.add(gridHelper);
    scene.add(dirlight);

    let rotatables = make01Scene(renderer, scene);
    
    const sceneOptions = {
        scene01: true, 
        grid: false, 
        plane: true,
        lighthelper: false
    };
    const sceneOptionsGui = gui.addFolder('SceneOptions');
    const scene01Handler = sceneOptionsGui.add(sceneOptions, 'scene01').name('Scene 01').listen();
    scene01Handler.onChange(function(check) {
        if(check == true) {
            rotatables = make01Scene(renderer, scene);
        }
        else {
            if(rotatables.length > 0) {
                rotatables.forEach(function(v, i){
                    v.parent.remove(v);
                });
                rotatables= null;
                rotatables=[];
            }
        }
        
        console.log(rotatables);
    });

    const gridHandler = sceneOptionsGui.add(sceneOptions, 'grid').name('Grid').listen();
    gridHandler.onChange(function(check){
        if(check) {
            scene.add(gridHelper);
        }
        else {
            // let gridHelper = scene.getObjectByName("GridHeler");
            scene.remove(gridHelper);
        }
    });
    const planeHandler = sceneOptionsGui.add(sceneOptions, 'plane').name('Plane').listen();
    planeHandler.onChange(function(check) {
        if(check) {
            scene.add(planarGrid);
        } else {
            scene.remove(planarGrid);
        }
    });

    //light options
    const lighthelperHandler = sceneOptionsGui.add(sceneOptions, 'lighthelper').name('Light_Helper').listen();
    lighthelperHandler.onChange(function(check) {
        if(check) {
            scene.add(dirlightHelper);
        } else {
            scene.remove(dirlightHelper);
        }
    });
    sceneOptionsGui.add(dirlight.position, 'x', -10, 10, 0.01).name('lightdir x');
    sceneOptionsGui.add(dirlight.position, 'y', -10, 10, 0.01).name('lightdir y');
    sceneOptionsGui.add(dirlight.position, 'z', -10, 10, 0.01).name('lightdir z');
    sceneOptionsGui.add(dirlight.target.position, 'x', -10, 10, 0.01).name('light target x');
    sceneOptionsGui.add(dirlight.target.position, 'y', -10, 10, 0.01).name('light target y');
    sceneOptionsGui.add(dirlight.target.position, 'z', -10, 10, 0.01).name('light target z');

    renderer.render(scene, camera);

    function resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if(needResize) {
            renderer.setSize(width, height, false);
        }

        return needResize;
    }

    let once = true;
    function render(time)
    {
        const rot = time * .0001;
        rotatables.forEach((rotatable, ndx) => {
            // rotatable.rotation.x = rot;
            rotatable.rotation.y = rot;
        });

        if(resizeRendererToDisplaySize(renderer))
        {
            camera.aspect = canvas.clientWidth/canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        orbitControls.update();
        renderer.render(scene, camera);
        if(once)
        {
            console.log(renderer.info);
            console.log(renderer.info.programs[1])
            console.log(renderer.info.programs[1].getUniforms())
            console.log(renderer.info.programs[1].vertexShader)
            renderer.debug.checkShaderErrors = true
            once = false;
        }
        requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
}


main();
