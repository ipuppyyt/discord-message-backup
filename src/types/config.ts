export interface Config {
    token: string;
    port: number;
    client: {
        id: string;
        secret: string;
    };
    owner: string;
    developers: string[];
    activity: {
        type: 'online' | 'idle' | 'dnd' | 'invisible';
        message: string;
    };
}