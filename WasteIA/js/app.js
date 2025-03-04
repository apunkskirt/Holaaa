class WasteClassifier {
    constructor() {
        this.URL = 'https://teachablemachine.withgoogle.com/models/1lvchvJMz/';
        this.model = null;
        this.webcam = null;
        this.maxPredictions = 0;
        this.isInitialized = false;
    }

    async initialize() {
        if (this.isInitialized) return;

        try {
            // Load the model
            const modelURL = this.URL + 'model.json';
            const metadataURL = this.URL + 'metadata.json';
            this.model = await tmImage.load(modelURL, metadataURL);
            this.maxPredictions = this.model.getTotalClasses();

            // Setup webcam
            const flip = true;
            const width = window.innerWidth > 500 ? 500 : window.innerWidth;
            const height = width;
            this.webcam = new tmImage.Webcam(width, height, flip);
            
            await this.webcam.setup();
            await this.setupUI();
            
            this.webcam.play();
            this.isInitialized = true;
            
            // Start the prediction loop
            this.loop();
        } catch (error) {
            console.error('Initialization error:', error);
            this.handleError(error);
        }
    }

    async setupUI() {
        const webcamContainer = document.getElementById('camera-container');
        webcamContainer.appendChild(this.webcam.canvas);

        const resultsContainer = document.getElementById('results-container');
        resultsContainer.innerHTML = '';
        
        for (let i = 0; i < this.maxPredictions; i++) {
            const div = document.createElement('div');
            div.className = 'material-item';
            resultsContainer.appendChild(div);
        }
    }

    async loop() {
        if (!this.isInitialized) return;
        
        this.webcam.update();
        await this.predict();
        window.requestAnimationFrame(() => this.loop());
    }

    async predict() {
        const predictions = await this.model.predict(this.webcam.canvas);
        const resultsContainer = document.getElementById('results-container');

        predictions.forEach((prediction, idx) => {
            const element = resultsContainer.children[idx];
            const probability = prediction.probability.toFixed(2);
            
            element.textContent = `${prediction.className}: ${probability}`;
            element.className = 'material-item';

            if (probability > 0.5) {
                const materialType = prediction.className.toLowerCase();
                if (materialType.includes('azul')) {
                    element.classList.add('material-blue');
                } else if (materialType.includes('amarillo')) {
                    element.classList.add('material-yellow');
                } else if (materialType.includes('verde')) {
                    element.classList.add('material-green');
                } else {
                    element.classList.add('material-gray');
                }
            }
        });
    }

    handleError(error) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = 'Error al acceder a la cámara. Por favor, verifica los permisos.';
        document.body.appendChild(errorMessage);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const classifier = new WasteClassifier();
    const startButton = document.getElementById('start-button');
    
    startButton.addEventListener('click', () => {
        classifier.initialize();
        startButton.style.display = 'none';
    });
});
