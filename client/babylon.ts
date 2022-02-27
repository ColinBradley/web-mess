const babylonButton = document.getElementById('babylon-button')!;

babylonButton.addEventListener('click', async () => {
    const [
        { Engine },
        { Scene },
        { Vector3 },
        { FreeCamera },
        { HemisphericLight },
        { CreateSphere },
        { CreateGround },
    ] = await Promise.all([
        import('@babylonjs/core/Engines/engine'),
        import('@babylonjs/core/scene'),
        import('@babylonjs/core/Maths/math'),
        import('@babylonjs/core/Cameras/freeCamera'),
        import('@babylonjs/core/Lights/hemisphericLight'),
        import('@babylonjs/core/Meshes/Builders/sphereBuilder'),
        import('@babylonjs/core/Meshes/Builders/groundBuilder'),
        import('@babylonjs/core/Materials/standardMaterial'),
    ]);

    const canvas = document.getElementById("3d-container") as HTMLCanvasElement;
    const engine = new Engine(canvas);
    var scene = new Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new FreeCamera("camera1", new Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new HemisphericLight("light1", new Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Our built-in 'sphere' shape. Params: name, options, scene
    var sphere = CreateSphere("sphere1", { segments: 16, diameter: 2 }, scene);

    // Move the sphere upward 1/2 its height
    sphere.position.y = 2;

    // Our built-in 'ground' shape. Params: name, options, scene
    CreateGround("ground1", { width: 6, height: 6, subdivisions: 2 }, scene);

    engine.runRenderLoop(() => {
        scene.render();
    });
});
