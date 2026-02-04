import { existsSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";

const loadModals = (dir: string) => {
    const modalsPath = join(__dirname, dir);
    if (!existsSync(modalsPath)) mkdirSync(modalsPath);
    const modals: { [key: string]: any } = {};
    const files = readdirSync(modalsPath);

    for (const file of files) {
        const filePath = join(modalsPath, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            Object.assign(modals, loadModals(filePath));
        } else if (file.endsWith('.ts')) {
            const modalModule = require(filePath);
            const modal = modalModule[Object.keys(modalModule)[0]];
            modals[modal.id] = modal;
        }
    }

    return modals;
};

export default loadModals;