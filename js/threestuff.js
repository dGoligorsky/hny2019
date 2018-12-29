// set up a renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

// choose the element to add the renderer to
const sectionTag = document.querySelector("section")
sectionTag.appendChild(renderer.domElement)

// create a SCENE
const scene = new THREE.Scene()
// scene.background = new THREE.Color(0xF4E4CF)

// create a CAMERA
const camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 5000) // fov, aspect ratio, near clipping, far clipping
camera.position.z = 0

// you need to add LIGHTS to the scene
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0,0,-1)
scene.add(light) 

// make a THREE.js loader
const loader = new THREE.TextureLoader()

// using JS promises. Creating a new promise function that is passed the mtl and obj asset. On resolve (when the files are successfully loaded) the function returns the object. Now you can use the loadFiles() function and add on a .then() method that easily adds new obj/mtls to the scene.
const loadFiles = function(mtlUrl, objUrl) {
    return new Promise((resolve, reject) => {
        const objLoader = new THREE.OBJLoader()
        const mtlLoader = new THREE.MTLLoader()
        
        mtlLoader.load(mtlUrl, function(materials) {
            objLoader.setMaterials(materials)
        objLoader.load(objUrl, function(obj) {
                resolve(obj)
            })
        })

    })
}

// add the MODEL using the loadFiles function
let dg = null
loadFiles("assets/dg.mtl", "assets/dg.obj").then(function(obj) {
    obj.rotateY(Math.PI)
    obj.position.y = -6
    obj.position.z = 0

    // go through the model to update material
    const material = new THREE.MeshNormalMaterial({
        wireframe: false,
        flatShading: true
    })
    obj.traverse(child => {
        child.material = material
    })

    dg = obj
    scene.add(dg)
})

// make a particle system
const makeStars = function() {
    const texture = loader.load("assets/particle.png")
    const geometry = new THREE.Geometry()

    for(let i = 0; i < 1000; i = i + 1) {
        const point = new THREE.Vector3()
        const sphericalPoint = new THREE.Spherical(
            // radius, phi, theta
            10 + Math.random() * 10,
            2 * Math.PI * Math.random(),
            Math.PI * Math.random()
        )

        point.setFromSpherical(sphericalPoint)

        geometry.vertices.push(point)
    }

    const material = new THREE.PointsMaterial({
        color: 0x0033cc,
        size: 0.5,
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false
    })

    const points = new THREE.Points(geometry, material)
    scene.add(points)
    return points
}
const stars = makeStars()

let cameraAimX = 0
let cameraAimY = 0
let cameraAimZ = -18
    
// add an ANIMATION loop
const animate = function() {

    const cameraDiffX = cameraAimX - camera.position.x
    const cameraDiffY = cameraAimY - camera.position.y
    const cameraDiffZ = cameraAimZ - camera.position.z

    camera.position.x = camera.position.x + cameraDiffX * .05
    camera.position.y = camera.position.y + cameraDiffY * .05
    camera.position.z = camera.position.z + cameraDiffZ * .05

    camera.lookAt(scene.position)
    renderer.render(scene, camera)
    requestAnimationFrame(animate)

    // // frame rate throttling
    // setTimeout( function() {
    //     requestAnimationFrame( animate );
    // }, 1000 / 30 );

    if(dg){
        dg.rotateY(0.01)
        stars.rotateY(-0.01)
    }

}
// and kick off the animation
animate()

document.addEventListener("mousemove", function(event) {
    cameraAimX = .025 * ((window.innerWidth / 2) - event.pageX)
    cameraAimY = .025 * ((window.innerHeight / 2) - event.pageY)
})

document.addEventListener("wheel", function(event) {
    cameraAimZ = cameraAimZ + event.deltaY
    cameraAimZ = Math.max(-90, cameraAimZ)
    cameraAimZ = Math.min(-12, cameraAimZ)
    event.preventDefault()
})

document.addEventListener("touchstart", touch2Mouse, true);
document.addEventListener("touchmove", touch2Mouse, true);
document.addEventListener("touchend", touch2Mouse, true);

function touch2Mouse(e) {
  var theTouch = e.changedTouches[0];
  var mouseEv;

  switch(e.type)
  {
    case "touchstart": mouseEv="mousedown"; break;  
    case "touchend":   mouseEv="mouseup"; break;
    case "touchmove":  mouseEv="mousemove"; break;
    default: return;
  }

  var mouseEvent = document.createEvent("MouseEvent");
  mouseEvent.initMouseEvent(mouseEv, true, true, window, 1, theTouch.screenX, theTouch.screenY, theTouch.clientX, theTouch.clientY, false, false, false, false, 0, null);
  theTouch.target.dispatchEvent(mouseEvent);

  e.preventDefault();
}

window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})

