// set up a renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

// choose the element to add the renderer to
const section = document.querySelector("section")
section.appendChild(renderer.domElement)

// create a SCENE
const scene = new THREE.Scene()
scene.background = new THREE.Color(0xF4E4CF)

// create a CAMERA
const camera = new THREE.PerspectiveCamera( 110, window.innerWidth / window.innerHeight, 0.1, 5000) // fov, aspect ratio, near clipping, far clipping
camera.position.z = -50
camera.lookAt(scene.position)


// you need to add LIGHTS to the scene
const light = new THREE.DirectionalLight(0xffffff, 1)
light.position.set(0,0,-1)
scene.add(light) 

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

let dg = null
let dgColor = "#0033cc"
loadFiles("assets/dg.mtl", "assets/dg.obj").then(function(obj) {
    obj.rotateY(Math.PI)
    obj.position.y = -5
    obj.position.z = -40

    // go through the model to update material
    const material = new THREE.MeshLambertMaterial({
        color: new THREE.Color(dgColor),
        reflectivity: 1
    })
    obj.traverse(child => {
        child.material = material
    })

    dg = obj
    scene.add(dg)
})

// hold some data about shapes being added
const shapes = []

// add an ANIMATION loop
const animate = function() {
    renderer.render(scene, camera)
    requestAnimationFrame(animate)

    // move the camera forward in space
    // camera.position.setZ(camera.position.z + 1)

    // if you want to rotate the shapes each frame
    shapes.forEach(shape => {
        shape.rotateX(0.01)
    })

    dg.rotateY(0.01)
}
// and kick off the animation
animate()

// hold state for the color hue
let hue = 0

// ok, now you can create SHAPES/GEOMETRIES
const createShape = function(x, y) {

    // make a list of shapes
    const geometries = [
        new THREE.ConeGeometry(10, 20, 30),
        new THREE.BoxGeometry(15, 15, 15),
        new THREE.TorusGeometry(5, 3, 16, 100),
        new THREE.SphereGeometry(10, 32, 32)
    ]

    // pick a random shape from the list
    const randNumber = Math.floor(Math.random() * geometries.length)
    const geometry = geometries[randNumber]

    const emissiveColor = new THREE.Color("hsl(" + hue + ", 100%, 50%)")
    const material = new THREE.MeshLambertMaterial({
        color:0xffffff,
        emissive: emissiveColor
    })

    const shape = new THREE.Mesh(geometry, material)
    

    shape.position.set(
        (window.innerWidth / 2) - x, 
        (window.innerHeight / 2) - y, 
        camera.position.z + 500 // this makes sure you're placing objects in front of camera
        )
    shape.rotateX(1.5)
    shape.rotateZ(1.5)

    // add the shape to the scene and the list (array) of "shapes"
    shapes.push(shape)
    scene.add(shape)

    // update the hue for next draw
    hue = hue + 1
}

// do things on click and drag
let isMouseDown = false

document.addEventListener("mousemove", function(event) {
    if (isMouseDown) {
        createShape(event.pageX, event.pageY)
    }
})

document.addEventListener("mousedown", function() {
    isMouseDown = true
})

document.addEventListener("mouseup", function() {
    isMouseDown = false
})

// and on mobile 

document.addEventListener("touchmove", function(event) {
    if (isMouseDown) {
        createShape(event.pageX, event.pageY)
    }
})

document.addEventListener("touchstart", function() {
    isMouseDown = true
})

document.addEventListener("touchend", function() {
    isMouseDown = false
})

window.addEventListener("resize", function() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
})