import File from '../modules/files';
import Edit from '../modules/edit';

export const initApp = async (args) => {
    await File(args);
    await Edit(args);
};