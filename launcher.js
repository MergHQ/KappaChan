const spawn = require('child_process').spawn;

loop();
function loop() {
    var proc = spawn('node', ['KappaChan.js']);
    proc.stdout.on('data', d => {
        if(d !== null)
            console.log(d.toString('utf8'));
    });

    proc.on('close', code => {
        console.log(`CLOSED: ${code}`);
        loop();
    });
}