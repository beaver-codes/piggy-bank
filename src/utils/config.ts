const config = {
    useEmulators: !!process.env.REACT_APP_EMULATORS,
    functions: {
        testFunction: 'https://testFunction-q3uli4apvq-ew.a.run.app',
    }
}

if (config.useEmulators) {
    config.functions = {
        testFunction: 'http://127.0.0.1:5001/exercise-planner-2c1bd/europe-west1/testFunction',
    }
}

export default config;