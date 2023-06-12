import chalk from 'chalk';

import readline from 'readline';

import FS from 'fs';

const throwCommandLine = (location, text) => {
    return `${chalk.gray(`┌─`)}[${chalk.yellowBright(`system`)}]${chalk.gray(`-`)}[${chalk.blueBright(location)}]\n${chalk.gray(`└─`)} $ ${text}`;
}

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const os = JSON.parse(FS.readFileSync(`./os.json`));

let setupObject;

let system = {
    selectX: 0
};

if (os.state === `setup`) {
    setupObject = { state: `username` };

    console.log(chalk.yellowBright(`(!) Setup is required before using nodeos.\n`));
    rl.setPrompt(`${throwCommandLine(`setup wizard`, `user name: `)}`);
}

const viewHome = array => {
    console.log(array.map((e, i) => i === system.selectX ? chalk.redBright(`┌─────┐`) : `┌─────┐`).join(` `));
    console.log(array.map((e, i) => i === system.selectX ? chalk.redBright(`│  ${i}  │`) : `│  ${i}  │`).join(` `));
    console.log(array.map((e, i) => i === system.selectX ? chalk.redBright(`└─────┘`) : `└─────┘`).join(` `));
}

if (os.state === `home`) {
    const homeDir = FS.readdirSync(`${os.directory}/home`);

    console.log(chalk.greenBright(`(!) Boot successful.\n`));

    viewHome(homeDir);

    rl.setPrompt(`${throwCommandLine(`home`, ``)}`);
}

rl.prompt();

rl.on(`line`, async line => {
    if (os.state === `setup`) {
        if (setupObject.state === `username`) {
            if (line.trim() === ``) {
                console.log(chalk.redBright.underline(`\n(!) Username cannot be blank.`));
            } else {
                os.username = line.trim();
                FS.writeFileSync(`./os.json`, JSON.stringify(os, null, 4));

                setupObject.state = `select directory`;
                rl.setPrompt(`${throwCommandLine(`setup wizard`, `Enter the directory to install: `)}`);
            }
        } else if (setupObject.state === `select directory`) {
            await new Promise((res, rej) => {
                FS.stat(line.trim(), (err, stats) => {
                    if (stats.isDirectory()) {
                        os.directory = line.trim();
                        FS.writeFileSync(`./os.json`, JSON.stringify(os, null, 4));
            
                        console.log(chalk.yellowBright(`\n(!) Setting up. It will all be done soon.`));
            
                        console.log(chalk.redBright(`\n(!) Let me show you the precautions during installation.`));
                        console.log(`\n- If you force a username change on an operating system, you can have many problems.`);
                        console.log(`- If you turn off the operating system in a way other than Ctrl+c, the operating system can be corrupted.`);

                        FS.mkdirSync(`${os.directory}/home`);
                        FS.writeFileSync(`${os.directory}/home/MD`, `# NodeOS v0.0.1b\n\n~~This is not os~~`);
                        FS.writeFileSync(`${os.directory}/home/18`, `made by ice1.`);
            
                        console.log(chalk.greenBright(`\n(!) The installation is complete. Have fun!`));

                        os.state = `home`;
                        FS.writeFileSync(`./os.json`, JSON.stringify(os, null, 4));

                        setupObject.state = `exit`;

                        res();
                    } else {
                        console.log(chalk.redBright.underline(`\n(!) The path is not a directory.`));
                    }
                });
            });

            process.exit();
        }
    } else if (os.state === `home`) {
    }

    console.log();
    rl.prompt();
});

process.stdin.on(`keypress`, (ch, key) => {
    if (key.name === `c` && key.ctrl) {
        console.log(chalk.redBright(`\n\n(!) Process terminated.`));
        process.exit();
    }

    if (os.state === `home`) {
        if (key.name === `left`) system.selectX -= 1;
        if (key.name === `right`) system.selectX += 1;

        if ([`left`, `right`].includes(key.name)) {
            console.clear();
            
            const homeDir = FS.readdirSync(`${os.directory}/home`);
            viewHome(homeDir);

            console.log();
            rl.prompt();
        }

        if (key.name === `return`) {
            const homeDir = FS.readdirSync(`${os.directory}/home`);
            console.log(`\n\n${FS.readFileSync(`${os.directory}/home/${homeDir[system.selectX]}`, `utf-8`)}`);
        }
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();