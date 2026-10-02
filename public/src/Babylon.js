// Create Babylon engine
const engine = new BABYLON.Engine(canvas, true);

// Create the scene
const scene = new BABYLON.Scene(engine);

// setting the background color

scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // RGBA values

// Create an orbiting cam
// Parameters = name, rotx, roty, radius, target, scene
const camera = new BABYLON.ArcRotateCamera(
    "OrbitalCamera",
    Math.PI / 2,   // horizontal rotation
    Math.PI / 4,   // vertical rotation
    5,             // distance from target
    new BABYLON.Vector3(0, 0, 0), // target position
    scene
);

// POST PROCESSING

const pipeline = new BABYLON.DefaultRenderingPipeline(
    "pipeline",
    true,      // HDR 
    scene,
    [camera]   // cameras to apply bloom to // it is js camera so only one elm in array
);

// settings
pipeline.bloomEnabled = true;
pipeline.bloomThreshold = 0.01;   // brightness cutoff
pipeline.bloomWeight = 0.4;      // intensity
pipeline.bloomKernel = 64;       // blur size

camera.minZ = 0.01; // to prev clipping of near objs
camera.angularSensibilityX = 2000;
camera.angularSensibilityY = 2000;

// Attach camera to canvas
camera.attachControl(canvas, true);

// setting camera bounds (will need adjustment later in proj)
camera.lowerRadiusLimit = 4;  // min zoom
camera.upperRadiusLimit = 4; // max zoom
camera.wheelDeltaPercentage = 0.005; // smooth zoom
camera.zoom = 1000;

// Add a light
const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(1, 1, 0),
    scene
);

light.intensity = 2;


scene.lights.forEach(light => {
    if (light.getShadowGenerator()) {
        light.getShadowGenerator().dispose(); // Removes shadow generator
    }
});


// loading a model
// globe code

BABYLON.SceneLoader.ImportMesh(
    "",
    "/models/",
    "HologramGlobe.gltf",
    scene,
    function (meshes) {
        const model = meshes[1];

        const color = [132, 150, 255]

        const mat = new BABYLON.StandardMaterial("SolidColor", scene);
        // mat.diffuseColor = new BABYLON.Color3(color[0]/255, color[1]/255, color[2]/255);
        mat.emissiveColor = new BABYLON.Color3(color[0], color[1], color[2])//new BABYLON.Color3(color[0]/200, color[1]/200, color[2]/200);; // makes it self-lit
        // mat.specularColor = new BABYLON.Color3(0, 0, 0); // removes highlights
        mat.disableLighting = true; // ignores all lights
        mat.alpha = 0.5;
        model.material = mat;

        model.position = new BABYLON.Vector3(0, 0, 0);
        model.rotation = new BABYLON.Vector3(0, 0, 0);
        scene.registerBeforeRender(() => {
            model.rotation.y += 0.0001;
            model.rotation.x += 0.0001;
        })
    }
);




////////////////////////////////////////////////////////
// THUS CONCLUDES THE SETUP STUFF NOW RENDERING PLANE //
////////////////////////////////////////////////////////


class Plane {
    // constructor that reads in some data to create a plane
    constructor(x, y, z, lat, long, xrot, yrot, zrot, color, heading, speed) {
        // shorthand of this.x = x, this.y=y ect.
        Object.assign(this, {x, y, z, lat, long, xrot, yrot, zrot, color, heading, speed});
        this.model = null;
        let updateFunction = (model) => {
            this.update(model);
        }
       
        BABYLON.SceneLoader.ImportMesh(
            "",
            "/models/",
            "LowPolyPassengerPlane.gltf",
            scene,
            function (meshes) {
                const model = meshes[1];
                model.position = new BABYLON.Vector3(x, y, z);
                model.rotation = new BABYLON.Vector3(xrot, yrot, zrot);
                model.scaling = new BABYLON.Vector3(1/1000, 1/1000, 1/1000);
                if (model.material && model.material instanceof BABYLON.PBRMaterial) {
                    // Change base color (albedoColor)
                    model.material.albedoColor = new BABYLON.Color3(color[0], color[1], color[2]); 
                }
                else if (model.material && model.material instanceof BABYLON.StandardMaterial) {
                    // For StandardMaterial, use diffuseColor
                    model.material.diffuseColor = new BABYLON.Color3(color[0], color[1], color[2]);
                }
                scene.registerBeforeRender(() => {
                    updateFunction(model);
                })



                // particle trails
                // Create a particle system
                const ps = new BABYLON.ParticleSystem("trail", 2000, scene);

                // REQUIRED: particle texture
                ps.particleTexture = new BABYLON.Texture("https://playground.babylonjs.com/textures/flare.png", scene);

                // Attach to your plane model
                ps.emitter = model;  // plane must exist and be ready

                // Colors
                ps.color1 = new BABYLON.Color4(color[0], color[1], color[2], 1);   // bright red
                ps.color2 = new BABYLON.Color4(color[0], color[1], color[2], 1);
                ps.colorDead = new BABYLON.Color4(0, 0, 0, 0);

                // Size
                ps.minSize = 0.005;
                ps.maxSize = 0.015;

                // Lifetime
                ps.minLifeTime = 3;
                ps.maxLifeTime = 4;

                // Emission rate
                ps.emitRate = 200;

                // Speed
                ps.minEmitPower = 0;
                ps.maxEmitPower = 0;

                // Start the system
                ps.start();



            }
        );
    }


    update(model) {
        
        // here is where the calculations for x,y,z given lat, long go

        this.lat += Math.sin(this.heading * Math.PI/180) * this.speed;
        this.long += Math.cos(this.heading * Math.PI/180) * this.speed;
        this.prevPosition = model.position.clone();
        // update
        let rad = 1;
        model.position = new BABYLON.Vector3((rad * Math.cos(this.lat * Math.PI/180)) * Math.cos(this.long * Math.PI/180), (rad * Math.sin(this.lat * Math.PI/180)), (rad * Math.cos(this.lat * Math.PI/180)) * Math.sin(this.long * Math.PI/180));
        // const forward = model.position.subtract(this.prevPosition).normalize();
        const forward = this.prevPosition.subtract(model.position).normalize();
        this.savepos = model.position.clone();
        // Compute global axes
        const up = model.position.normalize(); // surface normal
                            
        const right = BABYLON.Vector3.Cross(up, forward).normalize();
        model.position = this.savepos;

        // Build rotation matrix
        const rotMatrix = new BABYLON.Matrix();
        BABYLON.Matrix.FromXYZAxesToRef(right, up, forward, rotMatrix);

        // Convert to quaternion
        model.rotationQuaternion = BABYLON.Quaternion.FromRotationMatrix(rotMatrix);
    }

}



// array of all planes 
let planes = [];

for (let i = 0; i < 10; i++) {
    planes.push(new Plane(
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random()*180 - 90,
        Math.random()*360 - 180,
        Math.random() * 360,
        Math.random() * 360,
        Math.random() * 360,
        [
            Math.random(), 
            Math.random(),
            Math.random()
        ],
        Math.random() * 360,
        0.1,
    ));
}





// BABYLON.SceneLoader.ImportMesh(
//     "",
//     "/models/",
//     "LowPolyPassengerPlane.gltf",
//     scene,
//     function (meshes) {
//         const model = meshes[1];
//         model.position = new BABYLON.Vector3(0, 0, 0);
//         model.rotation = new BABYLON.Vector3(0, 0, 0);
//         model.scaling = new BABYLON.Vector3(2/1000, 2/1000, 2/1000);
//         if (model.material && model.material instanceof BABYLON.PBRMaterial) {
//             // Change base color (albedoColor)
//             model.material.albedoColor = new BABYLON.Color3(0, 0, 1); // Red
//         }
//         else if (model.material && model.material instanceof BABYLON.StandardMaterial) {
//             // For StandardMaterial, use diffuseColor
//             model.material.diffuseColor = new BABYLON.Color3(0, 0, 1);
//         }
//     }
// );







// Running + init

engine.runRenderLoop(() => {
    scene.render();
});

// Handle window resize
window.addEventListener("resize", () => {
    engine.resize();
});









console.log("Babylon.js script loaded");




async function updateFlights() {
    fetch("/api")
        .then(res => res.json())
        .then(data => console.log(data));
}