import type * as monaco from 'monaco-editor';

(self as any).MonacoEnvironment = {
    getWorker(_workerId, label) {
        function getWorkerModule(moduleUrl: string, label: string) {
            return new Worker(moduleUrl, {
                name: label,
                type: 'module'
            });
        };

        switch (label) {
            case 'json':
                return getWorkerModule('/dist/vs/language/json/json.worker.js', label);
            case 'css':
            case 'scss':
            case 'less':
                return getWorkerModule('/dist/vs/language/css/css.worker.js', label);
            case 'html':
            case 'handlebars':
            case 'razor':
                return getWorkerModule('/dist/vs/language/html/html.worker.js', label);
            case 'typescript':
            case 'javascript':
                return getWorkerModule('/dist/vs/language/typescript/ts.worker.js', label);
            default:
                return getWorkerModule('/dist/vs/editor/editor.worker.js', label);
        }
    }
} as monaco.Environment;

const monacoButton = document.getElementById('monaco-button')!;
monacoButton.addEventListener('click', load);

if (location.hash === 'eager-load') {
    await load();
}

async function load() {
    const monaco = await import('monaco-editor');

    monaco.editor.create(
        document.getElementById('editor-container')!,
        {
            value: 'const hello = "world"',
            language: 'typescript',
            theme: 'vs-dark',
        });
}

export { };