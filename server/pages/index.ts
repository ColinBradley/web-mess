export async function getIndexBody() {
    let mainJsPath: string | undefined = undefined;
    let mainCssPath: string | undefined = undefined;

    for await (const item of Deno.readDir('./www/static')) {
        if (!item.isFile) {
            continue;
        }
        if (!item.name.startsWith('main-')) {
            continue;
        }

        if (item.name.endsWith('.js')) {
            mainJsPath = '/static/' + item.name;
        } else if (item.name.endsWith('.css')) {
            mainCssPath = '/static/' + item.name;
        }
    }

    if (mainCssPath === undefined || mainJsPath === undefined) {
        throw new Error('Unable to find main files');
    }

    return `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Deno testing</title>
    <link rel="stylesheet" href="${mainCssPath}">
</head>

<body>
    <h1>Hello</h1>
    <tests>
        <test>
            <button id="monaco-button">Monaco</button>
            <div id="editor-container" class="container" style="background-color: rgb(66, 106, 146);"></div>
        </test>
        <test>
            <button id="babylon-button">Babylon</button>
            <canvas id="3d-container" class="container" style="background-color: rgb(65, 129, 70);"></canvas>
        </test>
        <test>
            <button id="trave-view-button">Trace View</button>
            <canvas id="trace-test" class="container" style="background-color: rgb(65, 129, 70);"></canvas>
        </test>
    </tests>
    <script src="${mainJsPath}" type="module" async></script>
</body>

</html>`;
}