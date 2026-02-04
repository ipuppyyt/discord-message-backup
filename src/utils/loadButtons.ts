import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

const loadButtons = (dir: string) => {
    const btnsPath = join(__dirname, dir);
    if (!existsSync(btnsPath)) mkdirSync(btnsPath);
    const buttons: { [key: string]: any } = {};
    const files = readdirSync(btnsPath);

    for (const file of files) {
        const filePath = join(btnsPath, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            Object.assign(buttons, loadButtons(filePath));
        } else if (file.endsWith('.ts')) {
            const buttonModule = require(filePath);
            const button = buttonModule[Object.keys(buttonModule)[0]];
            buttons[button.id] = button;
        }
    }

    return buttons;
};

export default loadButtons;